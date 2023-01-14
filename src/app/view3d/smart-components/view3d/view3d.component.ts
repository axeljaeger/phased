import { AfterViewInit, Component, ElementRef, HostListener, NgZone, ViewChild } from '@angular/core';

import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { AxesViewer } from '@babylonjs/core/Debug/axesViewer';
import { Engine } from '@babylonjs/core/Engines/engine';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Effect } from '@babylonjs/core/Materials/effect';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Scene } from '@babylonjs/core/scene';
import { excitationBufferInclude } from 'src/app/utils/excitationbuffer';
import '@babylonjs/loaders/glTF';

import { Store } from '@ngrx/store';

import { Results } from 'src/app/store';

import { setTransducerHovered } from 'src/app/store/actions/selection.actions';
import { selectTransducers } from 'src/app/store/selectors/arrayConfig.selector';
import { selectEnvironment } from 'src/app/store/selectors/environment.selector';
import { selectRayleigh } from 'src/app/store/selectors/rayleigh.selector';
import { selectSelection } from 'src/app/store/selectors/selection.selector';
import { selectResultEnabled } from 'src/app/store/selectors/viewportConfig.selector';

@Component({
  selector: 'app-view3d',
  templateUrl: './view3d.component.html',
  styleUrls: ['./view3d.component.css'],
})
export class View3dComponent implements AfterViewInit {
  @ViewChild('view3dcanvas', { static: false })
  canvasRef: ElementRef<HTMLCanvasElement>;

  engine: Engine;
  public scene: Scene;

  title = 'Air coupled Ultrasound Array';

  transducers$ = this.store.select(selectTransducers);
  selection$ = this.store.select(selectSelection);
  environment$ = this.store.select(selectEnvironment);

  rayleighEnabled$ = this.store.select(selectResultEnabled(Results.RayleighIntegral));
  rayleighAspect$ = this.store.select(selectRayleigh);

  farfieldEnabled$ = this.store.select(selectResultEnabled(Results.Farfield));
  
  constructor(private store: Store, private ngZone: NgZone) {}

  public transducerHovered(transducerId : number) : void {
    this.store.dispatch(setTransducerHovered({transducerId }));
  }

  ngAfterViewInit(): void {
    this.initEngine(this.canvasRef);

  }

  @HostListener('window:resize', ['$event'])
  resize() : void {
    // this.engine.resize();
  }

  initEngine(canvas: ElementRef<HTMLCanvasElement>) {
    this.engine = new Engine(canvas.nativeElement, true);

    // Uniform buffers are disabled per default in Chrome on MacOS
    // Re-enable this.
    this.engine.disableUniformBuffers = false;

    const scene = this.createScene(canvas);
    window.setTimeout(() => {
      this.scene = scene;
      this.start();
      window.setTimeout(() => this.engine.resize(), 100);  
    }, 0);
    //this.scene.debugLayer.show();
  }

  createScene(canvas: ElementRef<HTMLCanvasElement>) {
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
    camera.zoomToMouseLocation = true;

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

    new AxesViewer(scene, 0.005);

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
