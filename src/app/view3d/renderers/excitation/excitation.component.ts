import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { TransducerMaterial } from '../../../materials/transducer.material';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Plane } from '@babylonjs/core/Maths/math.plane';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { MAT4_ELEMENT_COUNT, SCALAR_ELEMENT_COUNT } from '../../../utils/webgl.utils';

import { ExecuteCodeAction } from '@babylonjs/core/Actions/directActions';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import '@babylonjs/core/Culling/ray';
import { SelectionState } from 'src/app/store/reducers/selection.reducer';
import { Transducer } from 'src/app/store/selectors/arrayConfig.selector';
import { Scene } from '@babylonjs/core/scene';
import { Renderer } from '../../interfaces/renderer';
import { View3dComponent } from '../../smart-components/view3d/view3d.component';

@Component({
  selector: 'app-excitation-renderer',
  template: '<ng-content></ng-content>',
})
export class ExcitationRendererComponent extends Renderer implements OnChanges {
  constructor(view3d: View3dComponent) {
    super(view3d);
  }
  
  @Input() transducers : Array<Transducer> | null = null;
  @Input() selection : SelectionState | null = null;

  @Output() hovered = new EventEmitter<number>();

  private transducerMaterial: TransducerMaterial;
  private transducerMesh: Mesh;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.transducerMaterial) {
      this.uploadArrayConfig(this.transducers, this.selection);
    }
  }

  public initialize3D(scene : Scene) : void {
    this.transducerMaterial = new TransducerMaterial(scene);
    //this.transducerMaterial = new StandardMaterial("transmat", this.engine.scene);

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
