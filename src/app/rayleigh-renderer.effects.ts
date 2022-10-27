import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { setConfig } from './store/actions/arrayConfig.actions';
import { initializeResources } from './babylon-lifecycle.actions';
import { EngineService } from './engine.service';

import { Plane } from '@babylonjs/core/Maths/math.plane';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { selectTransducers } from './store/selectors/arrayConfig.selector';
import { RayleighMaterial } from './materials/rayleigh.material';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';

import { VEC4_ELEMENT_COUNT } from './utils/webgl.utils';
import { createExcitationBuffer, excitationBufferMaxElements, setExcitationElement } from './utils/excitationbuffer';
import { selectEnvironment } from './store/selectors/environment.selector';

@Injectable()
export class RayleighRendererEffects {
  private rayleighMaterial: RayleighMaterial;
  private uniformExcitationBuffer: UniformBuffer;

  initialize3DResources$ = createEffect(() => {
    return this.actions$.pipe(
    ofType(initializeResources.type),
    tap(() => {
      console.log("Initalize 3D resources");

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

    const plane = CreatePlane('plane', planeOptions, this.engine.scene);
    plane.material = this.rayleighMaterial;
    plane.position = new Vector3(0, 0, 0.5);
    plane.bakeCurrentTransformIntoVertices();

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

    this.rayleighMaterial.setInt('viewmode', 0);
    this.rayleighMaterial.setFloat('dynamicRange', 10);

    }),
  )}, 
  { dispatch: false} );


  updateExcitationBuffer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setConfig.type),
      concatLatestFrom(action => this.store.select(selectTransducers)),
      tap((args) => {
        console.log("Set config effect");
        const transducers = args[1];
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
      })
    )
  }, { dispatch: false } );

  updateEnvironment$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setConfig.type),
      concatLatestFrom(action => this.store.select(selectEnvironment)),
      tap((args) => {
        console.log("Update env");
        const speedOfSound = args[1];
        const omega = 2.0 * Math.PI * 40000;

        this.rayleighMaterial.setFloat('omega', omega);
        this.rayleighMaterial.setFloat('k', omega / speedOfSound);
      })
    )
  }, { dispatch: false } );

  constructor(
    private actions$: Actions, 
    private store: Store, 
    private engine: EngineService) {}
}
