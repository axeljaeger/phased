import {
    Component,
    input,
    output,
    signal,
    effect,
  } from '@angular/core';
  
  interface Position2D {
    x: number;
    y: number;
  }

  @Component({
    selector: 'app-joystick',
    standalone: true,
    templateUrl: './joystick.component.html',
    styleUrls: ['./joystick.component.scss'],
  })
  export class JoystickComponent {
    disabled = input(false);
    positionInput = input<Position2D>({ x: 0, y: 0 });
    position = output<Position2D>();
  
    x = signal(0);
    y = signal(0);
    radius = 100;
    knobRadius = 10;
    strokePadding = 2;
  
    get totalPadding(): number {
      return Math.max(this.knobRadius, this.strokePadding);
    }
  
    get paddedRadius() {
      return this.radius - this.knobRadius;
    }
  
    get svgSize(): number {
      return this.radius * 2 + this.totalPadding * 2;
    }
  
    get viewBox(): string {
      return `${-this.totalPadding} ${-this.totalPadding} ${this.svgSize + 2} ${this.svgSize + 2}`;
    }
  
    dragging = false;
    shiftPressed = false;
    dragOffset = { x: 0, y: 0 };
  
    readonly syncPosition = effect(() => {
      const pos = this.positionInput();
      //this.x.set(pos.x);
      //this.y.set(pos.y);
    });
  
    readonly emitPosition = effect(() => {
      this.position.emit({ x: this.x(), y: this.y() });
    });
  
    getCenter() {
      return this.totalPadding + this.radius;
    }
  
    getKnobPosition() {
      return {
        cx: this.getCenter() + this.x() * this.paddedRadius,
        cy: this.getCenter() - this.y() * this.paddedRadius,
      };
    }
  
    get dominantAxis(): 'x' | 'y' | null {
      if (!this.shiftPressed) return null;
      return Math.abs(this.x()) > Math.abs(this.y()) ? 'x' : 'y';
    }
  
    getSvgCoordinates(event: PointerEvent): { x: number; y: number } {
      const svg = (event.target as SVGElement).closest('svg')!;
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const transformed = point.matrixTransform(svg.getScreenCTM()!.inverse());
      return { x: transformed.x, y: transformed.y };
    }
  
    onPointerDown(event: PointerEvent) {
      if (this.disabled()) return;
  
      this.dragging = true;
      (event.target as Element).setPointerCapture(event.pointerId);
  
      const coords = this.getSvgCoordinates(event);
      const knob = this.getKnobPosition();
      const targetIsKnob = (event.target as Element).classList.contains('joystick-knob');
  
      if (targetIsKnob) {
        this.dragOffset = {
          x: coords.x - knob.cx,
          y: coords.y - knob.cy,
        };
        this.updatePosition(event, true);
      } else {
        this.dragOffset = { x: 0, y: 0 };
        this.updatePosition(event, false);
      }
    }
  
    onPointerMove(event: PointerEvent) {
      if (this.disabled() || !this.dragging) return;
      this.updatePosition(event, true);
    }
  
    onPointerUp(event: PointerEvent) {
      if (this.disabled()) return;
      this.dragging = false;
      (event.target as Element).releasePointerCapture(event.pointerId);
    }
  
    onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Shift') this.shiftPressed = true;
    }
  
    onKeyUp(event: KeyboardEvent) {
      if (event.key === 'Shift') this.shiftPressed = false;
    }
  
    updatePosition(event: PointerEvent, applyOffset: boolean = true) {
      const coords = this.getSvgCoordinates(event);
      const center = this.getCenter();
  
      const offsetX = applyOffset ? this.dragOffset.x : 0;
      const offsetY = applyOffset ? this.dragOffset.y : 0;
  
      let newX = (coords.x - center - offsetX) / this.paddedRadius;
      let newY = (center - coords.y + offsetY) / this.paddedRadius;
  
      if (this.shiftPressed) {
        if (Math.abs(newX) > Math.abs(newY)) newY = 0;
        else newX = 0;
      }  
      this.x.set(Math.max(-1, Math.min(1, newX)));
      this.y.set(Math.max(-1, Math.min(1, newY)));
    }
  }
  