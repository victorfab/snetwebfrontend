import { Component, OnInit, Input } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { SessionStorageService } from "../../../services/tdd/session-storage.service";
import { UtilsTddService } from "../../../services/tdd/utils-tdd.service";
import { DataService } from "../../../services/data.service";
import { NavigationService } from "../../../services/navigation.service/navigation.service";
import { BlockModel, QuestionsModel, ResponseModel } from "./../../../models";
// Alertas
import { delay, of, Subscription } from "rxjs";
import { AlertsTddService } from "../../../services/tdd/alerts-tdd.service";

//Taggeo
import { TaggingService } from "../../../services/tagging.service";
import * as _ from "lodash";
import moment from "moment";
import { CashbackService } from "../../../services/cashback/cashback.service";

/**
 * componente que da el resumen de los movimnientos y respuestas del usuario
 * da de alta la aclaracion
 *
 * @export
 * @class SummaryTddComponent
 * @implements {OnInit}
 */
@Component({
  selector: "app-summary-tdd",
  templateUrl: "./summary-tdd.component.html",
  providers: [DataService, NavigationService],
})
export class SummaryTddComponent implements OnInit {
  /**
   *
   * subscripcion a servicios para obtener una respuesta y
   * llevar el contenido a la vista
   *
   * @type {Subscription}
   * @memberof SummaryTddComponent
   */
  subscription: Subscription;

  /**
   * cuestionario de la vista
   *
   * @private
   * @memberof SummaryTddComponent
   */
  private viewQuestions = [];
  /**
   * canal por el que se accedio a la aplicaicon
   *
   * @private
   * @memberof SummaryTddComponent
   */
  public chanelType = "";
  /**
   *seccion del formulario
   *
   * @private
   * @type {string}
   * @memberof SummaryTddComponent
   */
  private section: string = "summary";
  /**
   * Model de las preguntas realizada por el usuario
   *
   * @private
   * @type {QuestionsModel}
   * @memberof SummaryTddComponent
   */
  private questions: QuestionsModel;

  public isCashbackFlow: string = "";
  public totalCashback: number;
  public selectedMoves: number;
  public location: string = "";
  public data: string = "";

  /**
   *Creates an instance of SummaryTddComponent.
   * @param {UtilsTddService} utils
   * @param {SessionStorageService} storage
   * @param {DataService} dataService
   * @param {Router} router
   * @param {AlertsTddService} alertsTddService
   * @param {TaggingService} taggingService
   * @memberof SummaryTddComponent
   */
  constructor(
    private utils: UtilsTddService,
    private storage: SessionStorageService,
    private dataService: DataService,
    private router: Router,
    private alertsTddService: AlertsTddService,
    private navigationService: NavigationService,
    private taggingService: TaggingService,
    private cashbackService: CashbackService
  ) {
    // tealium.setConfig();
  }

  /**
   * navega al inicio de la pagina
   * consulta el cuestionario a mostrar del storage
   * inicializa el servicio de urls
   * consulta el canal de la aplicacion
   *
   * @memberof SummaryTddComponent
   */
  ngOnInit() {
    let path: string = "";
    this.navigationService.tapBack(this.section);
    this.utils.scrollTop();
    this.viewQuestions = this.storage.getFromLocal("viewQuestions");
    this.dataService.setUris(this.storage.getFromLocal("enviroment"));
    this.chanelType = this.storage.getFromLocal("chanel");
    this.isCashbackFlow = this.cashbackService.getFlow();
    if (this.isCashbackFlow === "true") {
      this.location = this.storage.getFromLocal("location");
      this.totalCashback =
        this.cashbackService.getLocalStorage("cashbackTicket").amount;
      this.selectedMoves =
        this.cashbackService.getTotalMoves("multifolio").length;
      this.data = this.storage.getFromLocal("additionaldata");
    }

    //TALIUM TAG
    /*const dataLayer = {
      4: this.section,
      17: 'step-summary-tdd',
    };
    this.taggingService.uTagView(dataLayer);
    this.taggingService.setPageName();
    this.taggingService.send(location.hash);*/
    if (this.isCashbackFlow === "true") {
      this.taggingService.view({
        tag_subsection1: "aclaraciones",
        tag_titulo: "aclaraciones_cargos/summary_cuestionario_cashback",
        tag_url: "aclaraciones_cargos/summary_cuestionario_cashback",
      });
    } else {
      path = this.taggingService.typeClarificationTDD();
      this.taggingService.setvalues("aclaraciones", path);
      this.taggingService.view(this.taggingService.getvalues());
    }

    //Recibir mensaje bloqueo
    this.subscription = this.alertsTddService
      .getMessage()
      .subscribe((message) => {
        if (message.response.number === -2) {
          this.continueBlock();
        }
      });
  }

  /**
   * Hace la consulta del token de la aplicacion para llamar a ejecutar la aclaracion
   * dependiendo del ambiente lo hace en dummy o al endpoint
   *
   *
   * @public
   * @memberof SummaryTddComponent
   */
  public executeContinue() {
    let path = this.taggingService.typeClarificationTDD();
    if (this.isCashbackFlow === "true") {
      this.taggingService.link({
        event: "aclaraciones",
        interaction_action: "confirmacion",
        interaction_label: "confirmar",
        interaction_category: "cashback",
        interaction_url: path
      });
    } else {
      this.taggingService.link({
        event: "aclaraciones",
        interaction_category: "aclaraciones_cargos",
        // this.taggingService.getvalues().tag_aclaracion.toString(),
        interaction_action: "cuestionario_resumen",
        interaction_label: "confirmar",
        interaction_url: path
      });
    }
    this.alertsTddService.sendMessage(-1, true, -1);
    if (this.storage.getFromLocal("dummy")) {
      of("")
        .pipe(delay(1500))
        .subscribe(() => {
          this.dataService
            .dummyRequest("assets/data/token.json")
            .subscribe((response) => {
              this.storage.saveInLocal("app-access", response.access_token);
              this.executeClarification();
            });
        });
    } else {
      this.executeClarification();
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
    this.storage.saveInLocal("BlockModel", r);
    if (!blocker.operationCancellation) {
      this.alertsTddService.sendMessage(0, true, 0);

      // TODO: Block card on each motive
    }
  }

  /**
   * Execute card block.
   *
   * @private
   * @memberof SummaryComponent
   */
  private executeCardBlock() {
    let blockMotive =
      this.viewQuestions[1].value ===
      "ME LA ROBARON O LA EXTRAVIÉ Y NO LA HE REPORTADO"
        ? "robo"
        : "fraude";
    let defaultMessage = "Estamos bloqueando su tarjeta, un momento por favor.";

    if (this.storage.getFromLocal("dummy")) {
      /* DUMMY MODE */
      const endpoint = `/lock/lock_code/${blockMotive}/path/front`;
      this.subscription = this.dataService
        .dummyRequest("assets/data/lock-card.json")
        .subscribe((response) => this.handleCardBlockResponse(response));
    } else {
      const endpoint = `/lock/lock_code/${blockMotive}/path/front`;
      this.subscription = this.dataService
        .restRequest(
          endpoint,
          "POST",
          "",
          "cards",
          this.storage.getFromLocal("app-access"),
          this.storage.getFromLocal("client")
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
          }
        );
    }
  }
  /**
   * Method that checks:
   *  * If the flow requires to lock cards.
   *
   * @memberof SummaryComponent
   */
  public async validateCardLock() {
    let valid: boolean = false;
    if (this.storage.getFromLocal("dummy")) {
      /* DUMMY MODE */
      let subscription = this.dataService
        .dummyRequest("assets/data/check-cards.json")
        .subscribe((response) => {
          if (response.data === "true") {
            if (
              this.viewQuestions[0].value === "NO" &&
              this.viewQuestions[1].value ===
                "LA REPORTÉ COMO ROBADA O EXTRAVIADA"
            ) {
              this.alertsTddService.sendMessage(1, true, 1);
            } else {
              if (this.viewQuestions[1].value === "NO") {
                this.alertsTddService.sendMessage(6, true, 0);
              } else {
                if (this.viewQuestions[1].value === "NUNCA LA TUVE CONMIGO") {
                  this.executeCardBlock();
                  let SMObject = this.utils.generateSMObject();
                  let subscriptionSMResponse = this.dataService
                    .dummyRequest("assets/data/sm-response-tdd.json")
                    .subscribe((responseSMResponse) => {
                      this.storage.saveInLocal(
                        "SMResponse",
                        responseSMResponse
                      );
                      this.router.navigate(["resultTDD"]);
                    });
                } else {
                  this.alertsTddService.sendMessage(0, true, 0);
                }
              }
            }
          } else {
            if (
              this.viewQuestions[1].value ===
              "ME LA ROBARON O LA EXTRAVIÉ Y NO LA HE REPORTADO"
            ) {
              this.alertsTddService.sendMessage(5, true, 1);
            } else {
              let SMObject = this.utils.generateSMObject();
              let subscriptionSMResponsetdd = this.dataService
                .dummyRequest("assets/data/sm-response-tdd.json")
                .subscribe((responseSMResponsetdd) => {
                  this.storage.saveInLocal("SMResponse", responseSMResponsetdd);
                  this.router.navigate(["resultTDD"]);
                });
            }
          }
        });
    } else {
      /*Consulta bloqueo en MODO NORMAL*/
      let SMObject = this.utils.generateSMObject();
      let CheckCards = this.utils.generateObjectCheckCards();
      /* SMObject.wvrinboxrn.cuestionario[0].Respuestas="NO"
      SMObject.wvrinboxrn.cuestionario[1].Preguntas="¿Qué sucedió con su tarjeta?"
      SMObject.wvrinboxrn.cuestionario[1].Respuestas="."*/
      this.subscription = this.dataService
        .restRequest(
          "/check-cards/",
          "POST",
          {
            multifolio: CheckCards.wvrinboxrn.multifolio,
            cuestionario: this.generateQuestionaire(
              SMObject.wvrinboxrn.cuestionario
            ),
          },
          "user",
          this.storage.getFromLocal("app-access"),
          this.storage.getFromLocal("client")
        )
        .subscribe((response) => {
          if (response.data === "true") {
            if (
              this.viewQuestions[0].value === "NO" &&
              this.viewQuestions[1].value ===
                "LA REPORTÉ COMO ROBADA O EXTRAVIADA"
            ) {
              this.alertsTddService.sendMessage(1, true, 1);
            } else {
              if (this.viewQuestions[1].value === "NO") {
                this.alertsTddService.sendMessage(6, true, 0);
              } else {
                if (this.viewQuestions[1].value === "NUNCA LA TUVE CONMIGO") {
                  this.executeCardBlock();
                  this.clarificationsService();
                } else {
                  this.alertsTddService.sendMessage(0, true, 0);
                }
              }
            }
          } else {
            if (
              this.viewQuestions[1].value ===
              "ME LA ROBARON O LA EXTRAVIÉ Y NO LA HE REPORTADO"
            ) {
              this.alertsTddService.sendMessage(5, true, 1);
            } else {
              this.clarificationsService();
            }
          }
        });
    }
  }
  private generateQuestionaire(questionsSelected: object): object {
    let questionarieGenerated = {};
    if (this.viewQuestions[1].value === "LA REPORTÉ COMO ROBADA O EXTRAVIADA") {
      questionarieGenerated = [
        {
          Preguntas: "¿Tiene la tarjeta en su poder?",
          Respuestas: "NO",
        },
        {
          Preguntas: "¿Qué sucedió con su tarjeta?",
          Respuestas: "La reporté como robada o extraviada.",
        },
      ];
    } else if (
      this.viewQuestions[1].value ===
      "ME LA ROBARON O LA EXTRAVIÉ Y NO LA HE REPORTADO"
    ) {
      questionarieGenerated = [
        {
          Preguntas: "¿Tiene la tarjeta en su poder?",
          Respuestas: "NO",
        },
        {
          Preguntas: "¿Qué sucedió con su tarjeta?",
          Respuestas: "Me la robaron o la extravié y no la he reportado.",
        },
      ];
    } else {
      questionarieGenerated = questionsSelected;
    }
    return questionarieGenerated;
  }
  public async clarificationsService() {
    let SMObject = this.utils.generateSMObject(this.isCashbackFlow);
    let subscription = this.dataService
      .restRequest(
        "/clarifications/",
        "POST",
        JSON.stringify(SMObject),
        "",
        this.storage.getFromLocal("app-access"),
        this.storage.getFromLocal("client")
      )
      .subscribe((response) => {
        this.storage.saveInLocal("SMResponse", response);
        this.router.navigate(["resultTDD"]);
      });
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
      tempFolio.includes("|")
        ? (tempArray = tempFolio.split("|"))
        : tempArray.push(tempFolio);
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
      if (find.split(": ")[1].includes(" ")) {
        let a = 0;
        let tempFolio = "";
        let arrayFolio = find.split(": ")[1].split(" ");
        if (arrayFolio[0] !== "undefined" && arrayFolio[1] !== "undefined") {
          return `${arrayFolio[0]}|${arrayFolio[1]}`;
        } else {
          arrayFolio[0] !== "undefined"
            ? (tempFolio = tempFolio + arrayFolio[0])
            : (a += 1);
          arrayFolio[1] !== "undefined"
            ? (tempFolio = tempFolio + arrayFolio[1])
            : (a += 1);
          tempFolio === "" ? (tempFolio = null) : (a += 1);
          return tempFolio;
        }
      }
      return find.split(": ")[1] !== "undefined" ? find.split(": ")[1] : null;
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
      greater = international.isAfter(national) ? international : national;
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
  private getPayment(r: string[]): any {
    const find = _.find(r, (item: any) => {
      return item.match(new RegExp(`^Abono: `));
    });
    if (!_.isUndefined(find)) {
      return find.split(": ")[1] !== "undefined" ? find.split(": ")[1] : null;
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
      return moment(find.split("==> ")[1], "DD/MM/YYYY HH::mm:ss");
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
      if (r.codigoMensaje === "MSG-001") {
        this.dataService.handleError("", { name: r.mensaje });
      }
    }
    if (r.status === "Error") {
      this.dataService.handleError("", { name: r.status });
    }
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
    if (this.storage.getFromLocal("dummy")) {
      if (
        this.viewQuestions[1].value === "NO" ||
        this.viewQuestions[0].value === "NO"
      ) {
        this.validateCardLock();
      } else {
        let subscription = this.dataService
          .dummyRequest("assets/data/sm-response-tdd.json")
          .subscribe((response) => {
            this.storage.saveInLocal("SMResponse", response);
            this.router.navigate(["resultTDD"]);
          });
      }
    } else {
      if (
        this.viewQuestions[0].value === "NO" ||
        this.viewQuestions[1].value === "NO"
      ) {
        this.validateCardLock();
      } else {
        this.clarificationsService();
      }
    }
  }

  /**
   *
   * set the abs of the pay of movement clarificaded
   * @param {*} cant
   * @returns
   * @memberof SummaryTddComponent
   */
  removeSign(cant: any) {
    return Math.abs(cant);
  }

  //Continuar Bloqueo
  public continueBlock() {
    this.router.navigate(["lockedTDD"]);
  }

  public returnPage() {
    if (this.isCashbackFlow === "true") {
      let path = this.taggingService.typeClarificationTDD();
      this.cashbackService.cashbackFlow(false);
      this.cashbackService.editFlow("true");
      this.router.navigate(["cashback-movements"]);
      this.taggingService.link({
        event: "aclaraciones",
        interaction_action: "editar",
        interaction_label: "editar",
        interaction_category: "cashback",
        interaction_url: path
      });
    } else {
      let path = this.taggingService.typeClarificationTDD();
      this.taggingService.link({
        event: "aclaraciones",
        interaction_action: "editar",
        interaction_label: "cambiar",
        interaction_category: "aclaraciones_cargos",
        interaction_url: path
      });
      this.utils.clearData();
      this.router.navigate(["welcomeTDD"]);
    }
  }

  public goTicket() {
    this.router.navigate(["resultTDD"]);
  }
}


// dashboard google analitics
