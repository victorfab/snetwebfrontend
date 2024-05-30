import { Injectable, Inject } from '@angular/core';
import { LocalStorageService } from 'angular-web-storage';

/**
 * llave para almacenar el token
 */
const TOKEN = 'sessionid';

/**
 * servicio que se encarga de consultar y guardar los datos de la sesion
 *
 * @export
 * @class SessionStorageService
 */
@Injectable()
export class SessionStorageService {
  /**
   * Creates an instance of SessionStorageService.
   * @memberof SessionStorageService
   * @param localStorageService
   */
  constructor(
    private localStorageService: LocalStorageService
  ) {
  }

  /**
   * guarda en sesion el valor {val} mediante la llave {key}
   *
   * @param {*} key
   * @param {*} val
   * @memberof SessionStorageService
   */
  saveInLocal(key, val): void {
    this.localStorageService.set(key, val);
  }

  /**
   * consulta de sesion la llave {key} y la regresa
   *
   * @param {*} key
   * @returns {*}
   * @memberof SessionStorageService
   */
  getFromLocal(key): any {
    return this.localStorageService.get(key);
  }

  /**
   * guarda el token de la aplicacion en sesion
   *
   * @param {*} token
   * @memberof SessionStorageService
   */
  saveToken(token) {
    // this.storage.set(TOKEN, token);
  }

  /**
   * consulta de sesion el token y lo regresa
   *
   * @returns
   * @memberof SessionStorageService
   */
  getToken() {
    // return this.storage.get(TOKEN);
  }

}
