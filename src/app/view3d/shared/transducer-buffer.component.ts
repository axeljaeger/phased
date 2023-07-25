import {
  Component,
  ContentChildren,
  Input,
  OnChanges,
  OnDestroy,
  QueryList,
  SimpleChanges,
} from '@angular/core';

import { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';
import { Scene } from '@babylonjs/core/scene';
import { Transducer } from '../../store/selectors/arrayConfig.selector';
import {
  createExcitationBuffer,
  excitationBufferMaxElements,
  setExcitationElement,
} from '../../utils/excitationbuffer';
import { VEC4_ELEMENT_COUNT } from '../../utils/webgl.utils';
import { OnSceneCreated } from '../interfaces/lifecycle';
import { map, pairwise } from 'rxjs/operators';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Beamforming } from 'src/app/store/reducers/beamforming.reducer';

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
  template: '<ng-content></ng-content>',
  standalone: true,
})
export class TransducerBufferComponent
  implements OnChanges, OnDestroy, OnSceneCreated {
  @Input() transducers: Array<Transducer> | null;
  @Input() beamforming: Beamforming | null;

  @ContentChildren('transducerBufferConsumer')
  consumers: QueryList<any>;

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

    this.consumers.forEach((consumer) => {
      if (implementsOnTransducerBufferCreated(consumer)) {
        consumer.ngxSceneAndBufferCreated(
          scene,
          this.uniformExcitationBuffer,
          this.textures
        );
      }
    });

    this.consumers.changes
      .pipe(
        map((list) => list.toArray()),
        pairwise()
      )
      .subscribe(([prev, next]) => {
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
          setExcitationElement(transducer.pos, buffer, index);
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
    }
  }
}
