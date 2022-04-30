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


import { BehaviorSubject, combineLatest } from 'rxjs';
import { RayleighMaterial } from './materials/rayleigh.material';
import { TransducerMaterial } from './materials/transducer.material';


export interface Transducer {
  name: string;
  pos: Vector3;
  enabled: boolean;
  selected: boolean;
}

export interface ExcitationElement {
  pos: Vector3;
  phase: number;
  amplitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class EngineService {
  engine: Engine;
  private scene: Scene;

  private transducerMaterial: TransducerMaterial;
  private rayleighMaterial: RayleighMaterial;

  private transducerPrototype: Mesh;

  private speedOfSoundSubject: BehaviorSubject<number> = new BehaviorSubject(343);
  public speedOfSound$ = this.speedOfSoundSubject.asObservable();
  
  private transducersSubject = new BehaviorSubject<Array<Transducer>>([]);
  public transducers$ = this.transducersSubject.asObservable();

  constructor(private ngZone: NgZone) {}

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

    this.transducerPrototype = CreatePlane('plane', apertureOptions, scene);
    this.transducerPrototype.material = this.transducerMaterial;

    // Result
    this.rayleighMaterial = new RayleighMaterial(scene);

    // Setup result plane
    const resultPlane = Plane.FromPositionAndNormal(origin, yPositive);
    const planeOptions = {
      sourcePlane: resultPlane
    };

    const plane = CreatePlane('plane', planeOptions, scene)
    plane.material = this.rayleighMaterial;
    plane.position = new Vector3(0, 0, .5);
    plane.bakeCurrentTransformIntoVertices();

    let phase = 0;
    scene.registerBeforeRender(() => {
      this.transducerMaterial.setFloat('globalPhase', Angle.FromDegrees(phase).radians());
      this.rayleighMaterial.setFloat('globalPhase', Angle.FromDegrees(phase).radians());
      this.rayleighMaterial.setFloat('t', Angle.FromDegrees(phase).radians());

      phase += 6;
      phase %= 360;
    });

    const excitationBuffer = new UniformBuffer(this.engine);
    // Unclear why we need to pass 16 here, 2x vec4 should be either
    // 1) 8 -> if a float counts as 1
    // 2) 32 -> if a float counts as 4: 2*4*4 
    excitationBuffer.addUniform('elements', 4, this.transducersSubject.value.length * 2);

    this.rayleighMaterial.onBind = ((mesh:AbstractMesh) => {
      this.rayleighMaterial.getEffect().bindUniformBuffer(excitationBuffer.getBuffer()!, 'excitation');
    })
    
    combineLatest([this.speedOfSound$, this.transducers$]).subscribe(
      ([speedOfSound, transducers]) => {

        this.rayleighMaterial.setInt('numElements', this.transducersSubject.value.length);
      
        const omega = 2.0 * Math.PI * 40000;
        
        this.rayleighMaterial.setFloat('omega', omega);
        this.rayleighMaterial.setFloat('k', omega / speedOfSound);
        
        this.rayleighMaterial.setInt('viewmode', 0);
        this.rayleighMaterial.setFloat('dynamicRange', 10);
    
        const elementSize = 8;

        const buffers = transducers.reduce((buffer, transducer, index) => {
          Matrix.Translation(
            transducer.pos.x, 
            transducer.pos.y, 
            transducer.pos.z
          ).copyToArray(buffer.matrixBuffer, index * 16);

          const elementOffset = elementSize * index;
          transducer.pos.toArray(buffer.excitationBuffer, elementOffset);
          
          buffer.excitationBuffer[elementOffset + 4] = 1; // amplitude
          buffer.excitationBuffer[elementOffset + 5] = 1; // area
          buffer.excitationBuffer[elementOffset + 6] = 0; // phase
          buffer.excitationBuffer[elementOffset + 7] = 0; // zero  

          return buffer;
        }, { 
          matrixBuffer: new Float32Array(16 * transducers.length),
          excitationBuffer: new Float32Array(elementSize * transducers.length) 
        } );

        this.transducerPrototype.thinInstanceSetBuffer('matrix', buffers.matrixBuffer, 16, false);
        excitationBuffer.updateUniformArray('elements', buffers.excitationBuffer, buffers.excitationBuffer.length);
        excitationBuffer.update();
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

  setTransducerPositions(positions: Array<Transducer>) {
    this.transducersSubject.next(positions);
  }
}
