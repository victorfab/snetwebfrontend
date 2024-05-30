import { inject } from "@angular/core";
import moment from "moment";
import { MoveModel, QuestionsModel, ResponseModel } from "../models";
import { DataProxyService } from "../services/data-proxy.service";
import { DataService } from "../services/data.service";
import * as _ from "lodash";
import { SessionStorageService } from "../services/tdd/session-storage.service";
import { Router } from "@angular/router";
import { NavigationService } from "../services/navigation.service/navigation.service";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { AlertComponent, LoaderComponent } from "../partials";
import { Subscription } from "rxjs";
import { DateFormat } from "../enums/date-format.enum";
import { SessionStorageService as Session } from "angular-web-storage";
import { MoveType } from "../enums/move-type.enum";

interface FoliosTicket {
  nationalFolios: string[];
  internationalFolios: string[];
}

/**
 *some utilities in the app
 *
 * @export
 * @class Utils
 */
export class Utils {
  private dataService = inject(DataService);
  private dataProxyService = inject(DataProxyService);
  private storage = inject(SessionStorageService);
  private session = inject(Session);
  private router = inject(Router);
  private navigationService = inject(NavigationService);
  private modalService = inject(BsModalService);

  private modalSubscription: Subscription[] = [];
  private section: string = "summary";

  private modalRef: BsModalRef;
  /**
   *Method that formats a date to shw in the app
   *
   * @param {string} dateToBeParsed
   * @returns
   * @memberof Utils
   */
  public retrieveParsedDate(dateToBeParsed: string) {
    moment.locale("es");
    return moment(dateToBeParsed, "DD-MM-YYYY").format(
      "dddd DD [de] MMMM, YYYY"
    );
  }

  public formatQuestionnarie(questions: any[]): any {
    const excludedQuestions = ["description", "place", "state"];
    return questions
      .filter(({ name }) => !excludedQuestions.includes(name))
      .map((question) => ({
        Preguntas: question.question,
        Respuestas: question.value,
      }));
  }

  /**
   * Handle service manager request.
   *
   * @private
   * @param {*} r
   * @memberof SummaryComponent
   */
  public handleServiceManagerRequest(
    r: any,
    questions: QuestionsModel,
    options?: any
  ): void {
    this.validateSMHandler(r);
    let response: ResponseModel = this.dataProxyService.getResponseDAO();
    let dateC = "";
    if (this.dataProxyService.getDummyMode()) {
      response.setResult(301); // DUMMY
    }
    // Set the current date before the request
    let format = DateFormat.DD_MMM_YYYY_HH_mm;
    if (options && options.format) {
      format = options.format;
    }
    const currentDate = moment().format(format).toString();

    response.setCurrentDate(currentDate.split(".").join(""));

    if (r.Messages) {
      let nationalFolios = [];
      let internationalFolios = [];
      let payment = "false";
      let date = moment();
      let serviceFolio = "";
      for (let i of r.Messages) {
        if (this.getPayment(i) === "true") {
          payment = "true";
        }
        const internationalFolio = this.getFolioDate(i, "INTERNACIONAL");
        const nationalFolio = this.getFolioDate(i, "NACIONAL");
        let temporaldate = this.greaterDateValue(
          internationalFolio,
          nationalFolio
        );
        date = this.greaterDateValue(date, temporaldate);

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
      response.setGreaterDate(
        date,
        Boolean(serviceFolio) ? DateFormat.DD_DE_MMMM_DEL_YYYY : null
      );
      response.setPayment(payment);
      response.setAmount(r.wvrinboxrn.monto * 1);
      response.setResult(301);
    }
    response.setDateCommitment(dateC);
    response.setTotalAmount(this.getTotalAmount());
    response.setName(this.dataProxyService.creditCardFullData.userName);
    response.setVisaCard(r.wvrinboxrn.VisaCarta);
    response.setOldCard(this.dataProxyService.creditCardFullData.cardNumber);
    response.setEmail(r.wvrinboxrn.Email);
    this.dataProxyService.setResponseDAO(response);
    response.setNewCard(
      this.dataProxyService.questions?.blocker?.panReposition || ""
    );
    if (options && options.route) {
      this.closeModal(() => {
        this.router.navigate([options.route]);
      });
      return;
    }
    this.closeModal(() => {
      if (
        r.wvrinboxrn.AptoDefinitivo === "true" &&
        questions.hasCard == 1 &&
        questions.haveContact == "2"
      ) {
        this.storage.saveInLocal("tdcSmResponse", r);
        this.router.navigate(["definitivePayment"]);
      } else {
        this.router.navigate(["result"]);
      }
    });
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
    if (!_.isUndefined(r.codigoMensaje)) {
      if (r.codigoMensaje === "MSG-001") {
        this.dataService.handleError("", { name: r.mensaje });
      }
    }
    if (r.status === "Error") {
      this.dataService.handleError("", { name: r.status });
    }
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

  private extractFolio(tempFolio) {
    let tempArray = [];
    if (tempFolio !== null) {
      tempFolio.includes("|")
        ? (tempArray = tempFolio.split("|"))
        : tempArray.push(tempFolio);
    }
    return tempArray;
  }

  private concatArray(origin, toConcat) {
    toConcat.forEach(function (element) {
      origin.push(element);
    });
    return origin;
  }

  /**
   * Get total amount.
   *
   * @private
   * @returns {number}
   * @memberof SummaryComponent
   */
  private getTotalAmount(): number {
    let totalSum = 0;
    _.each(this.dataProxyService.getDataSelected(), (item: MoveModel) => {
      totalSum += item.amount;
    });
    return totalSum;
  }

  /**
   * Close modal.
   *
   * @private
   * @param {*} [cb]
   * @memberof SummaryComponent
   */
  public closeModal(cb?: any): void {
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
   * Open a modal instance.
   *
   * @private
   * @param {string} type
   * @memberof SummaryComponent
   */
  public openModal(type: string): BsModalRef<any> {
    this.navigationService.tapBack("");
    this.modalSubscription.push(
      this.modalService.onShown.subscribe((reason: string) => {})
    );
    let options: any = {
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: true,
    };
    if (type === "loader") {
      options.class = "modal-loader";
      this.modalRef = this.modalService.show(LoaderComponent, options);
    } else {
      this.modalRef = this.modalService.show(AlertComponent, options);
      this.modalRef.content.type = type;
    }
    if (type === "block-one" || type === "block-two") {
      // Cancel navigation
      this.navigationService.tapBack("");
    }
    return this.modalRef;
  }

  public deepCopy<T>(input: T): T {
    return JSON.parse(JSON.stringify(input));
  }

  /**
   *
   * @param move Transforms a base move to a MoveModel object
   * @param extractIndex The index of extract
   * @returns A transformed object
   */
  public transformMove(move: any, extractIndex: number): MoveModel {
    const dateStr: string = moment(move.athInfo.origDt, "YYYY-MM-DD").format(
      "DD-MM-YYYY"
    );
    const periodStr: string = moment(dateStr, "DD-MM-YYYY").format("MMMM YYYY");
    const fecha = this.formatDate(move.athInfo.origDt);
    const parsedStrDate = dateStr.split("-");
    const typedDate = new Date(
      Number(parsedStrDate[2]),
      Number(parsedStrDate[1]) - 1,
      Number(parsedStrDate[0])
    );

    const ccData = this.dataProxyService.getCCData();
    const userData = this.dataProxyService.getUserData();
    let nmove: MoveModel = null;
    try {
      nmove = new MoveModel(
        move.athId,
        move.athInfo.trnType.desc,
        move.athInfo.totalCurAmt.amt.toString(),
        dateStr,
        periodStr,
        move.athInfo.networkTrnData.merchNum,
        move.athInfo.networkTrnData.merchName,
        move.athInfo.origCurAmt.curCode.curCodeValue,
        fecha,
        move.athInfo.trnTime,
        move.athInfo.networkTrnData?.POSEntryCapability,
        move.athInfo.totalCurAmt.amt,
        ccData.cardRec.cardInfo.acctRef.acctInfo.fiData.branchIdent,
        move.athId,
        userData?.extracts[extractIndex]?.id || "",
        "",
        move.athInfo.trnType.trnTypeCode,
        move.athInfo.acctKeys.cardKeys.cardNum,
        typedDate
      );
      nmove.type = move.athInfo.type;
    } catch (error) {
      console.log(error);
    }

    return nmove;
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
   * Format Date.
   *
   * @private
   * @param {string} v
   * @returns {string}
   * @memberof WelcomeComponent
   */
  private formatDate(v: string): string {
    return moment(v, "YYMMDD").format("YYYY-MM-DD[T06:00:00+00:00]").toString();
  }

  public clearSession(): void {
    this.session.clear();
    sessionStorage.clear();
    localStorage.removeItem("alreadyFlow");
    localStorage.removeItem("optionValue");
    localStorage.removeItem("editFlow");
    localStorage.removeItem("option");
    localStorage.removeItem("respositionType");
  }
}
