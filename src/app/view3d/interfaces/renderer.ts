import { Scene } from "@babylonjs/core/scene";

export interface Renderer {
    initialized: boolean;
    initialize3D: (scene: Scene) => void;
}