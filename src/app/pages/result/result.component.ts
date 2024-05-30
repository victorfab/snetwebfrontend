import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";

import { DataObject } from "./../../shared/data.object";
// Services
import { DataProxyService } from "./../../services/data-proxy.service";
import { DataService } from "./../../services/data.service";
import { LabelsService } from "./../../services/labels.service";
import { NavigationService } from "./../../services/navigation.service/navigation.service";
import { TaggingService } from "./../../services/tagging.service";

import { QualityRatingComponent } from "../../partials/quality-rating/quality-rating.component";
import { MoveModel, QuestionsModel, ResponseModel } from "./../../models/";
import { SessionStorageService } from "./../../services/tdd/session-storage.service";

import { SessionStorageService as Session } from "angular-web-storage";
import { ArrowType } from "../../enums/arrow-type.enum";
import { TicketContentType } from "../../enums/ticket-content-type.enum";
import { CustomCurrencyPlain } from "../../pipes";
import { Utils } from "../../shared/utils";

/**
 *
 *
 * @export
 * @class ResultComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: "result",
  templateUrl: "./result.component.html",
  providers: [
    DataObject,
    DataService,
    NavigationService,
    TaggingService,
    CustomCurrencyPlain,
  ],
})
export class ResultComponent implements OnInit, OnDestroy {
  public questions: QuestionsModel;
  private section: string = "result";
  private responseModel: ResponseModel;
  private statusCode = 0;
  private rawData: any;
  private errorMessage: string;
  private isEnabled = false;
  private modalRef: BsModalRef;
  private session = inject(Session);
  public showAlert: boolean = true;
  public blockPrefolio: any;
  public mail: string = '';
  public sections = [];

  /**
   * tipo de reposicion que se tendra la tarjeta
   * 1- personalizada
   * 2- expres
   * @private
   * @memberof ResultComponent
   */
  private repositionType = this.storage.getFromLocal("respositionType");
  /**
   * Card Reposition Response type used on view
   * contine el numero de la nueva tarjeta de dicha reposicion
   *
   * @private
   * @memberof ResultComponent
   */
  private cardRepositionResponse = this.storage.getFromLocal(
    "cardRepositionResponse"
  );

  //Nombre Canal

  public nameChanel: string = "";

  public visaCarta: string = "false";

  public ticketContent = null;
  public ticketOption: TicketContentType = TicketContentType.NORMAL_COMISSION;
  public ticketOptions = TicketContentType;
  public arrowType: ArrowType | null = null;
  public ticketTitle = "Aclaración recibida exitosamente";
  public prefolio = this.storage.getFromLocal("prefolios");
  public blockAlert = null;
  public requirementList: any[] = [];
  public blocker: any = null;
  public color: string = 'success';
  public pfolio = '';

  /**
   * Creates an instance of ResultComponent.
   * @param {Router} router
   * @param {DataObject} dataObject
   * @param {DataProxyService} dataProxyService
   * @param {DataService} dataService
   * @param {TaggingService} taggingService
   * @param {LabelsService} labelsService
   * @param {BsModalService} modalService
   * @param {NavigationService} navigationService
   * @param {SessionStorageService} storage
   * @memberof ResultComponent
   */
  constructor(
    private router: Router,
    private dataObject: DataObject,
    private dataProxyService: DataProxyService,
    private dataService: DataService,
    private taggingService: TaggingService,
    private labelsService: LabelsService,
    private modalService: BsModalService,
    private navigationService: NavigationService,
    private storage: SessionStorageService,
    private format: CustomCurrencyPlain,
    private utils: Utils
  ) {
    this.ticketOption =
      this.prefolio === true
        ? TicketContentType.PREFOLIO
        : this.session.get("ticket") || TicketContentType.NORMAL_COMISSION;

    const amount = this.format.transform(
      this.session.get("ticket_amount") || 0
    );

    switch (this.ticketOption) {
      case TicketContentType.DEFER_PURCHASE:
        this.ticketTitle = "Recibimos tu solicitud";
        this.arrowType = ArrowType.DOWN;
        const defer = this.session.get("defer");
        this.ticketContent = {
          text1Style: {
            "font-size": "20px",
            "font-weight": 400,
          },
          text1: "Diferir compra",
          text2: "Plazo seleccionado:",
          text2Style: {
            "font-size": "20px",
            "font-weight": 400,
            color: "#020202",
            "text-transform": "capitalize",
          },
          text3: defer.label,
          text4: defer.total,
          alert: {
            title: "Aún no hemos diferido tu compra",
            text: "Espera nuestra carta respuesta en tu correo electrónico.",
          },
        };
        break;
      case TicketContentType.AMOUNT_CORRECTION_LINEX:
        this.ticketTitle = "Recibimos tu solicitud";
        this.arrowType = ArrowType.UP;
        this.ticketContent = {
          text1: "Corregir monto de crédito línea express",
          text2: "Monto solicitado",
          text3: `$${amount}`,
          alert: {
            title: "Aún no corregimos tu crédito",
            text: "Espera nuestra carta respuesta en tu correo electrónico.",
          },
        };
        break;
      case TicketContentType.CANCEL_LINEX:
        this.ticketTitle = "Recibimos tu solicitud";
        this.arrowType = ArrowType.UP;
        this.ticketContent = {
          text1: "CANCELAR CRÉDITO LÍNEA EXPRESS",
          text2: "El cliente no solicitó el crédito",
          alert: {
            title: "¡Evita pagar intereses!",
            text: "No olvides hacer el traspaso de los recursos a tu tarjeta de crédito.",
          },
        };
        break;

      case TicketContentType.PROMOTION_CORRECTION:
        this.ticketTitle = "Recibimos tu solicitud";
        this.arrowType = ArrowType.DOWN;
        const corrAmount = this.session.get("corrPromAmount") || 0;
        this.ticketContent = {
          text1: "Liquidar compras:",
          text2: "Monto total:",
          // bolder: `$${this.format.transform(corrAmount)}`,
          bolder: "$00,000.00",
          alert: {
            title: "¡Evita pagar intereses!",
            text: `<strong>Si aún no has realizado el pago del monto total, hazlo ahora mismo.</strong>
                Si tu pago no cubre el monto total, el saldo pendiente será transferido a tu crédito revolvente y deberás pagarlo en tu siguiente fecha de corte. `,
          },
        };
        break;
      case TicketContentType.AMORTIZATION:
        this.ticketTitle = "Recibimos tu solicitud";
        const formValue = this.session.get("patch");
        this.showAlert = formValue.alreadyPay === "0";
        const option = formValue.payApplication === "1" ? "plazo" : "cuota";
        const linexMessage =
          formValue.pay === "0"
            ? "PARA LIQUIDAR TU CRÉDITO LÍNEA EXPRESS"
            : "A " + option + " DE TU CRÉDITO LÍNEA EXPRESS";
        this.ticketContent = {
          text1: "Abonar",
          // bolder: `$${amount}`,
          bolder: `$00,000.00`,
          linex: linexMessage,
          alert: {
            title: "¡Importante!",
            text: `Si aún no has realizado el pago, hazlo ahora mismo. <strong>Es requisito para concluir tu solicitud.</strong>`,
          },
        };
        break;
      case TicketContentType.PREFOLIO:
        this.color = 'warning';
        this.responseModel = this.dataProxyService.getResponseDAO();
        this.mail = this.responseModel.email;
        const amountP = this.format.transform( this.responseModel.amount || 0 );
        this.pfolio = this.responseModel.nationalFolio[0] ? this.responseModel.nationalFolio[0]:
                     this.responseModel.internationalFolio[0] ? this.responseModel.internationalFolio[0]: '';
        let status: string = 'Pendiente';
        this.sections = [
          {
            "items": [
              {
                "label": "Folio",
                "value": this.pfolio,
              }
            ]
          },
          {
            "items": [
              {
                "label": "Estatus de la aclaración",
                "value": status,
                "class": true
              }
            ]
          },
          {
            "items": [
              {
                "label": "Monto",
                "value": `$${amountP}`
              }
            ]
          },
          {
            "items": [
              {
                "label": "Fecha y hora de alta",
                "value": this.responseModel.currentDate
              }
            ]
          }
        ]
        if (this.prefolio) {
          this.ticketTitle = "Recibimos tu solicitud";
          this.blockPrefolio = {
            title: `<strong>¡Importante!</strong>`,
            paragraph: `Si el movimiento que seleccionaste desaparece, esta aclaracion se cancelará.<br>En <strong>5 días hábiles</strong> te notificaremos el estatus de tu aclaración.`,
          };
        }
        break;
      default:
        break;
    }
  }

  /**
   * Loads initial content.
   *
   * @memberof ResultComponent
   */
  public ngOnInit() {
    if (this.dataProxyService.getChannel() == "default") {
      this.nameChanel = "SuperMóvil";
    } else {
      this.nameChanel = "SuperWallet";
    }

    // Navigation rules
    // this.navigationService.setTitle('Folio de Aclaración');
    this.navigationService.tapBack("");
    this.navigationService.hideBackButton();

    this.dataService.setUris(this.dataProxyService.getEnviroment());
    this.responseModel = this.dataProxyService.getResponseDAO();
    this.statusCode = this.responseModel.getResult();
    this.questions = this.dataProxyService.getQuestions();
    this.storage.saveInLocal('questionsTDC', this.questions);
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
    // GA - Tealium
    /*const dataLayer: Object = {
      4: this.section,
      17: 'step-result',
    };
    this.taggingService.uTagView(dataLayer);
    this.taggingService.setPageName();
    this.taggingService.send('');*/
    const prefolio = this.storage.getFromLocal('prefolios');
    let typeUser = prefolio ? 'prefolio': '';
    let path = this.taggingService.typeClarificationTDC();
    let category = this.taggingService.getvalues().tag_aclaracion;
    this.taggingService.view({
      tag_subsection1: "aclaraciones",
      tag_titulo: path.replace(/\//g,'|'),
      tag_url: path,
      tag_tipoUsuario: typeUser,
      tag_proceso: category
    });
    this.visaCarta = this.responseModel.getVisaCard();
    this.utils.clearSession();

    this.blocker = this.questions.blocker;
    if (
      (this.responseModel.newCard &&
        this.blocker.operationReposition == true &&
        this.questions.whatHappens.getKey() != "S-02") ||
      (this.cardRepositionResponse && this.repositionType === "2")
    ) {
      this.blockAlert = {
        title: `Tu tarjeta terminación ${this.dataProxyService.getOldCard()} fue bloqueada exitosamente`,
        body: `Tu nueva tarjeta, terminación ${this.responseModel.newCard}, llegará a tu <strong>sucursal titular</strong> en los próximos <strong>3 a 5 días hábiles</strong>. Recíbela con tu <strong>identificación oficial</strong>.`,
      };
    } else if (this.blocker.operationExpressReposition == true) {
      this.blockAlert = {
        title: `Tu tarjeta terminación ${this.dataProxyService.getOldCard()} fue bloqueada exitosamente`,
        body: `Acude a cualquier sucursal Santander, con tu identificación oficial, para recibir una reposición.`,
      };
    }
    this.setRequirements();
  }
  /**
   * Listen the interaction of the user and validate the native session.
   *
   * @private
   * @param {Event} $event
   * @memberof ResultComponent
   */
  @HostListener("window:scroll", ["$event"])
  private onWindowScroll($event: Event): void {
    this.navigationService.validateSession();
  }
  /**
   * Method for the finish button.
   *
   * @memberof ResultComponent
   */
  public finishApp(): void {
    // this.openQualityRatingModal();
    //TOFIX; Check the follow error Cannot read properties of undefined (reading 'tag_aclaracion')
    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: this.taggingService
        .getvalues()
        .tag_aclaracion.toString(),
      interaction_action: "resumen",
      interaction_label: "finalizar",
    });
    this.navigationService.goToRoot();
  }
  /**
   * Open the Quality Rating modal.
   *
   * @memberof ResultComponent
   */
  public openQualityRatingModal(): void {
    const options: any = {
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: true,
      class: "quality-rating-modal",
    };
    this.modalRef = this.modalService.show(QualityRatingComponent, options);
  }

  public get showOldTicket(): boolean {
    return this.ticketOption === TicketContentType.NORMAL_COMISSION;
  }

  public setRequirements(): void {
    let result = [];
    switch (this.questions.motive.key) {
      case "IC-202":
        result = [this.labelsService.getRestrictions(1)];
        break;
      case "IC-203":
        result = [this.labelsService.getRestrictions(2)];
        break;
      case "IC-204":
        result = [
          this.labelsService.getRestrictions(0),
          this.labelsService.getRestrictions(8),
        ];
        break;
      case "IC-205":
        result = [this.labelsService.getRestrictions(4)];
        break;
      case "IC-206":
        result = [this.labelsService.getRestrictions(3)];
        break;
      case "IC-207":
        result = [this.labelsService.getRestrictions(9)];
        break;
      default:
        if (
          this.questions.whatHappens.getKey() == "S-01" ||
          this.questions.whatHappens.getKey() == "S-03"
        ) {
          result = [this.labelsService.getRestrictions(7)];
        } else {
          result = [];
        }

        break;
    }
    this.requirementList = result.map((element) => ({ value: element }));
  }

  /**
   * Method that is called when result component is destroyed.
   *
   * @memberof ResultComponent
   */
  public ngOnDestroy() {
    // delete data on destroy component
    this.dataProxyService.setDataSource([]);
    this.utils.clearSession();
  }
}
