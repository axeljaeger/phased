import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, forwardRef } from '@angular/core';

import { PositionGizmo } from '@babylonjs/core/Gizmos/positionGizmo';
import { CreateIcoSphere } from '@babylonjs/core/Meshes/Builders/icoSphereBuilder';
import { PointerDragBehavior } from '@babylonjs/core/Behaviors/Meshes/pointerDragBehavior';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { BabylonConsumer } from '../../interfaces/lifecycle';
import { Scene } from '@babylonjs/core';
import { ArrayConfig } from 'src/app/store/arrayConfig.state';


@Component({
  selector: 'app-ura-interaction',
  standalone: true,
  imports: [],
  template: '<ng-content />',
  providers: [{provide: BabylonConsumer, useExisting: forwardRef(() => UraInteractionRendererComponent)}],
})
export class UraInteractionRendererComponent extends BabylonConsumer implements OnDestroy, OnChanges {
  @Input() arrayConfig : ArrayConfig | null = null;
  @Output() arrayConfigChange = new EventEmitter<ArrayConfig>();
  
  private pitchHandle: Mesh;
  private pitchGizmo: PositionGizmo;

  private numHandle: Mesh;
  private numGizmo: PositionGizmo;


  private pointerDragBehavior: PointerDragBehavior;
  private offset: Vector3;

  async ngxSceneCreated(scene: Scene): Promise<void> {
    
    this.pitchHandle = CreateIcoSphere('arrayPitchHandle', {
      radius: 0.00025,
      subdivisions: 3,
    })

    this.pitchGizmo = new PositionGizmo();
    this.pitchGizmo.zGizmo.dispose();
    this.pitchGizmo.attachedMesh = this.pitchHandle;
    
    this.pitchGizmo.xGizmo.dragBehavior.moveAttached = false;
    this.pitchGizmo.xGizmo.dragBehavior.onDragStartObservable.add(event => 
      this.offset = this.pitchHandle.position.subtract(event.dragPlanePoint)
    );
    
    this.pitchGizmo.xGizmo.dragBehavior.onDragObservable.add(event => {
      if (this.arrayConfig) {
        this.arrayConfigChange.next({
          ...this.arrayConfig,
          uraConfig: {
            ...this.arrayConfig.uraConfig,
            pitchX: event.dragPlanePoint.add(this.offset).x * 2 / (this.arrayConfig.uraConfig.elementsX-1)
          }
        });
      }
    });

    this.pitchGizmo.yGizmo.dragBehavior.moveAttached = false;
    this.pitchGizmo.yGizmo.dragBehavior.onDragStartObservable.add(event => 
      this.offset = this.pitchHandle.position.subtract(event.dragPlanePoint)
    );
    this.pitchGizmo.yGizmo.dragBehavior.onDragObservable.add(event => {
      if (this.arrayConfig) {
        this.arrayConfigChange.next({
          ...this.arrayConfig,
          uraConfig: {
            ...this.arrayConfig.uraConfig,
            pitchY: event.dragPlanePoint.add(this.offset).y * 2 /(this.arrayConfig.uraConfig.elementsY-1)
          }
        });
      }
    });

    /// 

    this.numHandle = CreateIcoSphere('arrayPitchHandle', {
      radius: 0.00025,
      subdivisions: 3,
    })

    this.numGizmo = new PositionGizmo();
    this.numGizmo.zGizmo.dispose();
    this.numGizmo.attachedMesh = this.numHandle;
    this.numGizmo.xGizmo.dragBehavior.moveAttached = false;
    this.numGizmo.xGizmo.dragBehavior.onDragStartObservable.add(event => 
      this.offset = this.pitchHandle.position.subtract(event.dragPlanePoint)
    );
    this.numGizmo.xGizmo.dragBehavior.onDragObservable.add(event => {
      if (this.arrayConfig) {
        this.arrayConfigChange.next({
          ...this.arrayConfig,
          uraConfig: {
            ...this.arrayConfig.uraConfig,
            elementsX: Math.abs(1 + Math.round(2*event.dragPlanePoint.add(this.offset).x / this.arrayConfig.uraConfig.pitchX))
          }
        });
      }
    });

    this.numGizmo.yGizmo.dragBehavior.moveAttached = false;
    this.numGizmo.yGizmo.dragBehavior.onDragStartObservable.add(event => 
      this.offset = this.pitchHandle.position.subtract(event.dragPlanePoint)
    );
    this.numGizmo.yGizmo.dragBehavior.onDragObservable.add(event => {
      if (this.arrayConfig) {
        this.arrayConfigChange.next({
          ...this.arrayConfig,
          uraConfig: {
            ...this.arrayConfig.uraConfig,
            elementsY: Math.abs(1 + Math.round(2*event.dragPlanePoint.add(this.offset).y / this.arrayConfig.uraConfig.pitchY))
          }
        });
      }
    });
    this.prepareHandles();
  }

  ngOnDestroy(): void {
    this.pitchHandle?.dispose();
    this.pitchGizmo?.dispose();

    this.numHandle?.dispose();
    this.numGizmo?.dispose();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.prepareHandles();
  }

  prepareHandles() : void {
    if (this.arrayConfig && this.pitchHandle) {
      this.numHandle.position = new Vector3(
        this.arrayConfig.uraConfig.pitchX * this.arrayConfig.uraConfig.elementsX / 2, 
        this.arrayConfig.uraConfig.pitchY * this.arrayConfig.uraConfig.elementsY / 2,0);
    
        this.pitchHandle.position = new Vector3(
          this.arrayConfig.uraConfig.pitchX * (this.arrayConfig.uraConfig.elementsX-1) / 2, 
          this.arrayConfig.uraConfig.pitchY * (this.arrayConfig.uraConfig.elementsY-1) / 2,0);
    }
  }
}
