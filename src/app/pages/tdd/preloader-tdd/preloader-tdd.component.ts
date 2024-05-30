import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { DataService } from '../../../services/data.service';
import { UtilsService } from '../../../services/utils.service';
import { MoveModel, UserModel, ExtractModel, LoaderModel } from '../../../models';
import { OsService } from '../../../services/os.service/os.service';
// Constants
import { ConstantsService } from '../../../services/constants.service';

import { AlertComponent } from '../../../partials';

//TDD
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SessionStorageService } from '../../../services/tdd/session-storage.service';



import * as _ from 'lodash';
import moment from 'moment';
import { DataProxyService } from '../../../services/data-proxy.service';
/**
 *
 *
 * @export
 * @class PreloaderTddComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-preloader-tdd',
  templateUrl: './preloader-tdd.component.html',
  providers: [
    DataService,
    OsService
  ]
})
export class PreloaderTddComponent implements OnInit {
  /**entorno de la aplicacion */
  private enviroment: any;
  /**subscripcion de las respuestas de el http */
  private subscription: Subscription;
  /**datos del usuario */
  private userData: UserModel;
  /**movimientos del usuario almacenados en un array */
  private dataHandler = Array<MoveModel>();
  /**movimientos seleccionados */
  private selectionHandler = Array<MoveModel>();
  /**datos recibidos de los servicios */
  private rawData: any;
  /**datos de la tarjeta de debito */
  private ccData: any;
  /**descripcion del filtro */
  private filterDesc = '';
  /**filtro aplicado a los movimientos */
  private currentFilter: string;
  /**cantidad de fechas */
  private dateArraysQuantity = 0;
  /**variable del modo dummy */
  private dummyMode = false;
  /**variable de la carga de un servicio */
  private isLoading = false;
  /**numero de tarjeta de entrada */
  private cardNumber = '';
  /**loader que muestra la app */
  private loader: LoaderModel;
  /**token de la aplicacion */
  private token = '';
  /**servicio de modals */
  private modalRef: BsModalRef;
  /**checar ambiente y setear método */
  private methodType: string = '';

  /**
   * Creates an instance of PreloaderTddComponent.
   * @param {DataService} dataService
   * @param {ActivatedRoute} route
   * @param {Router} router
   * @param {ConstantsService} constantsService
   * @param {BsModalService} modalService
   * @param {OsService} OsService
   * @memberof PreloaderTddComponent
   */
  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private constantsService: ConstantsService,
    private modalService: BsModalService,
    private storage: SessionStorageService,
    public http: HttpClient,
    private utilService: UtilsService,
    private osService : OsService,
    private dataProxyService: DataProxyService
  ) { 
    sessionStorage.removeItem('ccData');
  }
  /**
   * Angular Lifecycle hook: When the component it is initialized.
   *
   * @memberof PreloaderTddComponent
   */
  public ngOnInit(): void {
    // Get and Set the enviroment
    this.subscription = this.dataService
      .restRequest(
        'config.json',
        'GET',
        {},
        'config'
      )
      .subscribe(
        (response) => this.parseConfiguration(response),
        (error) => this.storage.saveInLocal('enviroment', 'dev')
      );
  }
  /**
   * Parse the alias of the configuration.
   *
   * @private
   * @param {*} config
   * @memberof PreloaderTddComponent
   */
  private parseConfiguration(config: any): void {
    // Search the enviroment
    this.enviroment = _.find(this.constantsService.ENVIROMENT, (item) => {
      return item.env === config.ENV_VAR;
    });
    this.methodType = this.enviroment.env === 'pro' ? 'POST' : 'GET';
    if (!_.isUndefined(this.enviroment)) {
      this.storage.saveInLocal('enviroment', this.enviroment.env)
      this.dataService.setUris(this.enviroment.env);
      this.getSsoToken();
    } else {
      this.handleError('No enviroment');
    }
  }
  /**
   * Get SSO token according to OS and channel.
   *
   * @private
   * @memberof PreloaderComponent
   */
  private getSsoToken() : void {
    let tokenSSO :any = null;
    if(this.osService.getOs().ios &&
      !(window.hasOwnProperty('Connect') && window.Connect.hasOwnProperty('getSSOToken'))) {
        this.getQueryParams(null);
    } else {
      try {
        tokenSSO = window.Connect.getSSOToken();
      } catch(err) {  }
      this.getQueryParams(tokenSSO);
    }
  }
  /**
   * Get the params in the URL.
   *
   * @private
   * @memberof PreloaderTddComponent
   */
  private getQueryParams(tokenSSO: string): void {
    (window as any).ssotokenResponse = null;
    let paramDummy: any = '';
    let paramNoLock: any = '';
    let chanel: any = '';
    this.route.queryParams.subscribe((params) => {
      this.token = tokenSSO ? decodeURIComponent(tokenSSO) : params['token'];
      paramDummy = params['dummy'];
      paramNoLock = params['nolock'];
      chanel = params['chanel'];
      if (chanel === undefined) {
        chanel = 'default';
      }
      this.storage.saveInLocal('chanel', chanel);
      this.storage.saveInLocal('nolock', false);
      this.storage.saveInLocal('dummy', false);
      if (paramNoLock === 'true') {
        this.storage.saveInLocal('nolock', true)
      }
      if (paramDummy === 'true') {
        this.dummyMode = paramDummy;
        this.storage.saveInLocal('pan', 1234567890123456);
        this.storage.saveInLocal('dummy', true);
      }

      this.postOAuthToken();
    });
  }
  /**
   * Post OAuth Token.
   *
   * @private
   * @memberof PreloaderTddComponent
   */
  private postOAuthToken(): void {
    this.processTokenOAuth();
  }
  /**
   * Process token OAuth.
   *
   * @private
   * @param {*} r
   * @memberof PreloaderTddComponent
   */
  private processTokenOAuth(): void {
    if (this.dummyMode) {
      this.aquireClientData();
    } else {
      this.getID();
    }
  }
  /**
   * Get the ID from the token validator.
   *
   * @private
   * @memberof PreloaderTddComponent
   */
  private getID(): void {

    this.dataService
      .restRequest('/token_validator', 'POST', null, 'sso_token', this.token)
      .subscribe(
        (response) => {
          
          if (response.id && response.pan) {
            this.cardNumber = response.pan;
            this.storage.saveInLocal('client', response.id);
            this.storage.saveInLocal('pan', response.pan.toString().slice(-4));
            this.storage.saveInLocal('buc', response.buc);
            this.storage.saveInLocal('category', response.menu);
            this.storage.saveInLocal('segment', response.segmento);
            const channel = response.canal.toLowerCase();
            if (channel === 'swal') {
              this.storage.saveInLocal('chanel', 'wallet');
            } else {
              this.storage.saveInLocal('chanel', 'default');
            }
            this.aquireClientData();
          }
        },
        (error) => this.handleError(error)
      );
  }
  /**
   * Aquire client data.
   *
   * Cambio de metodo GET -> POST 13/07/2020
   * @private
   * @param {string} cardID
   * @returns {void}
   * @memberof PreloaderTddComponent
   */
  private aquireClientData(): void {
    // this.loader.setMessage('Obteniendo información de usuario');
    if (this.dummyMode) {
      this.subscription = this.dataService.dummyRequest('assets/data/ccdata.json')
        .subscribe((response) => this.processCCData(response)); // DUMMY MODE
    } else {
      this.subscription = this.dataService
        .restRequest(
          '/detail/',
          'POST',
          {},
          'cards',
          this.storage.getFromLocal('app-access'),
          this.storage.getFromLocal('client')
        )
        .subscribe(
          (response) => {
            this.dataProxyService.setCCData(response);
            this.processCCData(response);
          },
          (error) => this.handleError(error)
        );
    }
  }
  /**
   * Process CCData.
   *
   * @private
   * @param {*} r
   * @memberof PreloaderTddComponent
   */
  private processCCData(r: any): void {
    if (!_.isUndefined(r.codigoMensaje)) {
      this.showAlert();
    }
    this.storage.saveInLocal('ccdata', r);
    this.ccData = r;
    this.getStatesCatalog();
  }
  /**
   * Get the states from a JSON file.
   *
   * @private
   * @memberof PreloaderTddComponent
   */
  private getDummyStates(): void {
    this.subscription = this.dataService.dummyRequest('assets/data/states.json')
      .subscribe((response) => this.processStates(response));
  }
  /**
   * Get states catalog, if the size if the response is zero, get from the dummy file.
   *
   * @private
   * @memberof PreloaderTddComponent
   */
  private getStatesCatalog(): void {
    // this.loader.setMessage('Obteniendo Entidades Federativas');
    if (this.dummyMode) {
      this.getDummyStates();
    } else {
      this.subscription = this.dataService.restRequest(
        '/states',
        'GET',
        '',
        'catalogs',
        this.storage.getFromLocal('app-access'),
        this.storage.getFromLocal('client')
      ).subscribe(
        (response) => {
          if (_.size(response) > 0) {
            this.processStates(response);
          } else {
            this.getDummyStates();
          }
        },
        (error) => {
          this.getDummyStates();
        }
      );
    }
  }
  /**
   * Process States.
   *
   * @private
   * @param {*} v
   * @memberof PreloaderTddComponent
   */
  private processStates(v: any): void {
    let idxstate = _.findIndex(v, ['clave', 9]);
    if (idxstate !== -1) v[idxstate].nombre = 'CIUDAD DE MÉXICO';
    idxstate = _.findIndex(v, ['clave', 12]);
    if (idxstate !== -1) v[idxstate].nombre = 'GUERRERO';
    idxstate = _.findIndex(v, ['clave', 15]);
    if (idxstate !== -1) v[idxstate].nombre = 'ESTADO DE MÉXICO';
    this.storage.saveInLocal('states', v);
    this.processUserData();
    //this.aquireExtracts();
    // TODO: Get the Categories and SubCategories
  }

  /**
   * Process user data and save them in the local storage.
   *
   * @private
   * @param {Response} response
   * @memberof PreloaderTddComponent
   */
  private processUserData(): void {
    this.subscription.unsubscribe();
    let usrdata = {
      buc: this.storage.getFromLocal('buc'),
      name: this.ccData.cardRec.cardInfo.cardEmbossName,
      cardNumber: this.ccData.cardRec.cardInfo.cardNum,
      cardName: this.ccData.cardRec.cardInfo.acctRef.acctInfo.desc,
      cardBrand: this.ccData.cardRec.cardInfo.brand,
      saldo: this.getBalance('AVAIL'),
      cardType: this.ccData.cardRec.cardInfo.cardType
    }
    this.storage.saveInLocal('userdata', usrdata);
    this.preloaderComplete();
  }

  /**
   *get the balance dependig the type
   *
   * @private
   * @param {string} type
   * @returns {number}
   * @memberof PreloaderTddComponent
   */
  private getBalance(type: string): number {
    let res = 0;
    const full: any = this.ccData;
    const v: any = full.cardRec.cardInfo.acctRef.acctInfo.acctBal;
    _.forEach(v, function (item: any) {
      if(item.balType===undefined || item.balType.balTypeValues.toUpperCase() === type){
       //El servicio de back no regresa el titulo del campo entonces se puso este parche
      //los demas titulos si aparecen
          res = parseFloat(item.curAmt.amt);
      }


    });
    return res;
  }

  /**
   * Show the error alert.
   *
   * @private
   * @memberof PreloaderTddComponent
   */
  private showAlert(): void {
    const options: any = {
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: true
    };
    this.modalRef = this.modalService.show(AlertComponent, options);
    this.modalRef.content.type = 'servicesError';
  }
  /**
   * Handle error
   *
   * @private
   * @param {*} error
   * @returns {*}
   * @memberof PreloaderTddComponent
   */
  private handleError(error: any): any {
    return error;
  }
  /**
   * Preloader complete.
   *
   * @private
   * @memberof PreloaderTddComponent
   */
  private preloaderComplete(): void {
    this.router.navigate(['welcomeTDD']);
  }
}
