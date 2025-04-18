import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import { Plane } from '@babylonjs/core/Maths/math.plane';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { RayleighMaterial, ResultAspect } from '../../materials/rayleigh.material';
import { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { Textures, TransducerBufferConsumer } from '../../shared/transducer-buffer.component';
import { Engine } from '@babylonjs/core/Engines/engine';
import { ResultSet } from 'src/app/store/rayleigh.state';
import { VertexData } from '@babylonjs/core';
import { Environment, Transducer } from 'src/app/store/store.service';

export const cubeCut = (): VertexData => {
  const positions = [
    -0.5, -0.5, 0, 
    0.5, -0.5, 0, 
    0.5, 0.5, 0, 
    0.0, 0.5, 0,
    0.0, 0.0, 0,
    -0.5, 0.0, 0,

    -0.5, -0.5, 1, 
    0.5, -0.5, 1, 
    0.5, 0.5, 1, 
    0.0, 0.5, 1,
    0.0, 0.0, 1,
    -0.5, 0.0, 1,
  ];

  const indices = [
    0, 2, 1, 
    0, 5, 4,
    4, 3, 2,
  
    4,10,3,
    10, 9, 3,
    2, 3, 9,
    2, 9, 8,

    5, 11, 4,
    11,10,4,
    0, 6, 5,
    6, 11, 5,

    0, 1, 6,
    1, 7, 6,

    1, 2, 7,
    2, 8, 7,

    6, 8, 7, 
    6, 11, 10,
    10, 9, 8,
  ];

  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  return vertexData;
};

@Component({
    selector: 'app-rayleigh-integral-renderer',
    template: '<ng-content/>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    providers: [{provide: TransducerBufferConsumer, useExisting: RayleighIntegralRendererComponent}],
})
export class RayleighIntegralRendererComponent extends TransducerBufferConsumer implements OnChanges, OnDestroy {
  // Should no longer be needed or changed to a number.
  @Input() transducers : Transducer[] | null = null;

  @Input() environment : Environment | null = null;

  @Input() aspect : ResultAspect | null = null;
  @Input() resultSet : ResultSet | null = null;
  
  private material: RayleighMaterial;

  private xzPlane : Mesh;
  private yzPlane : Mesh;
  private cubeCut : Mesh;

  ngxSceneAndBufferCreated(scene: Scene, buffer: UniformBuffer, textures : Textures): void {
    // Result
    this.material = new RayleighMaterial(scene, textures.coolwarm);
    this.material.setUniformBuffer('excitation', buffer);      

    this.material.stencil.enabled = true;
    this.material.stencil.funcRef = 1;
    this.material.stencil.func = Engine.ALWAYS;
    this.material.stencil.opStencilDepthPass = Engine.REPLACE;

    // Setup Aperture
    const origin = new Vector3(0, 0, 0);
    const xNegative = new Vector3(-1, 0, 0);
    const yPositive = new Vector3(0, 1, 0);

    // Setup result plane
    const xzMathPlane = Plane.FromPositionAndNormal(origin, yPositive);
    this.xzPlane = CreatePlane('rayleigh', {
      sourcePlane: xzMathPlane,
    }, scene);
    this.xzPlane.material = this.material;
    this.xzPlane.position = new Vector3(0, 0, 0.5);
    this.xzPlane.bakeCurrentTransformIntoVertices();
    this.xzPlane.isPickable = false;
    this.xzPlane.renderingGroupId = 1;

    const yzMathPlane = Plane.FromPositionAndNormal(origin, xNegative);
    this.yzPlane = CreatePlane('rayleigh', {
      sourcePlane: yzMathPlane,
    }, scene);
    this.yzPlane.material = this.material;
    this.yzPlane.position = new Vector3(0, 0, 0.5);
    this.yzPlane.bakeCurrentTransformIntoVertices();
    this.yzPlane.isPickable = false;
    this.yzPlane.renderingGroupId = 1;
    this.yzPlane.setEnabled(false);

    this.cubeCut = new Mesh('cubeCut', scene);
    cubeCut().applyToMesh(this.cubeCut);
    this.cubeCut.material = this.material;
    this.cubeCut.isPickable = false;
    this.cubeCut.renderingGroupId = 1;
    this.cubeCut.setEnabled(false);

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

    if (changes.resultSet && this.xzPlane && this.yzPlane) {
      this.xzPlane.setEnabled(this.resultSet === ResultSet.XZPlane);
      this.yzPlane.setEnabled(this.resultSet === ResultSet.YZPlane);
      this.cubeCut.setEnabled(this.resultSet === ResultSet.CutCube);
    }
  }

  ngOnDestroy(): void {
    this.material.dispose();
    this.xzPlane.dispose();
    this.yzPlane.dispose();
    this.cubeCut.dispose();
  }

  private uploadEnvironment(environment : Environment | null) : void {
    if (environment) {
      const omega = 2.0 * Math.PI * 40000;

      this.material.setFloat('omega', omega);
      this.material.setFloat('k', omega / environment.speedOfSound);
    }
  }

  private uploadArrayConfig(transducers: Transducer[] | null) : void {
    if (transducers) {
      this.material.setInt('numElements', transducers.length);
    }
  }
}
