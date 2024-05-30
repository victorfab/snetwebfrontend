import { Component, OnInit, ViewChild, forwardRef, Input, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import moment from 'moment';
import { TooltipTddComponent } from '../';
import { UtilsTddService } from '../../../services/tdd/utils-tdd.service';
import { SessionStorageService } from '../../../services/tdd/session-storage.service';
import * as _ from 'lodash';
import { AlertsTddService } from '../../../services/tdd/alerts-tdd.service';
import { NavigationService } from '../../../services/navigation.service/navigation.service';

//Taggeo
import { TaggingService } from '../../../services/tagging.service';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { SessionStorageService as Session } from 'angular-web-storage';
import { CashBack } from '../../../enums/cashback.enum';
import { CashbackService } from '../../../services/cashback/cashback.service';


/**
 *
 *
 * @export
 * @class QuestionnaireTddComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-questionnaire-tdd',
  templateUrl: './questionnaire-tdd.component.html',
  providers: [
    NavigationService
  ]
})
export class QuestionnaireTddComponent implements OnInit, OnDestroy {
  /** tooltip agregado como child */
  // TODO: Check this
  // @ViewChild(forwardRef(() => TooltipTddComponent),{static:true}) tooltip: TooltipTddComponent;
  /**tiene la tarjeta en su poder */
  private hasCard;
  /**interactuo con el comercio */
  private commerceInteraction;
  /**motivo seleccionado  */
  private motiveSelected;
  /**id del motivo seleccionado */
  private motiveSelectedId;
  /**descripcion de lo sucedidp */
  private motiveClientDescription;
  /**validacion de la longitud de la descripcion */
  private validMotiveClientDescription;
  /**fecha en l que perdio la tarjeta */
  private lostDate;
  /**dia en que perdio la tarjeta */
  private lostDateDay;
  /**mes en que perdio la tarjeta */
  private lostDateMonth;
  /**año en que reporto la tarjeta */
  private lostDateYear;
  /**ubicacion del cliente */
  private location;
  /**estado donde se encuentra el cliente */
  private state;
  //**días del mes */
  private days;
  /**meses del año */
  private months;
  /**años a seleccionar */
  private years;
  /**catalogo de estados */
  private states = [{ clave: 0, nombre: '' }];

  /** SECTION NAME TB BUTTON */
  private section: string = 'questionnaire';

  /**motivos a mostrar en la vista */
  //8-La reporte como robada o extraviada
  //9-Nunca la tuve conmigo
  //10 = Me la robaron o la extravié y no la he reportado
  private motives = [
    { id: '1', description: 'Cargo duplicado', label: 'Describa lo que <b>sucedió</b>:', hover: 'Ejem.: No reconozco el cargo porque me aparece en más de una ocasión.', tooltip: 'Se presenta cuando en los movimientos aparecen 2 importes por la misma compra.' },
    { id: '2', description: 'Monto alterado', label: '¿Cuál es el importe que <strong>autorizó y reconoce</strong>?', hover: 'Ejem.: Es de $120,000.00 el monto que si reconozco.', tooltip: 'Se presenta cuando se realizó  una compra y el movimiento tiene una cantidad diferente a la que se reconoce.' },
    { id: '3', description: 'Cargos adicionales al autorizado', label: 'Indique los datos del (los) <strong>consumo(s) que sí reconoce</strong>:', hover: 'Ejem.: ID 2429384 - Compra en Liverpool', tooltip: 'Se presenta cuando aparecen distintos o mayor número de importes.' },
    { id: '4', description: 'Pago por otro medio', label: 'Describa lo que <strong>sucedió</strong>:', hover: 'Ejem.: No hice el pago a través de este medio.', tooltip: 'Se presenta cuando el pago con la tarjeta falla, y aun así se realiza el cargo, aunque se haya pagado con otro medio (efectivo u otra tarjeta).' },
    { id: '5', description: 'Devolución no aplicada', label: '<strong>Comentarios</strong> adicionales:', hover: 'Ejem.: No me han hecho mi devolución.', tooltip: 'Se presenta cuando se realizó una compra, se devolvió el objeto y en el estado de cuenta el cargo fue aplicado.' },
    { id: '6', description: 'Mercancías o servicios no proporcionados', label: '<strong>Comentarios</strong> adicionales:', hover: 'Ejem.: Nunca me llegó mi mercancía', tooltip: 'Se presenta cuando se hizo una compra, nunca llegó el objeto y aun así el cargo fue aplicado.' },
    { id: '7', description: 'Cancelación de servicio', label: '<strong>Comentarios</strong> adicionales:', hover: 'Ejem.: No estoy de acuerdo con el cobro del servicio, por lo cual lo cancelo.', tooltip: 'Se presenta cuando se estableció un pago de servicio, se canceló el servicio y aun así se sigue aplicando el cargo.' },
    { id: '11', description: 'Cashback-Beneficio Alianzas no es correcto', label: '', hover: '', tooltip: '', visible: 'N' },

  ]


  public isCashbackFlow = false;
  public cashback = CashBack;
  public chanelType = '';
  private readonly MAX_CHARACTER = 240;
  public comesFromEdit = false;


  /**
   *Creates an instance of QuestionnaireTddComponent.
   * @param {UtilsTddService} utils
   * @param {SessionStorageService} storage
   * @param {Router} router
   * @param {AlertsTddService} alertsTddService
   * @param {NavigationService} navigationService
   * @param {TaggingService} taggingService
   * @memberof QuestionnaireTddComponent
   */
  constructor(
    private utils: UtilsTddService,
    private storage: SessionStorageService,
    private router: Router,
    private alertsTddService: AlertsTddService,
    private navigationService: NavigationService,
    private taggingService: TaggingService,
    private session: Session,
    private cashbackService: CashbackService,
  ) {
    this.chanelType = this.storage.getFromLocal("chanel");
    const clacon = (this.session.get('clacon') || []) as string[];

    if (clacon.length > 0) {
      this.isCashbackFlow = (clacon[0] === this.cashback.NOMINA || clacon[0] === this.cashback.LIKEU);
    }

    this.hasCard = '';
    this.resetQuestionary(1);
    this.generateDates();
    this.states = this.storage.getFromLocal('states');
    this.states.splice(-1, 1);
    this.comesFromEdit = this.cashbackService.getEditFlow() === 'true'
  }

  /**
   *
   *
   * @memberof QuestionnaireTddComponent
   */
  ngOnInit() {
    //TB BUTTON SM O WALL
    this.navigationService.tapBack(this.section);
    //this.alertsMain.sendMessage(-1,false);
    this.resetQuestionary(1);
    this.states = this.storage.getFromLocal('states');


    //TALIUM - TAG

    // GA - Tealium
    if (!this.isCashbackFlow) {
      this.taggingService.setvalues("cuestionario_tdd", "aclaraciones/cuestionario_tdd");
      this.taggingService.view(this.taggingService.getvalues());
    } else {
      this.taggingService.setvalues("cuestionario_tdd", "aclaraciones/cuestionario_cashback");
      this.taggingService.view(this.taggingService.getvalues());
      // this.taggingService.link({
      //   event: "aclaraciones",
      //   interaction_action: "questionnairetdd",
      //   interaction_category: "cashback",
      //   interaction_label: "continuar",
      // })
    }
    /*const dataLayer = {
      4: this.section,
      17: 'step-questionnaire-tdd',
    };
    this.taggingService.uTagView(dataLayer);
    this.taggingService.setPageName();
    this.taggingService.send(location.hash);
*/

    const additional = this.storage.getFromLocal('additionaldata');

    if (additional) {
      this.state = additional.location;
      this.location = this.state === 33 ? 'Foreign' : 'Mexico';

      if (this.isCashbackFlow) {
        this.motiveClientDescription = additional?.description[0];
        this.validateMotiveDescription();
      }
    }
  }

  /**
  * Method to go botoom page
  *
   *
   *
   * @private
   * @memberof QuestionnaireTddComponent
   */
  private scrollBottom() {
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 150)

  }

  /**
  * Method that generates the values of the date
   *
   * @memberof QuestionnaireTddComponent
   */
  generateDates() {
    this.days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
    this.months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    let date = moment();
    this.years = [date.format('YYYY')];
    for (let i = 0; i < 10; i++) {
      this.years.push(date.subtract(1, 'years').format('YYYY'));
    }
  }


  /**
  * Input validator for the comments
  *
   *
   * @param {*} event
   * @memberof QuestionnaireTddComponent
   */
  inputValidator(event: any) {
    const pattern = /^[a-zA-Z0-9 _\\-\\.:,;áéíóúÁÉÍÓÚÜü¿?"¡!#$%&()=]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^a-zA-Z0-9 _\\-\\.:,;áéíóúÁÉÍÓÚÜü¿?"¡!#$%&()=]/g, "");
      this.motiveClientDescription = event.target.value;
    }
  }
  /**
   *Validate the description lenght
   *
   * @memberof QuestionnaireTddComponent
   */
  validateMotiveDescription() {
    this.motiveClientDescription = this.motiveClientDescription.trim();
    this.motiveClientDescription.length >= 5 && this.motiveClientDescription.trim() != "" ? this.validMotiveClientDescription = true : this.validMotiveClientDescription = false;
  }

  /**
  * set the correct value to motiveSelected when changes the motive
   *
   * @param {*} id
   * @memberof QuestionnaireTddComponent
   */
  changeMotive(id) {
    if (Number(id) === 8 || Number(id) === 9 || Number(id) === 10) {
      this.motiveSelected = { id: id };
    } else {
      this.motiveSelected = this.motives[Number(id) - 1];
    }

    //Call tagging service
    //this.tagginService('11', this.motiveSelected.description);
  }

  /**
  * reset the value of the questionary depending the level of reset
  *
   *
   * @param {*} level
   * @memberof QuestionnaireTddComponent
   */
  resetQuestionary(level) {
    switch (level) {
      case 1:
        this.commerceInteraction = '';
        this.motiveSelectedId = '0';
        this.motiveSelected = { id: '0' }
        this.motiveClientDescription = '';
        this.validMotiveClientDescription = false;
        this.lostDate = '';
        this.lostDateDay = '';
        this.lostDateMonth = '';
        this.lostDateYear = '';
        this.state = '';
        this.location = '';
        break;
      case 2:
        this.motiveSelectedId = '0';
        this.motiveSelected = { id: '0' }
        this.motiveClientDescription = '';
        this.validMotiveClientDescription = false;
        this.lostDate = '';
        this.lostDateDay = '';
        this.lostDateMonth = '';
        this.lostDateYear = '';
        this.state = '';
        this.location = '';
        break;
      case 3:
        this.motiveClientDescription = '';
        this.validMotiveClientDescription = false;
        this.lostDate = '';
        this.lostDateDay = '';
        this.lostDateMonth = '';
        this.lostDateYear = '';
        this.state = '';
        this.location = '';
        break;
      case 4:
        this.location = '';
        this.state = '';
        break;
      case 5:
        this.state = '';
        break;
      case 6:
        this.validMotiveClientDescription = false;
        break;
      default:
        break;
    }
  }

  /**
   * Check if the lost date is valid
   *
   *
   *
   * @memberof QuestionnaireTddComponent
   */
  public validateDate() {
    if (this.lostDateDay !== '' && this.lostDateMonth !== '' && this.lostDateYear !== '') {
      if (moment(`${this.lostDateDay}/${this.lostDateMonth}/${this.lostDateYear}`, 'DD/MMM/YYYY', 'es').isValid()) {
        this.lostDate = moment(`${this.lostDateDay}/${this.lostDateMonth}/${this.lostDateYear}`, 'DD/MMM/YYYY', 'es').format('DD/MMM/YYYY').toString().replace(/\./g, '');
      }
    }
  }

  /**
   * check if the lost date is a valid date
   */
  public lostDateIsValid(): boolean {
    let isValid = false;
    const NowDate = new Date;
    const MesesMilisegundos = 1000 * 60 * 60 * 24 * 31 * 4;
    const OldDate = NowDate.getTime() - MesesMilisegundos;
    const DateOld = new Date(OldDate);
    const stoleDate = new Date(moment(this.lostDate, 'DD/MMM/YYYY', 'es').format());
    if ((NowDate >= stoleDate)) {
      return true;
    }
    return false;
  }

  /**
   * generates the multifolio object
   *
   *
   * @memberof QuestionnaireTddComponent
   */
  validateForm() {

    let questionnaire = [];
    let viewQuestions = [];
    let viewLocation = '';
    let category = '';

    if (this.hasCard === 'SI' && Number(this.motiveSelectedId) !== 5 && Number(this.motiveSelectedId) < 8) {
      questionnaire = questionnaire.concat(this.generateNonrecognized());
    } else {
      let question = {
        Preguntas: '¿Reporto usted su tarjeta de crédito o débito como robada o extraviada a Banco Santander?',
        Respuestas: ''
      };
      if (Number(this.motiveSelectedId) === 8) {
        question.Respuestas = 'SI';
        questionnaire.push(question);
      } else {
        question.Respuestas = 'NO';
        questionnaire.push(question);
      }

    }

    if (this.state !== '') {
      viewLocation = _.find(this.states, (item) => {
        if (Number(item.clave) === this.state) {
          return item.nombre.toUpperCase();
        }
      }).nombre;
    } else {
      viewLocation = 'FUERA DE LA REPÚBLICA'
    }

    viewQuestions = this.utils.generateViewQuestions(this.motiveSelected, this.motiveClientDescription, this.lostDate, viewLocation, this.commerceInteraction);

    this.storage.saveInLocal('viewQuestions', viewQuestions);
    this.storage.saveInLocal('questionnaire', questionnaire);

    if (this.isCashbackFlow) {
      questionnaire = [
        {
          "Preguntas": "¿Tiene la tarjeta en su poder?",
          "Respuestas": "NO"
        },
        {
          "Preguntas": "¿Interactuó con el comercio durante la compra?",
          "Respuestas": "NO"
        },
        {
          "Preguntas": "Cargo duplicado",
          "Respuestas": "NO"
        },
        {
          "Preguntas": "Monto alterado",
          "Respuestas": "NO"
        },
        {
          "Preguntas": "Cargos adicionales",
          "Respuestas": "NO"
        },
        {
          "Preguntas": "Servicios no proporcionados",
          "Respuestas": "NO"
        },
        {
          "Preguntas": "Mercancia defectuosa",
          "Respuestas": "NO"
        },
        {
          "Preguntas": "Pago por otro medio",
          "Respuestas": "NO"
        },
        {
          "Preguntas": "Cancelación de servicio",
          "Respuestas": "NO"
        },
        {
          "Preguntas": "Cashback-Beneficio Alianzas no es correcto",
          "Respuestas": "SI"
        },
        {
          "Preguntas": "Otro",
          "Respuestas": "NO"
        }
      ]
      this.storage.saveInLocal('questionnaire', questionnaire);
    }
    let actualLocation;
    this.location === 'Foreign' ? actualLocation = 33 : actualLocation = this.state;
    let adittionaldata = {
      description: [this.motiveClientDescription],
      lostdate: this.lostDate,
      location: actualLocation
    }

    if (this.isCashbackFlow) {
      this.motiveSelected = this.motives[7];
      this.motiveSelectedId = '11';
    }

    switch (Number(this.motiveSelected.id)) {
      case 0:
        adittionaldata.description = ["COMPRA NO RECONOCIDA"];
        break;
      case 9:
        adittionaldata.description = ["TARJETA NO RECIBIDA"];
        break;
      case 8:
      case 10:
        adittionaldata.description = ["TARJETA ROBADA O EXTRAVIADA"];
        break;
      case 11:
        // adittionaldata.description = ["Cashback-Beneficio Alianzas no es correcto"];
        adittionaldata.description = [this.motiveClientDescription];
        break;

    }

    this.saveSubcategory();
    this.storage.saveInLocal('additionaldata', adittionaldata);
    this.storage.saveInLocal('questionId', this.motiveSelected);

    category = this.getCategoryTagging(adittionaldata);

    this.taggingService.setvalues("cuestionario_tdd", "cuestionario_tdd", category);

    const values = this.taggingService.getvalues();
    const tag = values.tag_aclaracion && values.tag_aclaracion.length ? values.tag_aclaracion[0]: '';
    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: 'aclaraciones_cargos',
      interaction_action: 'cuestionario_tdd',
      interaction_label: 'enviar',
      interaction_url: 'aclaraciones/cuestionario_tdd'
    });

    // this.tagAction(category);

    if (this.isCashbackFlow) {

      this.validateMotiveDescription();
      if (this.state !== '') {
        viewLocation = _.find(this.states, (item) => {
          if (Number(item.clave) === this.state) {
            return item.nombre.toUpperCase();
          }
        }).nombre;
      } else {
        viewLocation = 'FUERA DE LA REPÚBLICA'
      }

      this.storage.saveInLocal('location', viewLocation);

      this.cashbackService.cashbackFlow(true);
      this.router.navigate(['summaryTDD']);
      return;
    }
    this.cashbackService.cashbackFlow(false);
    this.router.navigate(['summaryTDD']);
  }

  /**
   *Set the category for tagging
   *
   * @memberof QuestionnaireTddComponent
   */
  public getCategoryTagging(adittionaldata: any): string {
    let category
    if (this.motiveSelected.description) {
      category = this.motiveSelected.description.toString().toLowerCase().replace(/ /g, '_')
    } else {
      category = adittionaldata.description.toString().toLowerCase().replace(/ /g, '_');
    }
    return category;
  }

  /**
   *validates the subcategory and saves in the storage
   *
   * @memberof QuestionnaireTddComponent
   */
  saveSubcategory() {
    switch (Number(this.motiveSelectedId)) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 6:
      case 7:
        this.storage.saveInLocal('subcategory', 'COMPRA NO RECONOCIDA');
        break;
      case 5:
        this.storage.saveInLocal('subcategory', 'DEVOLUCION NO APLICADA');
        break;
      case 8:
      case 10:
        this.storage.saveInLocal('subcategory', 'TARJETA ROBADA O EXTRAVIADA');
        break;
      case 9:
        this.storage.saveInLocal('subcategory', 'TARJETA NO RECIBIDA');
        break;
      case 11:
        this.storage.saveInLocal('subcategory', 'BENEFICIO ALIANZAS NO ES CORRECTO');
        break;
      default:
        this.storage.saveInLocal('subcategory', 'COMPRA NO RECONOCIDA');
        break;
    }
  }


  /**
   *generates the questions when he fow is not recognized
   *
   * @returns
   * @memberof QuestionnaireTddComponent
   */
  generateNonrecognized() {
    let questions = [
      { Preguntas: '¿Tiene la tarjeta en su poder?', Respuestas: 'SI' }
    ];
    let tempQuestion = { Preguntas: '¿Interactuó con el comercio durante la compra?', Respuestas: '' };

    if (this.commerceInteraction === 'SÍ') {
      tempQuestion.Respuestas = 'SI';
    } else {
      tempQuestion.Respuestas = 'NO';
    }


    questions.push(tempQuestion);
    questions = questions.concat(this.getAdditionalQuestionary());
    return questions;
  }


  /**
   *Additional questions in non recognized
   *
   * @returns
   * @memberof QuestionnaireTddComponent
   */
  getAdditionalQuestionary() {
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

    switch (Number(this.motiveSelectedId)) {
      case 1: {
        questionary[0].Respuestas = 'SI';
        break;
      }
      case 2: {
        questionary[1].Respuestas = 'SI';
        break;
      }
      case 3: {
        questionary[2].Respuestas = 'SI';
        break;
      }
      case 4: {
        questionary[3].Respuestas = 'SI';
        break;
      }
      case 6: {
        questionary[5].Respuestas = 'SI';
        break;
      }
      case 7: {
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
   *method tho execute the child component
   *
   * @param {*} evt
   * @memberof QuestionnaireTddComponent
   */
  public showTooltip(evt: any) {
    // this.tooltip.showTooltip(evt, this.motiveSelected.tooltip);
  }


  /**
   * muestra el alert cuando se seleccione no en el cuestionario
   *
   *
   * @memberof QuestionnaireTddComponent
   */
  showAlert() {
    this.alertsTddService.sendMessage(4, true, -1);
  }

  //TALIUM GA

  public tagginService(dimension: string, type: string): void {
    /*
        this.taggingService.setDimenson(dimension, type);
        this.taggingService.send(location.hash);

    */
  }

  public validateMaxLength(value: string) {
    if (value?.length >= this.MAX_CHARACTER) {
      return false;
    }
  }

  public reset(change: string): void {
    console.log(change)
    if (!this.comesFromEdit || change.length < 5) {
      this.resetQuestionary(4);
      this.resetQuestionary(6);
    }
  }

  ngOnDestroy(): void {
    this.cashbackService.editFlow('false');
  }
}
