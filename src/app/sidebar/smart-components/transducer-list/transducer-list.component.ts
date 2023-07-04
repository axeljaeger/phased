import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { setTransducerHovered, clearHover } from '../../../store/actions/selection.actions';

import { Transducer, selectTransducers } from '../../../store/selectors/arrayConfig.selector';

@Component({
  selector: 'app-transducer-list',
  templateUrl: './transducer-list.component.html',
  styleUrls: ['./transducer-list.component.css']
})
export class TransducerListComponent {
  public transducers$ = this.store.select(selectTransducers);
  transducerIndex(index: number, transducer: Transducer) : number {
    return index;
  }

  constructor(private store: Store) { }

  public setTransducerHovered(index : number) : void {
    this.store.dispatch(setTransducerHovered({transducerId: index}));
  }

  public clearTransducerHighlight() : void {
    this.store.dispatch(clearHover());
  }
}
