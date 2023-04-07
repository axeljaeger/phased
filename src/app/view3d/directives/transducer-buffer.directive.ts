import { Directive, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';

import { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';
import { Scene } from '@babylonjs/core/scene';
import { Transducer } from '../../store/selectors/arrayConfig.selector';
import { createExcitationBuffer, excitationBufferMaxElements, setExcitationElement } from '../../utils/excitationbuffer';
import { VEC4_ELEMENT_COUNT } from '../../utils/webgl.utils';

@Directive({ selector: '[appTransducerBuffer]'})
export class TransducerBufferDirective implements OnInit, OnChanges, OnDestroy {
  private readonly context = new TransducerBufferContext();
  private hasView = false;

  private uniformExcitationBuffer: UniformBuffer | null = null;

  @Input() appTransducerBuffer : Scene; // Default argument is the scene
  @Input() appTransducerBufferTransducers : Array<Transducer> | null;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef) { }
    
    ngOnChanges(changes: SimpleChanges): void {
        if (this.appTransducerBuffer) { // Actually the scene
            if (! this.uniformExcitationBuffer) {
                this.createBuffer()
            }
            if (this.appTransducerBufferTransducers) {
                this.updateBuffer(this.appTransducerBufferTransducers);
            }
        }
    }

    ngOnDestroy(): void {
        if (this.uniformExcitationBuffer) {
            this.uniformExcitationBuffer.dispose();
        }
    }
    
    ngOnInit(): void {
        if (!this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef, this.context);
            this.hasView = true;
        }
    }

    createBuffer() : void {
        this.uniformExcitationBuffer = new UniformBuffer(this.appTransducerBuffer.getEngine());
        // Babylons only supports element sizes of 1,2,3,4 and 16.
        // Use 4 here, although it is 8 in reality (VEC4_ELEMENT_COUNT * 2) and multiply the number
        // of elements by 2 to correct the final size:
        // 8 * maxElementSize becomes 4 * maxElementSize * 2
        this.uniformExcitationBuffer.addUniform(
          'elements',
          VEC4_ELEMENT_COUNT /* *2 */,
          excitationBufferMaxElements * 2
        );
        this.context.ueb = this.uniformExcitationBuffer;
    }

    updateBuffer(transducers: Transducer[]) : void {
        if (this.uniformExcitationBuffer) {
            const excitationBuffer = transducers.reduce(
                (buffer, transducer, index) => {
                  setExcitationElement(transducer.pos, buffer, index);
                  return buffer;
                },
                createExcitationBuffer(),
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

class TransducerBufferContext {
    ueb : UniformBuffer | null = null;
}