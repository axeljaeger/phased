import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NoOpRendererService {

  constructor() {
    console.log("constructor");
   }

  public doIt() : void {
    console.log("Do it");
  }
}
