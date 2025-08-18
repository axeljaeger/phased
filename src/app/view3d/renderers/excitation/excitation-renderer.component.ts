import { ChangeDetectionStrategy, Component, effect, forwardRef, input, output } from '@angular/core';

import { TransducerMaterial } from '../../materials/transducer.material';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Plane } from '@babylonjs/core/Maths/math.plane';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { MAT4_ELEMENT_COUNT, SCALAR_ELEMENT_COUNT } from '../../../utils/webgl.utils';

import { ExecuteCodeAction } from '@babylonjs/core/Actions/directActions';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';

import '@babylonjs/core/Culling/ray';
import '@babylonjs/core/Meshes/thinInstanceMesh';

import { SelectionState } from 'src/app/store/selection.state';
import { Scene } from '@babylonjs/core/scene';
import { BabylonConsumer } from '../../interfaces/lifecycle';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Transducer } from 'src/app/store/store.service';
import { CreateLineSystem, LinesMesh } from '@babylonjs/core';

@Component({
  selector: 'app-excitation-renderer',
  template: '<ng-content/>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  providers: [{ provide: BabylonConsumer, useExisting: forwardRef(() => ExcitationRendererComponent) }],
})
export class ExcitationRendererComponent extends BabylonConsumer {
  transducers = input<Transducer[] | null>(null);
  transducerDiameter = input<number | null>(null);
  transducerModel = input<'Point' | 'Piston'>('Piston');
  selection = input<SelectionState | null>(null);
  hovered = output<number>();

  // Piston transducer view
  private transducerMaterial: TransducerMaterial;
  private transducerMaterialHidden: TransducerMaterial;

  private transducerMesh: Mesh;
  private transducerMeshHidden: Mesh;

  // Point source transducer
  private pointMesh: LinesMesh;

  async ngxSceneCreated(scene: Scene): Promise<void> {
    this.initialize3D(scene);
    this.uploadArrayConfig(this.transducers(), this.selection());
  }

  updateArrayConfig = effect(() => {
    const transducers = this.transducers();
    const selection = this.selection();

    if (this.transducerMaterial) {
      this.uploadArrayConfig(transducers, selection);
    }
  })

  public initialize3D(scene: Scene): void {
    this.transducerMaterial = new TransducerMaterial(scene);
    this.transducerMaterial.depthFunction = Engine.ALWAYS;
    this.transducerMaterial.stencil.enabled = true;
    this.transducerMaterial.stencil.funcRef = 1;
    this.transducerMaterial.stencil.func = Engine.EQUAL;
    this.transducerMaterial.stencil.opStencilDepthPass = Engine.KEEP;
    this.transducerMaterial.setFloat('innerRadius', 0.85);

    this.transducerMaterialHidden = new TransducerMaterial(scene);
    this.transducerMaterialHidden.depthFunction = Engine.ALWAYS;
    this.transducerMaterialHidden.stencil.enabled = true;
    this.transducerMaterialHidden.stencil.funcRef = 1;
    this.transducerMaterialHidden.stencil.func = Engine.NOTEQUAL;
    this.transducerMaterialHidden.stencil.opStencilDepthPass = Engine.KEEP;
    this.transducerMaterialHidden.setFloat('innerRadius', 0.0);

    const origin = new Vector3(0, 0, 0);
    const zPositive = new Vector3(0, 0, -1);
    const aperturePlane = Plane.FromPositionAndNormal(origin, zPositive);

    const apertureOptions = {
      sourcePlane: aperturePlane,
      size: 1,
    };

    this.transducerMesh = CreatePlane('excitation', apertureOptions, scene);
    this.transducerMesh.material = this.transducerMaterial;
    this.transducerMesh.renderingGroupId = 1;
    this.transducerMesh.thinInstanceEnablePicking = true;
    this.transducerMesh.pointerOverDisableMeshTesting = false;

    this.transducerMeshHidden = CreatePlane('excitationHidden', apertureOptions, scene);
    this.transducerMeshHidden.material = this.transducerMaterialHidden;
    this.transducerMeshHidden.renderingGroupId = 1;
    this.transducerMeshHidden.thinInstanceEnablePicking = true;
    this.transducerMeshHidden.pointerOverDisableMeshTesting = false;

    const actionManager = new ActionManager(scene);
    this.transducerMesh.actionManager = actionManager;

    actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnPointerOverTrigger,
        },
        (event) => {
          const pickingResult = scene.pick(event.pointerX, scene.pointerY);
          this.hovered.emit(pickingResult.thinInstanceIndex);
        }
      )
    )
    actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnPointerOutTrigger,
        },
        (event) => this.hovered.emit(-1)
      )
    )


    const options = {
      lines: [[
        new Vector3(-.5, -.5, 0),
        new Vector3(.5, .5, 0)
      ], [
        new Vector3(-.5, .5, 0),
        new Vector3(.5, -.5, 0)
      ]],
    }

    this.pointMesh = CreateLineSystem("point", options, scene);
    this.pointMesh.renderingGroupId = 1;
    this.pointMesh.material!.alpha = 0.99;

    this.uploadArrayConfig(this.transducers(), this.selection());
  }

  private uploadArrayConfig(transducersx: Transducer[] | null, selectionx: SelectionState | null): void {
    const transducers = transducersx ?? []
    const selection: SelectionState = selectionx ?? { hovered: [], selected: [] };

    const initial = { left: Infinity, top: -Infinity, right: -Infinity, bottom: Infinity };

    const rawBB = (transducers ?? []).reduce((acc, t) => ({
      left: Math.min(acc.left, t.pos.x),
      top: Math.max(acc.top, t.pos.y),
      right: Math.max(acc.right, t.pos.x),
      bottom: Math.min(acc.bottom, t.pos.y)
    }), initial);

    const maxDim = Math.max(rawBB.right - rawBB.left, rawBB.top - rawBB.bottom);
    const pointCrossSize = Math.max(maxDim * 0.005, 0.0001);

    const buffers = (transducers ?? []).reduce(
      (buffers, transducer, index) => {
        Matrix.Scaling(this.transducerDiameter()!, this.transducerDiameter()!, 1).multiply(Matrix.Translation(
          transducer.pos.x,
          transducer.pos.y,
          transducer.pos.z
        )).copyToArray(buffers.matrices, index * MAT4_ELEMENT_COUNT);

        Matrix.Scaling(pointCrossSize, pointCrossSize, 1).multiply(Matrix.Translation(
          transducer.pos.x,
          transducer.pos.y,
          transducer.pos.z
        )).copyToArray(buffers.pointMatrices, index * MAT4_ELEMENT_COUNT);

        buffers.selection[index] = selection.hovered.includes(index) ? 1 : 0;

        return buffers;
      },
      {
        matrices: new Float32Array(MAT4_ELEMENT_COUNT * transducers.length),
        pointMatrices: new Float32Array(MAT4_ELEMENT_COUNT * transducers.length),
        selection: new Float32Array(SCALAR_ELEMENT_COUNT * transducers.length)
      }
    );

    if (transducers.length > 0) {
      switch (this.transducerModel()) {
        case 'Point':
          this.pointMesh.thinInstanceSetBuffer(
            'matrix',
            buffers.pointMatrices,
            MAT4_ELEMENT_COUNT,
            false
          );
          this.pointMesh.setEnabled(true);
          [this.transducerMesh, this.transducerMeshHidden].forEach(mesh => {
            mesh.setEnabled(false);
          });
          break;
        case 'Piston':
          this.pointMesh.setEnabled(false);
          [this.transducerMesh, this.transducerMeshHidden].forEach(mesh => {
            mesh.setEnabled(true);
            mesh.thinInstanceSetBuffer(
              'matrix',
              buffers.matrices,
              MAT4_ELEMENT_COUNT,
              false
            );

            mesh.thinInstanceSetBuffer(
              'selected',
              buffers.selection,
              SCALAR_ELEMENT_COUNT,
              false
            );
          });
          break;
      }
    } else {
      [this.transducerMesh, this.transducerMeshHidden, this.pointMesh].forEach(mesh => {
        mesh.setEnabled(false);
      });
    }
  }
}
