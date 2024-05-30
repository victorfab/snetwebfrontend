// Native imports
import { OnInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
// Services
import { SSessionStorageService } from '../../../services/tdd/s-session-storage.service';
import { DataProxyService } from '../../../services/data-proxy.service';
import { UtilsTddService } from '../../../services/tdd/utils-tdd.service';
import { DataService } from '../../../services/data.service';
import { AlertsTddService } from '../../../services/tdd/alerts-tdd.service';
import { TaggingService } from '../../../services/tagging.service';
import { NavigationService } from '../../../services/navigation.service/navigation.service';
import { CustomCurrencyPipe } from '../../../pipes';
import moment from 'moment';
import { SessionStorageService } from '../../../services/tdd/session-storage.service';

@Component({
  selector: 'summary-atm',
  templateUrl: './summary-atm.component.html',
  providers: [
    DataService,
    NavigationService
  ]
})
export class SummaryATMComponent implements OnInit {
  /**
   * Datos del usuario a mostrar
   *
   * @type {*}
   * @memberof SummaryATMComponent
   */
  public userInfo: any;
  /**
   * preguntas respondidas por el cliente
   *
   * @type {*}
   * @memberof SummaryATMComponent
   */
  public questions: any;
  /**
   * arreglo de estados
   *
   * @private
   * @type {*}
   * @memberof SummaryATMComponent
   */
  private states: any;
  /**
   * categoria seleccionada
   *
   * @private
   * @type {string}
   * @memberof SummaryATMComponent
   */
  private categoria: string;

  private token: any;
  /**
   *
   * subscripcion a servicios para obtener una respuesta y
   * llevar el contenido a la vista
   *
   * @type {Subscription}
   * @memberof SummaryTddComponent
   */
  subscription: Subscription;
  // TODO: Replace it
  public questionsAnswered: any = []

  constructor(
    private storage: SessionStorageService,
    private dataProxyService: DataProxyService,
    private utils: UtilsTddService,
    private alertsTddService: AlertsTddService,
    private dataService: DataService,
    public router: Router,
    private taggingService: TaggingService
  ) {
  }

  /**
   * Init
   */
  public ngOnInit(): void {
    document.getElementById('body').style.removeProperty('body-footer-spacer');
    this.utils.scrollTop();
    this.questions = this.storage.getFromLocal('viewQuestions');
    this.states = this.storage.getFromLocal('states');
    this.dataService.setUris(this.storage.getFromLocal('enviroment'));
    console.log({appAcess: this.storage.getFromLocal('app-access')});
    if (this.storage.getFromLocal('app-access') === null) {
      console.log({client: this.dataProxyService.getIdToken()});
      this.storage.saveInLocal('client', this.dataProxyService.getIdToken())
    }

    if (this.storage.getFromLocal('client') === null) {
      this.storage.saveInLocal('client', this.dataProxyService.getIdToken())
    }

    this.categoria = this.storage.getFromLocal('categoria') != null ? this.storage.getFromLocal('categoria') : 'TARJETA DE DEBITO';
    this.getUserInfo();

    this.taggingService.setvalues('summaryatm', 'summaryatm');
    this.taggingService.view({
      tag_subsection1: 'summaryatm',
      tag_titulo: '/summaryatm',
      tag_url: '/summaryatm',    
    });

    // Recibir mensaje bloqueo
    this.subscription = this.alertsTddService.getMessage().subscribe(message => {
      if (message.response.number === -2) {
        console.info(message);
      }
    })

  }

  /**
   * Tomar valores del usuario y preguntas resueltas
   */
  private getUserInfo(): void {
    const fromTddFlow: any = this.storage.getFromLocal('userdata');
    if (this.dataProxyService.getCreditCardFullData() !== null) {
      this.userInfo = {
        cardName: this.dataProxyService.creditCardFullData.cardDesc,
        balance: this.dataProxyService.creditCardFullData.balance,
        cardNumber: this.dataProxyService.creditCardFullData.cardNumber
      }
    } else {
      this.userInfo = {
        cardName: fromTddFlow.cardName,
        balance: fromTddFlow.saldo,
        cardNumber: fromTddFlow.cardNumber
      }
    }

    this.questions.forEach(element => {
      switch (element.id) {
        case 'reason':
          this.questionsAnswered.push({
            question: 'MOTIVO DE LA ACLARACIÓN',
            answer: element.value
          });
          break;
        case 'description':
          this.questionsAnswered.push({
            question: 'DESCRIPCIÓN',
            answer: element.value
          });
          break;
        case 'howMuchRequest':
          this.questionsAnswered.push({
            question: 'SOLICITO EN CAJERO ATM',
            answer: `$${CustomCurrencyPipe.prototype.transform(Number.parseFloat(element.value))}`
          });
          break;
        case 'howMuchGet':
          this.questionsAnswered.push({
            question: 'MONTO RECIBIDO POR ATM',
            answer: `$${CustomCurrencyPipe.prototype.transform(Number.parseFloat(element.value))}`
          });
          break;
        case 'totalAmount':
          this.questionsAnswered.push({
            question: 'MONTO TOTAL DE LA ACLARACIÓN',
            answer: `$${CustomCurrencyPipe.prototype.transform(Number.parseFloat(element.value))}`
          });
          break;
        case 'hasCard':
          this.questionsAnswered.push({
            question: 'TARJETA EN SU PODER',
            answer: element.value
          });
          break;
        case 'entitySelected':
          const location = this.states.find(state => state.nombre === element.value);
          this.questionsAnswered.push({
            question: 'UBICACIÓN ACTUAL',
            answer: location === undefined ? this.states[element.value - 1].nombre : location.nombre
          });
          break;
        case 'interactiveAtm':
          this.questionsAnswered.push({
            question: 'INTERACTUÓ CON EL CAJERO ATM',
            answer: element.value
          });
          break;

      }
    });
  }

  /**
   * Hace la consulta del token de la aplicacion para llamar a ejecutar la aclaracion
   * dependiendo del ambiente lo hace en dummy o al endpoint
   *
   *
   * @private
   * @memberof SummaryTddComponent
   */
  executeContinue() {
    const values = this.taggingService.getvalues(); 
    const tag = values.tag_aclaracion && values.tag_aclaracion.length ? values.tag_aclaracion[0]: '';
    this.taggingService.link({
      event: 'aclaraciones',
      interaction_category: tag,
      interaction_action: 'confirmacion',
      interaction_label: 'confirmar',
    });

    this.alertsTddService.sendMessage(-1, true, 0);
    if (this.storage.getFromLocal('dummy') || this.dataProxyService.getDummyMode()) {
      this.exeCuteContinueDummyData();
    } else {
      this.executeContinueRestRequest();
    }
  }

  private executeContinueRestRequest(): void {
      this.executeClarification();
  }

  private exeCuteContinueDummyData(): void {
    const SMObject = this.utils.generateSMObject();
    SMObject.wvrinboxrn.Categoria = this.categoria;
    this.dataService.dummyRequest('assets/data/token.json')
      .subscribe((response) => {
        this.storage.saveInLocal('app-access', response.access_token);

        this.dataService.dummyRequest('assets/data/sm-response-tdd.json')
          .subscribe((responsedumy) => {
            this.storage.saveInLocal('SMResponse', responsedumy);
            this.router.navigate(['result-atm']);
          });
      });
  }

  /**
   * llamado al servicio de alta de aclaraciones
   */
  public executeClarification() {
    console.log('executeClarifications');
    const SMObject = this.utils.generateSMObject();
    const multifolio: any[] = this.storage.getFromLocal('multifolio');
    SMObject.wvrinboxrn.Categoria = this.categoria;
    if (this.categoria.includes('CREDITO')) {
      // SMObject.wvrinboxrn.multifolio = this.getMultifolioModel(); not working
      SMObject.wvrinboxrn.multifolio = multifolio.map(m => {
        return {
          AcctTrnId: m.id,
          AcctStmtId: m.txrNumExtracto,
          Date: moment(m.date, 'MM-DD-YYYY').format('YYYY-MM')
        };
      });
    }
    this.dataService.restRequest(
      '/clarifications/',
      'POST',
      JSON.stringify(SMObject),
      '',
      this.storage.getFromLocal('app-access'),
      this.storage.getFromLocal('client'))
      .subscribe((response) => {
        this.storage.saveInLocal('SMResponse', response);
        this.router.navigate(['result-atm']);
      });
  }

  /**
   * tapback
   */
  public returnPage() {
    const values = this.taggingService.getvalues(); 
    const tag = values.tag_aclaracion && values.tag_aclaracion.length ? values.tag_aclaracion[0]: '';
    this.taggingService.link({
      event: 'aclaraciones',
      interaction_category: tag,
      interaction_action: 'confirmacion',
      interaction_label: 'editar',
    });
    this.router.navigate(['questionarie-atm']);
  }

}
