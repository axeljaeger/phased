import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { RxFor } from '@rx-angular/template/for';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { RxLet } from '@rx-angular/template/let';
import { SelectionActions } from 'src/app/store/selection.state';
import { Transducer, arrayConfigFeature } from 'src/app/store/arrayConfig.state';

@Component({
    selector: 'app-transducer-list',
    templateUrl: './transducer-list.component.html',
    styleUrls: ['./transducer-list.component.scss'],
    standalone: true,
    imports: [RxLet, MatExpansionModule, MatListModule, RxFor]
})
export class TransducerListComponent {
  public transducers$ = this.store.select(arrayConfigFeature.selectTransducers);
  transducerIndex(index: number, transducer: Transducer) : number {
    return index;
  }

  constructor(private store: Store) { }

  public setTransducerHovered(index : number) : void {
    this.store.dispatch(SelectionActions.set({transducerId: index}));
  }

  public clearTransducerHighlight() : void {
    this.store.dispatch(SelectionActions.clear());
  }
}
