import { AfterViewInit, Component, ContentChildren, ElementRef, QueryList, ViewChild } from '@angular/core';
import { EngineService } from '../engine.service';
import { ExcitationComponent } from './excitation/excitation.component';

@Component({
  selector: 'app-view3d',
  templateUrl: './view3d.component.html',
  styleUrls: ['./view3d.component.css'],
  queries: {
    contentChildren: new ContentChildren(ExcitationComponent)  
  }
})
export class View3dComponent implements AfterViewInit {
  @ViewChild('view3dcanvas', { static: true })
  canvasRef: ElementRef<HTMLCanvasElement>;
  contentChildren: QueryList<ExcitationComponent>;

  constructor(private readonly engineService: EngineService) { }

  async ngAfterViewInit(): Promise<void> {
    await this.engineService.initEngine(this.canvasRef);
    this.engineService.start();
    this.contentChildren.forEach((child) => {
      child.initialize3D(this.engineService.scene);
    });
  }
}
