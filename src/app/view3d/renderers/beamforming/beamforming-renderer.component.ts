import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

import { Mesh } from '@babylonjs/core/Meshes/mesh';

import { Scene } from '@babylonjs/core/scene';
import { CreateIcoSphere } from '@babylonjs/core/Meshes/Builders/icoSphereBuilder';
import { OnSceneCreated } from '../../interfaces/lifecycle';
import { RotationGizmo } from '@babylonjs/core';

@Component({
    selector: 'app-beamforming-renderer',
    template: '<ng-content></ng-content>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class BeamformingRendererComponent implements OnSceneCreated {
  @Output() az = new EventEmitter<number>();
  @Output() el = new EventEmitter<number>();
  
  private azHandle: Mesh;
  private elHandle: Mesh;

  async ngxSceneCreated(scene: Scene): Promise<void> {
    this.initialize3D(scene);
  }
  
  public initialize3D(scene : Scene) : void {
    this.azHandle = new Mesh('azHandle', scene);

    const azRotationGizmo = new RotationGizmo();
    azRotationGizmo.scaleRatio = 3;
    azRotationGizmo.zGizmo.dispose();
    azRotationGizmo.yGizmo.dispose();
    azRotationGizmo.attachedMesh = this.azHandle;

    azRotationGizmo.xGizmo.dragBehavior.onDragObservable.add(event => {
      this.az.next(this.azHandle.rotation.x);
    });

    this.elHandle = new Mesh('elHandle', scene);
  
    const elRotationGizmo = new RotationGizmo();
    elRotationGizmo.scaleRatio = 3;
    elRotationGizmo.zGizmo.dispose();
    elRotationGizmo.xGizmo.dispose();
    elRotationGizmo.attachedMesh = this.elHandle;

    elRotationGizmo.yGizmo.dragBehavior.onDragObservable.add(event => {
      this.el.next(this.elHandle.rotation.y);
    });
  }
}
