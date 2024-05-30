import { PlatformLocation } from "@angular/common";
import { Component, HostListener, OnInit, inject } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { Subscription } from "rxjs";
// Services
import { DataProxyService } from "./../../services/data-proxy.service";
import { DataService } from "./../../services/data.service";
import { NavigationService } from "./../../services/navigation.service/navigation.service";
import { TaggingService } from "./../../services/tagging.service";
import { SessionStorageService } from "./../../services/tdd/session-storage.service";
// Constants
import { SessionStorageService as Session } from "angular-web-storage";
import * as _ from "lodash";
import moment from "moment";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { DateFormat } from "../../enums/date-format.enum";
import { TicketContentType } from "../../enums/ticket-content-type.enum";
import { Utils } from "../../shared/utils";
import {
  AnswersQuestionsModel,
  BlockModel,
  CreditCardFullDataModel,
  LoaderModel,
  MoveModel,
  MultifolioCompleteModel,
  MultifolioModel,
  QuestionsModel,
  ResponseModel,
} from "./../../models";
import { ConstantsService } from "./../../services/constants.service";
import { CustomCurrencyPlain } from "../../pipes";
import { SmRequestService } from "../../services/sm-request.service";
import { MoveType } from "../../enums/move-type.enum";

/**
 * @export
 * @class SummaryComponent
 * @implements {OnInit}
 */
@Component({
  selector: "app-summary",
  templateUrl: "./summary.component.html",
  providers: [
    DataService,
    NavigationService,
    TaggingService,
    Utils,
    CustomCurrencyPlain,
  ],
})
export class SummaryComponent implements OnInit {
  private enviroment: any;
  private section: string = "summary";
  private moves: any;
  private dummyMode = false;
  private isBusy = false;
  private totalItems = 0;
  private subscription: Subscription;
  private modalSubscription: Subscription[] = [];
  private responseDAO: ResponseModel;
  private modalRef: BsModalRef;
  private questions: QuestionsModel;
  private loader: LoaderModel;
  private blockMotive = "";
  private enablebtn = true;
  private category = "";

  private summary = [];
  private mapedSummary: Map<string, any> = new Map();

  private utils = inject(Utils);
  private formatt = inject(CustomCurrencyPlain);
  private smRequest = inject(SmRequestService);
  private ticketOption: TicketContentType = null;

  public place = "";
  public prefolio = this.storage.getFromLocal('prefolios');
  public typeUser;
  /**
   * Creates an instance of SummaryComponent. Search the enviroment. Bind methods. Models. Get questions
   * @param {DataService} dataService
   * @param {DataProxyService} dataProxyService
   * @param {TaggingService} taggingService
   * @param {BsModalService} modalService
   * @param {Router} router
   * @param {ConstantsService} ContsService
   * @param {NavigationService} navigationService
   * @param {PlatformLocation} location
   * @memberof SummaryComponent
   */
  constructor(
    private dataService: DataService,
    public dataProxyService: DataProxyService,
    private taggingService: TaggingService,
    private modalService: BsModalService,
    private router: Router,
    private ContsService: ConstantsService,
    private navigationService: NavigationService,
    private location: PlatformLocation,
    private storage: SessionStorageService,
    private session: Session
  ) {
    this.enviroment = _.find(ContsService.ENVIROMENT, (item) => {
      return item.env === this.dataProxyService.getEnviroment();
    });
    this.executeCardBlock = this.executeCardBlock.bind(this);
    this.executeClarificationRequest =
      this.executeClarificationRequest.bind(this);
    this.loader = new LoaderModel();
    this.questions = this.dataProxyService.getQuestions();
    this.storage.saveInLocal('questionsTDC', this.questions);
    this.summary = this.session.get("questionnarie") || [];

    if (!this.sevenMotives) {
      this.summary.forEach((question) => {
        if (question.name === "amount") {
          question.value = `$ ${this.formatt.transform(question.value)}`;
        }
        if (question.name === "motive") {
          const option = question.options[1];
          question.value = option.label;
        }
        this.mapedSummary.set(question.name, question);
      });

      const place = this.mapedSummary.get("place");
      if (place?.value === "mx") {
        const stateValue = this.mapedSummary.get("state");
        if (stateValue) {
          this.place = stateValue?.stringValue;
        }
      } else {
        this.place = "FUERA DE LA REPÚBLICA";
      }
      // detect back navigation
      location.onPopState(() => {
        this.router.navigate(["d-questionnarie"]);
      });
    } else {
      if (!this.questions && this.sevenMotives)
        this.router.navigate(["questionnaire"]);

      location.onPopState(() => {
        this.router.navigate(["/questionnaire"]);
      });
    }
  }
  /**
   * Loads initial content :: User data and previously selected items. Navigation rules. GA - Tealium
   *
   * @memberof SummaryComponent
   */
  public ngOnInit() {
    this.typeUser = this.prefolio ? 'prefolio': '';
    let path: string = "";
    this.navigationService.tapBack(this.section);
    this.dataService.setUris(this.dataProxyService.getEnviroment());
    this.dummyMode = this.dataProxyService.getDummyMode();

    if (!this.sevenMotives) {

      return;
    }
    let selectedMoves: Array<MoveModel> =
      this.dataProxyService.getDataSelected();
    if (selectedMoves) {
      this.totalItems = selectedMoves.length;
      this.moves = _(selectedMoves).groupBy("date").toPairs().value();
    }
    this.dataProxyService
      .getQuestionsStatusService()
      .subscribe((data) => this.handleFooterResponse(data));
    // Format the lostDate to 'DD/MMM/YYYY'
    this.questions.lostDate = this.formatDate(this.questions.lostDate);
    this.questions.lostDate === "Invalid date"
      ? (this.questions.lostDate = "")
      : (this.questions.lostDate = this.questions.lostDate);
    if (this.dataProxyService.getQuestions().hasCard.toString() == "2") {
      if (
        this.dataProxyService.getQuestions().whatHappens.getTitle() ===
        "Me la robaron o la extravié y no la he reportado"
      ) {
        this.category = "robo_extraviada";
      } else {
        this.category = "robo_no_reporte"; //robo_extraviada
      }
    } else {
      if (this.dataProxyService.getQuestions().haveContact == "2") {
        this.category = "fraude_no_intereaccion_comercio";
      } else {
        this.category = this.getCategory();
      }
    }


    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });

    this.taggingService.setvalues("aclaraciones", "summary", this.category);
    const prefolio = this.storage.getFromLocal('prefolios');
    let typeUser = prefolio ? 'prefolio': '';
    path = this.taggingService.typeClarificationTDC();
    this.taggingService.view({
      tag_subsection1: "aclaraciones",
      tag_titulo: path.replace(/\//g,'|'),
      tag_url: path,
      tag_tipoUsuario: typeUser
    });
    /*const dataLayer = {
      4: this.section,
      17: 'step-summary',
    };
    this.taggingService.uTagView(dataLayer);
    this.taggingService.setPageName();
    this.taggingService.send('');*/
  }

  /**
   * Method that checks:
   *  * If the flow requires to lock cards.
   *
   * @memberof SummaryComponent
   */
  public async validateCardLock() {
    let valid = false;
    if (this.dataProxyService.getDummyMode()) {
      /* DUMMY MODE */
      this.subscription = this.dataService
        .dummyRequest("assets/data/check-cards.json")
        .subscribe((response) => {
          if (response.data === "true") {
            valid = true;
          }
          this.executeLockFlow(valid);
        });
    } else {
      /*Consulta bloqueo en MODO NORMAL*/
      this.subscription = this.dataService
        .restRequest(
          "/check-cards/",
          "POST",
          {
            multifolio: this.getMultifolioModelComplete(),
            cuestionario: this.getQuestionsCheckCards(),
          },
          "user",
          this.dataProxyService.getAccessToken()
        )
        .subscribe((response) => {
          if (response.data === "true") {
            valid = true;
          }
          this.executeLockFlow(valid);
        });
    }
  }

  /**
   * Listen the interaction of the user and validate the native session.
   *
   * @private
   * @param {Event} $event
   * @memberof SummaryComponent
   */
  @HostListener("window:scroll", ["$event"])
  private onWindowScroll($event: Event): void {
    this.navigationService.validateSession();
  }
  /**
   * Retrieve ParsedDate.
   *
   * @private
   * @param {string} dateToBeParsed
   * @returns
   * @memberof SummaryComponent
   */
  private retrieveParsedDate(dateToBeParsed: string) {
    moment.locale("es");
    return moment(dateToBeParsed, "DD-MM-YYYY").format(
      "dddd DD [de] MMMM, YYYY"
    );
  }
  /**
   * Retrieve parsed date from position at.
   *
   * @private
   * @param {number} n
   * @returns
   * @memberof SummaryComponent
   */
  private retrieveParsedDateFromPositionAt(n: number) {
    return this.retrieveParsedDate(this.moves[n].toString());
  }
  /**
   * Transaction Handler: Handle footer response.
   *
   * @private
   * @param {string} v
   * @memberof SummaryComponent
   */
  private handleFooterResponse(v: string) {
    switch (v) {
      case "validatedQuestionnaire":
        this.validatedQuestionnaire();
        break;
      case "cancelBlocker":
        this.closeModal(() => {
          this.modalRef = this.utils.openModal("blockCancel");
        });
        break;
      case "cancelExecuteBlocker":
        this.closeModal(() => {
          this.modalRef = this.utils.openModal("cancelExecuteBlock");
        });
        break;
      case "executeCardBlock":
        this.closeModal(() => {
          this.checkToken(this.executeCardBlock);
        });
        break;
      default:
        break;
    }
  }
  /**
   * Validate the questionaire to open the block modal.
   *
   * @private
   * @memberof SummaryComponent
   */
  private validatedQuestionnaire() {
    this.ticketOption = this.session.get("ticket");
    let currentUrl: string = this.getCurrentURL();
    if (currentUrl === "/summary") {
      let path = this.taggingService.typeClarificationTDC();
      this.taggingService.link({
        event: "aclaraciones",
        interaction_category: 'aclaraciones_cargos',
        interaction_action: "resumen_tdc",
        interaction_label: "confirmar",
        interaction_url: path,
        interaction_tipoUsuario: this.typeUser
      });
    }

    if (!this.sevenMotives) {
      this.modalRef = this.utils.openModal("loader");
      this.smRequest.getRequest();
      if (this.dataProxyService.getDummyMode()) {
        this.dataProxyService.setQuestions(new QuestionsModel());
        this.subscription = this.dataService
          .dummyRequest("assets/data/sm-response.json")
          .subscribe((response) => this.checkServiceManagerError(response));
      } else {
        this.dataProxyService.setQuestions(new QuestionsModel());
        this.dataService
          .restRequest(
            "/clarifications/",
            "POST",
            JSON.stringify(this.smRequest.getRequest()),
            "",
            this.dataProxyService.getAccessToken()
          )
          .subscribe((response) => this.checkServiceManagerError(response));
      }
      return;
    }

    if (
      this.questions.hasCard.toString() === "1" &&
      this.questions.haveContact.toString() === "1"
    ) {
      this.checkToken(this.executeClarificationRequest);
    } else {
      this.validateCardLock();
    }
  }
  /**
   * Excecute lock flow.
   *
   * @private
   * @param {boolean} isValidLock
   * @memberof SummaryComponent
   */
  private executeLockFlow(isValidLock: boolean) {
    if (this.getBlockCardOne() && !this.modalRef) {
      this.validateNoInteraction(isValidLock);
    } else if (this.getBlockCardTwo() && !this.modalRef) {
      this.validateNonReported(isValidLock);
    } else if (this.getBlockedCardReported() && !this.modalRef) {
      this.validateReported(isValidLock);
    } else if (!this.isBusy && this.router.url === "/summary") {
      this.checkToken(this.executeClarificationRequest);
    }
  }
  /**
   * Validate the questionaire to open the block modal in flow of no interaction with the commerce.
   *
   * @private
   * @param {*} goToLock
   * @memberof SummaryComponent
   */
  private validateNoInteraction(goToLock: any) {
    if (goToLock) {
      this.modalRef = this.utils.openModal("block-one");
    } else {
      this.checkToken(this.executeClarificationRequest);
    }
  }
  /**
   * Validate the questionaire to open the block modal
   * in the flow non reported.
   *
   * @private
   * @param {*} goToLock
   * @memberof SummaryComponent
   */
  private validateNonReported(goToLock: any): void {
    if (goToLock) {
      this.modalRef = this.utils.openModal("block-two");
    } else {
      this.modalRef = this.utils.openModal("cant-block");
    }
  }
  /**
   * Validate the questionaire to open the block modal
   * in the flow the card was reported.
   *
   * @private
   * @param {*} goToLock
   * @memberof SummaryComponent
   */
  private validateReported(goToLock: any): void {
    if (goToLock == true) {
      this.modalRef = this.utils.openModal("no-locked");
    } else {
      this.checkToken(this.executeClarificationRequest);
    }
  }
  /**
   * Method that checks:
   *  * If the user hasn't the card.
   *  * if the  card is not locked.
   *
   * @private
   * @returns
   * @memberof SummaryComponent
   */
  private getBlockedCardReported() {
    let block: boolean = false;
    if (
      Number(this.questions.hasCard) === 2 &&
      this.questions.whatHappens.getKey() === "S-01"
    ) {
      block = true;
    }
    return block;
  }
  /**
   * Method that checks:
   *  * If the user has the card
   *  * If the user do NOT interact with the commerce.
   *
   * @private
   * @returns {boolean}
   * @memberof SummaryComponent
   */
  private getBlockCardOne(): boolean {
    let block: boolean = false;
    if (
      Number(this.questions.hasCard) === 1 &&
      Number(this.questions.haveContact) === 2
    ) {
      block = true;
    }
    return block;
  }
  /**
   * Method that checks:
   *  * If the user do not have the card.
   *  * What happen with your card: "Me la robaron o la extravié y no la he reportado".
   *
   * @private
   * @returns {boolean}
   * @memberof SummaryComponent
   */
  private getBlockCardTwo(): boolean {
    let block: boolean = false;
    if (
      Number(this.questions.hasCard) === 2 &&
      this.questions.whatHappens.getKey() === "S-03"
    ) {
      block = true;
    }
    return block;
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
      if (this.questions.whatHappens.getKey() === "S-03") {
        this.blockMotive = "robo";
      } else {
        this.blockMotive = "fraude";
      }
      let defaultMessage =
        "Estamos bloqueando su tarjeta, un momento por favor.";
      this.loader.setMessage(defaultMessage);
      this.modalRef = this.utils.openModal("loader");
      if (
        this.dataProxyService.getDummyMode() ||
        this.dataProxyService.getNoLock()
      ) {
        /* DUMMY MODE */
        this.subscription = this.dataService
          .dummyRequest("assets/data/lock-card.json")
          .subscribe((response) => this.handleCardBlockResponse(response));
      } else {
        const endpoint = `/lock/lock_code/${this.blockMotive}/path/front`;
        this.subscription = this.dataService
          .restRequest(
            endpoint,
            "POST",
            "",
            "cards",
            this.dataProxyService.getAccessToken()
          )
          .subscribe(
            (response) => this.handleCardBlockResponse(response),
            (error) => {
              this.questions.blocker.operationReposition = false;
              this.questions.blocker.operationCancellation = false;
              this.questions.blocker.operationCancellationMsg =
                "no fue posible cancelar la tarjeta";
              this.questions.blocker.operationRepositionMsg =
                "no fue posible reponer la tarjeta";
              this.isBusy = false;
              this.closeModal(() => {
                this.modalRef = this.utils.openModal("cancelExecuteBlock");
              });
            }
          );
      }
    }
  }
  /**
   * Check token expiration time.
   *
   * @private
   * @param {*} cb
   * @memberof SummaryComponent
   */
  private checkToken(cb: any) {
    if (this.dummyMode) {
      this.dataService
        .dummyRequest("assets/data/token.json")
        .subscribe((response) => {
          this.dataProxyService.setAccessToken(response.access_token);
          cb();
        });
    } else {
      cb();
    }
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
    if (blocker.operationCancellation) {
      this.closeModal(() => {
        this.dataProxyService.questions.blocker = blocker;
        this.router.navigate(["locked"]);
      });
    } else {
      this.closeModal(() => {
        this.modalRef = this.utils.openModal("cancelExecuteBlock");
      });
    }
    // TODO: Block card on each motive
  }
  /**
   * Execute clarification request.
   *
   * @private
   * @returns {(boolean | undefined)}
   * @memberof SummaryComponent
   */
  private executeClarificationRequest(): boolean | undefined {
    if (!this.isBusy) {
      this.isBusy = true;
    } else {
      this.isBusy = false;
      return false;
    }
    if (this.isBusy) {
      let serviceManagerObject = this.generateServiceManagerObject();
      let message = "";
      console.log("request", serviceManagerObject);
      this.modalRef = this.utils.openModal("loader");
      if (this.dataProxyService.getDummyMode()) {
        /* DUMMY MODE */
        this.subscription = this.dataService
          .dummyRequest("assets/data/sm-response.json")
          .subscribe((response) =>
            this.utils.handleServiceManagerRequest(response, this.questions, {
              format: DateFormat.DD_MMMM_YYYY_HH_mm,
            })
          );
      } else {
        /*ALTA DE ACLARACION MODO NORMAL*/
        this.subscription = this.dataService
          .restRequest(
            "/clarifications/",
            "POST",
            JSON.stringify(serviceManagerObject),
            "",
            this.dataProxyService.getAccessToken()
          )
          .subscribe((response) => this.checkServiceManagerError(response));
      }
    }
  }
  /**
   * Handle service manager request.
   *
   * @private
   * @param {*} r
   * @memberof SummaryComponent
   */
  private checkServiceManagerError(r: any): void {
    // Check if the reponse is an error
    if (this.checkInvalidSession(r)) {
      this.dataService.handleError("", { name: r.mensaje });
    } else if (this.checkInternalErrors(r)) {
      this.dataService.handleError("", { name: r.mensaje });
    } else {
      this.utils.handleServiceManagerRequest(
        r,
        this.questions || new QuestionsModel(),
        {
          format: DateFormat.DD_MMMM_YYYY_HH_mm,
          ...(this.ticketOption ===
            TicketContentType.AMOUNT_CORRECTION_LINEX && {
            route: "result",
          }),
        }
      );
    }
  }
  /**
   * Check if the session is invalid
   *
   * @private
   * @param {*} r
   * @returns {boolean}
   * @memberof SummaryComponent
   */
  private checkInvalidSession(r: any): boolean {
    let error = false;
    if (!_.isUndefined(r.codigoMensaje)) {
      if (r.codigoMensaje === "MSG-001") {
        error = true;
      }
    }
    return error;
  }
  /**
   * Check if there are some errors on the middleware.
   *
   * @private
   * @param {*} r
   * @returns {boolean}
   * @memberof SummaryComponent
   */
  private checkInternalErrors(r: any): boolean {
    let error = false;
    if (!_.isUndefined(r.status)) {
      if (r.status === "Error") {
        error = true;
      }
    }
    return error;
  }

  /**
   * Generate service manager object.
   *
   * @private
   * @returns {Object}
   * @memberof SummaryComponent
   */
  private generateServiceManagerObject(): Object {
    let obj: any = {};
    let fullccdata: CreditCardFullDataModel =
      this.dataProxyService.getCreditCardFullData();
    let wvrinboxrn: Object = {
      Categoria: "TARJETA DE CREDITO TARJETAHABIENTES",
      Descripcion: [
        this.questions.additionalComments !== ""
          ? this.questions.additionalComments
          : this.getSubcategory(),
      ],
      EntidadFed: this.dataProxyService
        .getStateID(this.questions.state)
        .toString(),
      Subcategoria: this.getSubcategory(),
      VisaCarta: this.applyVISARule(fullccdata),
      cuestionario: this.getQuestionsAndAnswers(),
      multifolio: this.getMultifolioModel(),
      FechaRobada:
        this.questions.missingYY !== "" && this.questions.missingYY !== null
          ? `${this.questions.missingYY}-${this.questions.missingMM}-${this.questions.missingDD}`
          : "",
      /* "Descripcion":       [
         "NO BORRAR",
         "EJEMPLO PARA UNA TDC",
         "TARJETA DE CREDITO NO RECIBIDA",
         "cuando no existen los datos personales:",
         "EL REGISTRO NO EXISTE EN LA B.D. MPDT009"
       ], */
    };
    obj.wvrinboxrn = wvrinboxrn;
    return obj;
  }
  /**
   * Gets the account number if exists.
   *
   * @private
   * @returns {*}
   * @memberof SummaryComponent
   */
  private accountNumber(): any {
    try {
      return this.dataProxyService.getCCData()["cardRec"][0].cardInfo.acctRef
        .acctId;
    } catch (error) {
      return null;
    }
  }
  /**
   * Get Subcategory.
   *
   * @private
   * @returns {string}
   * @memberof SummaryComponent
   */
  private getSubcategory(): string {
    let res = "COMPRA NO RECONOCIDA";
    if (Number(this.questions.hasCard) === 1) {
      if (this.questions.motive.key === "IC-205") {
        res = "DEVOLUCION NO APLICADA";
      }
    } else {
      if (
        this.questions.whatHappens.getTitle() ===
          "La reporté como robada o extraviada." ||
        this.questions.whatHappens.getTitle() ===
          "Me la robaron o la extravié y no la he reportado."
      ) {
        res = "TARJETA ROBADA O EXTRAVIADA";
      } else {
        res = "TARJETA NO RECIBIDA";
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
   * @memberof SummaryComponent
   */
  private applyVISARule(data: CreditCardFullDataModel): string {
    let r = "false";
    if (data.cardBrand.toLowerCase() === "visa") {
      _.each(this.dataProxyService.getDataSelected(), (item: MoveModel) => {
        if (item.txrTipoFactura === "1003" && Number(item.txrMonto) >= 400) {
          r = "true";
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
   * @memberof SummaryComponent
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
      objmultifolio.TxrHrTxr = this.formatHour(item.txrHrTxr);
      objmultifolio.TxrModoEntrada = item.txrModoEntrada;
      objmultifolio.TxrMonto = item.txrMonto;
      objmultifolio.TxrMovExtracto = item.txrMovExtracto;
      objmultifolio.TxrNumExtracto = item.txrNumExtracto;
      objmultifolio.TxrReferencia = item.txrReferencia;
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
  private getMultifolioModelComplete() {
    let multifolio = [];
    let ix = 0;
    _.each(this.dataProxyService.getDataSelected(), (item: MoveModel) => {
      let objmultifolio = new MultifolioCompleteModel();
      //objmultifolio.TxrCodigoCom = item.txrCodigoCom;
      //objmultifolio.TxrComercio = item.txrComercio;
      //objmultifolio.TxrDivisa = item.txrDivisa;
      // objmultifolio.TxrFecha = item.txrFecha;
      //objmultifolio.TxrHrTxr = this.formatHour(item.txrHrTxr);
      //objmultifolio.TxrModoEntrada = item.txrModoEntrada;
      objmultifolio.TxrMonto = item.txrMonto;
      objmultifolio.TxrMovExtracto = item.txrMovExtracto;
      objmultifolio.TxrNumExtracto = item.txrNumExtracto;
      //objmultifolio.TxrReferencia = item.txrReferencia;
      //objmultifolio.TxrSucursalAp = item.txrSucursalAp;
      //objmultifolio.TxrTipoFactura = item.txrTipoFactura;
      objmultifolio.TxrPAN = item.txrPAN;
      //objmultifolio.TxrClacon = ''; //TODO:
      //objmultifolio.TxrRefEmisor = '';
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
   * @memberof SummaryComponent
   */
  private getQuestionsAndAnswers(): any {
    let question = [];
    if (Number(this.questions.hasCard) === 1) {
      if (this.questions.motive.key !== "IC-205") {
        question = question.concat(this.getQuestionsHaveCard());
      }
    } else {
      let objquestion = new AnswersQuestionsModel();
      objquestion.Preguntas =
        "¿Reporto usted su tarjeta de crédito o débito como robada o extraviada a Banco Santander?";
      if (
        this.questions.whatHappens.getTitle() ===
        "La reporté como robada o extraviada."
      ) {
        objquestion.Respuestas = "SI";
        question.push(objquestion);
      } else if (
        this.questions.whatHappens.getTitle() ===
        "Me la robaron o la extravié y no la he reportado."
      ) {
        objquestion.Respuestas = "NO";
        question.push(objquestion);
      }
    }
    return question;
  }

  /**
   *
   * obtener el suceso que del cliente con la tarjeta
   * @private
   * @returns {*}
   * @memberof SummaryComponent
   */
  private getQuestionsCheckCards(): any {
    const hasCard: string = this.questions.hasCard == 1 ? "SI" : "NO";
    let cardHappens: string = this.questions.whatHappens.getTitle();
    let cardHappensLabel: string = "¿Qué sucedió con su tarjeta?";
    if (this.questions.haveContact == "2") {
      cardHappens = "NO";
      cardHappensLabel = "¿Interactuó con el comercio durante la compra?";
    }
    return [
      {
        Preguntas: "¿Tiene la tarjeta en su poder?",
        Respuestas: hasCard,
      },
      {
        Preguntas: cardHappensLabel,
        Respuestas: cardHappens,
      },
    ];
  }

  /**
   * Get questions and answers when the client have card.
   *
   * @private
   * @returns {*}
   * @memberof SummaryComponent
   */
  private getQuestionsHaveCard(): any {
    let question = [
      { Preguntas: "¿Tiene la tarjeta en su poder?", Respuestas: "SI" },
    ];
    let objquestion = new AnswersQuestionsModel();
    objquestion.Preguntas = "¿Interactuó con el comercio durante la compra?";
    if (this.questions.haveContact === "1") {
      objquestion.Respuestas = "SI";
    } else {
      objquestion.Respuestas = "NO";
    }
    question.push(objquestion);
    question = question.concat(this.getAdditionalQuestionary());
    return question;
  }
  /**
   * Get additional questions when.
   *
   * @private
   * @returns {*}
   * @memberof SummaryComponent
   */
  private getAdditionalQuestionary(): any {
    let questionary = [
      { Preguntas: "Cargo duplicado", Respuestas: "NO" },
      { Preguntas: "Monto alterado", Respuestas: "NO" },
      { Preguntas: "Cargos adicionales", Respuestas: "NO" },
      { Preguntas: "Servicios no proporcionados", Respuestas: "NO" },
      { Preguntas: "Mercancia defectuosa", Respuestas: "NO" },
      { Preguntas: "Pago por otro medio", Respuestas: "NO" },
      { Preguntas: "Cancelación de servicio", Respuestas: "NO" },
      { Preguntas: "Otro", Respuestas: "NO" },
    ];
    switch (this.questions.motive.key) {
      case "IC-201": {
        questionary[0].Respuestas = "SI";
        break;
      }
      case "IC-202": {
        questionary[1].Respuestas = "SI";
        break;
      }
      case "IC-203": {
        questionary[2].Respuestas = "SI";
        break;
      }
      case "IC-204": {
        questionary[3].Respuestas = "SI";
        break;
      }
      case "IC-206": {
        questionary[5].Respuestas = "SI";
        break;
      }
      case "IC-207": {
        questionary[6].Respuestas = "SI";
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
   * @memberof SummaryComponent
   */
  private formatDate(v: string): string {
    moment.locale("es");
    return moment(v).format("DD/MMM/YYYY").toString().replace(/\./g, "");
  }
  /**
   * Format hour.
   *
   * @private
   * @param {string} h
   * @returns {string}
   * @memberof SummaryComponent
   */
  private formatHour(h: string): string {
    if (h === "" || h === null || typeof h === "undefined") {
      return "00:00:00";
    } else {
      return h.replace(".", ":");
    }
  }

  /**
   *
   * @returns category for tealium service
   */
  public getCategory(): string {
    let key = this.dataProxyService.getQuestions().motive.key;
    switch (key) {
      case "IC-201": {
        return "cargo_duplicado";
      }
      case "IC-202": {
        return "monto_alterado";
      }
      case "IC-203": {
        return "cargos_adicionales";
      }
      case "IC-204": {
        return "servicios_no_proporcionados";
      }
      case "IC-206": {
        return "pago_por_otro_medio";
      }
      case "IC-207": {
        return "cancelacion_de_servicio";
      }
      default: {
        break;
      }
    }
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
    document.getElementById("body").style.removeProperty("overflow");
    setTimeout(() => {
      this.modalRef.hide();
      if (cb) {
        cb();
      }
    }, 1000);
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
    if (currentUrl.lastIndexOf("?") > -1) {
      currentUrl = currentUrl.substr(0, currentUrl.lastIndexOf("?"));
    }
    currentUrl = currentUrl.substr(
      currentUrl.lastIndexOf("/"),
      currentUrl.length
    );
    return currentUrl;
  }

  public get sevenMotives(): boolean {
    const moves = <MoveModel[]>this.dataProxyService.getDataSelected();
    const [move] = moves;
    const option = this.session.get("serviceOption");
    if (option === MoveType.COMPRA || option === MoveType.SEGURO || option === MoveType.PREFOLIO) {
      return moves.length > 1 ? true : !(move?.type === MoveType.SEGURO);
    }
  }

  public editFlow() {
    let currentUrl: string = this.getCurrentURL();
    if (currentUrl === "/summary") {
      let path = this.taggingService.typeClarificationTDC();
      this.taggingService.link({
        event: "aclaraciones",
        interaction_category: 'aclaraciones_cargos',
        interaction_action: "editar",
        interaction_label: "cambiar",
        interaction_url: path,
        interaction_tipoUsuario: this.typeUser
      });
    }
    this.storage.saveInLocal("alreadyFlow", false);
    this.storage.saveInLocal("editFlow", true);
    this.storage.saveInLocal('prefolios', false);
    this.utils.clearSession();
    this.dataProxyService.cleanData();
    this.router.navigate(["welcome"]);
  }
}
