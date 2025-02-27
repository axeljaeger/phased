import {
  AfterContentChecked,
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  HostListener,
  NgZone,
  OnInit,
  QueryList,
  ViewChild,
} from '@angular/core';

import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { AxesViewer } from '@babylonjs/core/Debug/axesViewer';
import { Engine } from '@babylonjs/core/Engines/engine';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Scene } from '@babylonjs/core/scene';
import { excitationBufferInclude } from '../../../utils/excitationbuffer';

import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { BabylonConsumer, implementsOnSceneCreated } from '../../interfaces/lifecycle';
import { WebGPUEngine } from '@babylonjs/core/Engines/webgpuEngine';
import { ShaderStore } from '@babylonjs/core/Engines/shaderStore';
import { map, pairwise, startWith } from 'rxjs';
import { Color4 } from '@babylonjs/core';

const diff = (previous: Array<any>, next: Array<any>) =>
({
  added: next.filter((val) => !previous.includes(val)),
  removed: previous.filter((val) => !next.includes(val)),
});

@Component({
  selector: 'app-babylon-jsview',
  templateUrl: './babylon-jsview.component.html',
  styleUrls: ['./babylon-jsview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'babylon',
  standalone: true,
})
export class BabylonJSViewComponent
  implements AfterViewChecked, OnInit, AfterContentChecked
{
  @ViewChild('view3dcanvas', { static: true })
  canvasRef: ElementRef<HTMLCanvasElement>;

  @ContentChildren(BabylonConsumer)
  renderers: QueryList<BabylonConsumer>;

  engine: WebGPUEngine | NullEngine;
  public scene: Scene;
  camera: ArcRotateCamera;

  constructor(
    private ngZone: NgZone,
    private elRef: ElementRef,
  ) {}
  ngAfterContentChecked(): void {
    this.ngZone.runOutsideAngular(() => {
      if (this.scene) {
        this.engine.beginFrame();
        this.scene.render();
        this.engine.endFrame();
      }
    });
  }

  ngAfterViewChecked(): void {
    this.ngZone.runOutsideAngular(() => {
      if (this.scene) {
        this.engine.beginFrame();
        this.scene.render();
        this.engine.endFrame();
      }
    });
  }

  @HostListener('window:resize')
  resize(): void {
    const rect = this.elRef.nativeElement.getBoundingClientRect();
    this.canvasRef.nativeElement.width = rect.width;
    this.canvasRef.nativeElement.height = rect.height;

    this.canvasRef.nativeElement.style.width = rect.width + 'px';
    this.canvasRef.nativeElement.style.height = rect.height + 'px';

    this.engine.resize(true);
  }

  async ngOnInit(): Promise<void> {
    await this.initEngine(this.canvasRef);
    
    this.renderers.changes
      .pipe(
        map((list) => list.toArray()),
        startWith([], this.renderers.toArray()),
        pairwise()
      )
      .subscribe(([prev, next]) => {
        const { added } = diff(prev, next);
        added.map((renderer) => {
          implementsOnSceneCreated(renderer)
          ? renderer.ngxSceneCreated(this.scene)
          : Promise.resolve() 
        });
      });

    await this.scene.whenReadyAsync();
    
    this.engine.beginFrame();
    this.scene.render();
    this.engine.endFrame();
  }

  async initEngine(canvas: ElementRef<HTMLCanvasElement>) {
    await this.ngZone.runOutsideAngular(async () => {
      if (window.WebGLRenderingContext) {        
        this.engine = new WebGPUEngine(canvas.nativeElement, {
          adaptToDeviceRatio: true,
        });
        await this.engine.initAsync();
       
        // this.engine.setStencilBuffer(true);
        // this.engine.setStencilMask(0xff);
      } else {
        this.engine = new NullEngine();
      }

      this.scene = this.createScene(canvas);
      this.scene.useRightHandedSystem = true;

      const renderingOrder = [
        'rayleigh',
        'farfieldMesh',
        'excitation',
        'excitationHidden'
      ];

      this.scene.setRenderingOrder(1, (meshA, meshB) => {
        const indexA = renderingOrder.indexOf(meshA.getMesh().name);
        const indexB = renderingOrder.indexOf(meshB.getMesh().name);
        if (indexA === indexB) return 0
        else if (indexA > indexB) return 1
        else return -1
      });

      this.scene.onBeforeRenderingGroupObservable.add((groupInfo) => {
        if (groupInfo.renderingGroupId === 0) {
          this.engine.setDepthFunction(Engine.LEQUAL);
        } 
      });

      this.scene.onPointerDown = () => {
        this.engine.runRenderLoop(() => this.camera.update());
      };

      this.scene.onPointerUp = () => {
        this.engine.stopRenderLoop();
      };

      this.scene.onPointerObservable.add((kbInfo) => {
        if (kbInfo.type == 8) {
          //scroll
          this.camera.update();
        }
      });
    });
    //this.scene.debugLayer.show();
    this.resize();
  }

  createScene(canvas: ElementRef<HTMLCanvasElement>) {
    ShaderStore.IncludesShadersStoreWGSL['ExcitationBuffer'] =
      excitationBufferInclude as unknown as string;

    const scene = new Scene(this.engine);
    scene.clearColor = new Color4(0.2, 0.2, 0.2, 1.0);
    this.camera = new ArcRotateCamera(
      'Camera',
      (3 * Math.PI) / 4,
      Math.PI / 4,
      0.1,
      Vector3.Zero(),
      scene
    );
    this.camera.lowerRadiusLimit = 0.01;
    this.camera.attachControl(canvas, true);
    this.camera.minZ = 0.001;
    this.camera.inertia = 0;
    this.camera.wheelDeltaPercentage = 0.1;
    this.camera.zoomToMouseLocation = true;

    this.camera.onViewMatrixChangedObservable.add(() => { 
      this.engine.beginFrame();
      scene.render();
      this.engine.endFrame();
    });

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
