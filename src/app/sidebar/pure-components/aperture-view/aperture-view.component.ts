import { Component, computed, input } from '@angular/core';
import { Transducer } from 'src/app/store/arrayConfig.state';

@Component({
  selector: 'app-aperture-view',
  templateUrl: './aperture-view.component.html',
  styleUrls: ['./aperture-view.component.scss']
})
export class ApertureViewComponent {
  transducers = input<Transducer[]>([]);
  transducerDiameter = input<number>(0);
  bb = computed(() => {
    const rawBB = this.transducers().reduce((acc, t) => ({
        left: Math.min(acc.left, t.pos.x - this.transducerDiameter() / 2),
        top: Math.max(acc.top, t.pos.y + this.transducerDiameter() / 2),
        right: Math.max(acc.right, t.pos.x + this.transducerDiameter() / 2),
        bottom: Math.min(acc.bottom, t.pos.y - this.transducerDiameter() / 2) 
    }), {left: Infinity, top: -Infinity, right: -Infinity, bottom: Infinity});
    const bbString = `${rawBB.left} ${-rawBB.top} ${rawBB.right - rawBB.left} ${rawBB.top - rawBB.bottom}`;
    console.log(bbString);
    return bbString;
  });
  transducersMapped = computed(() => this.transducers().map(t => ({
    ...t,
    pos: { x: t.pos.x, y: -t.pos.y }
  })))
}