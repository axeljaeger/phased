import { ElementRef, Injectable, NgZone } from '@angular/core';

import {
  Angle,
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  Matrix,
  Mesh,
  MeshBuilder,
  Plane,
  Scene,
  ShaderMaterial,
  Vector3
} from '@babylonjs/core';
import { BehaviorSubject } from 'rxjs';
import { RayleighMaterial } from './materials/rayleigh.material';
import { TransducerMaterial } from './materials/transducer.material';

export interface Transducer {
  name: string;
  pos: Vector3;
  enabled: boolean;
  selected: boolean;
  phase: number;
}

@Injectable({
  providedIn: 'root'
})
export class EngineService {
  engine: Engine;
  private scene: Scene;

  private transducerMaterial: ShaderMaterial;
  private rayleighMaterial: ShaderMaterial;

  private transducerPrototype: Mesh;

  public transducers: BehaviorSubject<Array<Transducer>> = new BehaviorSubject<Array<Transducer>>([]);

  constructor(private ngZone: NgZone) {


    const aperturePitch = 0.0043;
    const apdh = aperturePitch;
    this.transducers.next([
      { pos: new Vector3(-apdh, -apdh, 0), enabled: true, selected: false, phase: 0, name: '1' },
      { pos: new Vector3(-apdh, apdh, 0), enabled: true, selected: false, phase: 0, name: '2' },
      { pos: new Vector3(apdh, apdh, 0), enabled: true, selected: false, phase: 0, name: '3' },
      { pos: new Vector3(apdh, -apdh, 0), enabled: true, selected: false, phase: 0, name: '4' }
    ]);
  }

  initEngine(canvas: ElementRef<HTMLCanvasElement>) {
    this.engine = new Engine(canvas.nativeElement, true);
    this.scene = this.createScene(canvas);
  }

  createScene(canvas: ElementRef<HTMLCanvasElement>) {
    let scene = new Scene(this.engine);
    let camera = new ArcRotateCamera("Camera", Math.PI / 4, Math.PI / 4, 4, Vector3.Zero(), scene);
    camera.lowerRadiusLimit = 0.01;
    camera.attachControl(canvas, true);
    camera.minZ = 0.001;
    camera.inertia = 0;

    let light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);



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
      size: transducerDiameter
    };

    this.transducerPrototype = MeshBuilder.CreatePlane('plane', apertureOptions, scene);
    this.transducerPrototype.material = this.transducerMaterial;

    // Result
    this.rayleighMaterial = new RayleighMaterial(scene);

    // Setup result plane
    const resultPlane = Plane.FromPositionAndNormal(origin, yPositive);
    const planeOptions = {
      sourcePlane: resultPlane
    };

    const plane = MeshBuilder.CreatePlane('plane', planeOptions, scene)
    plane.material = this.rayleighMaterial;
    plane.position = new Vector3(0, 0, .5);

    let phase = 0;
    scene.registerBeforeRender(() => {
      this.transducerMaterial.setFloat('globalPhase', Angle.FromDegrees(phase).radians());
      this.rayleighMaterial.setFloat('globalPhase', Angle.FromDegrees(phase).radians());

      phase += 6;
      phase %= 360;
    });
    return scene;
  }


  start() {

    // ... you can add content to the Scene

    // ignore the change events from the Engine in the Angular ngZone
    this.ngZone.runOutsideAngular(() => {
      // start the render loop and therefore start the Engine
      this.engine.runRenderLoop(() => this.scene.render())
    });
  }

  setTransducerPositions(positions: Array<{ x: number; y: number; phase: number }>) {
    const matrixBuffer = new Float32Array(16 * positions.length);
    const matrices = positions.map(pos => Matrix.Translation(pos.x, pos.y, 0));

    const excitationBuffer: Array<number> = [];
    positions.forEach(pos => {
      return [...excitationBuffer, pos.x, pos.y, pos.phase];
    });
    this.rayleighMaterial.setArray3('excitation', excitationBuffer);
    matrices.forEach((mat, index) => mat.copyToArray(matrixBuffer, index * 16));
    this.transducerPrototype.thinInstanceSetBuffer('matrix', matrixBuffer, 16, false);
  }
}
