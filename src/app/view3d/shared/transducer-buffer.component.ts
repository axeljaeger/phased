import {
  Component,
  ContentChildren,
  DestroyRef,
  forwardRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  QueryList,
  SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';
import { Scene } from '@babylonjs/core/scene';
import {
  createExcitationBuffer,
  excitationBufferMaxElements,
  setExcitationElement,
} from '../../utils/excitationbuffer';
import { VEC4_ELEMENT_COUNT } from '../../utils/webgl.utils';
import { BabylonConsumer } from '../interfaces/lifecycle';
import { map, pairwise, startWith, tap } from 'rxjs/operators';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { BeamformingState } from 'src/app/store/beamforming.state';
import { Transducer } from 'src/app/store/store.service';

export interface Textures {
  viridis: Texture;
  coolwarm: Texture;
}

export interface OnTransducerBufferCreated {
  ngxSceneAndBufferCreated(
    scene: Scene,
    buffer: UniformBuffer,
    textures: Textures
  ): void;
}

export abstract class TransducerBufferConsumer implements OnTransducerBufferCreated {
  abstract ngxSceneAndBufferCreated(scene: Scene, buffer: UniformBuffer, textures: Textures): void;
}

export const implementsOnTransducerBufferCreated = (
  candidate: unknown
): candidate is OnTransducerBufferCreated =>
  typeof candidate === 'object' &&
  candidate !== null &&
  'ngxSceneAndBufferCreated' in candidate;

const diff = (previous: Array<any>, next: Array<any>) =>
({
  added: next.filter((val) => !previous.includes(val)),
  removed: previous.filter((val) => !next.includes(val)),
});

@Component({
  selector: 'app-transducer-buffer',
  template: '<ng-content/>',
  standalone: true,
  providers: [{provide: BabylonConsumer, useExisting: forwardRef(() => TransducerBufferComponent)}],
})
export class TransducerBufferComponent extends BabylonConsumer
  implements OnChanges, OnDestroy {
  destroyRef = inject(DestroyRef);

  @Input() transducers: Transducer[] | null;
  @Input() beamforming: BeamformingState | null;
  @Input() k: number | null;

  @ContentChildren(TransducerBufferConsumer)
  consumers: QueryList<TransducerBufferConsumer>;

  private uniformExcitationBuffer: UniformBuffer;
  private textures: Textures;

  async ngxSceneCreated(scene: Scene): Promise<void> {
    this.uniformExcitationBuffer = new UniformBuffer(scene.getEngine());
    // Babylons only supports element sizes of 1,2,3,4 and 16.
    // Use 4 here, although it is 8 in reality (VEC4_ELEMENT_COUNT * 2) and multiply the number
    // of elements by 2 to correct the final size:
    // 8 * maxElementSize becomes 4 * maxElementSize * 2
    this.uniformExcitationBuffer.addUniform(
      'elements',
      VEC4_ELEMENT_COUNT /* *2 */,
      excitationBufferMaxElements * 2
    );

    const textures = ['assets/viridis.png', 'assets/coolwarm.png'];
    const tex = await Promise.all(
      textures.map((txpath) => {
        return new Promise((resolve, reject) => {
          const tex = new Texture(
            txpath,
            scene,
            undefined,
            undefined,
            undefined,
            () => {
              tex.wrapU = Texture.CLAMP_ADDRESSMODE;
              resolve(tex);
            }
          );
        });
      })
    );

    this.textures = {
      viridis: tex[0] as Texture,
      coolwarm: tex[1] as Texture,
    };

    this.updateBuffer(this.transducers ?? []);

    this.consumers.changes
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((list) => list.toArray()),
        startWith([], this.consumers.toArray()),
        pairwise()
      ).subscribe(([prev, next]) => {
        const { added } = diff(prev, next);
        added.forEach((consumer) => {
          if (implementsOnTransducerBufferCreated(consumer)) {
            consumer.ngxSceneAndBufferCreated(
              scene,
              this.uniformExcitationBuffer,
              this.textures
            );
          }
        });
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.uniformExcitationBuffer && this.transducers) {
      this.updateBuffer(this.transducers);
    }
  }

  ngOnDestroy(): void {
    if (this.uniformExcitationBuffer) {
      this.uniformExcitationBuffer.dispose();
    }
  }

  updateBuffer(transducers: Transducer[]): void {
    if (this.uniformExcitationBuffer) {
      const excitationBuffer = transducers.reduce(
        (buffer, transducer, index) => {
          const phase = this.beamforming?.enabled ? (this.k ?? 700) * ((this.beamforming?.u ?? 0) * transducer.pos.x + (this.beamforming?.v ?? 0) * transducer.pos.y) : 0;
          setExcitationElement(transducer.pos, phase, buffer, index);
          return buffer;
        },
        createExcitationBuffer()
      );

      this.uniformExcitationBuffer.updateUniformArray(
        'elements',
        excitationBuffer,
        excitationBuffer.length
      );
      this.uniformExcitationBuffer.update();
      console.log("Buffer updated");
    }
  }
}
