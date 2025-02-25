import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RangeKpi } from 'src/app/store/arrayConfig.state';

@Component({
  selector: 'app-kpi',
  imports: [ DecimalPipe ],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.scss'
})
export class KPIComponent {
  kpis = input<{fnbw : RangeKpi, hpbw: RangeKpi}>();
}
