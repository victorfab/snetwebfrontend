import { Component } from '@angular/core';

@Component({
  selector: 'no-content',
  template: `
    <div>
      <h1 class="text-center">Lo sentimos</h1>
      <p class="text-center">Su sesión caducó o no hay información válida en su petición.</p>
    </div>
  `
})
export class NoContentComponent {

}
