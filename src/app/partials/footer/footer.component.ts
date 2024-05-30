import { LocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

// Services
import { TaggingService } from '../../services/tagging.service';
import { NavigationService } from './../../services/navigation.service/navigation.service';
import { DataProxyService } from '../../services/data-proxy.service';
import { AppServiceComponent } from '../../shared/app-service.component';
import { MoveModel, QuestionsModel } from '../../models';
import { SessionStorageService } from './../../services/tdd/session-storage.service';

import moment from 'moment';
import * as _ from 'lodash';
/**
 * Continue button used in the main pages
 *
 * @export
 * @class FooterComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'wr-footer',
  templateUrl: './footer.component.html',
  providers: [
    TaggingService,
    NavigationService
  ]
})
export class FooterComponent implements OnInit {
  public localState = { value: '' };
  private selectedItems: Array<MoveModel> = [];
  private toggleSelected = false;
  private hideSelected = false;
  private moves: any;
  private totalItems = 0;
  private active = true;
  private buttonText = 'Continuar';

  constructor(
    public appState: AppServiceComponent,
    private router: Router,
    private taggingService: TaggingService,
    private navigationService: NavigationService,
    public dataProxyService: DataProxyService,
    private uri: LocationStrategy,
    private storage: SessionStorageService) {
  }

  /**
   * Angular Lifecycle hook: When the component it is initialized
   *
   *
   * @memberof FooterComponent
   */
  public ngOnInit() {
    this.router.events.subscribe((event) => {
      this.handleStatus();
    });
    if (this.dataProxyService.getDataSelected()) {
      this.totalItems = this.dataProxyService.getDataSelected().length;
    }
  }

  /**
   * Toggle selected list
   *
   * @returns {void}
   *
   *
   * @memberof FooterComponent
   */
  public toggleSelectedList(): void {
    this.toggleSelected = !this.toggleSelected;
    if (this.toggleSelected) {
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Close the selected list
   *
   * @returns {void}
   *
   * @memberof FooterComponent
   */
  public closeSelectedList(): void {
    this.dataProxyService.setDataSource(this.selectedItems);
    this.toggleSelected = false;
    document.body.style.overflow = 'auto';
  }

  /**
   * Retrieve parsed date
   *
   *
   * @param {string} dateToBeParsed
   * @returns {string}
   * @memberof FooterComponent
   */
  public retrieveParsedDate(dateToBeParsed: string): string {
    moment.locale('es');
    return moment(dateToBeParsed, 'DD-MM-YYYY').format('dddd DD [de] MMMM, YYYY');
  }

  /**
   * Retrieve parsed date from position at
   *
   *
   *
   * @param {number} n
   * @returns {string}
   * @memberof FooterComponent
   */
  public retrieveParsedDateFromPositionAt(n: number): string {
    return this.retrieveParsedDate(this.moves[n].toString());
  }

  /**
   * Check if selected
   *
   *
   * @param {string} id
   * @returns {boolean}
   * @memberof FooterComponent
   */
  public checkIfSelected(id: string): boolean {
    let itm = _.find(this.selectedItems, (o: MoveModel) => { return o.id === id; });
    return (itm) ? true : false;
  }

  /**
   * Handle Selection
   *
   * @returns {void}
   *
   * @param {MoveModel} val
   * @memberof FooterComponent
   */
  public handleSelection(val: MoveModel): void {
    const idx: any = _.find(this.selectedItems, { id: val.id }, 0);
    if (idx) {
      const cindex: number = this.selectedItems.indexOf(idx);
      this.selectedItems.splice(cindex, 1);
    } else {
      const mv: MoveModel = new MoveModel(
        val.id,
        val.desc,
        val.amount.toString(),
        val.date,
        val.period,
        val.txrCodigoCom,
        val.txrComercio,
        val.txrDivisa,
        val.txrFecha,
        val.txrHrTxr,
        val.txrModoEntrada,
        val.txrMonto,
        val.txrSucursalAp,
        val.txrMovExtracto,
        val.txrNumExtracto,
        val.txrReferencia,
        val.txrTipoFactura,
        val.txrPAN
      );
      this.selectedItems.push(mv);
    }
    if (this.selectedItems.length < 1) {
      this.closeSelectedList();
      this.router.navigate(['']);
    }
  }

  /**
   * Gets the current URL
   *
   *
   *
   * @returns {string}
   * @memberof FooterComponent
   */
  public getCurrentURL(): string {
    let currentUrl: string = this.router.url.toString();
    let len = 0;
    if (currentUrl.lastIndexOf('?') > -1) {
      currentUrl = currentUrl.substr(0, currentUrl.lastIndexOf('?'));
    }
    currentUrl = currentUrl.substr(currentUrl.lastIndexOf('/'), currentUrl.length);
    return currentUrl;
  }

  /**
   * Get the current page
   *
   *
   * @returns {string}
   * @memberof FooterComponent
   */
  public getCurrentPage(): string {
    let url = this.getCurrentURL();
    return url.replace(/\//, '');
  }

  /**
   * Validate continue button
   *
   *
   * @returns {boolean}
   * @memberof FooterComponent
   */
  public validateContinueButton(): boolean {
    let res = false;
    let currentUrl: string = this.getCurrentURL();
    if (currentUrl === '/welcome') {
      if (this.dataProxyService.getSelectedCount() > 0) {
        res = true;
      }
    } else if (currentUrl === '/questionnaire' || currentUrl === '/summary') {
      if (!this.dataProxyService.getQuestions()) {
        return res;
      }
      return this.dataProxyService.getQuestions().isValid();
    } else if (currentUrl === '/locked') {
      const respositionType = this.storage.getFromLocal('respositionType');
      if (respositionType !== null) {
        res = true;
      }
    }
    return res;
  }

  /**
   * Handle status
   *
   *
   * @memberof FooterComponent
   */
  public handleStatus(): void {
    let currentUrl: string = this.getCurrentURL();
    if (currentUrl === '/welcome') {
      this.active = false;
    }
    if (currentUrl === '/questionnaire') {
      this.buttonText = 'Continuar';
      this.active = true; this.hideSelected = true;
      this.buttonText = 'Continuar';
    }
    if (currentUrl === '/result' || currentUrl === '/' || currentUrl === '/definitivePayment') {
      this.active = false;
    }
    if (currentUrl === '/summary') {
      this.buttonText = 'Confirmar';
      this.hideSelected = false;
      this.active = false;
    }
    if (currentUrl === '/locked') {
      if (this.dataProxyService.getQuestions().blocker.operationCancellation) {
        this.buttonText = 'Continuar';
      } else {
        this.buttonText = 'Finalizar';
      }
      this.active = true;
    }
    if (currentUrl === '/d-questionnarie') {
      this.active = false;
    }
  }

  /**
   * Handle navigation
   *
   * @param event {any}
   * @returns {void}
   */
  public handleNavigation(event: any): void {
    event.stopPropagation();
    let currentUrl: string = this.getCurrentURL();
    let category = "";
    const prefolio = this.storage.getFromLocal('prefolios');
    let typeUser = prefolio ? 'prefolio': '';
    switch (currentUrl) {
      case '/welcome':
        // Send the movements to the GA
        const movements = this.dataProxyService.getDataSelected();
        let movementsIds: Number[] = [];
        let amounts: String[] = [];

        movements.forEach((element) => {
          movementsIds.push(element.id);
          amounts.push(element.txrMonto);
        });
        /*this.taggingService.setDimenson('8', movementsIds.join());
        this.taggingService.setDimenson('16', amounts.join());
        this.taggingService.send('');*/



        this.navigationService.validateSession();
        if (this.storage.getFromLocal('isAtm')) {
          // this.taggingService.link({
          //   event: 'aclaraciones',
          //   interaction_category: 'seleccion_movimiento',
          //   interaction_action: 'detalle_movimientos',
          //   interaction_label: 'continuar'
          // });
          this.router.navigate(['questionnaire']);
        } else {

          // this.taggingService.link({
          //   event: 'aclaraciones',
          //   interaction_category: 'movimientos_atm',
          //   interaction_action: 'click_boton',
          //   interaction_label: 'continuar',
          // });

          this.storage.saveInLocal('states', this.dataProxyService.getStates());
          this.storage.saveInLocal('multifolio', this.dataProxyService.getDataSelected());
          this.storage.saveInLocal('chanel', this.dataProxyService.getChannel());
          this.storage.saveInLocal('enviroment', this.dataProxyService.getEnviroment());
          this.storage.saveInLocal('userdata', this.dataProxyService.getUserData());
          this.storage.saveInLocal('categoria', 'TARJETA DE CREDITO TARJETAHABIENTES');
          this.router.navigate(['questionarie-atm']);
        }

        break;
      case '/questionnaire':
        this.taggingService.link({
          event: 'aclaraciones',
          interaction_category: 'aclaraciones_cargos',
          interaction_action: 'cuestionario_tdc',
          interaction_label: 'continuar',
          interaction_tipoUsuario: typeUser,
          interaction_url: "aclaraciones/cuestionario_tdc"
        });
        //this.taggingService.send('');
        this.navigationService.validateSession();
        this.router.navigate(['summary']);
        break;
      case '/summary':
        let path = this.taggingService.typeClarificationTDC();
        this.taggingService.link({
          event: 'aclaraciones',
          interaction_category: 'aclaraciones_cargos',
          interaction_action: 'resumen_tdc',
          interaction_label: 'continuar',
          interaction_tipoUsuario: typeUser,
          interaction_url: path
        });
        this.navigationService.validateSession();
        this.navigationService.hideBackButton();
        this.active = false;
        this.dataProxyService.getQuestionsStatusService().emit('validatedQuestionnaire');
        break;
      case '/locked':
        // this.taggingService.send('');
        this.navigationService.validateSession();
        if (this.dataProxyService.getQuestions().blocker.operationCancellation) {
          this.active = false;
          this.dataProxyService.getQuestionsStatusService().emit('validatedQuestionnaire');
        } else {
          this.navigationService.goToRoot();
        }
        break;
      default:
        break;
    }
  }

  /**
   * Returns to the previous page
   *
   * @returns {void}
   * @memberof FooterComponent
   */
  public back(): void {
    let currentUrl: string = this.getCurrentURL();
    if (currentUrl === '/summary') {
      this.router.navigate(['/questionnaire']);
    }
    if (currentUrl === '/questionnaire') {
      this.router.navigate(['/welcome']);
    }
  }

  public setCategoryNoHasCard(): string {
    if (this.dataProxyService.getQuestions().whatHappens.getTitle() === 'Me la robaron o la extravié y no la he reportado') {
      return 'robo_extraviada';
    } else {
      return 'robo_no_reporte';//robo_extraviada
    }
  }
  /**
   *
   * @returns category for tealium service
   */
  public getCategory(): string {
    let key = this.dataProxyService.getQuestions().motive.key;

    if (this.dataProxyService.getQuestions().hasCard.toString() == "2") {
      return this.setCategoryNoHasCard();
    }
    if (this.dataProxyService.getQuestions().haveContact == '2') {
      return 'fraude_no_intereaccion_comercio';
    }
    switch (key) {
      case 'IC-201': {
        return "cargo_duplicado";
      }
      case 'IC-202': {
        return "monto_alterado";
      }
      case 'IC-203': {
        return "cargos_adicionales";
      }
      case 'IC-204': {
        return "servicios_no_proporcionados";
      }
      case 'IC-205': {
        return "devolucion_no_aplicada";
      }
      case 'IC-206': {
        return "pago_por_otro_medio";
      }
      case 'IC-207': {
        return "cancelacion_de_servicio"
      }
      default: {
        break;
      }
    }
  }
}
