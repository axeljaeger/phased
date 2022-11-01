import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { setTransducerHovered, clearHover } from 'src/app/store/actions/selection.actions';

import { selectTransducers } from '../../../store/selectors/arrayConfig.selector';

@Component({
  selector: 'app-transducer-list',
  templateUrl: './transducer-list.component.html',
  styleUrls: ['./transducer-list.component.css']
})
export class TransducerListComponent implements OnInit {
  public transducers$ = this.store.select(selectTransducers);

  constructor(private store: Store) { }

  ngOnInit(): void {
  }

  public setTransducerHovered(index : number) : void {
    this.store.dispatch(setTransducerHovered({transducerId: index}));
  }

  public clearTransducerHighlight() : void {
    this.store.dispatch(clearHover());
  }
}
