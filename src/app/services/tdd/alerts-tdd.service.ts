import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 *
 * AlertsMain class
 * @export
 * @class AlertsMain
 */
@Injectable()
export class AlertsTddService{
  /**
   * multicast for some messages 
   *
   * @private
   * @memberof AlertsTddService
   */
  private subject = new Subject<any>();

  /**
   *
   * sendMessage
   * @param {number} number
   * @param {boolean} visibility
   * @param {number} title
   * @memberof AlertsMain
   */
  sendMessage(number: number,visibility: boolean,title: number){
    let message = {
      "number" : number,
      "title" : title,
      "visibility" : visibility
    }
    this.subject.next({response:message});
  }

  /**
   * sendBlockCard
   *
   * @param {*} mess
   * @memberof AlertsMain
   */
  sendBlockCard(mess){
    let message2 = {
      "mess" : mess
    }
    this.subject.next({response:message2});
  }

  /**
   *clearMEssage
   *
   * @memberof AlertsMain
   */
  clearMessage() { 
    this.subject.next({response:'HOLA'});
  }
  /**
   * getMessage
   *
   * @returns {Observable<any>}
   * @memberof AlertsMain
   */
  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}