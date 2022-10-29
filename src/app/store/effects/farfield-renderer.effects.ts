import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, take, tap } from 'rxjs';
import { setConfig } from '../actions/arrayConfig.actions';
import { initializeResources } from '../actions/babylon-lifecycle.actions';
import { EngineService } from '../../engine.service';

import { FloatArray } from '@babylonjs/core/'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'


import { AbstractMesh  } from '@babylonjs/core/Meshes/abstractMesh';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { selectTransducers } from '../selectors/arrayConfig.selector';
import { VEC3_ELEMENT_COUNT } from '../../utils/webgl.utils';
import { selectResultEnabled } from '../selectors/viewportConfig.selector';
import { Results } from '..';
import { setResultVisible } from '../actions/viewportConfig.actions';

interface Edge {
  indices: Array<number>;
  midpointIndex: number;
}

interface EdgeReference {
  edge: Edge;
  forward: boolean;
}

interface Triangle {
  indices: [number, number, number];
  edges: Array<EdgeReference>;
}

@Injectable()
export class FarfieldRendererEffects {
  private farfield: AbstractMesh;

  private subdividedMesh : Mesh;

  initialize3DResources$ = createEffect(() => {
    return this.actions$.pipe(
    ofType(initializeResources.type),
    tap(() => {
      this.prepareSphere().then(() => {});

      this.subdividedMesh = new Mesh('subdividedMesh', this.engine.scene);

      this.store
      .select(selectResultEnabled(Results.RayleighIntegral))
      .pipe(take(1))
      .subscribe(enabled => this.subdividedMesh.setEnabled(enabled));

    }),
  )}, 
  { dispatch: false} );


  updateExcitationBuffer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setConfig.type),
      concatLatestFrom(action => this.store.select(selectTransducers)),
      tap((args) => {
        console.log("Set config effect");
        
      })
    )
  }, { dispatch: false} );

  updateSetEnabled$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setResultVisible.type),
      concatLatestFrom(action => this.store.select(selectResultEnabled(Results.Farfield))),
      distinctUntilChanged(),
      tap((args) => this.subdividedMesh.setEnabled(args[1]))
    )
  }, { dispatch: false } );


  constructor(
    private actions$: Actions, 
    private store: Store, 
    private engine: EngineService) {}

  async prepareSphere(): Promise<void> {
    const result = await SceneLoader.ImportMeshAsync(
      null,
      'assets/halfsphere.glb'
    );
    this.farfield = result.meshes[1];
    this.farfield.setEnabled(false);

    const orignalVertexData = new VertexData();
    orignalVertexData.positions = this.farfield.getVerticesData(
      VertexBuffer.PositionKind
    );
    orignalVertexData.indices = this.farfield.getIndices();

    const ssphere = this.subdivideSphere(orignalVertexData, true);
    const sssphere = this.subdivideSphere(ssphere, false);
    const ssssphere = this.subdivideSphere(sssphere, false);

    ssssphere.applyToMesh(this.subdividedMesh);
    this.subdividedMesh.scaling = new Vector3(-1, 1, 1);
  }

  indexFromEdge(edge: Edge, whichEnd: number, flip: boolean): number {
    return flip ? edge.indices[1 - whichEnd] : edge.indices[whichEnd];
  }

  private subdivideSphere(
    meshDataIn: VertexData,
    invertNormals: boolean
  ): VertexData {
    const vertices = meshDataIn.positions;
    const indices = meshDataIn.indices ?? [];
    const indexCount = indices?.length ?? 0;

    let triangles: Array<Triangle> = [];
    let edges: Array<Edge> = [];

    // Build up triangles from index buffer
    for (let i = 0; i < indexCount; i += 3) {
      triangles.push({
        indices: invertNormals
          ? [indices[i], indices[i + 2], indices[i + 1]]
          : [indices[i], indices[i + 1], indices[i + 2]],
        edges: [],
      });
    }

    // find common edges
    triangles.forEach((triangle) => {
      [
        [triangle.indices[0], triangle.indices[1]],
        [triangle.indices[1], triangle.indices[2]],
        [triangle.indices[2], triangle.indices[0]],
      ].forEach((edgeCandidate) => {
        const edge = edges.find(
          (edge) =>
            (edge.indices[0] === edgeCandidate[0] &&
              edge.indices[1] === edgeCandidate[1]) ||
            (edge.indices[1] === edgeCandidate[0] &&
              edge.indices[0] === edgeCandidate[1])
        );
        if (edge === undefined) {
          const newEdge = {
            indices: [edgeCandidate[0], edgeCandidate[1]],
            midpointIndex: -1,
          };
          edges.push(newEdge);
          triangle.edges.push({
            forward: true,
            edge: newEdge,
          });
        } else {
          const edgeForward = edgeCandidate[0] === edge.indices[0];
          triangle.edges.push({
            forward: edgeForward,
            edge: edge,
          });
        }
      });
    });

    // Subdivide edges:
    const subdividedVertices = [...(vertices as FloatArray)];
    edges.forEach((edge) => {
      const a = Vector3.FromArray(
        subdividedVertices,
        edge.indices[0] * VEC3_ELEMENT_COUNT
      );
      const b = Vector3.FromArray(
        subdividedVertices,
        edge.indices[1] * VEC3_ELEMENT_COUNT
      );
      const subdividedVertex = Vector3.Lerp(a, b, 0.5);
      subdividedVertex.normalize();
      edge.midpointIndex = subdividedVertices.length / VEC3_ELEMENT_COUNT;
      subdividedVertices.push(
        ...[subdividedVertex.x, subdividedVertex.y, subdividedVertex.z]
      );
    });

    // Create 4 new triangles from each new old triangle
    const subdividedIndices: Array<number> = [];
    triangles.forEach((triangle) => {
      const tedges = triangle.edges;

      subdividedIndices.push(
        ...[
          // Triangle 1
          this.indexFromEdge(tedges[0].edge, 0, !tedges[0].forward),
          tedges[0].edge.midpointIndex,
          tedges[2].edge.midpointIndex,

          // // Triangle 2
          tedges[1].edge.midpointIndex,
          tedges[0].edge.midpointIndex,
          this.indexFromEdge(tedges[0].edge, 1, !tedges[0].forward),

          // // Triangle 3
          this.indexFromEdge(tedges[2].edge, 1, tedges[2].forward),
          tedges[2].edge.midpointIndex,
          tedges[1].edge.midpointIndex,

          // // Triangle 4
          tedges[0].edge.midpointIndex,
          tedges[1].edge.midpointIndex,
          tedges[2].edge.midpointIndex,
        ]
      );
    });

    const vertexData = new VertexData();
    vertexData.positions = subdividedVertices;
    vertexData.indices = subdividedIndices;
    return vertexData;
  }
}
