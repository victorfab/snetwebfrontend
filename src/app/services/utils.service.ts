import { Injectable } from '@angular/core';

/**
 * Service for manage general app data
 *
 * @export
 * @class UtilsService
 */
@Injectable()
export class UtilsService {  
    /**
     *Creates an instance of UtilsService.
     * @memberof UtilsService
     */
    constructor() {}

    /**
     * Get SSO Token from native instance.
     *
     * @returns {*}
     * @memberof UtilsService
     */
    getNativeToken() : any {
      if (typeof window.Connect !== "undefined") {
          try {
            return window.Connect.getSSOToken();
          } catch(err) {
            return null;
          }
      } else{
        return null;
      }
    }


}
