import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { setTransducerHovered, clearHover } from '../../../store/actions/selection.actions';

import { Transducer, selectTransducers } from '../../../store/selectors/arrayConfig.selector';
import { RxFor } from '@rx-angular/template/for';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { RxLet } from '@rx-angular/template/let';

@Component({
    selector: 'app-transducer-list',
    templateUrl: './transducer-list.component.html',
    styleUrls: ['./transducer-list.component.css'],
    standalone: true,
    imports: [RxLet, MatExpansionModule, MatListModule, RxFor]
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
