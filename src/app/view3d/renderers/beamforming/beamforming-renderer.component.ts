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
  
  private beamFormHandle: Mesh;

  async ngxSceneCreated(scene: Scene): Promise<void> {
    this.initialize3D(scene);
  }
  
  public initialize3D(scene : Scene) : void {

    this.beamFormHandle = CreateIcoSphere('arrayPitchHandle', {
      radius: 0.00025,
      subdivisions: 3,
    })

    const rotationGizmo = new RotationGizmo();
    rotationGizmo.scaleRatio = 3;
    rotationGizmo.zGizmo.dispose();
    rotationGizmo.attachedMesh = this.beamFormHandle;

    rotationGizmo.xGizmo.dragBehavior.onDragObservable.add(event => {
      this.el.next(this.beamFormHandle.rotation.x);
    });

    rotationGizmo.yGizmo.dragBehavior.onDragObservable.add(event => {
      this.az.next(this.beamFormHandle.rotation.y);    
    });
  }
}
