import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

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
import { PointerDragBehavior } from '@babylonjs/core/Behaviors/Meshes/pointerDragBehavior';

@Component({
  selector: 'app-excitation-renderer',
  template: '<ng-content></ng-content>',
})
export class ExcitationRendererComponent implements OnChanges {
  @Input() scene: Scene;
  @Input() transducers : Array<Transducer> | null = null;
  @Input() selection : SelectionState | null = null;

  @Output() hovered = new EventEmitter<number>();
  @Output() pitchChange = new EventEmitter<number>();

  private transducerMaterial: TransducerMaterial;
  private transducerMesh: Mesh;

  private arrayPitchHandle: Mesh;


  ngOnChanges(changes: SimpleChanges): void {
    if (this.scene) {
      if (!this.transducerMaterial) {
        this.initialize3D(this.scene);
      }
      if (changes.selection || changes.transducers) {
        this.uploadArrayConfig(this.transducers, this.selection);
      } 
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
    this.transducerMesh.pointerOverDisableMeshTesting = true;

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

    const pointerDragBehavior = new PointerDragBehavior({dragAxis: new Vector3(1,0,0)});
    pointerDragBehavior.dragDeltaRatio = 1.0;

    pointerDragBehavior.onDragStartObservable.add((event)=>{
      console.log("dragStart");
      console.log(event);
    })
    pointerDragBehavior.onDragObservable.add((event)=>{
      this.pitchChange.next(event.dragPlanePoint.x * 2);
    })
    pointerDragBehavior.onDragEndObservable.add((event)=>{
      console.log("dragEnd");
      console.log(event);
    })

    this.arrayPitchHandle.addBehavior(pointerDragBehavior);
    
    
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
