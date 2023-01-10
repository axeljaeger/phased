import { AfterViewInit, Component, ContentChildren, ElementRef, HostListener, NgZone, QueryList, ViewChild } from '@angular/core';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { AxesViewer } from '@babylonjs/core/Debug/axesViewer';
import { Engine } from '@babylonjs/core/Engines/engine';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Effect } from '@babylonjs/core/Materials/effect';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Scene } from '@babylonjs/core/scene';
import { excitationBufferInclude } from 'src/app/utils/excitationbuffer';
import { Renderer } from '../../interfaces/renderer';

import '@babylonjs/loaders/glTF';

@Component({
  selector: 'app-view3d',
  templateUrl: './view3d.component.html',
  styleUrls: ['./view3d.component.css'],
})
export class View3dComponent implements AfterViewInit {
  @ViewChild('view3dcanvas', { static: true })
  canvasRef: ElementRef<HTMLCanvasElement>;

  @ContentChildren('renderer') 
  contentChildren: QueryList<Renderer>;

  initializedChildren : Array<Renderer> = [];

  engine: Engine;
  public scene: Scene;

  constructor(private ngZone: NgZone) { }

  ngAfterViewInit(): void {
    this.initEngine(this.canvasRef);
    this.start();

    this.contentChildren.changes.subscribe((val) => {
      this.initializeChildren();
    });

    this.initializeChildren();
    window.setTimeout(() => this.engine.resize(), 100);  
  }

  private initializeChildren() : void {
    this.contentChildren.forEach((child) => {
      // Initialize new children
      if (!this.initializedChildren.includes(child)) {
        child.initialize3D(this.scene);
        this.initializedChildren.push(child);
      }
    });
    // Cleanup children that are no longer part of the scene.
    this.initializedChildren = this.initializedChildren.filter((child) => this.contentChildren.toArray().includes(child));
  }

  @HostListener('window:resize', ['$event'])
  resize() : void {
    this.engine.resize();
  }

  initEngine(canvas: ElementRef<HTMLCanvasElement>) {
    this.engine = new Engine(canvas.nativeElement, true);

    // Uniform buffers are disabled per default in Chrome on MacOS
    // Re-enable this.
    this.engine.disableUniformBuffers = false;

    this.scene = this.createScene(canvas);
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
