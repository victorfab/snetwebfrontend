import { Component, OnInit } from '@angular/core';

/**
 * componente que muestra el loader de la aplicacion
 *
 * @export
 * @class SpinnerTddComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-spinner-tdd',
  templateUrl: './spinner-tdd.component.html'
})

export class SpinnerTddComponent implements OnInit {

  /**
   *Creates an instance of SpinnerTddComponent.
   * @memberof SpinnerTddComponent
   */
  constructor() { }


  /**
   * metodo a ejecutar ccuando el componente sea cargado
   *
   * @memberof SpinnerTddComponent
   */
  ngOnInit() {
  }

}
