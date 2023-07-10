import { AfterContentChecked, AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component , ContentChildren, ElementRef, EventEmitter, HostListener, NgZone, Output, QueryList, ViewChild} from '@angular/core';

import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { AxesViewer } from '@babylonjs/core/Debug/axesViewer';
import { Engine } from '@babylonjs/core/Engines/engine';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Effect } from '@babylonjs/core/Materials/effect';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Scene } from '@babylonjs/core/scene';
import { excitationBufferInclude } from '../../../utils/excitationbuffer';

import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { implementsOnSceneCreated } from '../../interfaces/lifecycle';

@Component({
    selector: 'app-babylon-jsview',
    templateUrl: './babylon-jsview.component.html',
    styleUrls: ['./babylon-jsview.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'babylon',
    standalone: true
})
export class BabylonJSViewComponent implements AfterViewChecked, AfterViewInit, AfterContentChecked {
  @ViewChild('view3dcanvas', { static: false })
  canvasRef: ElementRef<HTMLCanvasElement>;
  
  @ContentChildren('renderer')
  renderers: QueryList<any>;

  engine: Engine;
  public scene: Scene;
  camera: ArcRotateCamera;

  constructor(private ngZone: NgZone, private elRef:ElementRef, private cd: ChangeDetectorRef) {}
  ngAfterContentChecked(): void {
    this.ngZone.runOutsideAngular(() => {
      if (this.scene) {
        this.scene.render();
      }
    })
  }

  ngAfterViewChecked(): void {
    this.ngZone.runOutsideAngular(() => {
      if (this.scene) {
        this.scene.render();
      }
    })
  }

  @HostListener('window:resize')
  resize() : void  {
    const rect = this.elRef.nativeElement.getBoundingClientRect();
    this.canvasRef.nativeElement.width = rect.width;
    this.canvasRef.nativeElement.height = rect.height;
    this.engine.resize();
  }


  async ngAfterViewInit(): Promise<void> {
    this.initEngine(this.canvasRef);
    this.renderers.forEach(async (renderer) => {
      if (implementsOnSceneCreated(renderer)) {
        await renderer.ngxSceneCreated(this.scene);
      }
    });
  }

  initEngine(canvas: ElementRef<HTMLCanvasElement>) {
    this.ngZone.runOutsideAngular(() => {
      if (window.WebGLRenderingContext) {
        this.engine = new Engine(canvas.nativeElement, true);
      } else {
        this.engine = new NullEngine();
      }

      // Uniform buffers are disabled per default in Chrome on MacOS
      // Re-enable this.
      this.engine.disableUniformBuffers = false;
      
      this.scene = this.createScene(canvas);
      this.scene.useRightHandedSystem = true;

      this.scene.onPointerDown = () => {
       this.engine.runRenderLoop(() => this.camera.update());
      }

      this.scene.onPointerUp = () => {
       this.engine.stopRenderLoop();
      }

      this.scene.onPointerObservable.add((kbInfo) => {
        if (kbInfo.type == 8) //scroll
        {
            this.camera.update();
        }
      });
    });
    //this.scene.debugLayer.show();
    this.resize();
  }

  createScene(canvas: ElementRef<HTMLCanvasElement>) {
    Effect.IncludesShadersStore['ExcitationBuffer'] =
      excitationBufferInclude as unknown as string;

    let scene = new Scene(this.engine);
    this.camera = new ArcRotateCamera(
      'Camera',
      3*Math.PI / 4,
      Math.PI / 4,
      0.05,
      Vector3.Zero(),
      scene
    );
    this.camera.lowerRadiusLimit = 0.01;
    this.camera.attachControl(canvas, true);
    this.camera.minZ = 0.001;
    this.camera.inertia = 0;
    this.camera.wheelDeltaPercentage = 0.1;
    this.camera.zoomToMouseLocation = true;

    this.camera.onViewMatrixChangedObservable.add(() =>  scene.render() );

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
}
