import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { EngineService } from '../engine.service';

@Component({
  selector: 'app-view3d',
  templateUrl: './view3d.component.html',
  styleUrls: ['./view3d.component.css']
})
export class View3dComponent implements AfterViewInit {
  @ViewChild('view3dcanvas', { static: true })
  canvasRef: ElementRef<HTMLCanvasElement>;

  constructor(private readonly engineService: EngineService) { }

  async ngAfterViewInit(): Promise<void> {
    await this.engineService.initEngine(this.canvasRef);
    this.engineService.start();
  }
}
