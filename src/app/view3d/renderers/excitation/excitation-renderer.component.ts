import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { TransducerMaterial } from '../../materials/transducer.material';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Plane } from '@babylonjs/core/Maths/math.plane';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Matrix, Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
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
import { PointerDragBehavior } from '@babylonjs/core/Behaviors/Meshes/pointerDragBehavior';

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
  
  @Output() scale = new EventEmitter<Vector2>();
  
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
    this.transducerMaterial = new TransducerMaterial(scene);
    this.transducerMaterial.depthFunction = Engine.ALWAYS;
    this.transducerMaterial.stencil.enabled = true;
    this.transducerMaterial.stencil.funcRef = 1;
    this.transducerMaterial.stencil.func = Engine.EQUAL;
    this.transducerMaterial.stencil.opStencilDepthPass = Engine.KEEP;
    this.transducerMaterial.setFloat('innerRadius', 0.45);

    this.transducerMaterialHidden = new TransducerMaterial(scene);
    this.transducerMaterialHidden.depthFunction = Engine.ALWAYS;
    this.transducerMaterialHidden.stencil.enabled = true;
    this.transducerMaterialHidden.stencil.funcRef = 1;
    this.transducerMaterialHidden.stencil.func = Engine.NOTEQUAL;
    this.transducerMaterialHidden.stencil.opStencilDepthPass = Engine.KEEP;
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


    const pointerDragBehavior = new PointerDragBehavior({dragPlaneNormal: new Vector3(0,0,1)});
    
    // Use drag plane in world space
    pointerDragBehavior.useObjectOrientationForDragging = false;
    pointerDragBehavior.moveAttached = false;

    // Listen to drag events
    pointerDragBehavior.onDragStartObservable.add((event)=>{
        console.log("dragStart");
        console.log(event);
        scene.render();
    })
    pointerDragBehavior.onDragObservable.add((event)=>{
        console.log("drag", event.delta);
        console.log(event);

        const vec = new Vector2(event.delta.x / event.dragPlanePoint.x, 
        event.delta.y / event.dragPlanePoint.y)

        this.scale.next(vec
          );
        scene.render();

      })
    pointerDragBehavior.onDragEndObservable.add((event)=>{
        console.log("dragEnd");
        console.log(event);
        scene.render();

      })

    // If handling drag events manually is desired, set move attached to false
    // pointerDragBehavior.moveAttached = false;

    this.transducerMesh.addBehavior(pointerDragBehavior);



    this.uploadArrayConfig(this.transducers, this.selection);
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
