import { Injectable } from "@angular/core";
import { HttpHeaders } from "@angular/common/http";
import * as _ from "lodash";
import { SessionStorageService } from "./session-storage.service";
import { DataService } from "../data.service";
import { DataProxyService } from "../data-proxy.service";
import { MoveModel, ResponseModel, MultifolioTddModel } from "../../models";
import { DateFormat } from "../../enums/date-format.enum";
import {
  LocalStorageService,
  SessionStorageService as Session,
} from "angular-web-storage";
import { CashBack } from "../../enums/cashback.enum";
import { TabOptions } from "../../enums/tab.enum";
import { ResponseInfo } from "../../interfaces/response-info.interface";
import { Folio } from "../../interfaces/folios.interface";
import moment, { Moment } from "moment";

interface FnParams {
  response: ResponseModel;
  serviceResponse: any;
}

// Services

@Injectable()
export class UtilsTddService {
  private responseDAO: ResponseModel;
  private userData = this.storage.getFromLocal("userdata");
  private CONSTANTS: any = this.constants();

  private _mergedFolios: string[];

  /**
   * Creates an instance of UtilsTddService.
   * @param {SessionStorageService} storage
   * @param {DataService} dataService
   * @param {DataProxyService} dataProxyService
   * @memberof UtilsTddService
   */
  constructor(
    private storage: SessionStorageService,
    private dataService: DataService,
    public dataProxyService: DataProxyService,
    private session: Session,
    private st: LocalStorageService
  ) {}

  public get mergedFolios(): string[] {
    return this._mergedFolios;
  }

  public set mergedFolios(input: string[]) {
    this._mergedFolios = input;
  }

  /**
   * scroll top method
   * @memberof UtilsTddService
   */
  scrollTop() {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }

  /**
   *
   * generate View Questions
   * @param {*} motive motive general
   * @param {string} description Description of motive of a clarification
   * @param {*} date date of movement
   * @param {string} location location of the movement
   * @param {string} commerceInt information of the commerce
   * @returns {Array<any>}
   * @memberof UtilsTddService
   */
  generateViewQuestions(
    motive: any,
    description: string,
    date: any,
    location: string,
    commerceInt: string
  ): any[] {
    let questions = [];

    switch (Number(motive.id)) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        questions = this.getInteractionView(motive, description, commerceInt);

        break;
      // la reporte como robada
      case 8:
        questions = this.getInteractionView(
          motive,
          description,
          commerceInt,
          date
        );
        break;
      // Nunca la tuve conmigo
      case 9:
        questions = this.getInteractionView(motive, description, commerceInt);
        break;
      // no la he reportado
      case 10:
        questions = this.getInteractionView(motive, description, commerceInt);
        break;
      default:
        break;
    }
    questions.push({
      key: "UBICACIÓN ACTUAL",
      value: location,
      id: "location",
    });
    return questions;
  }

  /**
   *
   * get Interaction View of questionary
   * @param {*} motive
   * @param {string} description
   * @param {string} commerceInt
   * @returns {Array<any>}
   * @memberof UtilsTddService
   */

  getInteractionView(
    motive: any,
    description: string,
    commerceInt: string,
    date?: any
  ): any[] {
    let questions;
    if (motive.id < 8) {
      questions = [
        { key: "TARJETA EN SU PODER", value: "SÍ", id: "hasCard" },
        {
          key: "INTERACTUÓ CON EL COMERCIO",
          value: commerceInt,
          id: "commerceInteract",
        },
      ];
    } else {
      questions = [{ key: "TARJETA EN SU PODER", value: "NO", id: "hasCard" }];
      switch (Number(motive.id)) {
        case 8:
          questions.push({
            key: "QUÉ SUCEDIÓ CON SU TARJETA",
            value: "LA REPORTÉ COMO ROBADA O EXTRAVIADA",
            id: "whatHappen",
          });
          questions.push({
            key: "FECHA DE ROBO O EXTRAVÍO",
            value: date,
            id: "stolenDate",
          });
          break;
        case 9:
          questions.push({
            key: "QUÉ SUCEDIÓ CON SU TARJETA",
            value: "NUNCA LA TUVE CONMIGO",
            id: "whatHappen",
          });
          break;
        case 10:
          questions.push({
            key: "QUÉ SUCEDIÓ CON SU TARJETA",
            value: "ME LA ROBARON O LA EXTRAVIÉ Y NO LA HE REPORTADO",
            id: "whatHappen",
          });
          break;
      }
    }

    if (commerceInt === "SÍ") {
      questions.push(
        {
          key: "MOTIVO DE LA ACLARACIÓN",
          value: motive.description.toUpperCase(),
          id: "motive",
        },
        {
          key: "DESCRIPCIÓN",
          value: description.toUpperCase(),
          id: "description",
        }
      );
    }

    return questions;
  }

  /**
   * set the format Date.
   *
   * @private
   * @param {string} v
   * @returns {string}
   * @memberof WelcomeComponent
   */
  private formatDate(v: string): string {
    return moment(v, "YYYY-MM-DD")
      .format("YYYY-MM-DD[T06:00:00+00:00]")
      .toString();
  }

  /**
   * set the format hour.
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
   * Get the Multifolio of the movements clarificaded
   *
   * @private
   * @returns
   * @memberof SummaryComponent
   */
  private getMultifolioModel(moves, addExtract = false) {
    const multifolio = [];
    let ix = 0;

    _.each(moves, (item: MoveModel) => {
      const objmultifolio = new MultifolioTddModel();
      objmultifolio.AcctTrnId = item.id;
      objmultifolio.Date = moment(item.date, "MM-DD-YYYY").format("YYYY-MM");
      if (addExtract) {
        objmultifolio.AcctStmtId = item.txrNumExtracto;
      }

      // objmultifolio.TxrCodigoCom = item.txrCodigoCom;
      // objmultifolio.TxrComercio = item.txrComercio;
      // objmultifolio.TxrDivisa = item.txrDivisa;
      // objmultifolio.TxrFecha = item.txrFecha;
      // objmultifolio.TxrHrTxr = this.formatHour(item.txrHrTxr);
      // objmultifolio.TxrModoEntrada = item.txrModoEntrada;
      // objmultifolio.TxrMonto = item.txrMonto;
      // objmultifolio.TxrMovExtracto = item.txrMovExtracto;
      // objmultifolio.TxrNumExtracto = item.txrNumExtracto;
      // objmultifolio.TxrReferencia = item.txrReferencia;
      // objmultifolio.TxrSucursalAp = item.txrSucursalAp;
      // objmultifolio.TxrTipoFactura = item.txrTipoFactura;
      // objmultifolio.TxrPAN = item.txrPAN;
      // objmultifolio.TxrClacon = item.txrClacon; //TODO:
      // objmultifolio.TxrRefEmisor = item.txrRefEmisor;//TODO
      multifolio.push(objmultifolio);
      ix++;
    });
    return multifolio;
  }

  private getMultifolioModelCheckCards(moves) {
    const multifolio = [];
    let ix = 0;
    _.each(moves, (item: MoveModel) => {
      const objmultifolio = new MultifolioTddModel();
      objmultifolio.AcctTrnId = item.id;
      objmultifolio.Date = moment(item.date, "MM-DD-YYYY").format("YYYY-MM");
      // objmultifolio.TxrCodigoCom = item.txrCodigoCom;
      // objmultifolio.TxrComercio = item.txrComercio;
      // objmultifolio.TxrDivisa = item.txrDivisa;
      // objmultifolio.TxrFecha = item.txrFecha;
      // objmultifolio.TxrHrTxr = this.formatHour(item.txrHrTxr);
      // objmultifolio.TxrModoEntrada = item.txrModoEntrada;
      // objmultifolio.TxrMonto = item.txrMonto;
      // objmultifolio.TxrMovExtracto = item.txrMovExtracto;
      // objmultifolio.TxrNumExtracto = item.txrNumExtracto;
      // objmultifolio.TxrReferencia = item.txrReferencia;
      // objmultifolio.TxrSucursalAp = item.txrSucursalAp;
      // objmultifolio.TxrTipoFactura = item.txrTipoFactura;
      objmultifolio.TxrPAN = item.txrPAN;
      // objmultifolio.TxrClacon = item.txrClacon; //TODO:
      // objmultifolio.TxrRefEmisor = item.txrRefEmisor;//TODO
      multifolio.push(objmultifolio);
      ix++;
    });
    return multifolio;
  }

  /**
   * generate the move informations of the view
   *
   * @param {*} v
   * @param {*} m
   * @returns
   * @memberof UtilsTddService
   */
  generateMove(v, m) {
    const date = v.acctTrnInfo?.origDt || v.acctTrnInfo?.postedDt;
    const dateStr = moment(date, "YYYY-MM-DD").format("MM-DD-YYYY").toString();
    const periodStr: string = moment(dateStr, "MM-DD-YYYY").format("MMMM YYYY");
    const fecha = this.formatDate(date);
    const parsedStrDate = dateStr.split("-");
    const typedDate = new Date(
      Number(parsedStrDate[2]),
      Number(parsedStrDate[0]) - 1,
      Number(parsedStrDate[1])
    );
    const nmove: MoveModel = new MoveModel(
      v.acctTrnId,
      v.acctTrnInfo?.trnType?.desc,
      v.acctTrnInfo.totalCurAmt.amt.toString(),
      dateStr,
      periodStr,
      v.acctTrnInfo.networkTrnData.merchNum,
      v.acctTrnInfo.networkTrnData?.merchName ||
        v.acctTrnInfo?.comments ||
        v.acctTrnInfo?.trnType?.desc,
      v.acctTrnInfo.origCurAmt?.curCode?.curCodeValue ||
        v.acctTrnInfo.totalCurAmt?.curCode?.curCodeValue,
      fecha,
      v.acctTrnInfo.trnTime,
      v.acctTrnInfo.networkTrnData.posEntryCapability,
      v.acctTrnInfo.totalCurAmt.amt,
      this.storage.getFromLocal(
        "ccdata"
      ).cardRec.cardInfo.acctRef.acctInfo.fiData.branchIdent,
      v.acctTrnId,
      m,
      v.acctTrnInfo.salesSlipRefNum, // dfef
      v.acctTrnInfo.trnType.trnTypeCode,
      v.acctTrnInfo.acctKeys?.cardKeys?.cardNum || "",
      typedDate,
      v.acctTrnInfo.clacon, // TxrClacon
      v.acctTrnInfo.refEmisor, // TxrRefEmisor
      v.acctTrnInfo.statusReverso // Estatus de reverso
    );
    return nmove;
  }

  /**
   * generate Service Mannager Object for clarifications
   * @returns
   * @memberof UtilsTddService
   */
  generateSMObject(isCashback = "false") {
    let moves = [];

    if (isCashback === "true") {
      moves = [...(JSON.parse(sessionStorage.getItem("multifolio")) as any[])];
    }

    const addExtract = isCashback === "true" && this.isLikeU;

    return {
      wvrinboxrn: {
        Categoria:
          isCashback === "true" ? "SANTANDER PLUS" : "TARJETA DE DEBITO", // this.storage.getFromLocal('category'),
        Descripcion: this.storage.getFromLocal("additionaldata").description,
        EntidadFed: this.storage
          .getFromLocal("additionaldata")
          .location.toString(),
        FechaRobada: this.storage.getFromLocal("additionaldata").lostdate,
        Subcategoria: this.storage.getFromLocal("subcategory"),
        VisaCarta: "false",
        cuestionario: this.storage.getFromLocal("questionnaire"),
        multifolio: this.getMultifolioModel(
          isCashback === "false"
            ? this.storage.getFromLocal("multifolio")
            : moves,
          addExtract
        ),
      },
    };
  }

  generateObjectCheckCards() {
    return {
      wvrinboxrn: {
        multifolio: this.getMultifolioModelCheckCards(
          this.storage.getFromLocal("multifolio")
        ),
      },
    };
  }

  /**
   * Return files needed according to the reason.
   *
   * @param {string} reason
   * @returns {Array<any>}
   * @memberof UtilsTddService
   */
  getRequirementsResult(reason: string): any[] {
    const requirementsResult = {
      receiptCorrectAmount: [
        { value: this.CONSTANTS.LABELS.RECEIPT_CORRECT_AMOUNT_DOC },
      ],
      receiptRecognized: [
        { value: this.CONSTANTS.LABELS.RECEIPT_RECOGNIZED_DOC },
      ],
      receiptPayment: [{ value: this.CONSTANTS.LABELS.RECEIPT_PAYMENT_DOC }],
      receiptReturn: [{ value: this.CONSTANTS.LABELS.RECEIPT_RETURN_DOC }],
      letterVoucher: [
        { value: this.CONSTANTS.LABELS.LETTER_VOUCHER_DOC },
        { value: this.CONSTANTS.LABELS.LETTER_VOUCHER_COPY },
      ],
      voucherCancel: [{ value: this.CONSTANTS.LABELS.VOUCHER_CANCEL_DOC }],
      formartBCOM: [{ value: this.CONSTANTS.LABELS.FORMART_BCOM_DOC }],
      INEFormart: [
        { value: this.CONSTANTS.LABELS.LETTER_VOUCHER_DOC },
        { value: this.CONSTANTS.LABELS.INE_FORMART_DOC },
        { value: this.CONSTANTS.LABELS.CURP_FORMART_DOC },
      ],
    };
    return requirementsResult[reason];
  }

  /**
   *
   * handle Service Manager Request
   * @param {*} serviceResponse
   * @returns {*}
   * @memberof UtilsTddService
   */
  handleServiceManagerRequest(serviceResponse: any, isCashback = false): any {
    this.validateSMHandler(serviceResponse);
    const response: any = new ResponseModel();
    const dateC = "";
    if (this.storage.getFromLocal("dummy")) {
      response.setResult(301); // DUMMY
    }
    const format = DateFormat.DD_MMMM_YYYY_HH_mm;
    const currentDate = moment().format(format).toString();
    response.setCurrentDate(currentDate.split(".").join(""));

    if (serviceResponse.Messages) {
      let nationalFolios = [];
      let internationalFolios = [];
      let atmFolios = [];
      let payment = false;
      let date = moment();
      let cashbackFolio = "";
      let cashbackDate = moment();
      let type: "DEBITO" | "CREDITO" = "DEBITO";
      let typePayment = "";
      let paymentAmount = 0.0;

      if (
        Object.keys(this.dataProxyService.getCCData()).length > 0 &&
        this.dataProxyService.getCCData().cardRec.cardInfo.cardType ===
          "Credit" &&
        this.session.get("tab") === TabOptions.ATM
      ) {
        type = "CREDITO";
      }

      for (const item of serviceResponse.Messages) {
        if (this.getPayment(item) === "true") payment = true;
        // Fechas de folios
        const internationalFolio = this.getFolioDate(item, "INTERNACIONAL");
        const nationalFolio = this.getFolioDate(item, "NACIONAL");
        const atmFolio = this.getFolioDate(item, type);
        let temporaldate = this.greaterDateValue(
          internationalFolio,
          nationalFolio
        );
        temporaldate = this.greaterDateValue(temporaldate, atmFolio);
        date = this.greaterDateValue(date, temporaldate);

        // Folio internacional
        let tempFoliosQ = this.getFolio(item, "Internacional");
        let tempArrayF = this.extractFolio(tempFoliosQ);
        internationalFolios = this.concatArray(internationalFolios, tempArrayF);

        // Folio nacional
        tempFoliosQ = this.getFolio(item, "Nacional");
        tempArrayF = this.extractFolio(tempFoliosQ);
        nationalFolios = this.concatArray(nationalFolios, tempArrayF);

        // Pagos
        typePayment = this.getTypePayment(item);
        paymentAmount = Number.parseInt(this.getPaymentAmount(item));

        // Folio cajero
        tempFoliosQ = this.getFolio(item, "CAJEROS AUTOMATICOS");
        tempArrayF = this.extractFolio(tempFoliosQ);
        atmFolios = this.concatArray(atmFolios, tempArrayF);

        // Folio cashback
        cashbackFolio = this.getFolio(item, "SANTANDER PLUS");
        if (isCashback) {
          cashbackDate = moment(this.getFolioDate(item, "", true));
        }
      }
      response.setInternationalFolio(internationalFolios);
      response.setNationalFolio(nationalFolios);
      response.setAtmFolio(atmFolios);
      response.setGreaterDate(
        isCashback ? cashbackDate : date,
        DateFormat.DD_DE_MMMM_DEL_YYYY
      );
      response.setPayment(payment);
      response.setAmount(serviceResponse.wvrinboxrn.monto * 1);
      response.setResult(301);
      response.cashbackFolio = cashbackFolio;
      response.setTypePayment(typePayment);
      response.setPaymentAmount(paymentAmount);
      this.mergedFolios = nationalFolios.concat(internationalFolios);
    }
    response.setDateCommitment(dateC);
    response.setTotalAmount(serviceResponse.wvrinboxrn.monto * 1);
    response.setName(this.userData.name);
    response.setVisaCard(serviceResponse.wvrinboxrn.VisaCarta);
    response.setOldCard(this.userData.cardNumber);

    return this.updateResponse({
      response,
      serviceResponse,
    });
  }

  /**
   * Updates the response or create a new to be used in the ticket screen
   * @param {ResponseModel} response - The obejct to use into ticket screen
   * @param {any[]} nationalFolios - The list of national folios
   * @param {any[]} internationalFolios - The lis of international folios
   * @param {any[]} mergedFolios - The joined folios list
   * @returns
   */
  private updateResponse({
    response = new ResponseModel(),
    serviceResponse = null,
  }: FnParams): any {
    if (!serviceResponse) {
      return response;
    }
    const {
      temporaryApplied,
      definitiveApplied,
      nationalFolios,
      internationalFolios,
      mergedFolios,
      Apto,
      AptoDefinitivo,
    } = this.getResponseInfo(serviceResponse);

    if (mergedFolios.length && (Apto === 'true' || AptoDefinitivo === 'true')) {
      response.temporary = temporaryApplied;
      response.definitive = definitiveApplied;
      const [national] = nationalFolios;
      const [international] = internationalFolios;

      response.setGreaterDate(
        this.greaterDateValue(
          this.toMoment(international?.TxrfechaC),
          this.toMoment(national?.TxrfechaC)
        )
      );

      response.setInternationalFolio(
        internationalFolios.map((folio) => folio.Txrfolio)
      );
      response.setNationalFolio(nationalFolios.map((folio) => folio.Txrfolio));

      if (definitiveApplied) {
        const definitiveAmount = this.getAmount(
          mergedFolios,
          definitiveApplied
        );
        response.setPaymentAmount(definitiveAmount);
      }
    }

    return response;
  }

  /**
   * Compute the amount from folio list
   * @param folioList - The list of folios object
   * @param appliFilter - Flag to filter the folio list
   * @returns
   */
  private getAmount(folioList: Folio[], appliFilter = false): number {
    let folios = folioList.slice();
    if (appliFilter) {
      folios = folioList.filter((folio) => folio.TxrabonoD === "true");
    }
    const value = folios.reduce((acc, current) => {
      const amount =
        current?.Txrmonto === " " ? 0 : (current.Txrmonto as any) * 1;
      return acc + amount;
    }, 0);
    return value;
  }

  /**
   * Transform the sevice manager response into a simpler object
   * @param serviceResponse - the service manager response
   * @returns object with specific data from response
   */
  public getResponseInfo(serviceResponse: any): ResponseInfo {
    const nationalFolios = this.filterFolios(
      serviceResponse.wvrinboxrn.folioNacional
    );

    const internationalFolios = this.filterFolios(
      serviceResponse.wvrinboxrn.folioInternacional
    );

    const folios = nationalFolios.concat(internationalFolios);
    // abono temploral
    const temporaryApplied = folios.some((folio) => folio.TxrabonoT === "true");
    // abono definitivo
    const definitiveApplied = folios.some(
      (folio) => folio.TxrabonoD === "true"
    );

    return {
      nationalFolios,
      internationalFolios,
      mergedFolios: folios,
      temporaryApplied,
      definitiveApplied,
      Apto: serviceResponse?.wvrinboxrn?.Apto,
      AptoDefinitivo: serviceResponse?.wvrinboxrn?.AptoDefinitivo,
    };
  }

  /**
   * Delete elements that no contains folio value
   * @param list - List of folios
   * @returns
   */
  private filterFolios(list: Folio[]): Folio[] {
    if (!list) {
      return [];
    }
    return list.filter((folio) => folio && folio.Txrfolio !== " ");
  }

  /**
   * validate Service Mannager Handler
   *
   * @param {*} serviceResponse
   * @memberof UtilsTddService
   */
  validateSMHandler(serviceResponse: any) {
    // Check if the reponse is an error
    if (!_.isUndefined(serviceResponse.codigoMensaje)) {
      if (serviceResponse.codigoMensaje === "MSG-001") {
        this.dataService.handleError("", { name: serviceResponse.mensaje });
      }
    }
    if (serviceResponse.status === "Error") {
      this.dataService.handleError("", { name: serviceResponse.status });
    }
  }

  /**
   *
   * get Payment of the service mannager
   * @param {string[]} serviceResponseItem
   * @returns {*}
   * @memberof UtilsTddService
   */
  getPayment(serviceResponseItem: string[]): any {
    const find = _.find(serviceResponseItem, (item: any) => {
      return item.match(new RegExp(`^Abono: `));
    });
    if (!_.isUndefined(find)) {
      return find.split(": ")[1] !== "undefined" ? find.split(": ")[1] : null;
    }
    return null;
  }

  /**
   * get Folio Date of service mannager
   *
   * @param {string[]} serviceResponseItem
   * @param {string} v
   * @param {boolean} onlyNextBreach - To get the date by next_breach string
   * @returns {*}
   * @memberof UtilsTddService
   */
  getFolioDate(
    serviceResponseItem: string[],
    v: string,
    onlyNextBreach = false
  ): any {
    const find = _.find(serviceResponseItem, (item: any) => {
      const exp = new RegExp(
        onlyNextBreach ? "next_breach ==> " : `^${v} next_breach ==> `
      );
      return item.match(exp);
    });
    if (!_.isUndefined(find)) {
      return moment(find.split("==> ")[1], "DD/MM/YYYY HH::mm:ss");
    }
    return null;
  }

  /**
   * get the greater Date Value
   *
   * @param {*} international
   * @param {*} national
   * @returns {*}
   * @memberof UtilsTddService
   */
  greaterDateValue(international, national): any {
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
   * get  all folios clarificaded
   *
   * @param {string[]} serviceResponseItem
   * @param {string} folioType
   * @returns {*}
   * @memberof UtilsTddService
   */
  getFolio(serviceResponseItem: string[], folioType: string): any {
    const find = _.find(serviceResponseItem, (item: any) => {
      return item.match(new RegExp(`^${folioType}: `));
    });
    if (!_.isUndefined(find)) {
      if (find.split(": ")[1].includes(" ")) {
        let a = 0;
        let tempFolio = "";
        const arrayFolio = find.split(": ")[1].split(" ");
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
   * get extract Folio array
   *
   * @param {*} tempFolio
   * @returns
   * @memberof UtilsTddService
   */
  extractFolio(tempFolio) {
    let tempArray = [];
    if (tempFolio !== null) {
      tempFolio.includes("|")
        ? (tempArray = tempFolio.split("|"))
        : tempArray.push(tempFolio);
    }
    return tempArray;
  }

  /**
   * concat Array of folios clarificaded
   *
   * @param {*} origin
   * @param {*} toConcat
   * @returns
   * @memberof UtilsTddService
   */
  concatArray(origin, toConcat) {
    toConcat.forEach((element) => {
      origin.push(element);
    });
    return origin;
  }

  /**
   * get the Headers of the Request
   *
   * @returns
   * @memberof UtilsTddService
   */
  public getHeadersRequest() {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
    };
    return httpOptions;
  }

  /**
   * Constants collection of the clarifications module
   *
   * @returns {object}
   * @memberof UtilsTddService
   */
  constants(): object {
    return {
      STORAGE: {
        CHANNEL: "chanel",
        SM_RESPONSE: "SMResponse",
        QUESTION_ID: "questionId",
      },
      LABELS: {
        PAYMENT_AMOUNT: "Monto abonado",
        PAYMENT_DESCRIPTION: "Hemos realizado un abono temporal a su tarjeta",
        CLARIFICATION_AMOUNT: "Monto de la aclaración",
        CLARIFICATION_REGISTER: "Hemos dado de alta su aclaración",
        SUPERMOBILE: "SuperMóvil",
        SUPERWALLET: "SuperWallet",
        NATIONAL_FOLIO: "FOLIO NACIONAL",
        INTERNATIONAL_FOLIO: "FOLIO INTERNACIONAL",
        FOLIO_NUMBER: "NÚMERO DE FOLIO",
        RECEIPT_CORRECT_AMOUNT: "receiptCorrectAmount",
        RECEIPT_RECOGNIZED: "receiptRecognized",
        RECEIPT_PAYMENT: "receiptPayment",
        RECEIPT_RETURN: "receiptReturn",
        LETTER_VOUCHER: "letterVoucher",
        VOUCHER_CANCEL: "voucherCancel",
        FORMART_BCOM: "formartBCOM",
        INE_FORMART: "INEFormart",
        CURP_FORMART: "CURPFormart",
        RECEIPT_CORRECT_AMOUNT_DOC:
          "Comprobante de compra con el importe correcto de la transacción realizada.",
        RECEIPT_RECOGNIZED_DOC:
          "Comprobante de compra con el importe del (los) cargo(s) que sí reconoce.",
        RECEIPT_PAYMENT_DOC: "Comprobante que demuestre el pago al comercio.",
        RECEIPT_RETURN_DOC:
          "Comprobante de devolución emitido por el comercio.",
        LETTER_VOUCHER_DOC:
          "Carta firmada que contenga el detalle de lo sucedido.",
        LETTER_VOUCHER_COPY:
          "Copia del comprobante con la fecha de entrega comprometida por el comercio.",
        VOUCHER_CANCEL_DOC: "Comprobante o folio de cancelación.",
        FORMART_BCOM_DOC:
          "Formato BCOM-488 que enviaremos al correo que tenemos registrado.",
        INE_FORMART_DOC:
          "Copia de su identificación oficial (por ambos lados).",
        CURP_FORMART_DOC: "Copia de su CURP.",
      },
    };
  }

  /**
   * Get the year and the month between a date rante
   * the output in format YYYY-MM
   * @param {Moment} start - The start date
   * @param {Moment} end - end date
   * @returns
   */
  public getYearMonthByRange(
    start: moment.Moment,
    end: moment.Moment
  ): string[] {
    const months: string[] = [];
    let month = 0;

    while (
      start.isBefore(end) ||
      start.format(DateFormat.YYYY_MM_DD) === end.format(DateFormat.YYYY_MM_DD)
    ) {
      end = end.subtract(month, "month");

      months.push(end.format(DateFormat.YYYY_MM));
      if (month === 0) {
        month++;
      }
    }
    return months;
  }

  /**
   * Returns a list of months from the current
   * @param monthNumber
   */
  public getMonthsByNumber(monthNumber: number): string[] {
    const months: string[] = [];
    for (let index = 0; index < monthNumber; index++) {
      const currentDate = moment().subtract(index, "month");
      months.push(currentDate.format(DateFormat.YYYY_MM));
    }
    return months;
  }

  /**
   * Create a new array by month with moves that belongs to the month and year
   * @param {any[]} input - The array to classify
   * @param {string[]} months  - Months to evaluate
   * @returns
   */
  public separateByMonth(input: any[], months: string[]): any[] {
    const array: any[] = [];
    months.forEach((month) => {
      const filter = input.filter(
        ({ acctTrnInfo }) =>
          moment(acctTrnInfo.origDt || acctTrnInfo.postedDt).format(
            DateFormat.YYYY_MM
          ) === month
      );
      array.push(filter);
    });

    return array;
  }

  /**
   * Will push a new movement anf classify it by date
   * @param current
   * @param move
   * @returns
   */
  public classifyMoves(current: any[], move: any): any[] {
    const result = current;
    const index = result.findIndex(
      ({ key }) =>
        moment(key).format(DateFormat.YYYY_MM_DD) ===
        moment(move.date).format(DateFormat.YYYY_MM_DD)
    );

    if (index !== -1) {
      const value = result[index].value || [];
      result[index].value = [...value, move];
    } else {
      result.push({
        key: move.date,
        value: [move],
      });
    }
    return result;
  }

  /**
   * Hide cancelled movements MXSLCUSTSE-10044
   * @param {any} movementList - The movement list
   * @returns {any[]}
   */
  public movementsFilter(movementList: any[]): any[] {
    return [
      ...movementList.filter((movement) => {
        return movement.acctTrnInfo?.trnType?.cancelledInd === "false";
      }),
    ];
  }

  private get isLikeU(): boolean {
    const plus: MoveModel[] = this.st.get("multifolio") as [];

    let addExtract = false;
    if (plus && plus.length > 0) {
      const [move] = plus;
      addExtract = move.txrTipoFactura === CashBack.LIKEU;
    }
    return addExtract;
  }

  /**
   * Tranforms a string date to YYYY-MM-DD format
   * @param date
   * @returns
   */
  public dateToYYYYMMDD(date: string): string {
    const year = date.substring(6, 10);
    const month = date.substring(0, 2);
    const day = date.substring(3, 5);
    return `${year}-${month}-${day}`;
  }

  /**
   *
   * get Payment of the service mannager
   * @param {string[]} serviceResponseItem
   * @returns {*}
   * @memberof UtilsTddService
   */
  public getTypePayment(serviceResponseItem: string[]): any {
    const find = _.find(serviceResponseItem, (item: any) => {
      return item.match(new RegExp(`^TipoAbono: `));
    });
    if (!_.isUndefined(find)) {
      return find.split(": ")[1] !== "undefined" ? find.split(": ")[1] : null;
    }
    return null;
  }

  /**
   *
   * get Payment of the service mannager
   * @param {string[]} serviceResponseItem
   * @returns {*}
   * @memberof UtilsTddService
   */
  public getPaymentAmount(serviceResponseItem: string[]): any {
    const find = _.find(serviceResponseItem, (item: any) => {
      return item.match(new RegExp(`^MontoAbono: `));
    });
    if (!_.isUndefined(find)) {
      return find.split(": ")[1] !== "undefined" ? find.split(": ")[1] : null;
    }
    return null;
  }

  public clearData(): void {
    this.st.remove("questionnaire");
    this.st.remove("questionId");
    this.st.remove("multifolio");
    this.st.remove("viewQuestions");
    this.st.remove("SMResponse");
    this.st.remove("BlockModel");
    this.st.remove("editFlow");
    this.st.remove("isCashbackFlow");
    this.st.remove("additionaldata");
    this.st.remove("location");
    this.st.remove("subcategory");
    this.st.remove("cashbackTicket");
  }

  public toMoment(date: string): Moment {
    if (!date || !moment(date, DateFormat.DD_MM_YYYY_HH_MM_SSV2).isValid()) {
      return null;
    }
    return moment(date, DateFormat.DD_MM_YYYY_HH_MM_SSV2);
  }
}
