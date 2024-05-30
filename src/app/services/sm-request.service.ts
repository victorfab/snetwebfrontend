import { Injectable, inject } from "@angular/core";
import {
  AnswersQuestionsModel,
  CreditCardFullDataModel,
  MoveModel,
  MultifolioModel,
} from "../models";
import { DataProxyService } from "./data-proxy.service";
import { SessionStorageService } from "angular-web-storage";
import * as _ from "lodash";
import { MoveType } from "../enums/move-type.enum";
import { MoveItem } from "../interfaces/move-item.interface";
import * as moment from "moment";
import { DateFormat } from "../enums/date-format.enum";
import { FlowsService } from "./navigation.service/flows.service";

@Injectable({
  providedIn: "root",
})
export class SmRequestService {
  private proxy = inject(DataProxyService);
  private session = inject(SessionStorageService);
  private flows = inject(FlowsService);

  private questionnarie = [];

  public getRequest(): any {
    this.questionnarie = this.session.get("questionnarie") || [];

    let fullccdata: CreditCardFullDataModel =
      this.proxy.getCreditCardFullData();

    const description = this.questionnarie.find(
      (question) => question.name === "description"
    );

    const place = this.questionnarie.find(
      (question) => question.name === "place"
    );

    let stateId = "33";
    if (place.value === "mx") {
      const state = this.questionnarie.find(
        (question) => question.name === "state"
      );
      stateId = state.value;
    }

    const defaultValues: any = {
      Categoria: "SERVICIOS TARJETA DE CREDITO",
      Descripcion: [description?.value || ""],
      EntidadFed: stateId,
      Subcategoria: "",
      VisaCarta: this.applyVISARule(fullccdata),
      cuestionario: this.getAnswers(),
      multifolio: this.getMultifolioModel(),
      FechaRobada: "",
    };

    const option = this.session.get("serviceOption") as MoveType;
    switch (option) {
      case MoveType.COMPRA:
      case MoveType.COMISION:
      case MoveType.SEGURO:
        defaultValues.Subcategoria = "BONIFICACION";
        break;
      case MoveType.CORRPROM: // 205 209
        defaultValues.Subcategoria = "CORRECCION POR PROMOCION";
        defaultValues.Descripcion = ["CORRECCION POR PROMOCION"];
        break;
      case MoveType.CORRPROMLINEX_AMOR: // 214
      case MoveType.CORRPROMLINEX_PMEN: // 210
        defaultValues.Subcategoria = "CORRECCION POR PROMOCION LINEA EXPRESS";
        defaultValues.Descripcion = ["CORRECCION POR PROMOCION LINEA EXPRESS"];
        const questionValue: string =
          defaultValues?.cuestionario[0]?.Respuestas;
        if (questionValue.includes("EL SALDO PENDIENTE")) {
          defaultValues.cuestionario[0].Respuestas = "SALDO PENDIENTE";
        }
        const payments =
          this.session.get("payments") || []; /*as MoveItem<any>[]*/
        const pagos: MoveModel[] = [];
        payments.forEach((item) => {
          this.flows.paymentsMoveModel.forEach((move) => {
            if (move.id === item.fullItem.acctTrnId) {
              pagos.push(move);
            }
          });
        });
        const multifolioPayments = this.getMultifolioModelPayments(pagos);
        defaultValues.pagos = multifolioPayments;

        break;
    }
    return { wvrinboxrn: defaultValues };
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
      _.each(this.proxy.getDataSelected(), (item: MoveModel) => {
        if (item.txrTipoFactura === "1003" && Number(item.txrMonto) >= 400) {
          r = "true";
        }
      });
    }
    return r;
  }

  private getAnswers(): AnswersQuestionsModel[] {
    const result: AnswersQuestionsModel[] = [];
    let questions: any[] = this.session.get("questionnarie");
    const questionsToDelete = ["place", "state"];

    //delete state
    questions = questions.filter(
      (question) => !questionsToDelete.includes(question.name)
    );

    questions.forEach((question) => {
      let quest: AnswersQuestionsModel = null;
      quest = {
        Preguntas: question.question,
        Respuestas: question.stringValue
          ? question.stringValue
          : question.value,
      };
      result.push(quest);
    });
    return result;
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
    _.each(this.proxy.getDataSelected(), (item: MoveModel) => {
      let objmultifolio = new MultifolioModel();
      objmultifolio.AcctTrnId = item.id;
      objmultifolio.AcctStmtId = item.txrNumExtracto;
      objmultifolio.Date = moment(item.date, DateFormat.DD_MM_YYYY).format(
        "YYYY-MM"
      );
      multifolio.push(objmultifolio);
    });
    return multifolio;
  }

  public getDefferRequest(optionSelected: AnswersQuestionsModel): any {
    this.questionnarie = this.session.get("questionnarie") || [];

    let obj: any = {};
    let fullccdata: CreditCardFullDataModel =
      this.proxy.getCreditCardFullData();

    const bsSelectedOption = this.session.get("BS_SELECTED");
    let wvrinboxrn: Object = {
      Categoria: "SERVICIOS TARJETA DE CREDITO",
      Descripcion: [bsSelectedOption || 'DIF_COM_MESES'],
      EntidadFed: "",
      Subcategoria: "CORRECCION POR PROMOCION",
      VisaCarta: this.applyVISARule(fullccdata),
      cuestionario: [optionSelected],
      multifolio: this.getMultifolioModel(),
      FechaRobada: "",
    };
    obj.wvrinboxrn = wvrinboxrn;
    return obj;
  }

  private getMultifolioModelPayments(payments) {
    let multifolio = [];
    payments.forEach((item: MoveModel) => {
      let objmultifolio = new MultifolioModel();
      objmultifolio.AcctTrnId = item.id;
      objmultifolio.AcctStmtId = item.txrNumExtracto;
      objmultifolio.Date = moment(item.date, DateFormat.DD_MM_YYYY).format(
        "YYYY-MM"
      );
      multifolio.push(objmultifolio);
    });
    return multifolio;
  }
}
