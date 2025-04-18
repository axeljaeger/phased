import { Component, computed, input } from '@angular/core';
import { Transducer } from 'src/app/store/store.service';

@Component({
  selector: 'app-aperture-view',
  templateUrl: './aperture-view.component.html',
  styleUrls: ['./aperture-view.component.scss']
})
export class ApertureViewComponent {
  transducers = input<Transducer[]>([]);
  transducerDiameter = input<number>(0);
  arrayDiameter = input<number | null>(null);
  bb = computed(() => {
    const dia = this.arrayDiameter();

    const initial = (dia === null) ?
      { left: Infinity, top: -Infinity, right: -Infinity, bottom: Infinity } : 
      { left: -dia / 2 - 0.001, top: dia / 2 + 0.001, right: dia / 2 + 0.001, bottom: -dia / 2 - 0.001};

    const rawBB = this.transducers().reduce((acc, t) => ({
        left: Math.min(acc.left, t.pos.x - this.transducerDiameter() / 2),
        top: Math.max(acc.top, t.pos.y + this.transducerDiameter() / 2),
        right: Math.max(acc.right, t.pos.x + this.transducerDiameter() / 2),
        bottom: Math.min(acc.bottom, t.pos.y - this.transducerDiameter() / 2) 
    }), initial);
    const bbString = `${rawBB.left} ${-rawBB.top} ${rawBB.right - rawBB.left} ${rawBB.top - rawBB.bottom}`;
    return bbString;
  });
  transducersMapped = computed(() => this.transducers().map(t => ({
    ...t,
    pos: { x: t.pos.x, y: -t.pos.y }
  })))
}