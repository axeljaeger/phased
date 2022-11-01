import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, combineLatestWith, take, tap, withLatestFrom } from 'rxjs';
import { setConfig } from '../actions/arrayConfig.actions';
import { initializeResources } from '../actions/babylon-lifecycle.actions';
import { EngineService } from '../../engine.service';

import { TransducerMaterial } from '../../materials/transducer.material';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Plane } from '@babylonjs/core/Maths/math.plane';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { selectTransducers, Transducer } from '../selectors/arrayConfig.selector';
import { MAT4_ELEMENT_COUNT, SCALAR_ELEMENT_COUNT } from '../../utils/webgl.utils';

import { ExecuteCodeAction } from '@babylonjs/core/Actions/directActions';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import '@babylonjs/core/Culling/ray';
import { selectSelection } from '../selectors/selection.selector';
import { SelectionState } from '../reducers/selection.reducer';
import { clearHover, setTransducerHovered } from '../actions/selection.actions';
import { StandardMaterial } from '@babylonjs/core';

@Injectable()
export class ExcitationRendererEffects {
  private transducerMaterial: TransducerMaterial;
  private transducerMesh: Mesh;

  initialize3DResources$ = createEffect(() => {
    return this.actions$.pipe(
    ofType(initializeResources.type),
    tap(() => {
      this.transducerMaterial = new TransducerMaterial(this.engine.scene);
      //this.transducerMaterial = new StandardMaterial("transmat", this.engine.scene);

      const origin = new Vector3(0, 0, 0);
      const zPositive = new Vector3(0, 0, 1);
      const aperturePlane = Plane.FromPositionAndNormal(origin, zPositive);
      
      const transducerDiameter = 0.0034;

      const apertureOptions = {
        sourcePlane: aperturePlane,
        size: transducerDiameter,
      };
  
      this.transducerMesh = CreatePlane('plane', apertureOptions, this.engine.scene);
      this.transducerMesh.material = this.transducerMaterial;
      
      this.transducerMesh.thinInstanceEnablePicking = true;
      this.transducerMesh.pointerOverDisableMeshTesting = true;

      const actionManager = new ActionManager(this.engine.scene);
      this.transducerMesh.actionManager = actionManager;

      actionManager.registerAction(        
          new ExecuteCodeAction(
              {
                  trigger: ActionManager.OnPointerOverTrigger,
              },
              (event) => {                
                  const pickingResult = this.engine.scene.pick(event.pointerX, this.engine.scene.pointerY);
                  console.log(pickingResult.thinInstanceIndex);
                  this.store.dispatch(setTransducerHovered({transducerId: pickingResult.thinInstanceIndex}));
                }
          )
      )
      actionManager.registerAction(        
          new ExecuteCodeAction(
              {
                  trigger: ActionManager.OnPointerOutTrigger,
              },
              (event) => this.store.dispatch(clearHover())
          )
      )

      combineLatest([
        this.store.select(selectTransducers),
        this.store.select(selectSelection),
      ]).pipe(take(1))
        .subscribe(([transducers, selection]) => this.uploadArrayConfig(transducers, selection));
    }),
  )}, 
  { dispatch: false} );


  updateExcitationBuffer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setConfig.type, setTransducerHovered.type, clearHover.type),
      concatLatestFrom(() => [
        this.store.select(selectTransducers),
        this.store.select(selectSelection),
      ]),
      tap((args) => this.uploadArrayConfig(args[1], args[2]))
    )
  }, { dispatch: false} );

  constructor(private actions$: Actions, private store: Store, private engine: EngineService) {}

  private uploadArrayConfig(transducers: Transducer[], selection: SelectionState) : void {
    const buffers = transducers.reduce(
      (buffer, transducer, index) => {
        Matrix.Translation(
          transducer.pos.x,
          transducer.pos.y,
          transducer.pos.z
        ).copyToArray(buffer, index * MAT4_ELEMENT_COUNT);
        return buffer;
      },
      new Float32Array(MAT4_ELEMENT_COUNT * transducers.length)
    );
  
    this.transducerMesh.thinInstanceSetBuffer(
      'matrix',
      buffers,
      MAT4_ELEMENT_COUNT,
      false
    );

    const buffer = new Float32Array(SCALAR_ELEMENT_COUNT * transducers.length);
    buffer.fill(0);
    if (selection.hovered.length) {
      buffer.set([1], selection.hovered[0]);
    }
    
    this.transducerMesh.thinInstanceSetBuffer(
      'selected',
      buffer,
      SCALAR_ELEMENT_COUNT,
      false
    );
  }
}
