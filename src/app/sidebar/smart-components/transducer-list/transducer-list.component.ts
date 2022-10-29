import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

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

}
