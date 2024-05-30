import { Injectable } from '@angular/core';
import { AppInternalStateType } from './app-internal-state-type.component'

/**
 * Getters and setters to handle states.
 *
 * @export
 * @class AppServiceComponent
 */
@Injectable()
export class AppServiceComponent {

  public _state: AppInternalStateType = { };

  /**
   * Already return a clone of the current state.
   *
   * @memberof AppServiceComponent
   */
  public get state() {
    return this._state = this._clone(this._state);
  }
  /**
   * Never allow mutation
   *
   * @memberof AppServiceComponent
   */
  public set state(value) {
    throw new Error('do not mutate the `.state` directly');
  }

  /**
   * Use our state getter for the clone.
   *
   * @param {*} [prop]
   * @returns
   * @memberof AppServiceComponent
   */
  public get(prop?: any) {
    const state = this.state;
    return state.hasOwnProperty(prop) ? state[prop] : state;
  }

  /**
   * Internally mutate our state.
   *
   * @param {string} prop
   * @param {*} value
   * @returns
   * @memberof AppServiceComponent
   */
  public set(prop: string, value: any) {
    return this._state[prop] = value;
  }

  /**
   * Simple object clone.
   *
   * @private
   * @param {AppInternalStateType} object
   * @returns
   * @memberof AppServiceComponent
   */
  private _clone(object: AppInternalStateType) {
    return JSON.parse(JSON.stringify( object ));
  }
}
