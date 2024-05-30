import { Injectable } from "@angular/core";
import { SessionStorageService } from "../services/tdd/session-storage.service";
import { DataService } from "../services/data.service";
import { MoveModel, UserModel } from "../models";
import { DataProxyService } from "./data-proxy.service";
import { DataObject } from "../shared/data.object";
import moment from "moment";
import * as _ from "lodash";
import { LocalStorageService } from "angular-web-storage";
import { UtilsTddService } from "./tdd/utils-tdd.service";
import { Observable, delay, map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MovesService {
  public userData: UserModel;
  protected hiddenMovements = Array<MoveModel>();
  protected hiddenMovementsATM = Array<MoveModel>();
  public isMovementsVisible = false;
  public dateArraysQuantity = 0;
  protected ccData: any;
  public extract = 0;
  public dateArraysQuantityAtm = 0;
  public listMoves = [];
  public extractID = 0;

  constructor(
    private dataService: DataService,
    private dataProxyService: DataProxyService,
    private dataObject: DataObject,
    private storage: LocalStorageService,
    private utils: UtilsTddService
  ) {}

  /**
   * Get the first 20 movements of the credit card ordered by list.
   *
   * @private
   * @param {number} extractIndex
   * @memberof WelcomeComponent
   */
  public async getInitMovements(extractIndex: number): Promise<any> {
    if (extractIndex === undefined) {
      Promise.reject("no extract id provided");
    }
    return new Promise<any>((resolve, reject) => {
      this.userData = this.dataProxyService.getUserData();

      const isValid = Object.keys(this.dataProxyService.getCCData()).length > 0;
      this.ccData = isValid
        ? this.dataProxyService.getCCData()
        : this.storage.get("ccdata");

      const ID = String(extractIndex);
      this.getExtractId(extractIndex);
      const movements = this.dataService.getMovements(ID);

      movements.subscribe((response) => {
        response.acctTrnRecComercios = this.utils.movementsFilter(
          response.acctTrnRecComercios
        );
        this.listMoves = [];

        if (!_.isUndefined(response.acctTrnRecComercios)) {
          if (response.acctTrnRecComercios.length > 0) {
            this.listMoves = this.addMovements(response);
            this.listMoves = _.sortBy(this.listMoves, "typeDate").reverse();
            const grouped = { ..._.groupBy([...this.listMoves], "date") };
            const dates = Object.keys(grouped);
            this.listMoves = dates.map((date) => ({
              key: date,
              value: grouped[date],
            }));
            resolve(this.listMoves);
          }
        }
      });
    });
  }

  /**
   * Get extract Id from an index.
   *
   * @private
   * @param {number} index
   * @returns
   * @memberof WelcomeComponent
   */
  private getExtractId(index: number): any {
    this.extractID = 0;
    this.userData.extracts.find((data) => {
      if (Number(data.id) === index) {
        return this.extractID;
      } else {
        this.extractID++;
      }
    });
  }

  /**
   * Add the movements from the response to the extract.
   *
   * @private
   * @param {*} extractIndex
   * @param {*} response
   * @memberof WelcomeComponent
   */
  private addMovements(response: any): any {
    this.userData.extracts[this.extractID].id;
    const moves: MoveModel[] = [];
    _.each(response.acctTrnRecComercios, (v: any) => {
      const dateStr: string = moment(v.acctTrnInfo.stmtDt, "YYYY-MM-DD").format(
        "MM-DD-YYYY"
      );
      const periodStr: string = moment(dateStr, "DD-MM-YYYY").format(
        "MMMM YYYY"
      );
      const fecha = this.formatDate(v.acctTrnInfo.stmtDt);
      const parsedStrDate = dateStr.split("-");
      const typedDate = moment(
        parsedStrDate[2] + "-" + parsedStrDate[0] + "-" + parsedStrDate[1]
      ).toDate();

      let obj: any = {
        amount: v.acctTrnInfo.totalCurAmt.amt.toString(),
        currency: v.acctTrnInfo.totalCurAmt.amt,
        date: dateStr,
        desc: v.acctTrnInfo.trnType.desc,
        id: v.acctTrnId,
        parsedDate: typedDate,
        period: periodStr,
        txrClacon: "",
        txrCodigoCom: v.acctTrnInfo.networkTrnData.merchNum,
        txrComercio: v.acctTrnInfo.networkTrnData.merchName,
        txrDivisa: v.acctTrnInfo.origCurAmt.curCode.curCodeValue,
        txrFecha: fecha,
        txrMonto: v.acctTrnInfo.totalCurAmt.amt,
        txrMovExtracto: v.acctTrnId,
        txrNumExtracto: this.userData.extracts[this.extractID].id,
        txrPAN: v.acctTrnInfo.cardRef.cardInfo.cardNum,
        txrRefEmisor: v.acctTrnInfo.salesSlipRefNum,
        txrReferencia: v.acctTrnInfo.trnType.trnTypeCode,
        txrSucursalAp:
          this.ccData.cardRec.cardInfo.acctRef.acctInfo.fiData.branchIdent,
        txrTipoFactura: v.acctTrnInfo.networkTrnData.posEntryCapability,
        typeDate: typedDate,
      };
      moves.push(obj);
    });
    return moves;
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
    return moment(v, "YYYY-MM-DD").format("YYYY-MM-DD").toString();
  }

  public pendingMoves(): Observable<any[]> {
    if (this.dataProxyService.getDummyMode()) {
      return this.dataService
        .dummyRequest("assets/data/pending-moves.json")
        .pipe(map((result) => result.acctTrnRecComerciosUnposted));
    } else {
      const url = "/unposted-moves/";
      return this.dataService
        .restRequest(url, "POST", null, "user", null, null, true)
        .pipe(map((result) => result.acctTrnRecComerciosUnposted));
    }
  }
}
