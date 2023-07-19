import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import { Plane } from '@babylonjs/core/Maths/math.plane';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { RayleighMaterial } from '../../materials/rayleigh.material';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { Transducer } from 'src/app/store/selectors/arrayConfig.selector';
import { OnTransducerBufferCreated, Textures } from '../../shared/transducer-buffer.component';

@Component({
    selector: 'app-rayleigh-integral-renderer',
    template: '<ng-content></ng-content>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class RayleighIntegralRendererComponent implements OnChanges, OnDestroy, OnTransducerBufferCreated {
  // Should no longer be needed or changed to a number.
  @Input() transducers : Array<Transducer> | null = null;

  @Input() environment : number | null = null;

  @Input() aspect : number | null = null;
  
  private material: RayleighMaterial;

  private plane : Mesh;

  ngxSceneAndBufferCreated(scene: Scene, buffer: UniformBuffer, textures : Textures): void {
    // Result
    this.material = new RayleighMaterial(scene);
    this.material.onCompiled = () => {
      scene.render();
    };
    this.material.setTexture('coolwarmSampler', textures.coolwarm);

    // Setup Aperture
    const origin = new Vector3(0, 0, 0);
    const zPositive = new Vector3(0, 0, 1);
    const yPositive = new Vector3(0, 1, 0);

    // Setup result plane
    const resultPlane = Plane.FromPositionAndNormal(origin, yPositive);
    const planeOptions = {
      sourcePlane: resultPlane,
    };

    this.plane = CreatePlane('plane', planeOptions, scene);
    this.plane.material = this.material;
    this.plane.position = new Vector3(0, 0, 0.5);
    this.plane.bakeCurrentTransformIntoVertices();

    this.material.onBind = (mesh: AbstractMesh) => {
        this.material
        .getEffect()
        .bindUniformBuffer(buffer.getBuffer()!, 'excitation');
      
    };

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
