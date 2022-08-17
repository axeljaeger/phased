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
import {
  MAT4_ELEMENT_COUNT,
  VEC3_ELEMENT_COUNT,
  VEC4_ELEMENT_COUNT,
} from './utils/webgl.utils';
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

    const subdividedMesh = new Mesh('subdividedMesh', this.scene);
    ssssphere.applyToMesh(subdividedMesh);
    subdividedMesh.scaling = new Vector3(-1, 1, 1);
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
