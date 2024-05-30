import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import * as _ from "lodash";
import { NavigationService } from "../../../services/navigation.service/navigation.service";
import { SessionStorageService } from "../../../services/tdd/session-storage.service";
import { UtilsTddService } from "../../../services/tdd/utils-tdd.service";

//Taggeo
import { ArrowType } from "../../../enums/arrow-type.enum";
import { CashbackService } from "../../../services/cashback/cashback.service";
import { TaggingService } from "../../../services/tagging.service";
import { CustomCurrencyPlain } from "../../../pipes";

/**
 *
 *
 * @export
 * @class ResultTddComponent
 * @implements {OnInit}
 */
@Component({
  selector: "app-result-tdd",
  templateUrl: "./result-tdd.component.html",
  providers: [NavigationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultTddComponent implements OnInit, OnDestroy {
  //cambio de variables a public, por error en html con private
  public config: any = {};
  public channel: string = "";
  public amountLabel: string = "";
  public clarificationLabel: string = "";
  public CONSTANTS: any = this.utils.constants();
  public section: string = "result";
  public block: any = { operationCancellation: false };
  public questionId: any = {};
  public isCashbackFlow: string = "";
  public selectedCashback: any;
  public totalMoves: any;
  public singularPlural: string = "";
  public arrowType = ArrowType.UP;
  public cardType: string = "";
  public moves = [];
  public ticketItems = [];
  public detailList = [];
  public foliosTab = [];
  public blockAlert = null;
  public oldCard = "";
  public extraDocumenst: boolean = false;
  public toastMessage = "Aclaración recibida exitosamente";
  /**
   * Creates an instance of ResultTddComponent.
   * @param {SessionStorageService} storage
   * @param {UtilsTddService} utils
   * @param {NavigationService} navigationService
   * @param {TaggingService} taggingService
   * @memberof ResultTddComponent
   */
  constructor(
    private storage: SessionStorageService,
    private navigationService: NavigationService,
    private taggingService: TaggingService,
    private cashbackService: CashbackService,
    private currency: CustomCurrencyPlain,
    public utils: UtilsTddService
  ) {
    this.isCashbackFlow = this.cashbackService.getFlow();
    this.moves = this.storage.getFromLocal("multifolio") || [];
    if (this.isCashbackFlow === "true") {
      this.selectedCashback =
        this.cashbackService.getLocalStorage("cashbackTicket");
      this.cardType = this.cashbackService.getCardType(this.selectedCashback);
      this.totalMoves = this.cashbackService.getTotalMoves("multifolio");
      if (this.totalMoves.length === 1) {
        this.singularPlural = "movimiento";
      } else {
        this.singularPlural = "movimientos";
      }
    }
  }

  /**
   * Loads initial content.
   *
   * @memberof ResultTddComponent
   */
  ngOnInit() {
    let path: string = "";
    this.navigationService.tapBack("resultTDD");
    this.channel = this.storage.getFromLocal(this.CONSTANTS.STORAGE.CHANNEL);
    this.utils.scrollTop();
    const serviceResponse: object = this.storage.getFromLocal(
      this.CONSTANTS.STORAGE.SM_RESPONSE
    );
    this.block =
      this.storage.getFromLocal("BlockModel") != null
        ? this.storage.getFromLocal("BlockModel")
        : { operationCancellation: false };

    this.oldCard = this.storage.getFromLocal("ccdata").cardRec.cardInfo.cardNum;
    this.oldCard =
      this.oldCard.length > 0
        ? this.oldCard.substring(this.oldCard.length - 4, this.oldCard.length)
        : "7845";
    if (this.isCustomReposition) {
      this.blockAlert = {
        title: `Tu tarjeta terminación ${this.oldCard} fue bloqueada exitosamente`,
        body: `Tu nueva tarjeta, terminación ${this.block.panReposition.slice(
          -4
        )}, llegará a tu <strong>sucursal titular</strong> en los próximos <strong>3 a 5 días hábiles</strong>. Recíbela con tu <strong>identificación oficial</strong>.`,
      };
    } else if (this.isExpressReposition) {
      this.blockAlert = {
        title: `Tu tarjeta terminación ${this.oldCard} fue bloqueada exitosamente`,
        body: `Acude a cualquier sucursal Santander, con tu identificación oficial, para recibir una reposición.`,
      };
    }

    this.questionId = this.storage.getFromLocal("questionId");
    const viewValues: any = this.utils.handleServiceManagerRequest(
      serviceResponse,
      this.isCashbackFlow === "true"
    );
    this.showExtraDoc();
    this.viewConfig(viewValues);
    this.loadViewValues();

    // GA - Tealium
    if (this.isCashbackFlow === "true") {
      this.taggingService.setvalues("resulttdd", "resulttdd");
      this.taggingService.view({
        tag_subsection1: "aclaraciones",
        tag_titulo: "aclaraciones_cargos/comprobante_cashback",
        tag_url: "/aclaraciones_cargos/comprobante_cashback",
      });
    } else {
      path = this.taggingService.typeClarificationTDD();
      this.taggingService.setvalues("aclaraciones", path);
      this.taggingService.view(this.taggingService.getvalues());
    }

    /*const dataLayer: Object = {
      4: this.section,
      17: 'step-result',
    };
    this.taggingService.uTagView(dataLayer);
    this.taggingService.setPageName();
    this.taggingService.send(location.hash);*/

    if (
      this.config.requirementsResult?.length &&
      this.config.visaCard === "false"
    ) {
      this.toastMessage = "Solicitud recibida exitosamente";
    }
  }

  /**
   *
   * Config principal view values.
   *
   * @param {*} viewValues
   * @returns {*}
   * @memberof ResultTddComponent
   */
  viewConfig(viewValues: any): any {
    if (viewValues.payment) {
      this.amountLabel = this.CONSTANTS.LABELS.PAYMENT_AMOUNT;
      this.clarificationLabel = this.CONSTANTS.LABELS.PAYMENT_DESCRIPTION;
    } else {
      this.amountLabel = this.CONSTANTS.LABELS.CLARIFICATION_AMOUNT;
      this.clarificationLabel = this.CONSTANTS.LABELS.CLARIFICATION_REGISTER;
    }
    const folios = this.orderFolios(viewValues);

    const channelLabel =
      this.channel === "default"
        ? this.CONSTANTS.LABELS.SUPERMOBILE
        : this.CONSTANTS.LABELS.SUPERWALLET;
    this.config = {
      userFullName: viewValues.name,
      dateTime: viewValues.currentDate,
      opinionDate: viewValues.greater,
      folios: folios,
      sentEmailLetter: true,
      channel: channelLabel,
      amount: {
        label: this.amountLabel,
        value: Math.abs(viewValues.totalAmount),
      },
      clarificationLabel: this.clarificationLabel,
      paymentAmount: viewValues.paymentAmount,
      visaCard: viewValues?.visaCard,
      temporary: viewValues.temporary,
      definitive: viewValues.definitive
    };
  }

  /**
   * Set documentation according to reason selected.
   *
   * @memberof ResultTddComponent
   */
  loadViewValues(): void {
    let viewSettings: any = {};
    const clarificationType: any = this.storage.getFromLocal(
      this.CONSTANTS.STORAGE.QUESTION_ID
    );
    switch (parseInt(clarificationType.id)) {
      /*case 2: // monto alterado
        viewSettings = {
          requirementsResult : this.utils.getRequirementsResult(this.CONSTANTS.LABELS.RECEIPT_CORRECT_AMOUNT)
        }
        this.sentInfoTemplate(viewSettings);
        break;
      case 3: // Cargos adicionales
        viewSettings = {
          requirementsResult : this.utils.getRequirementsResult(this.CONSTANTS.LABELS.RECEIPT_RECOGNIZED)
        }
        this.sentInfoTemplate(viewSettings);
        break;
      */
      case 4: // pago por otro medio
        viewSettings = {
          requirementsResult: this.utils.getRequirementsResult(
            this.CONSTANTS.LABELS.RECEIPT_PAYMENT
          ),
        };
        this.sentInfoTemplate(viewSettings);
        break;
      case 5: // devolucion no aplicada
        viewSettings = {
          requirementsResult: this.utils.getRequirementsResult(
            this.CONSTANTS.LABELS.RECEIPT_RETURN
          ),
        };
        this.sentInfoTemplate(viewSettings);
        break;
      case 6: // mercancias o servicios
        viewSettings = {
          requirementsResult: this.utils.getRequirementsResult(
            this.CONSTANTS.LABELS.LETTER_VOUCHER
          ),
        };
        this.sentInfoTemplate(viewSettings);
        break;
      case 7: // Cancelacion de servicio
        viewSettings = {
          requirementsResult: this.utils.getRequirementsResult(
            this.CONSTANTS.LABELS.VOUCHER_CANCEL
          ),
        };
        this.sentInfoTemplate(viewSettings);
        break;
      case 8: // No tiene la tarjeta + Ya la reportó
      case 10: // No tiene la tarjeta + No la ha reportado
        viewSettings = {
          requirementsResult: this.utils.getRequirementsResult(
            this.CONSTANTS.LABELS.FORMART_BCOM
          ),
        };
        this.sentInfoTemplate(viewSettings);
        break;
      /*case 9:
        viewSettings = {
          requirementsResult : this.utils.getRequirementsResult(this.CONSTANTS.LABELS.INE_FORMART)
        }
        this.sentInfoTemplate(viewSettings);
        break;*/
      default:
        break;
    }
  }

  /**
   * Group folios according to location selected by user.
   *
   * @param {*} viewValues
   * @returns {object}
   * @memberof ResultTddComponent
   */
  orderFolios(viewValues: any): object {
    let folios: object = {};

    if (viewValues.cashbackFolio) {
      return {
        national: {
          label: this.CONSTANTS.LABELS.FOLIO_NUMBER,
          values: [viewValues.cashbackFolio],
        },
      };
    }

    if (
      viewValues.internationalFolio.length > 0 &&
      viewValues.nationalFolio.length > 0
    ) {
      folios = {
        national: {
          label: this.CONSTANTS.LABELS.NATIONAL_FOLIO,
          values: viewValues.nationalFolio,
        },
        international: {
          label: this.CONSTANTS.LABELS.INTERNATIONAL_FOLIO,
          values: viewValues.internationalFolio,
        },
      };
    } else {
      folios = {
        national: {
          label: this.CONSTANTS.LABELS.FOLIO_NUMBER,
          values: _.merge(
            viewValues.internationalFolio,
            viewValues.nationalFolio
          ),
        },
      };
    }
    return folios;
  }

  /**
   * Create the config to show the view to sent info
   *
   * @param {*} viewSettings
   * @memberof ResultTddComponent
   */
  sentInfoTemplate(viewSettings: any): void {
    const configAssigend = {
      requirementsResult: viewSettings.requirementsResult,
      warning: true,
      sentEmailLetter: true,
    };
    _.assign(this.config, configAssigend);
  }

  /**
   * Method for the finish button.
   *
   * @memberof ResultTddComponent
   */
  public finishApp(): void {
    if (this.channel === "wallet") {
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
    this.cashbackService.cashbackFlow(false);
    this.cashbackService.editFlow("false");
    this.utils.clearData();
  }

  public tabChange(folio: any): void {
    this.foliosTab.forEach((tab) => (tab.active = false));
    folio.active = true;
  }

  public get isExpressReposition(): boolean {
    return Boolean(this.block.operationExpressReposition);
  }

  public get isCustomReposition(): boolean {
    return Boolean(this.block.operationReposition);
  }
  public showExtraDoc() {
    let additionalData =
      this.storage.getFromLocal("additionaldata") != null
        ? this.storage.getFromLocal("additionaldata")
        : false;
    if (additionalData.description[0] === "TARJETA ROBADA O EXTRAVIADA") {
      this.extraDocumenst = true;
    }
  }

  ngOnDestroy(): void {
    this.utils.clearData();
  }
}
