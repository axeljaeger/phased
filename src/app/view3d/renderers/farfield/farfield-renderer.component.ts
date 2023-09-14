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
import { OnTransducerBufferCreated, Textures } from '../../shared/transducer-buffer.component';
import { Transducer } from 'src/app/store/arrayConfig.state';
import { Engine } from '@babylonjs/core/Engines/engine';

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
    template: '<ng-content></ng-content>',
    standalone: true,
})
export class FarfieldRendererComponent
  implements OnChanges, OnDestroy, OnTransducerBufferCreated
{
  @Input() transducers: Array<Transducer> | null = null;
  @Input() environment: number | null = null;

  private material: FarfieldMaterial;
  private farfieldMesh: Mesh;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.material) {
      this.uploadEnvironment(this.environment);
      this.uploadArrayConfig(this.transducers);
    }
  }

  ngxSceneAndBufferCreated(scene: Scene, buffer: UniformBuffer, textures: Textures): void {
    const engine = scene.getEngine();
    this.material = new FarfieldMaterial(scene);
    this.material.onCompiled = () => {
      scene.render();
    };
    this.material.setTexture('viridisSampler', textures.viridis);

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

    this.farfieldMesh.onBeforeRenderObservable.add(() => {
      // Write to stencil buffer
      engine.setStencilFunctionReference(1);
      engine.setStencilFunction(Engine.ALWAYS);
      engine.setStencilOperationPass(Engine.REPLACE);
    });

    this.material.setFloat('dynamicRange', 50.0);
    this.uploadEnvironment(this.environment);
    this.uploadArrayConfig(this.transducers);
  }

  ngOnDestroy(): void {
    this.farfieldMesh.dispose();
    this.material.dispose();
  }

  private uploadEnvironment(speedOfSound: number | null): void {
    if (speedOfSound) {
      const omega = 2.0 * Math.PI * 40000;

      this.material.setFloat('omega', omega);
      this.material.setFloat('k', omega / speedOfSound);
    }
  }

  private uploadArrayConfig(transducers: Transducer[] | null): void {
    if (transducers) {
      this.material.setInt('numElements', transducers.length);
    }
  }
}
