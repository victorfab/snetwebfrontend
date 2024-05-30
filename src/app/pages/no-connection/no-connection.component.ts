import { Component } from '@angular/core';

@Component({
  selector: 'no-connection',
  template: `
    <div>
      <h1 class="text-center">Lo sentimos :(</h1>
      <p class="text-center">NO hemos detectado una conexión a internet estable, por favor intente más tarde.</p>
    </div>
  `
})
export class NoConnectionComponent {

}
