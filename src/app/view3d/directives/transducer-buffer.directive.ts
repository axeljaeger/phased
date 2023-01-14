import { Directive, EmbeddedViewRef, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Scene } from '@babylonjs/core/scene';

/**
 * Add the template content to the DOM unless the condition is true.
 */
@Directive({ selector: '[appTransducerBuffer]'})
export class TransducerBufferDirective implements OnInit {
  private readonly context = new TransducerBufferContext();

  private viewRef : EmbeddedViewRef<any> | null = null;
  private hasView = false;

  @Input() set scene(scenex: Scene) {
    
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef) { }
    
    ngOnInit(): void {
        console.log('Directive onInit');
        if (!this.hasView) {
            this.viewRef = this.viewContainer.createEmbeddedView(this.templateRef, this.context);
            this.hasView = true;
        }    
    }
}


class TransducerBufferContext {
    scene : Scene | null = null;
}