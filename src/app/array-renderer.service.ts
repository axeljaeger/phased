import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ArrayRendererService {

  constructor() { 
    console.log("Hello from renderer service");
  }
}
