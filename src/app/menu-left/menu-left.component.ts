import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Vector3 } from '@babylonjs/core';
import { EngineService, Transducer } from '../engine.service';


@Component({
  selector: 'app-menu-left',
  templateUrl: './menu-left.component.html',
  styleUrls: ['./menu-left.component.css']
})
export class MenuLeftComponent implements OnInit {
  arrayConfig = this.fb.group({
    arrayType: 'ura',
    uraConfig: this.fb.group({
      elementsX: this.fb.control(0),
      elementsY: this.fb.control(0),
      pitchX: this.fb.control(0),
      pitchY: this.fb.control(0),
    }),
    circularConfig: this.fb.group({
      radius: this.fb.control(0),
      elements: this.fb.control(0),
    }),
  });

  constructor(public readonly engineService: EngineService, private fb: FormBuilder) { }

  ngOnInit(): void {

    // memleak
    this.arrayConfig.valueChanges.subscribe(val => {
      console.log("Array config update");
      const excitation : Array<Transducer> = [];
      if (val.arrayType === 'ura') {
        const countX: number = val.uraConfig.elementsX;
        const countY: number = val.uraConfig.elementsY;
        const pitchX: number = val.uraConfig.pitchX;
        const pitchY: number = val.uraConfig.pitchY;

        const sizeXH = (countX - 1) * pitchX / 2.0;
        const sizeYH = (countY - 1) * pitchY / 2.0;

        for (let x = 0; x < countX; x++) {
          for (let y = 0; y < countY; y++) {
            const xpos = -sizeXH + x * pitchX;
            const ypos = -sizeYH + y * pitchY;
            excitation.push({ 
              name: `Transducer ${y * countY + x}`,
              pos: new Vector3(xpos, ypos), 
              enabled: false,
              selected: false
            });
          }
        }
      }

      this.engineService.setTransducerPositions(excitation);
    });

    this.arrayConfig.patchValue({
      arrayType: 'ura',
      uraConfig: {
        elementsX: 2,
        elementsY: 2,
        pitchX: 0.043,
        pitchY: 0.0043,
      },
      circularConfig: {
        radius: 2,
        elements: 2,
      }
    });
  }
}
