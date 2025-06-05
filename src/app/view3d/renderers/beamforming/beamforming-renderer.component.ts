import { ChangeDetectionStrategy, Component, OnDestroy, forwardRef, output } from '@angular/core';

import { Mesh } from '@babylonjs/core/Meshes/mesh';

import { Scene } from '@babylonjs/core/scene';
import { BabylonConsumer } from '../../interfaces/lifecycle';
import { RotationGizmo } from '@babylonjs/core/Gizmos/rotationGizmo';

@Component({
    selector: 'app-beamforming-renderer',
    template: '<ng-content/>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    providers: [{provide: BabylonConsumer, useExisting: forwardRef(() => BeamformingRendererComponent)}],

})
export class BeamformingRendererComponent extends BabylonConsumer implements OnDestroy {
  az = output<number>();
  el = output<number>();
  
  private azHandle: Mesh;
  private elHandle: Mesh;
  private azRotationGizmo: RotationGizmo;
  private elRotationGizmo: RotationGizmo;

  async ngxSceneCreated(scene: Scene): Promise<void> {
    this.initialize3D(scene);
  }
  
  public initialize3D(scene : Scene) : void {
    this.azHandle = new Mesh('azHandle', scene);

    this.azRotationGizmo = new RotationGizmo();
    this.azRotationGizmo.scaleRatio = 3;
    this.azRotationGizmo.zGizmo.dispose();
    this.azRotationGizmo.xGizmo.dispose();
    this.azRotationGizmo.attachedMesh = this.azHandle;

    this.azRotationGizmo.yGizmo.dragBehavior.onDragObservable.add(event => {
      this.az.emit(this.azHandle.rotation.y);
    });

    this.elHandle = new Mesh('elHandle', scene);
  
    this.elRotationGizmo = new RotationGizmo();
    this.elRotationGizmo.scaleRatio = 3;
    this.elRotationGizmo.zGizmo.dispose();
    this.elRotationGizmo.yGizmo.dispose();
    this.elRotationGizmo.attachedMesh = this.elHandle;

    this.elRotationGizmo.xGizmo.dragBehavior.onDragObservable.add(event => {
      this.el.emit(this.elHandle.rotation.x);
    });
  }

  ngOnDestroy(): void {
    this.azHandle?.dispose();
    this.elHandle?.dispose();

    this.azRotationGizmo?.dispose();
    this.elRotationGizmo?.dispose();
  }
}
