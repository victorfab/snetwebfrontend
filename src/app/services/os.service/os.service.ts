import { Injectable } from '@angular/core';

/**
 * Class that return the operating system
 * that is running the app.
 *
 * 
 *
 *
 * @export
 * @class OsService
 */
@Injectable()
export class OsService {
    /**
     * Creates an instance of OsService.
     * @param {NgZone} zone
     * @memberof OsService
     */
    constructor () {}
    
    /**
     * Return the operating system
     *
     * @returns {*}
     * @memberof OsService
     */
    public getOs () : any {
        let isAndroid : boolean = false;
        let isIos : boolean = false;
        if(window.navigator.platform === 'iPhone') { isIos = true } else { isAndroid = true }
        return {
            android: isAndroid,
            ios: isIos
        }
    }
}
