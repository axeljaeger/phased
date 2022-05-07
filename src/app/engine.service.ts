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
import { tap } from 'rxjs/operators';
import { RayleighMaterial } from './materials/rayleigh.material';
import { TransducerMaterial } from './materials/transducer.material';
import { createExcitationBuffer, excitationBufferInclude, excitationBufferMaxElements, setExcitationElement } from './utils/excitationbuffer';
import { Effect } from '@babylonjs/core/Materials/effect';
import { MAT4_ELEMENT_COUNT, VEC4_ELEMENT_COUNT } from './utils/webgl.utils';
import { Transducer } from './store/selectors/arrayConfig.selector';
import { selectArrayConfig } from './store/selectors/arrayConfig.selector';
import { Store } from '@ngrx/store';
import { selectTransducers } from './store/selectors/arrayConfig.selector';
import { selectEnvironment } from 'src/app/store/selectors/environment.selector';


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
  
  public transducers$ : Observable<Array<Transducer>>;

  constructor(private store: Store, private ngZone: NgZone) {
    this.transducers$ = store.select(selectTransducers);
  }

  initEngine(canvas: ElementRef<HTMLCanvasElement>) {
    this.engine = new Engine(canvas.nativeElement, true);
    this.scene = this.createScene(canvas);
  }

  createScene(canvas: ElementRef<HTMLCanvasElement>) {
    Effect.IncludesShadersStore["ExcitationBuffer"] = excitationBufferInclude as unknown as string;

    let scene = new Scene(this.engine);
    let camera = new ArcRotateCamera("Camera", Math.PI / 4, Math.PI / 4, 4, Vector3.Zero(), scene);
    camera.lowerRadiusLimit = 0.01;
    camera.attachControl(canvas, true);
    camera.minZ = 0.001;
    camera.inertia = 0;
    camera.wheelDeltaPercentage = 0.1;
    // camera.zoomToMouseLocation = true;

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
    
    // Babylons only supports element sizes of 1,2,3,4 and 16.
    // Use 4 here, although it is 8 in reality (VEC4_ELEMENT_COUNT * 2) and multiply the number
    // of elements by 2 to correct the final size:
    // 8 * maxElementSize becomes 4 * maxElementSize * 2
    excitationBuffer.addUniform('elements', VEC4_ELEMENT_COUNT /* *2 */, excitationBufferMaxElements * 2);

    this.rayleighMaterial.onBind = ((mesh:AbstractMesh) => {
      this.rayleighMaterial.getEffect().bindUniformBuffer(excitationBuffer.getBuffer()!, 'excitation');
    })
    
    this.rayleighMaterial.setInt('viewmode', 0);
    this.rayleighMaterial.setFloat('dynamicRange', 10);

    this.store.select(selectEnvironment).subscribe(speedOfSound => {
      const omega = 2.0 * Math.PI * 40000;
        
      this.rayleighMaterial.setFloat('omega', omega);
      this.rayleighMaterial.setFloat('k', omega / speedOfSound);
    });
    this.store.select(selectTransducers).subscribe(transducers => {
      this.rayleighMaterial.setInt('numElements', transducers.length);

      const bufferCollection = transducers.reduce((buffers, transducer, index) => {
        Matrix.Translation(
          transducer.pos.x, 
          transducer.pos.y, 
          transducer.pos.z
        ).copyToArray(buffers.matrixBuffer, index * MAT4_ELEMENT_COUNT);

        setExcitationElement(transducer.pos, buffers.excitationBuffer, index);
        return buffers;
      }, { 
        matrixBuffer: new Float32Array(MAT4_ELEMENT_COUNT * transducers.length),
        excitationBuffer: createExcitationBuffer()
      } );

      this.transducerPrototype.thinInstanceSetBuffer('matrix', bufferCollection.matrixBuffer, MAT4_ELEMENT_COUNT, false);
      excitationBuffer.updateUniformArray('elements', bufferCollection.excitationBuffer, bufferCollection.excitationBuffer.length);
      excitationBuffer.update();
    });
    return scene;
  }

  start() {
    // ignore the change events from the Engine in the Angular ngZone
    this.ngZone.runOutsideAngular(() => {
      // start the render loop and therefore start the Engine
      this.engine.runRenderLoop(() => this.scene.render())
    });
  }
}
