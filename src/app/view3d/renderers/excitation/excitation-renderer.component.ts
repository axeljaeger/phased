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

import { SelectionState } from 'src/app/store/reducers/selection.reducer';
import { Transducer } from 'src/app/store/selectors/arrayConfig.selector';
import { Scene } from '@babylonjs/core/scene';
import { CreateIcoSphere } from '@babylonjs/core/Meshes/Builders/icoSphereBuilder';
import { OnSceneCreated } from '../../interfaces/lifecycle';
import { PositionGizmo } from '@babylonjs/core';

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
  @Output() pitchChange = new EventEmitter<number>();

  private transducerMaterial: TransducerMaterial;
  private transducerMesh: Mesh;

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

    const origin = new Vector3(0, 0, 0);
    const zPositive = new Vector3(0, 0, -1);
    const aperturePlane = Plane.FromPositionAndNormal(origin, zPositive);
    
    const transducerDiameter = 0.0034;

    const apertureOptions = {
      sourcePlane: aperturePlane,
      size: transducerDiameter,
    };

    this.transducerMesh = CreatePlane('plane', apertureOptions, scene);
    this.transducerMesh.material = this.transducerMaterial;
    
    this.transducerMesh.thinInstanceEnablePicking = true;
    this.transducerMesh.pointerOverDisableMeshTesting = false;

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
      this.pitchChange.next(this.arrayPitchHandle.position.x * 2);
    });

    translationGizmo.yGizmo.dragBehavior.onDragObservable.add(event => {
      this.pitchChange.next(this.arrayPitchHandle.position.y * 2);
    });

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
      this.transducerMesh.thinInstanceSetBuffer(
        'matrix',
        buffers.matrices,
        MAT4_ELEMENT_COUNT,
        false
      );
      
      this.transducerMesh.thinInstanceSetBuffer(
        'selected',
        buffers.selection,
        SCALAR_ELEMENT_COUNT,
        false
      );
    }
  }
}
