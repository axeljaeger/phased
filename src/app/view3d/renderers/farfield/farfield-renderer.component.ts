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
import { Transducer } from 'src/app/store/selectors/arrayConfig.selector';
import { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';
import { FarfieldMaterial } from '../../materials/farfield.material';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { OnTransducerBufferCreated } from '../../shared/transducer-buffer.component';

const uniformSquareXY: VertexData = (() => {
  const positions = [-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0];
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

  ngxSceneAndBufferCreated(scene: Scene, buffer: UniformBuffer): void {
    this.material = new FarfieldMaterial(scene);

    this.farfieldMesh = new Mesh('farfieldMesh', scene);
    uniformSquareXY.applyToMesh(this.farfieldMesh);
    this.farfieldMesh.increaseVertices(200);
    this.farfieldMesh.material = this.material;

    this.material.onBind = (mesh: AbstractMesh) => {
      this.material
        .getEffect()
        .bindUniformBuffer(buffer.getBuffer()!, 'excitation');
    };

    this.material.setFloat('dynamicRange', 50.0);
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
