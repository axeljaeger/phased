import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';

import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';
import { FarfieldMaterial } from '../../materials/farfield.material';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { Textures, TransducerBufferConsumer } from '../../shared/transducer-buffer.component';
import { Transducer } from 'src/app/store/arrayConfig.state';
import { Engine } from '@babylonjs/core/Engines/engine';
import { TextureSampler } from '@babylonjs/core/Materials/Textures/textureSampler';
import { Constants } from '@babylonjs/core/Engines/constants';
import { EnvironmentState, frequencyFromBase } from 'src/app/store/environment.state';

const uvMesh: VertexData = (() => {
  const positions = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];
  const uv = [-1, -1, 1, -1, -1, 1, 1, 1];
  const indices = [0, 1, 2, 1, 3, 2];
  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.uvs = uv;
  return vertexData;
})();

@Component({
    selector: 'app-farfield-renderer',
    template: '<ng-content/>',
    standalone: true,
    providers: [{provide: TransducerBufferConsumer, useExisting: FarfieldRendererComponent}],
})
export class FarfieldRendererComponent extends TransducerBufferConsumer
  implements OnChanges, OnDestroy
{
  @Input() transducers: Transducer[] | null = null;
  @Input() environment: EnvironmentState | null = null;

  private material: FarfieldMaterial;
  private farfieldMesh: Mesh;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.material) {
      this.uploadEnvironment(this.environment);
      this.uploadArrayConfig(this.transducers);
    }
  }

  ngxSceneAndBufferCreated(scene: Scene, buffer: UniformBuffer, textures: Textures): void {
    this.material = new FarfieldMaterial(scene);
    this.material.setTexture('viridisTexture', textures.viridis);

    const sampler = new TextureSampler();

    sampler.setParameters(); // use the default values
    sampler.samplingMode = Constants.TEXTURE_NEAREST_SAMPLINGMODE;

    this.material.setTextureSampler("viridisSampler", sampler);

    this.material.stencil.enabled = true;
    this.material.stencil.funcRef = 1;
    this.material.stencil.func = Engine.ALWAYS;
    this.material.stencil.opStencilDepthPass = Engine.REPLACE;

    this.farfieldMesh = new Mesh('farfieldMesh', scene);
    uvMesh.applyToMesh(this.farfieldMesh);
    this.farfieldMesh.increaseVertices(200);
    this.farfieldMesh.material = this.material;
    this.farfieldMesh.isPickable = false;
    this.farfieldMesh.renderingGroupId = 1;

    this.material.onBind = (mesh: AbstractMesh) => {
      this.material
        .getEffect()
        .bindUniformBuffer(buffer.getBuffer()!, 'excitation');
    };

    this.material.setFloat('dynamicRange', 50.0);
    this.uploadEnvironment(this.environment);
    this.uploadArrayConfig(this.transducers);
  }

  ngOnDestroy(): void {
    this.farfieldMesh.dispose();
    this.material.dispose();
  }

  private uploadEnvironment(environment: EnvironmentState | null): void {
    if (environment) {
      const omega = 2.0 * Math.PI * frequencyFromBase(environment.excitationFrequencyBase, environment.multiplier);

      this.material.setFloat('omega', omega);
      this.material.setFloat('k', omega / environment.speedOfSound);
    }
  }

  private uploadArrayConfig(transducers: Transducer[] | null): void {
    if (transducers) {
      this.material.setInt('numElements', transducers.length);
    }
  }
}
