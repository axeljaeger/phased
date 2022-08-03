import { ElementRef, Injectable, NgZone } from '@angular/core';

import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Angle } from '@babylonjs/core/Maths/math.path';
import { Engine } from '@babylonjs/core/Engines/engine';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import '@babylonjs/core/Meshes/thinInstanceMesh'
import { Plane } from '@babylonjs/core/Maths/math.plane';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Scene } from '@babylonjs/core/scene';
import { AbstractMesh  } from '@babylonjs/core/Meshes/abstractMesh';
import { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';

import { BehaviorSubject, Observable } from 'rxjs';
import { RayleighMaterial } from './materials/rayleigh.material';
import { TransducerMaterial } from './materials/transducer.material';
import { createExcitationBuffer, excitationBufferInclude, excitationBufferMaxElements, setExcitationElement } from './utils/excitationbuffer';
import { Effect } from '@babylonjs/core/Materials/effect';
import { MAT4_ELEMENT_COUNT, VEC4_ELEMENT_COUNT } from './utils/webgl.utils';
import { Store } from '@ngrx/store';
import {
  Transducer,
  selectTransducers,
} from './store/selectors/arrayConfig.selector';
import { selectEnvironment } from './store/selectors/environment.selector';
import {
  FloatArray,
  SceneLoader,
  VertexBuffer,
  VertexData,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';

interface Edge {
  // triangles: Array<Triangle>;
  indices: Array<number>;
  midpointIndex: number;
}

interface EdgeReference {
  edge: Edge;
  forward: boolean;
}

interface Triangle {
  indices: [number, number, number];
  neighbours: Array<Triangle>;
  edges: Array<EdgeReference>;
  edgeForward: Array<boolean>;
}

@Injectable({
  providedIn: 'root',
})
export class EngineService {
  engine: Engine;
  private scene: Scene;

  private transducerMaterial: TransducerMaterial;
  private rayleighMaterial: RayleighMaterial;

  private transducerPrototype: Mesh;

  private farfield: AbstractMesh;

  private speedOfSoundSubject: BehaviorSubject<number> = new BehaviorSubject(
    343
  );
  public speedOfSound$ = this.speedOfSoundSubject.asObservable();

  public transducers$: Observable<Array<Transducer>>;

  constructor(private store: Store, private ngZone: NgZone) {
    this.transducers$ = store.select(selectTransducers);
  }

  async initEngine(canvas: ElementRef<HTMLCanvasElement>) {
    this.engine = new Engine(canvas.nativeElement, true);
    this.scene = await this.createScene(canvas);
    this.scene.debugLayer.show();
  }

  async createScene(canvas: ElementRef<HTMLCanvasElement>) {
    Effect.IncludesShadersStore['ExcitationBuffer'] =
      excitationBufferInclude as unknown as string;

    let scene = new Scene(this.engine);
    let camera = new ArcRotateCamera(
      'Camera',
      Math.PI / 4,
      Math.PI / 4,
      4,
      Vector3.Zero(),
      scene
    );
    camera.lowerRadiusLimit = 0.01;
    camera.attachControl(canvas, true);
    camera.minZ = 0.001;
    camera.inertia = 0;
    camera.wheelDeltaPercentage = 0.1;
    // camera.zoomToMouseLocation = true;

    let light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);

    // Setup Aperture
    const origin = new Vector3(0, 0, 0);
    const zPositive = new Vector3(0, 0, 1);
    const yPositive = new Vector3(0, 1, 0);
    const aperturePlane = Plane.FromPositionAndNormal(origin, zPositive);

    const transducerDiameter = 0.0034;

    // Transducer
    this.transducerMaterial = new TransducerMaterial(scene);

    const apertureOptions = {
      sourcePlane: aperturePlane,
      size: transducerDiameter,
    };

    this.transducerPrototype = CreatePlane('plane', apertureOptions, scene);
    this.transducerPrototype.material = this.transducerMaterial;

    await this.prepareSphere();

    // Result
    this.rayleighMaterial = new RayleighMaterial(scene);

    // Setup result plane
    const resultPlane = Plane.FromPositionAndNormal(origin, yPositive);
    const planeOptions = {
      sourcePlane: resultPlane,
    };

    const plane = CreatePlane('plane', planeOptions, scene);
    plane.material = this.rayleighMaterial;
    plane.position = new Vector3(0, 0, 0.5);
    plane.bakeCurrentTransformIntoVertices();

    let phase = 0;
    scene.registerBeforeRender(() => {
      this.transducerMaterial.setFloat(
        'globalPhase',
        Angle.FromDegrees(phase).radians()
      );
      this.rayleighMaterial.setFloat(
        'globalPhase',
        Angle.FromDegrees(phase).radians()
      );
      this.rayleighMaterial.setFloat('t', Angle.FromDegrees(phase).radians());

      phase += 6;
      phase %= 360;
    });

    const excitationBuffer = new UniformBuffer(this.engine);

    // Babylons only supports element sizes of 1,2,3,4 and 16.
    // Use 4 here, although it is 8 in reality (VEC4_ELEMENT_COUNT * 2) and multiply the number
    // of elements by 2 to correct the final size:
    // 8 * maxElementSize becomes 4 * maxElementSize * 2
    excitationBuffer.addUniform(
      'elements',
      VEC4_ELEMENT_COUNT /* *2 */,
      excitationBufferMaxElements * 2
    );

    this.rayleighMaterial.onBind = (mesh: AbstractMesh) => {
      this.rayleighMaterial
        .getEffect()
        .bindUniformBuffer(excitationBuffer.getBuffer()!, 'excitation');
    };

    this.rayleighMaterial.setInt('viewmode', 0);
    this.rayleighMaterial.setFloat('dynamicRange', 10);

    this.store.select(selectEnvironment).subscribe((speedOfSound) => {
      const omega = 2.0 * Math.PI * 40000;

      this.rayleighMaterial.setFloat('omega', omega);
      this.rayleighMaterial.setFloat('k', omega / speedOfSound);
    });
    this.store.select(selectTransducers).subscribe((transducers) => {
      this.rayleighMaterial.setInt('numElements', transducers.length);

      const bufferCollection = transducers.reduce(
        (buffers, transducer, index) => {
          Matrix.Translation(
            transducer.pos.x,
            transducer.pos.y,
            transducer.pos.z
          ).copyToArray(buffers.matrixBuffer, index * MAT4_ELEMENT_COUNT);

          setExcitationElement(transducer.pos, buffers.excitationBuffer, index);
          return buffers;
        },
        {
          matrixBuffer: new Float32Array(
            MAT4_ELEMENT_COUNT * transducers.length
          ),
          excitationBuffer: createExcitationBuffer(),
        }
      );

      this.transducerPrototype.thinInstanceSetBuffer(
        'matrix',
        bufferCollection.matrixBuffer,
        MAT4_ELEMENT_COUNT,
        false
      );
      excitationBuffer.updateUniformArray(
        'elements',
        bufferCollection.excitationBuffer,
        bufferCollection.excitationBuffer.length
      );
      excitationBuffer.update();
    });
    return scene;
  }

  start() {
    // ignore the change events from the Engine in the Angular ngZone
    this.ngZone.runOutsideAngular(() => {
      // start the render loop and therefore start the Engine
      this.engine.runRenderLoop(() => this.scene.render());
    });
  }

  indexFromEdge(edge: Edge, whichEnd: number, flip: boolean): number {
    return flip ? edge.indices[1 - whichEnd] : edge.indices[whichEnd];
  }

  async prepareSphere(): Promise<void> {
    const result = await SceneLoader.ImportMeshAsync(
      null,
      'assets/halfsphere.glb'
    );
    this.farfield = result.meshes[1];
    console.log('Vertices:');

    console.table(this.farfield.getVerticesData(VertexBuffer.PositionKind));
    console.log('Indices:');

    const vertices = this.farfield.getVerticesData(VertexBuffer.PositionKind);
    const indices = this.farfield.getIndices() ?? [];
    const indexCount = indices?.length ?? 0;

    let triangles: Array<Triangle> = [];
    let edges: Array<Edge> = [];
    let vertexArray: Array<Vector3> = [];

    for (let i = 0; i < indexCount; i += 3) {
      triangles.push({
        indices: [indices[i], indices[i + 1], indices[i + 2]],
        neighbours: [],
        edges: [],
        edgeForward: [],
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

    // Find neighbours
    for (let a = 0; a < triangles.length; a++) {
      const triangleA = triangles[a];
      for (let b = a + 1; b < triangles.length; b++) {
        const triangleB = triangles[b];
        console.assert(triangleA !== triangleB);
        console.assert(!triangleA.neighbours.includes(triangleB));
        let matchcount = 0;
        triangleA.indices.forEach((indexA) => {
          if (triangleB.indices.some((indexB) => indexA === indexB)) {
            matchcount++;
          }
        });
        console.assert([0, 1, 2].includes(matchcount));
        if (matchcount == 2) {
          triangleA.neighbours.push(triangleB);
          triangleB.neighbours.push(triangleA);
        }
      }
    }
    console.table(triangles);
    console.table(edges);

    // Subdivide edges:
    const subdividedVertices = [...(vertices as FloatArray)];
    edges.forEach((edge) => {
      const indexA = edge.indices[0];
      const indexB = edge.indices[1];

      const a = Vector3.FromArray(subdividedVertices, indexA * 3);
      const b = Vector3.FromArray(subdividedVertices, indexB * 3);
      const subdividedVertex = Vector3.Lerp(a, b, 0.5);
      subdividedVertex.normalize();
      edge.midpointIndex = subdividedVertices.length / 3;

      subdividedVertices.push(subdividedVertex.x);
      subdividedVertices.push(subdividedVertex.y);
      subdividedVertices.push(subdividedVertex.z);
    });

    const subdividedIndices: Array<number> = [];
    triangles.forEach((triangle) => {
      subdividedIndices.push(
        this.indexFromEdge(
          triangle.edges[0].edge,
          0,
          !triangle.edges[0].forward
        )
      );
      subdividedIndices.push(triangle.edges[2].edge.midpointIndex);
      subdividedIndices.push(triangle.edges[0].edge.midpointIndex);

      subdividedIndices.push(triangle.edges[0].edge.midpointIndex);
      subdividedIndices.push(triangle.edges[1].edge.midpointIndex);
      subdividedIndices.push(
        this.indexFromEdge(
          triangle.edges[0].edge,
          1,
          !triangle.edges[0].forward
        )
      );

      subdividedIndices.push(triangle.edges[2].edge.midpointIndex);
      subdividedIndices.push(
        this.indexFromEdge(triangle.edges[2].edge, 1, triangle.edges[2].forward)
      );
      subdividedIndices.push(triangle.edges[1].edge.midpointIndex);

      subdividedIndices.push(triangle.edges[0].edge.midpointIndex);
      subdividedIndices.push(triangle.edges[2].edge.midpointIndex);
      subdividedIndices.push(triangle.edges[1].edge.midpointIndex);
    });

    const subdividedMesh = new Mesh('subdividedMesh', this.scene);
    const vertexData = new VertexData();
    vertexData.positions = subdividedVertices;
    vertexData.indices = subdividedIndices;
    vertexData.applyToMesh(subdividedMesh);
  }
}
