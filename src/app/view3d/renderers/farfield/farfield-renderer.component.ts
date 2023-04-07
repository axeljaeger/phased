import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import { AbstractMesh  } from '@babylonjs/core/Meshes/abstractMesh';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { Transducer } from 'src/app/store/selectors/arrayConfig.selector';
import { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';
import { FarfieldMaterial } from '../../materials/farfield.material';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';

const uniformSquareXY : VertexData = (() => {
  const positions = [
    -0.5, -0.5, 0,
    0.5, -0.5, 0,
    -0.5, 0.5, 0,
    0.5, 0.5, 0];
  const uv = [
    -1, -1, 
    1, -1, 
    -1, 1, 
    1, 1
  ];
  const indices = [0, 1, 2, 1, 3, 2];
  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.uvs = uv;
  return vertexData;
}) ();

@Component({
  selector: 'app-farfield-renderer',
  template: '<ng-content></ng-content>',
})
export class FarfieldRendererComponent implements OnChanges, OnDestroy {
  @Input() scene :Scene;
  @Input() transducers : Array<Transducer> | null = null;
  @Input() UEB : UniformBuffer | null = null;
  @Input() environment : number | null = null;

  private material : FarfieldMaterial;
  private farfieldMesh : Mesh;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.scene) {
      if (!this.material) {
        this.initialize3D(this.scene);
      }
      this.uploadEnvironment(this.environment);
      this.uploadArrayConfig(this.transducers);
    }
  }

  initialize3D(scene: Scene) : void {
    this.material = new FarfieldMaterial(scene);

    this.farfieldMesh = new Mesh('farfieldMesh', scene);
    uniformSquareXY.applyToMesh(this.farfieldMesh);
    this.farfieldMesh.increaseVertices(200);
    this.farfieldMesh.material = this.material;

    this.material.onBind = (mesh: AbstractMesh) => {
      if (this.UEB) {
        this.material
        .getEffect()
        .bindUniformBuffer(this.UEB.getBuffer()!, 'excitation');
      }
    };

    this.material.setFloat('dynamicRange', 1);
  }

  ngOnDestroy(): void {
    this.farfieldMesh.dispose();
    this.material.dispose();
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
