import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SessionStorageService } from '../../../services/tdd/session-storage.service';
import { DataService } from '../../../services/data.service';
import { PlatformLocation } from '@angular/common';
import { NavigationService } from '../../../services/navigation.service/navigation.service';
import { Router } from '@angular/router';
import { UtilsTddService } from '../../../services/tdd/utils-tdd.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { LoaderComponent, AlertComponent } from './../../../partials';
import {
  MoveModel, QuestionsModel, LoaderModel,
  BlockModel, CreditCardFullDataModel, ResponseModel, AnswersQuestionsModel,
  MultifolioModel, MultifolioCompleteModel
} from './../../../models';
import { DataProxyService } from './../../../services/data-proxy.service';
import { ConstantsService } from './../../../services/constants.service';
//Taggeo
import { TaggingService } from '../../../services/tagging.service';
//Alertas
import { AlertsTddService } from '../../../services/tdd/alerts-tdd.service';

import * as _ from 'lodash';
import moment from 'moment';
/**
 *
 *
 * @export
 * @class LockedTddComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-locked-tdd',
  templateUrl: './locked-tdd.component.html',
  providers: [
    DataService,
    NavigationService
  ]
})
export class LockedTddComponent implements OnInit {
  /**
   * Nombre de la seccion
   *
   * @private
   * @type {string}
   * @memberof LockedTddComponent
   */
  private section: string = 'locked';
  /**
   * modelo de preguntas realizadas al usuario
   *
   * @private
   * @type {QuestionsModel}
   * @memberof LockedTddComponent
   */
  private questions: QuestionsModel;
  /**
   * Motivo del bloqueo de tarjeta
   *
   * @private
   * @memberof LockedTddComponent
   */
  private blockMotive = '';
  /**
   * bandera para no reenviar el formulario
   *
   *
   * @private
   * @memberof LockedTddComponent
   */
  private isBusy = false;
  /**
   * capa para mostrar overlay de loading
   *
   * @private
   * @type {LoaderModel}
   * @memberof LockedTddComponent
   */
  private loader: LoaderModel;
  /**
   * generar subscripciones a los servicios llamados
   *
   * @private
   * @type {Subscription[]}
   * @memberof LockedTddComponent
   */
  private modalSubscription: Subscription[] = [];
  /**
   * referencia a un modal
   *
   * @private
   * @type {BsModalRef}
   * @memberof LockedTddComponent
   */
  private modalRef: BsModalRef;
  /**
   * enviroment en donde se encuantra el aplicativo
   *
   * @private
   * @type {*}
   * @memberof LockedTddComponent
   */
  private enviroment: any;
  /**
   * tarjeta bloqueada
   *
   * @private
   * @type {string}
   * @memberof LockedTddComponent
   */
  private oldCard: string;
  /**
   * tarjeta recibida por reposicion
   *
   * @private
   * @type {string}
   * @memberof LockedTddComponent
   */
  private newCard: string;
  /**
   * bandera de tipo de reposicion
   *
   * @private
   * @type {boolean}
   * @memberof LockedTddComponent
   */
  private operationReposition: boolean;
  /**
   * bandera es candidato a tarjeta express
   *
   * @private
   * @type {boolean}
   * @memberof LockedTddComponent
   */
  private operationExpressReposition: boolean;
  /**
   * tipo de reposicion
   *
   * @private
   * @memberof LockedTddComponent
   */
  private repositionType = '';
  /**
   * resutado del bloqueo
   *
   * @private
   * @type {boolean}
   * @memberof LockedTddComponent
   */
  private resultBlock: boolean;
  /**
 *
 * subscripcion a servicios para obtener una respuesta y
 * llevar el contenido a la vista
 *
 * @type {Subscription}
 * @memberof SummaryTddComponent
 */
  subscription: Subscription;
  /**canal por el que se accedio a la aplicaicon */
  private chanelType = '';

  /** cuestionario de la vista */
  private viewQuestions = [];
  /**
   * category to tag
   *
   * @private
   * @memberof LockedTddComponent
   */
  private category = '';



  public isLoading = false;

  /**
  *Creates an instance of LockedTddComponent.
  * @param {TaggingService} taggingService
  * @memberof LockedTddComponent
  */
  constructor(
    private taggingService: TaggingService,
    private storage: SessionStorageService,
    private dataService: DataService,
    public dataProxyService: DataProxyService,
    private modalService: BsModalService,
    private utils: UtilsTddService,
    private ContsService: ConstantsService,
    private router: Router,
    private location: PlatformLocation,
    private navigationService: NavigationService,
    private alertsTddService: AlertsTddService
  ) {
    this.enviroment = _.find(ContsService.ENVIROMENT, (item) => {
      return item.env === this.dataProxyService.getEnviroment();
    });
    this.questions = this.dataProxyService.getQuestions();
    this.loader = new LoaderModel();
  }


  /**
 * Hace la consulta del token de la aplicacion para llamar a ejecutar la aclaracion
 * dependiendo del ambiente lo hace en dummy o al endpoint
 *
 *
 * @private
 * @memberof SummaryTddComponent
 */
  private executeContinue() {
    this.alertsTddService.sendMessage(-1, true, -1);
    this.openModal('loader');
    if (this.repositionType === '2') {
      this.taggingService.link({
        event: "aclaraciones",
        interaction_category: 'aclaraciones_cargos',
        interaction_action: 'reposicion_personalizada',
        interaction_label: 'continuar',
        interaction_url: 'aclaraciones/tarjeta_bloqueda_definitivamente'
      });
    } else {
      this.taggingService.link({
        event: "aclaraciones",
        interaction_category: 'aclaraciones_cargos',
        interaction_action: 'reposicion_inmediata',
        interaction_label: 'continuar',
        interaction_url: 'aclaraciones/tarjeta_bloqueda_definitivamente'
      });
    }
    if (this.storage.getFromLocal('dummy')) {
      this.dataService.dummyRequest('assets/data/token.json')
        .subscribe((response) => {
          this.storage.saveInLocal('app-access', response.access_token);
          if (this.repositionType === '2') {
            this.executeCardRepositionRequest();
          } else {
            this.executeClarification();
          }
        });
    } else {
      if(this.repositionType==='2'){
        this.executeCardRepositionRequest();
      }
      else{
        this.executeClarification();
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
    if (this.storage.getFromLocal('dummy')) {
      /* DUMMY MODE */
      this.subscription = this.dataService.dummyRequest('assets/data/reposition.json')
        .subscribe((response) => {
          this.storage.saveInLocal('BlockModel', response);
          this.executeClarification();
        });
    } else {
      /*ALTA DE REPOSICION MODO NORMAL*/
      this.subscription = this.dataService
        .restRequest(
          '/repositions',
          'GET',
          {},
          'cards',
          this.storage.getFromLocal('app-access'),
          this.storage.getFromLocal('client'))
        .subscribe((response) => {
          this.storage.saveInLocal('BlockModel', response);
          this.executeClarification();
        });
    }
  }

  /**
 * Set value of Type reposition on toggle service
 * @private
 * @return respositionType
 */
  private toggleRepositionType() {
    // this.taggingService.setDimenson('31', this.repositionType);
    this.storage.saveInLocal('respositionType', this.repositionType);
  }

  /**
     * hace el llamado al endpoint para dar de alta la aclaracion
     * dependiendo el ambiente o el modo dummy
     *
     * hace navegacion a la pantalla de respuesta
     *
     * @memberof SummaryTddComponent
     */
  executeClarification() {
    if (this.storage.getFromLocal('dummy')) {
      let SMObject = this.utils.generateSMObject();
      this.dataService.dummyRequest('assets/data/token.json')
      let subscription = this.dataService.dummyRequest('assets/data/sm-response-tdd.json')
        .subscribe((response) => {
          this.closeModal(() => {
            this.storage.saveInLocal('SMResponse', response);
            this.router.navigate(['resultTDD']);

          });
        });
    } else {
      let SMObject = this.utils.generateSMObject();
      let subscription = this.dataService.restRequest(
        '/clarifications/',
        'POST',
        JSON.stringify(SMObject),
        '',
        this.storage.getFromLocal('app-access'),
        this.storage.getFromLocal('client'))
        .subscribe((response) => {
          this.closeModal(() => {
            this.storage.saveInLocal('SMResponse', response);
            this.router.navigate(['resultTDD']);
          })
        });
    }
  }


  /**
   * get folio from service manager
   *
   * @private
   * @param {*} tempFolio
   * @returns
   * @memberof SummaryTddComponent
   */
  private extractFolio(tempFolio) {
    let tempArray = [];
    if (tempFolio !== null) {
      tempFolio.includes('|') ? tempArray = tempFolio.split('|') : tempArray.push(tempFolio);
    }
    return tempArray;
  }

  /**
   * generate array folios
   *
   * @private
   * @param {*} origin
   * @param {*} toConcat
   * @returns
   * @memberof SummaryTddComponent
   */
  private concatArray(origin, toConcat) {
    toConcat.forEach(function (element) {
      origin.push(element);
    });
    return origin;
  }

  /**
 * Get folio.
 *
 * @private
 * @param {string[]} r
 * @param {string} v
 * @returns {*}
 * @memberof SummaryComponent
 */
  private getFolio(r: string[], v: string): any {
    const find = _.find(r, (item: any) => {
      return item.match(new RegExp(`^${v}: `));
    });
    if (!_.isUndefined(find)) {
      if (find.split(': ')[1].includes(' ')) {
        let a = 0;
        let tempFolio = '';
        let arrayFolio = find.split(': ')[1].split(' ');
        if (arrayFolio[0] !== 'undefined' && arrayFolio[1] !== 'undefined') {
          return `${arrayFolio[0]}|${arrayFolio[1]}`;
        } else {
          arrayFolio[0] !== 'undefined' ? tempFolio = tempFolio + arrayFolio[0] : a += 1;
          arrayFolio[1] !== 'undefined' ? tempFolio = tempFolio + arrayFolio[1] : a += 1;
          tempFolio === '' ? tempFolio = null : a += 1;
          return tempFolio;
        }
      }
      return (find.split(': ')[1] !== 'undefined') ? find.split(': ')[1] : null;
    }
    return null;
  }
  /**
 * Compare dates and return the most away.
 *
 * @private
 * @param {*} international
 * @param {*} national
 * @returns {*}
 * @memberof SummaryComponent
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
  * Get payment
  *
  * @private
  * @param {string[]} r
  * @returns {*}
  * @memberof SummaryComponent
  */
  private getPayment(r: string[],): any {
    const find = _.find(r, (item: any) => { return item.match(new RegExp(`^Abono: `)); });
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
 * @memberof SummaryComponent
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
  * Validate if in the response exist a Error.
  *
  * @private
  * @param {*} r
  * @memberof SummaryComponent
  */
  private validateSMHandler(r: any) {
    // Check if the reponse is an error
    if (r.codigoMensaje) {
      if (r.codigoMensaje === 'MSG-001') {
        this.dataService.handleError('', { name: r.mensaje });
      }
    }
    if (r.status === "Error") {
      this.dataService.handleError('', { name: r.status });
    }
  }

  /**
   * Execute card block.
   *
   * @private
   * @memberof SummaryComponent
   */
  private executeCardBlock() {
    if (!this.isBusy) {
      this.isBusy = true;
      this.blockMotive = this.viewQuestions[1].value === "ME LA ROBARON O LA EXTRAVIÉ Y NO LA HE REPORTADO" ? 'robo' : 'fraude';
      let defaultMessage = 'Estamos bloqueando su tarjeta, un momento por favor.';
      this.loader.setMessage(defaultMessage);
      this.isLoading = true;
      //this.openModal('loader');
      if (this.storage.getFromLocal('dummy') || this.dataProxyService.getNoLock()) {
        /* DUMMY MODE */
        const endpoint = `/lock/lock_code/${this.blockMotive}/path/front`;
        this.subscription = this.dataService.dummyRequest('assets/data/lock-card.json')
          .subscribe((response) => this.handleCardBlockResponse(response));
      } else {
        const endpoint = `/lock/lock_code/${this.blockMotive}/path/front`;
        this.subscription = this.dataService
          .restRequest(endpoint, 'POST', '', 'cards', this.storage.getFromLocal('app-access'), this.storage.getFromLocal('client'))
          .subscribe(
            (response) => this.handleCardBlockResponse(response),
            (error) => {
              this.questions.blocker.operationReposition = false;
              this.questions.blocker.operationCancellation = false;
              this.questions.blocker
                .operationCancellationMsg = 'no fue posible cancelar la tarjeta';
              this.questions.blocker.operationRepositionMsg = 'no fue posible reponer la tarjeta';
              this.isBusy = false;
              this.closeModal(() => {
                this.openModal('cancelExecuteBlock');
              });
              this.isLoading = false;
            });
      }
    }
  }

  /**
 * Open a modal instance.
 *
 * @private
 * @param {string} type
 * @memberof SummaryComponent
 */
  private openModal(type: string): void {
    this.navigationService.tapBack('');
    this.modalSubscription.push(this.modalService.onShown.subscribe((reason: string) => { }));
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
    // GA - Tealium
    /*const dataLayer: Object = {
      17: `step-${type}`,
      27: type,
    };
    this.taggingService.uTagView(dataLayer);
    this.taggingService.setPageName();
    this.taggingService.send('');*/
  }

  /**
 * Handle card block response.
 *
 * @private
 * @param {*} r
 * @memberof SummaryComponent
 */
  private handleCardBlockResponse(r: any) {
    let blocker: BlockModel = r;
    this.isBusy = false;
    this.isLoading = false;
    if (blocker.operationCancellation) {
      this.storage.saveInLocal('BlockModel', r);
      this.operationReposition = r.operationReposition;
      this.operationExpressReposition = r.operationExpressReposition;
      this.newCard = r.panReposition;
      this.newCard = this.newCard.substring(this.newCard.length - 4, this.newCard.length);
      this.resultBlock = true;
      this.closeModal();
    } else {
      this.closeModal(() => {
        this.openModal('cancelExecuteBlock');
      });
    }
    // TODO: Block card on each motive
  }
  /**
   * Close modal.
   *
   * @private
   * @param {*} [cb]
   * @memberof SummaryComponent
   */
  private closeModal(cb?: any): void {
    this.navigationService.tapBack(this.section);
    document.getElementById('body').style.removeProperty('overflow');
    setTimeout(() => {
      this.modalRef.hide();
      if (cb) {
        cb();
      };
    }, 1000);
  }


  /**
   * inicio de componente
   *
   * @memberof LockedTddComponent
   */
  ngOnInit() {
    this.openModal('loader');
    // GA - Tealium
    /*const dataLayer: Object = {
      4: this.section,
      17: 'step-locked-tdd',
    };
    this.taggingService.uTagView(dataLayer);
    this.taggingService.setPageName();
    this.taggingService.send('');*/
    this.taggingService.setvalues("aclaraciones/bloqueo_de_tarjeta_popup", "aclaraciones/bloqueo_de_tarjeta_popup");
    this.taggingService.view(this.taggingService.getvalues());
    this.viewQuestions = this.storage.getFromLocal('viewQuestions');
    this.dataService.setUris(this.storage.getFromLocal('enviroment'));
    this.chanelType = this.storage.getFromLocal('chanel');
    this.executeCardBlock();
    this.oldCard = this.storage.getFromLocal('ccdata').cardRec.cardInfo.cardNum;
    this.oldCard = this.oldCard.length > 0 ? this.oldCard.substring(this.oldCard.length - 4, this.oldCard.length) : "7845";
    this.category = this.taggingService.getvalues().tag_aclaracion.toString();
  }

}
