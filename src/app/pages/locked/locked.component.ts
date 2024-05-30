import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { PlatformLocation } from '@angular/common'
import { Subscription } from 'rxjs';

import { DataService } from './../../services/data.service'
import { DataProxyService } from './../../services/data-proxy.service';
import { TaggingService } from './../../services/tagging.service';
import { NavigationService } from './../../services/navigation.service/navigation.service';
import { SessionStorageService } from './../../services/tdd/session-storage.service';

// Constants
import { ConstantsService } from './../../services/constants.service';
// Models
import {
  MoveModel, QuestionsModel, LoaderModel,
  CreditCardFullDataModel, ResponseModel, AnswersQuestionsModel,
  MultifolioModel
} from './../../models';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { LoaderComponent, AlertComponent } from './../../partials/';
import * as _ from 'lodash';
import moment from 'moment';

interface FoliosTicket {
  nationalFolios: string[];
  internationalFolios: string[];
}

/**
 * Locked page component.
 *
 * @export
 * @class LockedComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-locked',
  templateUrl: './locked.component.html',
  providers: [
    DataService,
    NavigationService,
    TaggingService
  ],
  entryComponents: [
  ]
})
export class LockedComponent implements OnInit {
  /**
   * Blocker
   *
   * @type {*}
   * @memberof LockedComponent
   */
  public blocker: any;
  /**
   * Old card
   *
   * @memberof LockedComponent
   */
  public oldCard = '';
  /**
   * Environment
   *
   * @private
   * @type {*}
   * @memberof LockedComponent
   */
  private enviroment: any;
  /**
   * Moves
   *
   * @private
   * @type {*}
   * @memberof LockedComponent
   */
  private moves: any;
  /**
   * Questions model
   *
   * @private
   * @type {QuestionsModel}
   * @memberof LockedComponent
   */
  private questions: QuestionsModel;
  /**
   * Pan
   *
   * @private
   * @type {string}
   * @memberof LockedComponent
   */
  private pan: string;
  /**
   * Response model
   *
   * @private
   * @type {ResponseModel}
   * @memberof LockedComponent
   */
  private responseModel: ResponseModel;
  /**
   * Flag to section
   *
   * @private
   * @type {string}
   * @memberof LockedComponent
   */
  private section: string = 'locked';
  /**
   * Flag to dummy mode
   *
   * @private
   * @memberof LockedComponent
   */
  private dummyMode = false;
  /**
   * flag when is busy
   *
   * @private
   * @memberof LockedComponent
   */
  private isBusy = false;
  /**
   * Flag to is loading
   *
   * @private
   * @memberof LockedComponent
   */
  private isLoading = false;
  /**
   * Filter description
   *
   * @private
   * @memberof LockedComponent
   */
  private filterDesc = '';
  /**
   * Current filter
   *
   * @private
   * @type {string}
   * @memberof LockedComponent
   */
  private currentFilter: string;
  /**
   * Total items
   *
   * @private
   * @memberof LockedComponent
   */
  private totalItems = 0;
  /**
   * Subscription model
   *
   * @private
   * @type {Subscription}
   * @memberof LockedComponent
   */
  private subscription: Subscription;
  /**
   * Modal subscription model
   *
   * @private
   * @type {Subscription[]}
   * @memberof LockedComponent
   */
  private modalSubscription: Subscription[] = [];
  /**
   * Response model
   *
   * @private
   * @type {ResponseModel}
   * @memberof LockedComponent
   */
  private responseDAO: ResponseModel;
  /**
   * Modal ref model
   *
   * @private
   * @type {BsModalRef}
   * @memberof LockedComponent
   */
  private modalRef: BsModalRef;
  /**
   * Loader model
   *
   * @private
   * @type {LoaderModel}
   * @memberof LockedComponent
   */
  private loader: LoaderModel;
  /**
   * tipo de reposicion que se tendra la tarjeta
   * 1- personalizada
   * 2- expres
   * @private
   * @memberof LockedComponent
   */
  private repositionType = '';

  /**
   * Creates an instance of LockedComponent.
   * @param {DataService} dataService
   * @param {DataProxyService} dataProxyService
   * @param {TaggingService} taggingService
   * @param {BsModalService} modalService
   * @param {Router} router
   * @param {ConstantsService} ConstService
   * @param {NavigationService} navigationService
   * @param {PlatformLocation} location
   * @param {SessionStorageService} storage
   * @memberof LockedComponent
   */
  constructor(
    private dataService: DataService,
    public dataProxyService: DataProxyService,
    private taggingService: TaggingService,
    private modalService: BsModalService,
    private router: Router,
    private ConstService: ConstantsService,
    private navigationService: NavigationService,
    private location: PlatformLocation,
    private storage: SessionStorageService
  ) {
    this.questions = this.dataProxyService.getQuestions();
    this.responseModel = this.dataProxyService.getResponseDAO();
    this.enviroment = _.find(ConstService.ENVIROMENT, (item) => {
      return item.env === this.dataProxyService.getEnviroment();
    });
    this.executeClarificationRequestL = this.executeClarificationRequestL.bind(this);
    this.executeCardRepositionRequest = this.executeCardRepositionRequest.bind(this);
    this.loader = new LoaderModel();
    this.questions = this.dataProxyService.getQuestions();
    this.oldCard = this.dataProxyService.getOldCard();
  }
  /**
   * Listen the interaction of the user and validate the native session.
   *
   * @param {Event} $event
   * @memberof LockedComponent
   */
  @HostListener('window:scroll', ['$event'])
  public onWindowScroll($event: Event): void {
    this.navigationService.validateSession();
  }
  /**
   * Angular Lifecycle hook: When the component it is initialized.
   *
   * @memberof LockedComponent
   */
  public ngOnInit(): void {
    this.dataService.setUris(this.dataProxyService.getEnviroment());
    this.dummyMode = this.dataProxyService.getDummyMode();
    let selectedMoves: Array<MoveModel> = this.dataProxyService.getDataSelected();
    if (selectedMoves) {
      this.totalItems = selectedMoves.length;
      this.moves = _(selectedMoves).groupBy('date').toPairs().value();
    }
    this.dataProxyService.getQuestionsStatusService().subscribe((data) => this.handleFooterResponse(data));
    this.questions.lostDate = this.formatDate(this.questions.lostDate);
    this.questions.lostDate === 'Invalid date' ? this.questions.lostDate = '' : this.questions.lostDate = this.questions.lostDate;
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
    // this.navigationService.setTitle('Bloqueo de tarjeta');
    this.navigationService.tapBack('');
    this.navigationService.hideBackButton();
    this.blocker = this.questions.blocker;
    if((!this.blocker.operationReposition && !this.blocker.operationExpressReposition) || (this.blocker.operationReposition && !this.blocker.operationExpressReposition)){
      this.storage.saveInLocal('respositionType','3');
    }
    this.pan = this.blocker.panReposition.slice(-4);

    const prefolio = this.storage.getFromLocal('prefolios');
    let typeUser = prefolio ? 'prefolio': '';
    let category = this.taggingService.getvalues().tag_aclaracion;
    this.taggingService.view({
      tag_subsection1: 'aclaraciones/bloqueo_de_tarjeta_popup',
      tag_titulo: 'aclaraciones|bloqueo_de_tarjeta_popup',
      tag_url: '/aclaraciones/bloqueo_de_tarjeta_popup',
      tag_tipoUsuario: typeUser,
      tag_proceso: category
    });

    // GA - Tealium
    /*const dataLayer: Object = {
      4: this.section,
      17: `step-card ${this.section}`,
    };
    this.taggingService.uTagView(dataLayer);
    this.taggingService.setPageName();
    this.taggingService.send('');*/

  }
/**
 * Set value of Type reposition on toggle service
 * @private
 * @return respositionType
 */
  private toggleRepositionType(){
    //this.taggingService.setDimenson('31', this.repositionType);
    this.storage.saveInLocal('respositionType',this.repositionType);
  }

  /**
   * Handle footer response.
   *
   * @private
   * @param {string} v
   * @memberof LockedComponent
   */
  private handleFooterResponse(v: string) {
    let category;
    category = this.taggingService.getvalues().tag_aclaracion;
    const prefolio = localStorage.getItem('prefolios');
    let typeUser = prefolio ? 'prefolio': '';
    let path = this.taggingService.typeClarificationTDC();
    if (this.router.url === '/locked') {
      if(!this.blocker.operationReposition && this.blocker.operationExpressReposition && this.repositionType === '2') {

          this.taggingService.link({
            event: 'aclaraciones',
            interaction_category: "aclaraciones_cargos",
            interaction_action:'reposicion_personalizada',
            interaction_label:'continuar',
            interaction_tipoUsuario: typeUser,
            interaction_url: path
          });

        this.checkTokenL(this.executeCardRepositionRequest);
      } else {
          this.taggingService.link({
            event: 'aclaraciones',
            interaction_category: "aclaraciones_cargos",
            interaction_action:'reposicion_inmediata',
            interaction_label:'continuar',
            interaction_tipoUsuario: typeUser,
            interaction_url: path
          });

        this.checkTokenL(this.executeClarificationRequestL);
      }
    }
  }
  /**
   * Check token expiration time.
   *
   * @private
   * @param {*} cb
   * @memberof LockedComponent
   */
  private checkTokenL(cb: any): void {
    if (this.dummyMode) {
      this.subscription = this.dataService.dummyRequest('assets/data/token.json')
        .subscribe((response) => {
          this.dataProxyService.setAccessToken(response.access_token);
          cb(true);
        });
    } else {
      cb(true);
    }
  }
  /**
   * Execute clarification request.
   *
   * @private
   * @returns {(boolean | undefined)}
   * @memberof LockedComponent
   */
  private executeClarificationRequestL(showModal): boolean | undefined {
    if (!this.isBusy) {
      this.isBusy = true;
    } else {
      this.isBusy = false;
      return false;
    }
    if (this.isBusy) {
      let serviceManagerObject = this.generateServiceManagerObject();

      let message = '';
      if(showModal){
        this.openModal('loader');
      }
      if (this.dataProxyService.getDummyMode()) {
        /* DUMMY MODE */
        this.subscription = this.dataService.dummyRequest('assets/data/sm-response.json')
          .subscribe((response) => this.handleServiceManagerRequest(response));
      } else {
        /*ALTA DE ACLARACION MODO NORMAL*/
        this.subscription = this.dataService
          .restRequest(
            '/clarifications/',
            'POST',
            JSON.stringify(serviceManagerObject),
            '',
            this.dataProxyService.getAccessToken())
          .subscribe((response) => this.handleServiceManagerRequest(response));
      }
    }
  }
  /**
   * Execute card reposition request
   *
   * @private
   * @memberof LockedComponent
   */
  private executeCardRepositionRequest(): void {
    this.openModal('loader');
    if (this.dataProxyService.getDummyMode()) {
      /* DUMMY MODE */
      this.subscription = this.dataService.dummyRequest('assets/data/reposition.json')
        .subscribe((response) => {
          this.storage.saveInLocal('cardRepositionResponse',response);
          this.executeClarificationRequestL(false);
        });
    } else {
      /*ALTA DE REPOSICION MODO NORMAL*/
      this.subscription = this.dataService
        .restRequest(
          '/repositions',
          'GET',
          {},
          'cards',
          this.dataProxyService.getAccessToken())
        .subscribe((response) => {
          this.storage.saveInLocal('cardRepositionResponse',response);
          this.executeClarificationRequestL(false);
        });
    }
  }
  /**
   * Validate if in the response exist a Error.
   *
   * @private
   * @param {*} r
   * @memberof LockedComponent
   */
  private validateSMHandler(r: any){
    // Check if the reponse is an error
    if (!_.isUndefined(r.codigoMensaje)) {
      if (r.codigoMensaje === 'MSG-001') {
        this.dataService.handleError('',{ name: r.mensaje });
      }
    }
    if(r.status==="Error"){
      this.dataService.handleError('',{name: r.status});
    }
  }
  /**
   * Handle service manager request.
   *
   * @private
   * @param {*} r
   * @memberof LockedComponent
   */
  private handleServiceManagerRequest(r: any): void {
    this.validateSMHandler(r);
    let response: ResponseModel = this.dataProxyService.getResponseDAO();
    let dateC = '';
    if (this.dataProxyService.getDummyMode()) {
      response.setResult(301); // DUMMY
    }
    // Set the current date before the request
    const currentDate = moment().format('DD/MMM/YYYY HH:mm').toString();
    response.setCurrentDate(currentDate.split('.').join(''));
    if (r.Messages) {
      let nationalFolios = [];
      let internationalFolios = [];
      let payment = 'false';
      let date = moment();
      for (let i of r.Messages) {
        if (this.getPayment(i) === 'true') {
          payment = 'true';
        }
        const internationalFolio = this.getFolioDate(i, 'INTERNACIONAL');
        const nationalFolio = this.getFolioDate(i, 'NACIONAL');
        let temporaldate = this.greaterDateValue(internationalFolio, nationalFolio);
        date = this.greaterDateValue(date, temporaldate);

        // let tempFoliosQ = this.getFolio(i, 'Internacional');
        // let tempArrayF = this.extractFolio(tempFoliosQ);
        // internationalFolios = this.concatArray(internationalFolios,tempArrayF);

        // tempFoliosQ = this.getFolio(i, 'Nacional');
        // tempArrayF = this.extractFolio(tempFoliosQ);
        // nationalFolios = this.concatArray(nationalFolios,tempArrayF)

        const folios = this.getFolios("Nacional", "Internacional", i);
        internationalFolios = folios.internationalFolios;
        nationalFolios = folios.nationalFolios;

        let serviceFolio = this.getFolio(i, "SERVICIOS TARJETA DE CREDITO");
        if (serviceFolio) {
          nationalFolios = [serviceFolio];
        }

        if (serviceFolio) {
          date = moment(this.getFolioDate(i, "null"));
        }

        if (this.storage.getFromLocal("prefolios")) {
          const folios = this.getFolios("Prefolio nacional, ID", "Prefolio internacional, ID", i);
          internationalFolios = folios.internationalFolios;
          nationalFolios = folios.nationalFolios;
        }

      }
      response.setInternationalFolio(internationalFolios);
      response.setNationalFolio(nationalFolios);
      response.setGreaterDate(date);
      response.setPayment(payment);
      response.setAmount(r.wvrinboxrn.monto * 1);
      response.setResult(301);
    }
    response.setDateCommitment(dateC);
    response.setTotalAmount(this.getTotalAmount());
    response.setName(this.dataProxyService.creditCardFullData.userName);
    response.setVisaCard(r.wvrinboxrn.VisaCarta);
    response.setOldCard(this.dataProxyService.creditCardFullData.cardNumber);
    this.dataProxyService.setResponseDAO(response);
    response.setNewCard(this.dataProxyService.questions.blocker.panReposition);
    this.closeModal(() => {
      if(r.wvrinboxrn.AptoDefinitivo === 'true'){
        this.storage.saveInLocal('tdcSmResponse',r);
        this.router.navigate(['definitivePayment']);
      }else{
        this.router.navigate(['result']);
      }
    });
  }

   /**
   * Gets the list of folios
   * @param national The key for national folio
   * @param international The key for international folio
   * @param i Array of data to prcess
   * @returns Both folios
   */
   private getFolios(
    national: string,
    international: string,
    i: string[]
  ): FoliosTicket {
    let tempFoliosQ = this.getFolio(i, international);
    let tempArrayF = this.extractFolio(tempFoliosQ);
    let internationalFolios = [];
    internationalFolios = this.concatArray(internationalFolios, tempArrayF);
    tempFoliosQ = this.getFolio(i, national);
    tempArrayF = this.extractFolio(tempFoliosQ);
    let nationalFolios = [];
    nationalFolios = this.concatArray(nationalFolios, tempArrayF);
    return {
      internationalFolios,
      nationalFolios,
    };
  }

/**
 *method thath receives  strign with folios or null and returns an aaray of folios
 *
 * @private
 * @param {*} tempFolio
 * @returns
 * @memberof LockedComponent
 */
private extractFolio(tempFolio){
    let tempArray =[];
    if(tempFolio !== null){
      tempFolio.includes('|') ? tempArray = tempFolio.split('|') : tempArray.push(tempFolio);
    }
    return tempArray;
  }
/**
 *Method that concats two arrays some like a.concat(b) butin the same scope
 *
 * @private
 * @param {*} origin
 * @param {*} toConcat
 * @returns
 * @memberof LockedComponent
 */
private concatArray(origin,toConcat){
    toConcat.forEach(function(element) {
      origin.push(element);
    });
    return origin;
  }



  /**
   * Compare dates and return the most away.
   *
   * @private
   * @param {*} international
   * @param {*} national
   * @returns {*}
   * @memberof LockedComponent
   */
  private greaterDateValue(international, national): any {
    let greater = null;
    if (international && national) {
      greater = (international.isAfter(national)) ? international : national;
    } else if (international) {
      greater = international;
    } else if (national) {
      greater = national;
    }
    return greater;
  }
  /**
   * Get total amount.
   *
   * @private
   * @returns {number}
   * @memberof LockedComponent
   */
  private getTotalAmount(): number {
    let totalSum = 0;
    _.each(this.dataProxyService.getDataSelected(), (item: MoveModel) => {
      totalSum += item.amount;
    });
    return totalSum;
  }
  /**
   * Get payment.
   *
   * @private
   * @param {string[]} r
   * @returns {*}
   * @memberof LockedComponent
   */
  private getPayment(r: string[], ): any {
    const find = _.find(r, (item: any) => {
      return item.match(new RegExp(`^Abono: `));
    });
    if (!_.isUndefined(find)) {
      return (find.split(': ')[1] !== 'undefined') ? find.split(': ')[1] : null;
    }
    return null;
  }
  /**
   * Get folio date.
   *
   * @private
   * @param {string[]} r
   * @param {string} v
   * @returns {*}
   * @memberof LockedComponent
   */
  private getFolioDate(r: string[], v: string): any {
    const find = _.find(r, (item: any) => {
      return item.match(new RegExp(`^${v} next_breach ==> `));
    });
    if (!_.isUndefined(find)) {
      return moment(find.split('==> ')[1], 'DD/MM/YYYY HH::mm:ss');
    }
    return null;
  }

  /**
   * Get folio
   *
   * @private
   * @param {string[]} r
   * @param {string} v
   * @returns {*}
   * @memberof LockedComponent
   */
  private getFolio(r: string[], v: string): any {
    const find = _.find(r, (item: any) => {
      return item.match(new RegExp(`^${v}: `));
    });
    if (!_.isUndefined(find)) {
      if(find.split(': ')[1].includes(' ')){
        let a =0;
        let tempFolio='';
        let arrayFolio = find.split(': ')[1].split(' ');
        if(arrayFolio[0]!== 'undefined' && arrayFolio[1]!== 'undefined'){
          return `${arrayFolio[0]}|${arrayFolio[1]}`;
        }else{
          arrayFolio[0]!== 'undefined'? tempFolio= tempFolio+ arrayFolio[0] :  a+=1;
          arrayFolio[1]!== 'undefined'? tempFolio= tempFolio+ arrayFolio[1] :  a+=1;
          tempFolio === '' ? tempFolio =  null : a+=1;
          return tempFolio;
        }
      }
      return (find.split(': ')[1] !== 'undefined') ? find.split(': ')[1] : null;
    }
    return null;
  }

  /**
   * Generate service manager object.
   *
   * @private
   * @returns {Object}
   * @memberof LockedComponent
   */
  private generateServiceManagerObject(): Object {
    let obj: any = {};
    let fullccdata: CreditCardFullDataModel = this.dataProxyService.getCreditCardFullData();
    let wvrinboxrn: Object = {
      "Categoria": "TARJETA DE CREDITO TARJETAHABIENTES",
      "Descripcion": [this.questions.additionalComments !== '' ? this.questions.additionalComments : this.getSubcategory()],
      "EntidadFed": this.dataProxyService.getStateID(this.questions.state).toString(),
      "Subcategoria": this.getSubcategory(),
      "VisaCarta": this.applyVISARule(fullccdata),
      "cuestionario": this.getQuestionsAndAnswers(),
      "multifolio": this.getMultifolioModel(),
      "FechaRobada": this.questions.missingYY !== '' && this.questions.missingYY !== null ? `${this.questions.missingYY}-${this.questions.missingMM}-${this.questions.missingDD}` : ""
    };
    obj.wvrinboxrn = wvrinboxrn;
    return obj;
  }
  /**
   * Gets the account number if exists.
   *
   * @private
   * @returns {*}
   * @memberof LockedComponent
   */
  private accountNumber(): any {
    try {
      return this.dataProxyService.getCCData()['cardRec'][0].cardInfo.acctRef.acctId;
    } catch (error) {
      return null;
    }
  }
  /**
   * Get Subcategory.
   *
   * @private
   * @returns {string}
   * @memberof LockedComponent
   */
  private getSubcategory(): string {
    let res = 'COMPRA NO RECONOCIDA';
    if (Number(this.questions.hasCard) === 1) {
      if (this.questions.motive.key === 'IC-205') {
        res = 'DEVOLUCION NO APLICADA';
      }
    } else {
      if (this.questions.whatHappens.getTitle() === 'La reporté como robada o extraviada.' ||
        this.questions.whatHappens.getTitle() === 'Me la robaron o la extravié y no la he reportado.') {
        res = 'TARJETA ROBADA O EXTRAVIADA';
      } else {
        res = 'TARJETA NO RECIBIDA';
      }
    }
    return res;
  }
  /**
   * Apply VISA Rule.
   *
   * @private
   * @param {CreditCardFullDataModel} data
   * @returns {string}
   * @memberof LockedComponent
   */
  private applyVISARule(data: CreditCardFullDataModel): string {
    let r = 'false';
    if (data.cardBrand.toLowerCase() === 'visa') {
      _.each(this.dataProxyService.getDataSelected(), (item: MoveModel) => {
        if (item.txrTipoFactura === '1003'  && Number(item.txrMonto) >= 400) {
          r = 'true';
        }
      });
    }
    return r;
  }
  /**
   * Get the Multifolio.
   *
   * @private
   * @returns
   * @memberof LockedComponent
   */
  private getMultifolioModel() {
    let multifolio = [];
    let ix = 0;
    const excludeExtract = this.storage.getFromLocal("prefolios")
    _.each(this.dataProxyService.getDataSelected(), (item: MoveModel) => {
      let objmultifolio = new MultifolioModel();
      objmultifolio.AcctTrnId = item.id;
      objmultifolio.AcctStmtId = excludeExtract ? '-1' : item.txrNumExtracto;
      /* objmultifolio.TxrCodigoCom = item.txrCodigoCom;
      objmultifolio.TxrComercio = item.txrComercio;
      objmultifolio.TxrDivisa = item.txrDivisa;
      objmultifolio.TxrFecha = item.txrFecha;
      //objmultifolio.TxrHrTxr = item.txrHrTxr;
      objmultifolio.TxrHrTxr = this.formatHour(item.txrHrTxr);
      objmultifolio.TxrModoEntrada = item.txrModoEntrada;
      objmultifolio.TxrMonto = item.txrMonto;
      objmultifolio.TxrMovExtracto = item.txrMovExtracto;
      objmultifolio.TxrNumExtracto = item.txrNumExtracto;
      objmultifolio.TxrReferencia = item.txrReferencia;
      //objmultifolio.TxrReferencia = item.txrMovExtracto;
      objmultifolio.TxrSucursalAp = item.txrSucursalAp;
      objmultifolio.TxrTipoFactura = item.txrTipoFactura;
      objmultifolio.TxrPAN = item.txrPAN;
      objmultifolio.TxrClacon = ''; //TODO:
      objmultifolio.TxrRefEmisor = ''; */
      multifolio.push(objmultifolio);
      ix++;
    });
    return multifolio;
  }
  /**
   * Get questions and answers.
   *
   * @private
   * @returns {*}
   * @memberof LockedComponent
   */
  private getQuestionsAndAnswers(): any {
    let question = [];
    if (Number(this.questions.hasCard) === 1) {
      if (this.questions.motive.key !== 'IC-205') {
        question = question.concat(this.getQuestionsHaveCard());
      }
    } else {
      let objquestion = new AnswersQuestionsModel();
      objquestion.Preguntas = '¿Reporto usted su tarjeta de crédito o débito como robada o extraviada a Banco Santander?';
      if (this.questions.whatHappens.getTitle() === 'La reporté como robada o extraviada.') {
        objquestion.Respuestas = 'SI';
        question.push(objquestion);
      } else if (this.questions.whatHappens.getTitle() === 'Me la robaron o la extravié y no la he reportado.') {
        objquestion.Respuestas = 'NO';
        question.push(objquestion);
      }
    }

    return question;
  }
  /**
   * Get questions and answers when the client have card.
   *
   * @private
   * @returns {*}
   * @memberof LockedComponent
   */
  private getQuestionsHaveCard(): any {
    let question = [
      { Preguntas: '¿Tiene la tarjeta en su poder?', Respuestas: 'SI' }
    ];
    let objquestion = new AnswersQuestionsModel();
    objquestion.Preguntas = '¿Interactuó con el comercio durante la compra?';
    if (this.questions.haveContact === '1') {
      objquestion.Respuestas = 'SI';
    } else {
      objquestion.Respuestas = 'NO';
    }
    question.push(objquestion);
    question = question.concat(this.getAdditionalQuestionary());
    return question;
  }
  /**
   * Get additional questions.
   *
   * @private
   * @returns {*}
   * @memberof LockedComponent
   */
  private getAdditionalQuestionary(): any {
    let questionary = [
      { Preguntas: 'Cargo duplicado', Respuestas: 'NO' },
      { Preguntas: 'Monto alterado', Respuestas: 'NO' },
      { Preguntas: 'Cargos adicionales', Respuestas: 'NO' },
      { Preguntas: 'Servicios no proporcionados', Respuestas: 'NO' },
      { Preguntas: 'Mercancia defectuosa', Respuestas: 'NO' },
      { Preguntas: 'Pago por otro medio', Respuestas: 'NO' },
      { Preguntas: 'Cancelación de servicio', Respuestas: 'NO' },
      { Preguntas: 'Otro', Respuestas: 'NO' }
    ];
    switch (this.questions.motive.key) {
      case 'IC-201': {
        questionary[0].Respuestas = 'SI';
        break;
      }
      case 'IC-202': {
        questionary[1].Respuestas = 'SI';
        break;
      }
      case 'IC-203': {
        questionary[2].Respuestas = 'SI';
        break;
      }
      case 'IC-204': {
        questionary[3].Respuestas = 'SI';
        break;
      }
      case 'IC-206': {
        questionary[5].Respuestas = 'SI';
        break;
      }
      case 'IC-207': {
        questionary[6].Respuestas = 'SI';
        break;
      }
      default: {
        break;
      }
    }
    return questionary;
  }
  /**
   * Format Date with momentJS.
   *
   * @private
   * @param {string} v
   * @returns {string}
   * @memberof LockedComponent
   */
  private formatDate(v: string): string {
    moment.locale('es');
    return moment(v).format('DD/MMM/YYYY').toString().replace(/\./g, '');
  }
  /**
   * Format hour.
   *
   * @private
   * @param {string} h
   * @returns {string}
   * @memberof LockedComponent
   */
  private formatHour(h: string): string {
    if (h === '' || h === null || typeof h === 'undefined') {
      return '00:00:00';
    } else {
      return h.replace('.', ':');
    }
  }
  /**
   * Open a modal instance.
   *
   * @private
   * @param {string} type
   * @memberof LockedComponent
   */
  private openModal(type: string) {
    this.modalSubscription.push(this.modalService.onShown.subscribe((reason: string) => {
    }));
    let options: any = {
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: true
    };
    if (type === 'loader') {
      options.class = 'modal-loader';
      this.modalRef = this.modalService.show(LoaderComponent, options);
    } else {
      this.modalRef = this.modalService.show(AlertComponent, options);
      this.modalRef.content.type = type;
    }
    if (type === 'block-one' || type === 'block-two') {
      // Cancel navigation
      this.navigationService.tapBack('');
    }
  }
  /**
   * Close modal.
   *
   * @private
   * @param {*} [cb]
   * @memberof LockedComponent
   */
  private closeModal(cb?: any) {
    document.getElementById('body').style.removeProperty('overflow');
    setTimeout(() => {
      this.modalRef.hide();
      if (cb) {
        cb();
      };
    }, 1000);
  }

}
