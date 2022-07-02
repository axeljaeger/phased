import { Component, OnInit } from '@angular/core';
import { ArrayRendererService } from 'src/app/array-renderer.service';
import { NoOpRendererService } from 'src/app/no-op-renderer.service';

@Component({
  selector: 'app-storybook-testbed',
  templateUrl: './storybook-testbed.component.html',
  styleUrls: ['./storybook-testbed.component.css'],
})
export class StorybookTestbedComponent implements OnInit {

  constructor(private rendererService: NoOpRendererService) {
    console.log("constructor");
  }

  ngOnInit(): void {
    console.log("ngOnInit");
    this.rendererService.doIt();
  }

}
