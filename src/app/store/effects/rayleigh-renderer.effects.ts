import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { take, tap } from 'rxjs';
import { setConfig } from '../actions/arrayConfig.actions';
import { setResultVisible } from '../actions/viewportConfig.actions';
import { initializeResources } from '../actions/babylon-lifecycle.actions';
import { EngineService } from '../../engine.service';

import { Plane } from '@babylonjs/core/Maths/math.plane';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { selectTransducers, Transducer } from '../selectors/arrayConfig.selector';
import { RayleighMaterial } from '../../materials/rayleigh.material';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';

import { VEC4_ELEMENT_COUNT } from '../../utils/webgl.utils';
import { createExcitationBuffer, excitationBufferMaxElements, setExcitationElement } from '../../utils/excitationbuffer';
import { selectEnvironment } from '../selectors/environment.selector';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { selectResultEnabled } from '../selectors/viewportConfig.selector';
import { Results } from '..';
import { setResultAspect } from '../actions/rayleigh.actions';
import { selectRayleigh } from '../selectors/rayleigh.selector';

@Injectable()
export class RayleighRendererEffects {
  private rayleighMaterial: RayleighMaterial;
  private uniformExcitationBuffer: UniformBuffer;

  private plane : Mesh;

  initialize3DResources$ = createEffect(() => {
    return this.actions$.pipe(
    ofType(initializeResources.type),
    tap(() => {
    // Result
    this.rayleighMaterial = new RayleighMaterial(this.engine.scene);

    // Setup Aperture
    const origin = new Vector3(0, 0, 0);
    const zPositive = new Vector3(0, 0, 1);
    const yPositive = new Vector3(0, 1, 0);

    // Setup result plane
    const resultPlane = Plane.FromPositionAndNormal(origin, yPositive);
    const planeOptions = {
      sourcePlane: resultPlane,
    };

    this.plane = CreatePlane('plane', planeOptions, this.engine.scene);
    this.plane.material = this.rayleighMaterial;
    this.plane.position = new Vector3(0, 0, 0.5);
    this.plane.bakeCurrentTransformIntoVertices();

    this.uniformExcitationBuffer = new UniformBuffer(this.engine.engine);

    // Babylons only supports element sizes of 1,2,3,4 and 16.
    // Use 4 here, although it is 8 in reality (VEC4_ELEMENT_COUNT * 2) and multiply the number
    // of elements by 2 to correct the final size:
    // 8 * maxElementSize becomes 4 * maxElementSize * 2
    this.uniformExcitationBuffer.addUniform(
      'elements',
      VEC4_ELEMENT_COUNT /* *2 */,
      excitationBufferMaxElements * 2
    );

    this.rayleighMaterial.onBind = (mesh: AbstractMesh) => {
      this.rayleighMaterial
        .getEffect()
        .bindUniformBuffer(this.uniformExcitationBuffer.getBuffer()!, 'excitation');
    };

    this.rayleighMaterial.setFloat('dynamicRange', 10);

    // Initialize buffers for the first time
    this.store
      .select(selectTransducers)
      .pipe(take(1))
      .subscribe(transducers => this.uploadArrayConfig(transducers));

    this.store
      .select(selectEnvironment)
      .pipe(take(1))
      .subscribe(env => this.uploadEnvironment(env));

    this.store
    .select(selectResultEnabled(Results.RayleighIntegral))
    .pipe(take(1))
    .subscribe(enabled => this.plane.setEnabled(enabled));

    this.store
    .select(selectRayleigh)
    .pipe(take(1))
    .subscribe(aspect => this.rayleighMaterial.setResultAspect(aspect));
  }),

  )}, 
  { dispatch: false} );


  updateExcitationBuffer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setConfig.type),
      concatLatestFrom(action => this.store.select(selectTransducers)),
      tap((args) => this.uploadArrayConfig(args[1]))
    )
  }, { dispatch: false } );

  updateEnvironment$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setConfig.type),
      concatLatestFrom(action => this.store.select(selectEnvironment)),
      tap((args) => this.uploadEnvironment(args[1]))
    )
  }, { dispatch: false } );

  updateSetEnabled$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setResultVisible.type),
      concatLatestFrom(action => this.store.select(selectResultEnabled(Results.RayleighIntegral))),
      tap((args) => this.plane.setEnabled(args[1]))
    )
  }, { dispatch: false } );

  updateResultAspect$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setResultAspect.type),
      concatLatestFrom(action => this.store.select(selectRayleigh)),
      tap((args) => this.rayleighMaterial.setResultAspect(args[1]))
    )
  }, { dispatch: false } );

  constructor(
    private actions$: Actions, 
    private store: Store, 
    private engine: EngineService) {}

    private uploadEnvironment(speedOfSound : number) : void {
      const omega = 2.0 * Math.PI * 40000;

      this.rayleighMaterial.setFloat('omega', omega);
      this.rayleighMaterial.setFloat('k', omega / speedOfSound);
    }

    private uploadArrayConfig(transducers: Transducer[]) : void {
      this.rayleighMaterial.setInt('numElements', transducers.length);
      const excitationBuffer = transducers.reduce(
        (buffer, transducer, index) => {
          setExcitationElement(transducer.pos, buffer, index);
          return buffer;
        },
        createExcitationBuffer(),
      ); 

      this.uniformExcitationBuffer.updateUniformArray(
        'elements',
        excitationBuffer,
        excitationBuffer.length
      );
      this.uniformExcitationBuffer.update();
    }
}
