import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import * as _ from 'lodash';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import {
  LoaderModel,
  MotiveModel,
  MoveModel, QuestionsModel,
  ResponseModel,
  StateModel,
  UserModel
} from './../../models';
import { DataProxyService } from './../../services/data-proxy.service';
import { DataService } from './../../services/data.service';
import { NavigationService } from './../../services/navigation.service/navigation.service';
import { TaggingService } from './../../services/tagging.service';
import { DataObject } from './../../shared/data.object';
import { SessionStorageService } from '../../services/tdd/session-storage.service';

/**
 *
 *
 * @export
 * @class QuestionnaireComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'questionnaire',
  templateUrl: './questionnaire.component.html',
  providers: [
    DataObject,
    DataService,
    TaggingService,
    NavigationService
  ]
})
export class QuestionnaireComponent implements OnInit, OnDestroy {

  public tooltipText : string = '';

  public isHideNav = false;
  protected userData: UserModel;
  private section: string = 'questionnaire';
  private dataHandler = Array<MoveModel>();
  private states: Array<StateModel> = Array<StateModel>();
  private shownStates: Array<StateModel> = Array<StateModel>();
  private questions:  QuestionsModel;
  private responseDAO: ResponseModel;
  private modalRef: BsModalRef;
  private subscription: Subscription;
  private rawData: any;
  private errorMessage: string;
  private isEnabled = false;
  private enableStateSelector = false;
  private timeoutOccured = false;
  private mask:any = [/[0-9]/, /[0-9]/,' ','/' ,' ', /[0-9]/,/[0-9]/];
  private maskTwoNumbers: any = [/[0-9]/, /[0-9]/];
  private maskFourNumbers: any = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/];
  private sixNumberMask: any = [/[0-9]/, /[0-9]/, /[0-9]/,/[0-9]/, /[0-9]/ ,/[0-9]/];
  private defaultMessage = 'Esta pantalla se cerrará de manera automática cuando el proceso termine.';
  private selectedMotive = '';
  private loadingMessage = '';
  private timerId = '';
  private counter = 0;
  private statesCounter = 0;
  private isBusy = false;
  private loader: LoaderModel;
  private motives: Array<MotiveModel> = [
    new MotiveModel(
      'IC-201',
      'Cargo duplicado',
      'Describa lo que <strong>sucedió</strong>:',
      'Ejem.: No reconozco el cargo porque me aparece en más de una ocasión.',
      'El cargo que hice está duplicado'
    ),
    new MotiveModel(
      'IC-202',
      'Monto alterado',
      '¿Cuál es el importe que <strong>autorizó y reconoce</strong>?',
      'Ejem.: Es de $120,000.00 el monto que si reconozco.',
      'El importe está alterado (solicitar pagaré firmado por cliente)'
    ),
    new MotiveModel(
      'IC-203',
      'Cargos adicionales al autorizado',
      'Indique los datos del (los) <strong>consumo(s) que sí reconoce</strong>:',
      'Ejem.: ID 2429384 - Compra en Liverpool',
      'Procesaron transacciones adicionales a la que autoricé(solicitar pagaré firmado por cliente)'
    ),
    new MotiveModel(
      'IC-206',
      'Pago por otro medio',
      'Describa lo que <strong>sucedió</strong>:',
      'Ejem.: No hice el pago a través de este medio.',
      'Pagué por otro medio(solicitar comprobante de pago)'
    ),
    new MotiveModel(
      'IC-205',
      'Devolución no aplicada',
      '<strong>Comentarios</strong> adicionales:',
      'Ejem.: No me han hecho mi devolución.',
      'La mercancía o servicios estaban defectuosos o difieren de lo acordado'
    ),
    new MotiveModel(
      'IC-204',
      'Mercancías o servicios no <br>proporcionados',
      '<strong>Comentarios</strong> adicionales:',
      'Ejem.: Nunca me llegó mi mercancía',
      'Mercancía o servicios no recibidos'
    ),
    new MotiveModel(
      'IC-207',
      'Cancelación de servicio',
      '<strong>Comentarios</strong> adicionales:',
      'Ejem.: No estoy de acuerdo con el cobro del servicio, por lo cual lo cancelo.',
      'Cancelé el servicio(solicitar información de cancelación: fecha, clave, comprobante)'
    )
  ];

  private isEdition = JSON.parse(localStorage.getItem('editFlow')) || false;

  private readonly MAX_CHARACTER = 240;
  public storage = inject(SessionStorageService);

  /**
   * Creates an instance of QuestionnaireComponent.
   * @param {Router} router
   * @param {DataProxyService} dataProxyService
   * @param {DataObject} dataObject
   * @param {DataService} dataService
   * @param {TaggingService} taggingService
   * @param {NavigationService} navigationService
   * @param {BsModalService} modalService
   * @memberof QuestionnaireComponent
   */
  constructor(
      private router: Router,
      public dataProxyService: DataProxyService,
      private dataObject: DataObject,
      private dataService: DataService,
      private taggingService: TaggingService,
      private navigationService: NavigationService,
      private modalService: BsModalService) {
    if (!this.dataProxyService.getQuestions()) {
      this.dataProxyService.setQuestions(new QuestionsModel());
    }
    this.questions = this.dataProxyService.getQuestions();
    if (!this.isEdition) {
      this.questions.resetHard();
    }

    this.questions.lostDateValid = false;
    this.loadingMessage = this.defaultMessage;
    this.selectedMotive = `${this.questions.defaultMotive.title} <span class="angle-down"></span>`;
    if (!this.questions.motive) {
      this.questions.motive = this.questions.defaultMotive;
    } else {
      if (this.questions.defaultMotive.key !== this.questions.motive.key) {
        this.selectedMotive = this.swapMotive(this.questions.motive);
      }
    }
    // this.st.newTimer('10sec', 10);
  }

  /**
   * Loads initial content.
   *
   * @memberof QuestionnaireComponent
   */
  public ngOnInit() {
    // Navigation rules
    // this.navigationService.setTitle('Cuestionario');
    this.navigationService.tapBack(this.section);
    if (!this.isEdition) {
      this.questions.resetValues();
    } else {
      console.log(this.dataProxyService.getQuestions());
    }
    this.questions.lostDateValid = false;
    this.dataHandler = this.dataObject.getSelectedMoves();
    this.userData = this.dataProxyService.getUserData();
    this.states = this.dataProxyService.getStates();
    if (this.states) {
      this.statesCounter = this.states.length;
    }

    this.assignShownStates(this.states);
    this.responseDAO = this.dataProxyService.getResponseDAO();
    this.loader = this.dataProxyService.getLoader();
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
          return;
      }
      window.scrollTo(0, 0);
    });
    // GA - Tealium
    /*const dataLayer = {
      4: this.section,
      17: 'step-questionnaire',
    };
    this.taggingService.uTagView(dataLayer);
    this.taggingService.setPageName();
    this.taggingService.send('');*/

    /* Se pretender agregar el tipoUsuario a los demas flujos de TDC
       Para el feature de prefolio se solicito que unicamente este flujo
       tenga el tag_tipoUsuario
    */
    const prefolio = this.storage.getFromLocal('prefolios');
    let typeUser = prefolio ? 'prefolio': '';
    this.taggingService.view({
      tag_subsection1: 'cuestionario_tdc',
      tag_titulo: 'aclaraciones_cargos|cuestionario_tdc',
      tag_url: '/aclaraciones_cargos/cuestionario_tdc',
      tag_tipoUsuario: typeUser
    });
    //this.tealium.view(this.taggingService.getvalues());

  }

  /**
   * Method that is called when result component is destroyed.
   *
   * @memberof QuestionnaireComponent
   */
  public ngOnDestroy() {
    // TODO: destroy implementation
  }

  /**
   * Scroll bottom.
   *
   * @private
   * @memberof QuestionnaireComponent
   */
  private scrollBottom(){
    setTimeout(()=>{
      window.scrollTo(0,document.body.scrollHeight);
    },150)

  }
  /**
   * Listen the interaction of the user and validate the native session.
   *
   * @private
   * @param {Event} $event
   * @memberof QuestionnaireComponent
   */
  @HostListener('window:scroll', ['$event'])
  private onWindowScroll($event: Event): void {
    this.navigationService.validateSession();
  }
  /**
   * Evaluate lost date.
   *
   * @private
   * @memberof QuestionnaireComponent
   */
  private evaluateLostDate() {
    this.navigationService.validateSession();
    this.questions.lostDateIsValid();
    if (this.questions.lostDateValid) {
      // GA - Tealium
      //this.taggingService.setDimenson('15', this.questions.lostDate);
      this.tryOut();
      this.scrollBottom();
    } else {
      this.isEnabled = false;
    }
  }
  /**
   * Toggle Card Status.
   *
   * @private
   * @param {*} e
   * @memberof QuestionnaireComponent
   */
  private toggleCardStatus(e) {
    this.navigationService.validateSession();
    //this.taggingService.setDimenson('9', (e === '1') ? 'yes' : 'no');
      this.questions.resetNOPath();
      this.questions.resetYESPath();
      this.questions.lostDateValid = false;
    this.questions.isValid();
    this.scrollBottom();
  }
  /**
   * Apply have contact.
   *
   * @private
   * @param {*} e
   * @memberof QuestionnaireComponent
   */
  private applyHaveContact(e) {
    this.navigationService.validateSession();
    this.isEnabled = false;
    this.questions.additionalComments = '';
    this.questions.motive = this.questions.defaultMotive;
    this.questions.location = 0;
    this.questions.state = this.questions.defaultState;
    /*if (this.questions.haveContact === '2') {
      this.questions.resetNOPath();
    } else {
      this.questions.resetYESPath();
    }*/
   // this.taggingService.setDimenson('10', (e === '1') ? 'yes' : 'no');
    if (e !== 1) { // If a contact was not made
      this.tryOut();
    }
    this.scrollBottom();
  }
  /**
   * Evaluate situation.
   *
   * @private
   * @param {*} e
   * @memberof QuestionnaireComponent
   */
  private evaluateSituation(e) {
    this.navigationService.validateSession();
    this.questions.softResetNoPath();
    this.isEnabled = false;
    // GA - Tealium
    //this.taggingService.setDimenson('14', e.title);
    if (e === this.questions.situations[1]) {
      this.isEnabled = true;
    }
    this.scrollBottom();
  }
  /**
   * Reset TextArea.
   *
   * @private
   * @param {*} evt
   * @memberof QuestionnaireComponent
   */
  private resetTextArea(evt: any){
    if (this.questions.additionalComments.length < 5) this.questions.location = 0;
    this.tryOut();
  }
  /**
   * Input validator for the comments.
   *
   * @param {*} event
   * @memberof QuestionnaireComponent
   */
  public inputValidator(event: any) {
    const pattern = /^[a-zA-Z0-9 _\\-\\.:,;áéíóúÁÉÍÓÚÜü¿?"¡!#$%&()=]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^a-zA-Z0-9 _\\-\\.:,;áéíóúÁÉÍÓÚÜü¿?"¡!#$%&()=]/g, "");
    }
  }
  /**
   * Try out.
   *
   * @private
   * @memberof QuestionnaireComponent
   */
  private tryOut() {
    this.isEnabled = this.questions.isValid();
  }
  /**
   * Skip
   *
   * @private
   * @memberof QuestionnaireComponent
   */
  private skip() {
    // this.st.unsubscribe(this.timerId);
    this.modalRef.hide();
    document.getElementById('body').style.removeProperty('overflow');
    this.router.navigate(['result']);
  }
  /**
   * Has card change.
   *
   * @private
   * @param {*} e
   * @memberof QuestionnaireComponent
   */
  private hasCardChange(e: any) {
    this.questions.resetHard();
    this.isEnabled = false;
  }
  /**
   * Check if the selected motive is the default.
   *
   * @private
   * @returns
   * @memberof QuestionnaireComponent
   */
  private checkSelectedMotive() {
    return this.questions.defaultMotive.title === this.questions.motive.title;
  }
  /**
   * Swap Motive and checks if the string is greater than 28 characters.
   *
   * @private
   * @param {MotiveModel} e
   * @returns {string}
   * @memberof QuestionnaireComponent
   */
  private swapMotive(e: MotiveModel): string {
    this.navigationService.validateSession();
    this.questions.motive = e;
    let short: string;
    // Check if the width of the ViewPort is lower than
    if (this.questions.motive.title.length >= 28) {
      let maxLength = 0;
      switch(true) {
        case (window.innerWidth <= 320):
          maxLength = 20;
          break;
        case (window.innerWidth <= 330):
          maxLength = 22;
          break;
        case (window.innerWidth <= 340):
          maxLength = 23;
          break;
        case (window.innerWidth <= 350):
          maxLength = 24;
          break;
        case (window.innerWidth <= 360):
          maxLength = 25;
          break;
        case (window.innerWidth <= 370):
          maxLength = 26;
          break;
        case (window.innerWidth <= 380):
          maxLength = 30;
          break;
        case (window.innerWidth <= 390):
          maxLength = 29;
          break;
        default:
          maxLength = 29;
      }
      short = this.questions.motive.title
                  .replace(/<(.|\n)*?>/g, ' ')
                  .substring(0, maxLength) + '...';
    } else {
      short = this.questions.motive.title;
    }
    //this.taggingService.setDimenson('11', this.questions.motive.title.replace(/<(.|\n)*?>/g, ' '));
    this.selectedMotive = `${short} <span class="angle-down"></span>`;
    return this.selectedMotive;
  }
  /**
   * Tagging the state when changes in select.
   *
   * @private
   * @memberof QuestionnaireComponent
   */
  private tagState() {
    this.navigationService.validateSession();
    //this.taggingService.setDimenson('13', this.questions.state);
  }
  /**
   * Assign shown states
   *
   * @private
   * @param {Array<StateModel>} a
   * @memberof QuestionnaireComponent
   */
  private assignShownStates(a: Array<StateModel>) {
    if (a) {
      this.shownStates = _.slice(a, 0, a.length - 1 );
    }
  }
  /**
   * Validate States Selector.
   *
   * @private
   * @returns
   * @memberof QuestionnaireComponent
   */
  private validateStatesSelector() {
    let res = false;
    // && questions.additionalComments.length > 4
    if ((this.questions.additionalComments.length > 4 && this.questions.additionalComments.trim()!= "") ||
       this.questions.whatHappens === this.questions.situations[1] ||
       this.questions.whatHappens === this.questions.situations[2] ||
       this.questions.haveContact === '2' ||
        this.questions.lostDateValid) {
          res = true;
        }
    return res;
  }
  /**
   * Swap foreign location.
   *
   * @private
   * @memberof QuestionnaireComponent
   */
  private swapForeignLocation() {
    this.navigationService.validateSession();
    let states: Array<StateModel> = this.dataProxyService.getStates();
    if (!_.isUndefined(states[states.length - 1])) {
      this.questions.state = states[states.length - 1].nombre;
    }
    //this.taggingService.setDimenson('12', 'En el extranjero');
    this.scrollBottom();
  }
  /**
   * Swap locale.
   *
   * @private
   * @memberof QuestionnaireComponent
   */
  private swapLocale() {
    this.navigationService.validateSession();
    //this.taggingService.setDimenson('12', 'En México');
    this.questions.state = this.questions.defaultState;
    this.scrollBottom();
  }
  /**
   * Show tooltip.
   *
   * @param {*} idMotive
   * @memberof QuestionnaireComponent
   */
  public tooltipShow(idMotive){
    // Remove Inactive
    let element = document.getElementById('tooltipMotive');
    element.classList.remove("inactive");

    //Inner HTML to Div
    switch (parseInt(idMotive)) {

        case 1:
        this.tooltipText = 'Se presenta cuando en los movimientos aparecen 2 importes por la misma compra.';
        break;

        case 2:
        this.tooltipText = 'Se presenta cuando se realizó  una compra y el movimiento tiene una cantidad diferente a la que se reconoce.';
        break;

        case 3:
        this.tooltipText = 'Se presenta cuando aparecen distintos o mayor número de importes.';
        break;

        case 4:
        this.tooltipText = 'Se presenta cuando el pago con la tarjeta falla, y aun así se realiza el cargo, aunque se haya pagado con otro medio (efectivo u otra tarjeta).';
        break;

        case 5:
        this.tooltipText = 'Se presenta cuando se realizó una compra, se devolvió el objeto y en el estado de cuenta el cargo fue aplicado.';
        break;

        case 6:
        this.tooltipText = 'Se presenta cuando se hizo una compra, nunca llegó el objeto y aun así el cargo fue aplicado.';
        break;

        case 7:
        this.tooltipText = 'Se presenta cuando se estableció un pago de servicio, se canceló el servicio y aun así se sigue aplicando el cargo.';
        break;


      default:
  }

  }
  /**
   * Opener Light Box
   *
   * @param {*} event
   * @memberof QuestionnaireComponent
   */
  public tooltipOpener(event){

    let y = event.clientY;
    let x = event.clientX;
    let tooltip = document.getElementById('tooltip-box');
    let backdrop = document.getElementById('backdrop');
    let tooltipText  = document.getElementById('tooltip-text');
    let flagBorder = document.getElementById('flag-border');
    let flagColor = document.getElementById('flag-color');

    tooltipText.innerHTML = this.tooltipText;
    tooltip.style.top = (y+20+ window.scrollY)+'px';
    tooltip.style.position = 'absolute';
    flagColor.style.left = (x-14)+'px';
    flagBorder.style.left = (x-14)+'px'  ;
    backdrop.classList.remove("tooltip-hide");
    tooltip.classList.remove("tooltip-hide");

  }

  public setSelection(motive1: MotiveModel, motive2: MotiveModel): boolean {
    if (this.isEdition) {
      return motive1.key === motive2.key;
    }
    if (motive2?.key === 'D-101') {
      return true;
    }
    return motive1?.key === motive2?.key;
  }

  public validateMaxLength(value: string) {
    if (value.length >= this.MAX_CHARACTER) {
      return false;
    }
  }
}
