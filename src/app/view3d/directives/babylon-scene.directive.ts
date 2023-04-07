import { AfterContentInit, Directive, ElementRef, EmbeddedViewRef, HostListener, NgZone, OnChanges, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { AxesViewer } from '@babylonjs/core/Debug/axesViewer';
import { Engine } from '@babylonjs/core/Engines/engine';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Effect } from '@babylonjs/core/Materials/effect';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Scene } from '@babylonjs/core/scene';
import { excitationBufferInclude } from '../../utils/excitationbuffer';

/**
 * Add the template content to the DOM unless the condition is true.
 */
@Directive({ selector: '[appBabylonScene]'})
export class BabylonSceneDirective implements OnInit, AfterContentInit {
  private readonly context = new BabylonSceneContext();

  private viewRef : EmbeddedViewRef<any> | null = null;
  private hasView = false;
  private engine : Engine;
  private scene: Scene;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private ngZone: NgZone) { }
    
    ngOnInit(): void {
        console.log('Directive onInit');
        if (!this.hasView) {
            this.viewRef = this.viewContainer.createEmbeddedView(this.templateRef, this.context);
            this.hasView = true;
        }    
    }
  
    ngAfterContentInit(): void {
        console.log('Directive afterViewInit');
        const canvasRef = this.viewRef?.rootNodes[0];
        this.engine = new Engine(canvasRef, true);
        console.log(this.engine);
        // Uniform buffers are disabled per default in Chrome on MacOS
        // Re-enable this.
        this.engine.disableUniformBuffers = false;
        this.scene = this.createScene(canvasRef);
        this.context.scene = this.scene;
        this.start();
    }

    @HostListener('resize', ['$event'])
    resize() : void {
        console.log("Resize");
        this.engine.resize();
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


class BabylonSceneContext {
    scene : Scene | null = null;
}