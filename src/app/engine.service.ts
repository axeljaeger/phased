import { ElementRef, Injectable, NgZone } from '@angular/core';

import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Engine } from '@babylonjs/core/Engines/engine';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import '@babylonjs/core/Meshes/thinInstanceMesh'
import { Scene } from '@babylonjs/core/scene';

import { BehaviorSubject, Observable } from 'rxjs';
import { excitationBufferInclude } from './utils/excitationbuffer';
import { Effect } from '@babylonjs/core/Materials/effect';
import { Store } from '@ngrx/store';
import {
  Transducer,
  selectTransducers,
} from './store/selectors/arrayConfig.selector';

import '@babylonjs/loaders/glTF';
import { initializeResources } from './store/actions/babylon-lifecycle.actions';

// import '@babylonjs/core/Debug/debugLayer';
// import '@babylonjs/inspector';

@Injectable({
  providedIn: 'root',
})
export class EngineService {
  engine: Engine;
  public scene: Scene;

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

    // Uniform buffers are disabled per default in Chrome on MacOS
    // Re-enable this.
    this.engine.disableUniformBuffers = false;

    this.scene = await this.createScene(canvas);
    this.store.dispatch(initializeResources());
    //this.scene.debugLayer.show();
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

    let phase = 0;
    scene.registerBeforeRender(() => {
      // this.transducerMaterial.setFloat(
      //   'globalPhase',
      //   Angle.FromDegrees(phase).radians()
      // );
      // this.rayleighMaterial.setFloat(
      //   'globalPhase',
      //   Angle.FromDegrees(phase).radians()
      // );
      // this.rayleighMaterial.setFloat('t', Angle.FromDegrees(phase).radians());
      phase += 6;
      phase %= 360;
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
}
