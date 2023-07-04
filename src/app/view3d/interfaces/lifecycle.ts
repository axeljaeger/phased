import { Scene } from "@babylonjs/core/scene";

export interface OnSceneCreated {
    ngxSceneCreated(scene: Scene): void;
}

export const implementsOnSceneCreated = (candidate: unknown): candidate is OnSceneCreated =>
  typeof candidate === 'object' && candidate !== null && 'ngxSceneCreated' in candidate;