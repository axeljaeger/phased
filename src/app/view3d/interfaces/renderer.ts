import { Scene } from "@babylonjs/core/scene";
import { take } from "rxjs/operators";
import { View3dComponent } from "../smart-components/view3d/view3d.component";

export abstract class Renderer {
    constructor(view3d: View3dComponent) {
        if (view3d.scene) {
          this.initialize3D(view3d.scene);
        } else {
          view3d.view3DInitialized.pipe(take(1)).subscribe(() => {
            this.initialize3D(view3d.scene);
          });
        }
    }
    abstract initialize3D(scene: Scene): void;
}