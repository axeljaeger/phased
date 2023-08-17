import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { TransducerMaterial } from '../../materials/transducer.material';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Plane } from '@babylonjs/core/Maths/math.plane';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { MAT4_ELEMENT_COUNT, SCALAR_ELEMENT_COUNT } from '../../../utils/webgl.utils';

import { ExecuteCodeAction } from '@babylonjs/core/Actions/directActions';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';

import '@babylonjs/core/Culling/ray';
import '@babylonjs/core/Meshes/thinInstanceMesh';

import { SelectionState } from 'src/app/store/selection.state';
import { Scene } from '@babylonjs/core/scene';
import { CreateIcoSphere } from '@babylonjs/core/Meshes/Builders/icoSphereBuilder';
import { OnSceneCreated } from '../../interfaces/lifecycle';
import { Transducer } from 'src/app/store/arrayConfig.state';
import { Engine } from '@babylonjs/core/Engines/engine';
import { PositionGizmo } from '@babylonjs/core/Gizmos/positionGizmo';

@Component({
    selector: 'app-excitation-renderer',
    template: '<ng-content></ng-content>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class ExcitationRendererComponent implements OnChanges, OnSceneCreated {
  @Input() transducers : Array<Transducer> | null = null;
  @Input() selection : SelectionState | null = null;

  @Output() hovered = new EventEmitter<number>();
  @Output() pitchX = new EventEmitter<number>();
  @Output() pitchY = new EventEmitter<number>();
  

  private transducerMaterial: TransducerMaterial;
  private transducerMaterialHidden: TransducerMaterial;

  private transducerMesh: Mesh;
  private transducerMeshHidden: Mesh;

  private arrayPitchHandle: Mesh;

  async ngxSceneCreated(scene: Scene): Promise<void> {
    this.initialize3D(scene);
    this.uploadArrayConfig(this.transducers, this.selection);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.transducerMaterial) {
      this.uploadArrayConfig(this.transducers, this.selection);

    }
  }
  
  public initialize3D(scene : Scene) : void {
    const engine = scene.getEngine();
    this.transducerMaterial = new TransducerMaterial(scene);
    this.transducerMaterial.setFloat('innerRadius', 0.45);
    this.transducerMaterialHidden = new TransducerMaterial(scene);
    this.transducerMaterialHidden.setFloat('innerRadius', 0.0);


    const origin = new Vector3(0, 0, 0);
    const zPositive = new Vector3(0, 0, -1);
    const aperturePlane = Plane.FromPositionAndNormal(origin, zPositive);
    
    const transducerDiameter = 0.0034;

    const apertureOptions = {
      sourcePlane: aperturePlane,
      size: transducerDiameter,
    };

    this.transducerMesh = CreatePlane('excitation', apertureOptions, scene);
    this.transducerMesh.material = this.transducerMaterial;
    this.transducerMesh.renderingGroupId = 1;
    this.transducerMesh.thinInstanceEnablePicking = true;
    this.transducerMesh.pointerOverDisableMeshTesting = false;

    this.transducerMeshHidden = CreatePlane('excitationHidden', apertureOptions, scene);
    this.transducerMeshHidden.material = this.transducerMaterialHidden;
    this.transducerMeshHidden.renderingGroupId = 1;

    this.transducerMesh.onBeforeRenderObservable.add(() => {
      // Set stencil test positive
      engine.setDepthFunction(Engine.ALWAYS);
      engine.setStencilFunction(Engine.EQUAL);
      engine.setStencilFunctionReference(1);
      engine.setStencilOperationPass(Engine.KEEP);
    });

    this.transducerMeshHidden.onBeforeRenderObservable.add(() => {
      // Set stencil test negative, disable depth test
      engine.setDepthFunction(Engine.ALWAYS);
      engine.setStencilFunction(Engine.NOTEQUAL);
      engine.setStencilFunctionReference(1);
      engine.setStencilOperationPass(Engine.KEEP);
    });



    const actionManager = new ActionManager(scene);
    this.transducerMesh.actionManager = actionManager;

    actionManager.registerAction(        
        new ExecuteCodeAction(
            {
                trigger: ActionManager.OnPointerOverTrigger,
            },
            (event) => {                
                const pickingResult = scene.pick(event.pointerX, scene.pointerY);
                this.hovered.next(pickingResult.thinInstanceIndex);
              }
        )
    )
     actionManager.registerAction(
         new ExecuteCodeAction(
             {
                 trigger: ActionManager.OnPointerOutTrigger,
             },
            (event) => this.hovered.next(-1)
         )
     )

    this.arrayPitchHandle = CreateIcoSphere('arrayPitchHandle', {
      radius: 0.00025,
      subdivisions: 3,
    })

    this.arrayPitchHandle.position = new Vector3(0.0043 / 2, 0.0043 / 2,0);

    const translationGizmo = new PositionGizmo();
    translationGizmo.zGizmo.dispose();
    translationGizmo.attachedMesh = this.arrayPitchHandle;

    translationGizmo.xGizmo.dragBehavior.onDragObservable.add(event => {
      this.pitchX.next(this.arrayPitchHandle.position.x * 2);
    });

    translationGizmo.yGizmo.dragBehavior.onDragObservable.add(event => {
      this.pitchY.next(this.arrayPitchHandle.position.y * 2);
    });

    this.uploadArrayConfig(this.transducers, this.selection);

    this.transducerMesh.onBeforeRenderObservable.add(() => {
      console.log("Render excitation")
    });

  }

  private uploadArrayConfig(transducersx: Transducer[] | null, selectionx: SelectionState | null) : void {
    const transducers = transducersx ?? []
    const selection : SelectionState = selectionx ?? {hovered: [], selected: [] };
    const buffers = (transducers ?? []).reduce(
      (buffers, transducer, index) => {
        Matrix.Translation(
          transducer.pos.x,
          transducer.pos.y,
          transducer.pos.z
        ).copyToArray(buffers.matrices, index * MAT4_ELEMENT_COUNT);
        
        buffers.selection[index] = selection.hovered.includes(index) ? 1 : 0;

        return buffers;
      },
      {
        matrices: new Float32Array(MAT4_ELEMENT_COUNT * transducers.length),
        selection: new Float32Array(SCALAR_ELEMENT_COUNT * transducers.length)
      }
    );
  

    this.transducerMesh.setEnabled(transducers.length > 0);

    if (transducers.length > 0) {
      [this.transducerMesh, this.transducerMeshHidden].forEach(mesh => {
        mesh.thinInstanceSetBuffer(
          'matrix',
          buffers.matrices,
          MAT4_ELEMENT_COUNT,
          false
        );
        
        mesh.thinInstanceSetBuffer(
          'selected',
          buffers.selection,
          SCALAR_ELEMENT_COUNT,
          false
        );
      })
    }
  }
}
