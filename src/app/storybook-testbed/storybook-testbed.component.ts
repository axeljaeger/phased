import { Component, OnInit } from '@angular/core';
import { NoOpRendererService } from '../no-op-renderer.service';

@Component({
    selector: 'app-storybook-testbed',
    templateUrl: './storybook-testbed.component.html',
    styleUrls: ['./storybook-testbed.component.css'],
    standalone: true,
})
export class StorybookTestbedComponent implements OnInit {
  constructor(private rendererService: NoOpRendererService) {
    console.log('constructor');
  }

  ngOnInit(): void {
    console.log('ngOnInit');
    this.rendererService.doIt();
  }
}
