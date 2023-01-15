import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import { Plane } from '@babylonjs/core/Maths/math.plane';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { RayleighMaterial } from '../../materials/rayleigh.material';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { Transducer } from 'src/app/store/selectors/arrayConfig.selector';

@Component({
  selector: 'app-rayleigh-integral-renderer',
  template: '<ng-content></ng-content>',
})
export class RayleighIntegralRendererComponent implements OnChanges, OnDestroy {
  @Input() set scene(scenex: Scene) {
    this.initialize3D(scenex);
  }

  ngOnDestroy(): void {
    this.rayleighMaterial.dispose();
    this.plane.dispose();
  }
  initialized: boolean;
  @Input() transducers : Array<Transducer> | null = null;
  @Input() UEB : UniformBuffer | null = null;
  @Input() aspect : number | null = null;
  @Input() environment : number | null = null;

  private rayleighMaterial: RayleighMaterial;

  private plane : Mesh;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rayleighMaterial) {
      this.uploadEnvironment(this.environment);
      this.uploadArrayConfig(this.transducers);
      this.rayleighMaterial.setResultAspect(this.aspect);
    }
  }

  public initialize3D(scene: Scene) : void {    
    // Result
    this.rayleighMaterial = new RayleighMaterial(scene);

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
    this.plane.material = this.rayleighMaterial;
    this.plane.position = new Vector3(0, 0, 0.5);
    this.plane.bakeCurrentTransformIntoVertices();

    this.rayleighMaterial.onBind = (mesh: AbstractMesh) => {
      if (this.UEB) {
        this.rayleighMaterial
        .getEffect()
        .bindUniformBuffer(this.UEB.getBuffer()!, 'excitation');
      }
    };

    this.rayleighMaterial.setFloat('dynamicRange', 10);
    this.rayleighMaterial.setResultAspect(this.aspect);
    this.uploadArrayConfig(this.transducers);
    this.uploadEnvironment(this.environment);
  }

  private uploadEnvironment(speedOfSound : number | null) : void {
    if (speedOfSound) {
      const omega = 2.0 * Math.PI * 40000;

      this.rayleighMaterial.setFloat('omega', omega);
      this.rayleighMaterial.setFloat('k', omega / speedOfSound);
    }
  }

  private uploadArrayConfig(transducers: Transducer[] | null) : void {
    if (transducers) {
      this.rayleighMaterial.setInt('numElements', transducers.length);
    }
  }
}
