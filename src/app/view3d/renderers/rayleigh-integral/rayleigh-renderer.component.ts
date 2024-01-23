import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import { Plane } from '@babylonjs/core/Maths/math.plane';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { RayleighMaterial } from '../../materials/rayleigh.material';
import { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { Textures, TransducerBufferConsumer } from '../../shared/transducer-buffer.component';
import { Transducer } from 'src/app/store/arrayConfig.state';
import { Engine } from '@babylonjs/core/Engines/engine';

@Component({
    selector: 'app-rayleigh-integral-renderer',
    template: '<ng-content/>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    providers: [{provide: TransducerBufferConsumer, useExisting: RayleighIntegralRendererComponent}],
})
export class RayleighIntegralRendererComponent extends TransducerBufferConsumer implements OnChanges, OnDestroy {
  // Should no longer be needed or changed to a number.
  @Input() transducers : Array<Transducer> | null = null;

  @Input() environment : number | null = null;

  @Input() aspect : number | null = null;
  
  private material: RayleighMaterial;

  private plane : Mesh;

  ngxSceneAndBufferCreated(scene: Scene, buffer: UniformBuffer, textures : Textures): void {
    // Result
    this.material = new RayleighMaterial(scene, textures.coolwarm);

    // this.material.onBind = (mesh: AbstractMesh) => {
    
    this.material.setUniformBuffer('excitation', buffer);      
  // };

 

    this.material.stencil.enabled = true;
    this.material.stencil.funcRef = 1;
    this.material.stencil.func = Engine.ALWAYS;
    this.material.stencil.opStencilDepthPass = Engine.REPLACE;

    // Setup Aperture
    const origin = new Vector3(0, 0, 0);
    const zPositive = new Vector3(0, 0, 1);
    const yPositive = new Vector3(0, 1, 0);

    // Setup result plane
    const resultPlane = Plane.FromPositionAndNormal(origin, yPositive);
    const planeOptions = {
      sourcePlane: resultPlane,
    };

    this.plane = CreatePlane('rayleigh', planeOptions, scene);
    this.plane.material = this.material;
    this.plane.position = new Vector3(0, 0, 0.5);
    this.plane.bakeCurrentTransformIntoVertices();
    this.plane.isPickable = false;
    this.plane.renderingGroupId = 1;

    this.material.setFloat('dynamicRange', 10);
    this.material.setResultAspect(this.aspect);
    this.uploadArrayConfig(this.transducers);
    this.uploadEnvironment(this.environment);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.material) {
      this.uploadEnvironment(this.environment);
      this.uploadArrayConfig(this.transducers);
      this.material.setResultAspect(this.aspect);
    }
  }

  ngOnDestroy(): void {
    this.material.dispose();
    this.plane.dispose();
  }

  private uploadEnvironment(speedOfSound : number | null) : void {
    if (speedOfSound) {
      const omega = 2.0 * Math.PI * 40000;

      this.material.setFloat('omega', omega);
      this.material.setFloat('k', omega / speedOfSound);
    }
  }

  private uploadArrayConfig(transducers: Transducer[] | null) : void {
    if (transducers) {
      this.material.setInt('numElements', transducers.length);
    }
  }
}
