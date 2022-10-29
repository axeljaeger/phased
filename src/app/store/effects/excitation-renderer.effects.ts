import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { take, tap } from 'rxjs';
import { setConfig } from '../actions/arrayConfig.actions';
import { initializeResources } from '../actions/babylon-lifecycle.actions';
import { EngineService } from '../../engine.service';

import { TransducerMaterial } from '../../materials/transducer.material';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Plane } from '@babylonjs/core/Maths/math.plane';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { selectTransducers, Transducer } from '../selectors/arrayConfig.selector';
import { MAT4_ELEMENT_COUNT } from '../../utils/webgl.utils';

@Injectable()
export class ExcitationRendererEffects {
  private transducerMaterial: TransducerMaterial;
  private transducerPrototype: Mesh;

  initialize3DResources$ = createEffect(() => {
    return this.actions$.pipe(
    ofType(initializeResources.type),
    tap(() => {
      this.transducerMaterial = new TransducerMaterial(this.engine.scene);

      const origin = new Vector3(0, 0, 0);
      const zPositive = new Vector3(0, 0, 1);
      const aperturePlane = Plane.FromPositionAndNormal(origin, zPositive);

      const transducerDiameter = 0.0034;

      const apertureOptions = {
        sourcePlane: aperturePlane,
        size: transducerDiameter,
      };
  
      this.transducerPrototype = CreatePlane('plane', apertureOptions, this.engine.scene);
      this.transducerPrototype.material = this.transducerMaterial;
      this.store
        .select(selectTransducers)
        .pipe(take(1))
        .subscribe(transducers => this.uploadArrayConfig(transducers));
    }),
  )}, 
  { dispatch: false} );


  updateExcitationBuffer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setConfig.type),
      concatLatestFrom(action => this.store.select(selectTransducers)),
      tap((args) => this.uploadArrayConfig(args[1]))
    )
  }, { dispatch: false} );

  constructor(private actions$: Actions, private store: Store, private engine: EngineService) {}

  private uploadArrayConfig(transducers: Transducer[]) : void {
    const buffers = transducers.reduce(
      (buffer, transducer, index) => {
        Matrix.Translation(
          transducer.pos.x,
          transducer.pos.y,
          transducer.pos.z
        ).copyToArray(buffer, index * MAT4_ELEMENT_COUNT);
        return buffer;
      },
      new Float32Array(MAT4_ELEMENT_COUNT * transducers.length),
    );

    this.transducerPrototype.thinInstanceSetBuffer(
      'matrix',
      buffers,
      MAT4_ELEMENT_COUNT,
      false
    );
  }
}
