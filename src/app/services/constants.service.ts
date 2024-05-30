import { Injectable } from '@angular/core';

/**
 * Constants used in all of the application
 *
 *
 * @export
 * @class ConstantsService
 */
@Injectable()
export class ConstantsService {
  /**
   *Enviroment array initialized as empty
   *
   * @type {Array<{
   *     env: string,
   *     url: string,
   *     rating: string,
   *   }>}
   * @memberof ConstantsService
   */
  public ENVIROMENT: Array<{
    env: string,
    url: string,
    rating: string,
  }> = [];

  /**
   * Adds each enviroment to the array
   *Creates an instance of ConstantsService.
   * @memberof ConstantsService
   */
  constructor() {
    // Development
    this.ENVIROMENT.push({
      env: 'dev',
      url: 'https://scg-mxgestaclar-service-mxgestaclar-dev.apps.str01.mex.dev.mx1.paas.cloudcenter.corp/',
      rating: 'https://stars-score-mxgestaclar-dev.appls.cto2.paas.gsnetcloud.corp'
    });
    // Pre-production
    this.ENVIROMENT.push({
      env: 'pre',
     // url: 'https://mxgestaclar-gateway-mxgestaclar-pre.appls.cto2.paas.gsnetcloud.corp/',  // version de la vieja arquitectura 
      url: 'https://gestionaclaraciones.pre.mx.corp/',
      rating: 'https://stars-score-mxgestaclar-pre.appls.cto2.paas.gsnetcloud.corp'
    });
    // Production
    this.ENVIROMENT.push({
      env: 'pro',
      url: 'https://gestionaclaraciones.santander.com.mx/',
      rating: 'https://stars-score-mxgestaclar-pro.appls.cto2.paas.gsnetcloud.corp'
    });
  }
}
