import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { DataService } from '../../services/data.service';
import { MoveModel, UserModel, LoaderModel } from '../../models';
import { DataProxyService } from '../../services/data-proxy.service';
import { UtilsService } from '../../services/utils.service';
import { OsService } from '../../services/os.service/os.service';


// Constants
import { ConstantsService } from '../../services/constants.service';

import { AlertComponent } from '../../partials';

import * as _ from 'lodash';
import { SessionStorageService } from '../../services/tdd/session-storage.service';
import { isNull } from 'lodash';

/**
 *
 *
 * @export
 * @class PreloaderComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-preloader',
  templateUrl: './preloader.component.html',
  providers: [
    DataService,
    OsService
  ]
})
export class PreloaderComponent implements OnInit {

  private enviroment: any;
  private subscription: Subscription;
  private userData: UserModel;
  private dataHandler = Array<MoveModel>();
  private selectionHandler = Array<MoveModel>();
  private ccData: any;
  private dummyMode = false;
  private cardNumber = '';
  private loader: LoaderModel;
  private token = '';
  private modalRef: BsModalRef;

  /**
   * Creates an instance of PreloaderComponent.
   * @param {DataService} dataService
   * @param {DataProxyService} dataProxyService
   * @param {ActivatedRoute} route
   * @param {Router} router
   * @param {ConstantsService} constantsService
   * @param {BsModalService} modalService
   * @param utilService
   * @param osService
   * @memberof PreloaderComponent
   */
  constructor(
    private sessionStorageService: SessionStorageService,
    private dataService: DataService,
    public dataProxyService: DataProxyService,
    private route: ActivatedRoute,
    private router: Router,
    private constantsService: ConstantsService,
    private modalService: BsModalService,
    private utilService: UtilsService,
    private osService: OsService
  ) {
  }

  /**
   * Angular Lifecycle hook: When the component it is initialized.
   *
   * @memberof PreloaderComponent
   */
  public ngOnInit(): void {
    this.loader = new LoaderModel();
    this.dataProxyService.cleanData();
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
        (error) => this.dataProxyService.setEnviroment('dev')
      );
  }

  /**
   * Parse the alias of the configuration.
   *
   * @private
   * @param {*} config
   * @memberof PreloaderComponent
   */
  private parseConfiguration(config: any): void {
    // Search the enviroment
    this.enviroment = _.find(this.constantsService.ENVIROMENT, (item) => {
      return item.env === config.ENV_VAR;
    });
    if (!_.isUndefined(this.enviroment)) {
      this.dataProxyService.setEnviroment(this.enviroment.env);
      this.dataService.setUris(this.enviroment.env);
      this.getSsoToken();
      localStorage.setItem('enviroment', this.enviroment.env);
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
  private getSsoToken(): void {
    let tokenSSO: any = null;
    if (this.osService.getOs().ios &&
      !(window.hasOwnProperty('Connect') && window.Connect.hasOwnProperty('getSSOToken'))) {
      this.getQueryParams(null);
    } else {
      try {
        tokenSSO = window.Connect.getSSOToken();
      } catch (err) {
      }
      this.getQueryParams(tokenSSO);
    }
  }

  /**
   * Get the params in the URL.
   *
   * @private
   * @memberof PreloaderComponent
   */
  private getQueryParams(tokenSSO: string): void {
    console.log('getQueryParams');
    (window as any).ssotokenResponse = null;
    let paramDummy: any = '';
    let paramNoLock: any = '';
    let chanel: any = '';
    this.route.queryParams.subscribe((params) => {
      this.token = tokenSSO !== null ? decodeURIComponent(tokenSSO) : params['token'];
      paramDummy = params['dummy'];
      paramNoLock = params['nolock'];
      chanel = params['chanel'];
      if (chanel === undefined) {
        chanel = 'default';
      }
      this.dataProxyService.setChannel(chanel);
      // paramDummy = 'true';
      this.dataProxyService.setNoLock(false);
      this.dataProxyService.setDummyMode(false);
      if (paramNoLock === 'true') {
        this.dataProxyService.setNoLock(true);
      }
      if (paramDummy === 'true') {
        this.dummyMode = paramDummy;
        this.dataProxyService.setPan(params['pan']);
        this.dataProxyService.setOldCard(params['pan']);
        // this.dataProxyService.setPan('5471460091895768');
        this.dataProxyService.setDummyMode(true);
      }
      this.postOAuthToken();
    });
  }

  /**
   * Post OAuth Token.
   *
   * @private
   * @memberof PreloaderComponent
   */
  private postOAuthToken(): void {
    if (this.dummyMode) {
      this.subscription = this.dataService.dummyRequest('assets/data/token.json')
        .subscribe((response) => this.processTokenOAuth()); // DUMMY MODE
    } else {
      this.processTokenOAuth();
    }
  }

  /**
   * Process token OAuth.
   *
   * @private
   * @param {*} r
   * @memberof PreloaderComponent
   */
  private processTokenOAuth(): void {
    // this.dataProxyService.setAccessToken(r.access_token);
    if (!this.ccData) {
      if (this.dummyMode) {
        this.aquireClientData(this.dataProxyService.getPan());
      } else {
        this.getID();
      }
    } else {
      this.dataProxyService.setCreditCardFullData(this.ccData);
      this.ccData = this.dataProxyService.getCCData();
      this.getStatesCatalog();
    }
  }

  /**
   * Get the ID from the token validator.
   *
   * @private
   * @memberof PreloaderComponent
   */
  private getID(): void {
    console.log('getID preloader');
    this.dataService
      .restRequest(
        '/token_validator', 'POST', null, 'sso_token', this.token
      )
      .subscribe(
        (response) => {
          if (response.id && response.pan) {
            this.cardNumber = response.pan;
            this.sessionStorageService.saveInLocal('client', response.id);
            this.dataProxyService.setIdToken(response.id);
            this.dataProxyService.setPan(response.pan);
            this.dataProxyService.setOldCard(response.pan);
            this.dataProxyService.setBuc(response.buc);
            const channel = response.canal.toLowerCase();
            if (channel.trim() === 'smov') {
              this.dataProxyService.setChannel('default');
            } else {
              this.dataProxyService.setChannel('wallet');
            }
            this.aquireClientData(this.dataProxyService.getPan());
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
   * @returns {(boolean | undefined)}
   * @memberof PreloaderComponent
   */
  private aquireClientData(cardID: string): boolean | undefined {
    if (!cardID) {
      return false;
    }
    this.loader.setMessage('Obteniendo información de usuario');
    if (this.dummyMode) {
      this.subscription = this.dataService.dummyRequest('assets/data/ccdata.json')
        .subscribe((response) => {
          this.processCCData(response);
        }); // DUMMY MODE
    } else {
      this.subscription = this.dataService
        .restRequest(
          '/detail/',
          'POST',
          {},
          'cards',
          this.dataProxyService.getAccessToken()
        )
        .subscribe(
          (response) => {
            console.log('onResponse');
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
   * @memberof PreloaderComponent
   */
  private processCCData(r: any): void {
    if (!_.isUndefined(r.codigoMensaje)) {
      this.showAlert();
    }
    this.dataProxyService.setCCData(r);
    this.ccData = r;
    this.getStatesCatalog();
  }

  /**
   * Get the states from a JSON file.
   *
   * @private
   * @memberof PreloaderComponent
   */
  private getDummyStates(): void {
    this.subscription = this.dataService.dummyRequest('assets/data/states.json')
      .subscribe((response) => this.processStates(response));
  }

  /**
   * Get states catalog, if the size if the response is zero, get from the dummy file.
   *
   * @private
   * @memberof PreloaderComponent
   */
  private getStatesCatalog(): void {
    this.loader.setMessage('Obteniendo Entidades Federativas');
    if (this.dummyMode) {
      this.getDummyStates();
    } else {
      this.subscription = this.dataService.restRequest(
        '/states',
        'GET',
        '',
        'catalogs',
        this.dataProxyService.getAccessToken()
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
   * @memberof PreloaderComponent
   */
  private processStates(v: any): void {
    let idxstate = _.findIndex(v, ['clave', 9]);
    if (idxstate !== -1) v[idxstate].nombre = 'Ciudad de México';
    idxstate = _.findIndex(v, ['clave', 12]);
    if (idxstate !== -1) v[idxstate].nombre = 'Guerrero';
    idxstate = _.findIndex(v, ['clave', 15]);
    if (idxstate !== -1) v[idxstate].nombre = 'Estado de México';
    this.dataProxyService.setStates(v);
    this.aquireExtracts();
    // TODO: Get the Categories and SubCategories
  }

  /**
   * Get categories catalog.
   *
   * @private
   * @memberof PreloaderComponent
   */
  private getCategoriesCatalog(): void {
    this.loader.setMessage('Obteniendo catálogos de categorías');
    if (!this.dataProxyService.getCategories()) {
      this.subscription = this.dataService
        .restRequest(
          '/catalog/categories',
          'GET',
          '',
          'catalogs',
          this.dataProxyService.getAccessToken()
        )
        .subscribe((response) => this.processCategories(response));
    } else {
      this.getSubcategories();
    }
  }

  /**
   * Process categories.
   *
   * @private
   * @param {*} v
   * @memberof PreloaderComponent
   */
  private processCategories(v: any): void {
    this.dataProxyService.setCategories(v);
    this.getSubcategories();
  }

  /**
   * Get subcategories.
   *
   * @private
   * @memberof PreloaderComponent
   */
  private getSubcategories(): void {
    this.loader.setMessage('Obteniendo catálogos de subcategorías');
    if (!this.dataProxyService.getSubcategories()) {
      this.subscription = this.dataService.restRequest(
        '/catalog/subcategories',
        'GET',
        '',
        'catalogs',
        this.dataProxyService.getAccessToken()
      )
        .subscribe((response) => this.processSubcategories(response));
    } else {
      this.aquireExtracts();
    }
  }

  /**
   * Process Subcategories.
   *
   * @private
   * @param {*} v
   * @memberof PreloaderComponent
   */
  private processSubcategories(v: any): void {
    this.dataProxyService.setSubcategories(v);
    this.aquireExtracts();
  }

  /**
   * Aquire extracts.
   *
   * @private
   * @memberof PreloaderComponent
   */
  private aquireExtracts(): void {
    if (this.dataProxyService.getDataSelected()) {
      this.dataHandler = this.dataProxyService.getDataSelected();
      this.selectionHandler = this.dataProxyService.getDataSelected();
    }
    this.userData = this.dataProxyService.getUserData();
    if (!this.userData) {
      if (this.dummyMode) {
        this.subscription = this.dataService.dummyRequest('assets/data/extracts.json')
          .subscribe((response) => this.processUserData(response)); // DUMMY MODE
      } else {
        // TODO: Throw an error if the cards has no info
        const cn = this.ccData.cardRec.cardInfo.cardNum;
        this.subscription = this.dataService
          .restRequest(
            '/extracts/',
            'GET',
            {},
            'user',
            this.dataProxyService.getAccessToken()
          )
          .subscribe(
            (response) => this.processUserData(response),
            (error) => this.handleError(error)
          );
      }
    } else {
      this.preloaderComplete();
    }
  }

  /**
   * Process user data and save them in the local storage.
   *
   * @private
   * @param {Response} response
   * @memberof PreloaderComponent
   */
  private processUserData(response: Response): void {
    this.subscription.unsubscribe();
    const p: any = response;
    const outstanding = this.ccData.cardRec.cardInfo.acctRef?.acctInfo?.acctBal
    .find(item => Boolean(item.balType) && item.balType.balTypeValues?.toLowerCase() === 'outstanding');

    let balance = 0;

    if (outstanding) {
      balance = Number(outstanding.curAmt.amt);
    }

    const usr: UserModel = new UserModel(
      this.dataProxyService.getBuc(),
      this.ccData.cardRec.cardInfo.cardEmbossName,
      this.ccData.cardRec.cardInfo.cardNum,
      this.ccData.cardRec.cardInfo.cardTrnLimit[0].curAmt.amt,
      balance.toString(),
      this.ccData.cardRec.cardInfo.acctRef.acctInfo.acctBal[3].curAmt.amt,
      this.ccData.cardRec.cardInfo.acctRef.acctInfo.desc,
      this.ccData.cardRec.cardInfo.closeStmtDt,
      p.acctStmtRec
    );
    this.dataProxyService.setUserData(usr);
    this.preloaderComplete();
  }

  /**
   * Show the error alert.
   *
   * @private
   * @memberof PreloaderComponent
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
   * @memberof PreloaderComponent
   */
  private handleError(error: any): any {
    return error;
  }

  /**
   * Preloader complete.
   *
   * @private
   * @memberof PreloaderComponent
   */
  private preloaderComplete(): void {
    this.router.navigate(['welcome']);
  }

}
