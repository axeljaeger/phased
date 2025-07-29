import {
    Component,
    input,
    output,
    signal,
    HostListener,
    viewChild,
    ElementRef,
    computed,
    effect,
  } from '@angular/core';
import { UVCoordinates } from 'src/app/store/beamforming.state';
import { azElToUV, uv2azel } from 'src/app/utils/uv';
  

@Component({
  selector: 'app-joystick',
  standalone: true,
  templateUrl: './joystick.component.html',
  styleUrls: ['./joystick.component.scss'],
})
export class JoystickComponent {
  svgRef = viewChild.required<ElementRef<SVGSVGElement>>('svgContainer');
  disabled = input(false);

  screenPosition = signal({ x: 0, y: 0 });
  positionInput = input({ u: 0, v: 0 });

  setInput = effect(() => {
    const uv = this.positionInput();
    const { az, el } = uv2azel(uv);
    this.screenPosition.set({
      x: 200 * az / Math.PI,
      y: -200 * el / Math.PI
    });
  });

  position = output<UVCoordinates>();


  radius = 100;
  knobRadius = 10;
  strokePadding = 2;
  paddedRadius = this.radius + this.knobRadius;
  svgSize = 2 * this.paddedRadius;
  viewBox = `${-this.paddedRadius} ${-this.paddedRadius} ${2*this.paddedRadius} ${2*this.paddedRadius}`;
  verticalLine = `M 0 ${-this.radius} V ${this.radius}`;
  horizontalLine = `M ${-this.radius} 0 H ${this.radius}`;

  dragging = false;
  dragOffset = { x: 0, y: 0 };
  
  shiftPressed = signal(false);
  dominantAxis = computed(() => {
    const {x, y} = this.screenPosition();
    if (!this.shiftPressed()) {
      return null;
    }
    return Math.abs(x) > Math.abs(y) ? 'x' : 'y';
  });

  getSvgCoordinates(event: PointerEvent) {
    const svg = this.svgRef().nativeElement;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const transformed = point.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: transformed.x, y: transformed.y };
  }

  onPointerDown(event: PointerEvent) {
    if (this.disabled()) return;

    this.dragging = true;
    const target = event.target as Element;

    target.setPointerCapture(event.pointerId);

    const coords = this.getSvgCoordinates(event);
    const knob = {
      cx: this.screenPosition().x,
      cy: this.screenPosition().y,
    };

    const targetIsKnob = target.tagName === 'circle';
    
    if (targetIsKnob) {
      this.dragOffset = {
        x: coords.x - knob.cx,
        y: coords.y - knob.cy,
      };
    } else {
      this.dragOffset = { x: 0, y: 0 };
    }
    this.updatePosition(event);
  }

  onPointerMove(event: PointerEvent) {
    if (this.disabled() || !this.dragging) return;
    this.updatePosition(event);
  }

  onPointerUp(event: PointerEvent) {
    if (this.disabled()) return;
    this.dragging = false;
    (event.target as Element).releasePointerCapture(event.pointerId);
  }

  @HostListener('window:keydown.shift')
  onKeyDown() {
    this.shiftPressed.set(true);
  }

  @HostListener('window:keyup.shift')
  onKeyUp() {
    this.shiftPressed.set(false);
  }

  updatePosition(event: PointerEvent) {
    const coords = this.getSvgCoordinates(event);
    const normX = Math.max(-this.radius, Math.min(this.radius, coords.x - this.dragOffset.x));
    const normY = Math.max(-this.radius, Math.min(this.radius, coords.y - this.dragOffset.y));
    const dom = this.shiftPressed() ? Math.abs(normX) > Math.abs(normY) ? 'x' : 'y' : null;

    this.screenPosition.set({
      x: dom === 'y' ? 0 : normX,
      y: dom === 'x' ? 0 : normY
    });

    const az = Math.PI * this.screenPosition().x / 200;
    const el = -Math.PI * this.screenPosition().y / 200;

    this.position.emit(azElToUV(az, el));
  }
}
