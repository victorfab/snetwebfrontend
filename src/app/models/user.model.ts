import moment from "moment";
import { ExtractModel } from "./extract.model";
import * as _ from "lodash";

/**
 * User object used in the preloader, welcome and summary component.
 *
 * @export
 * @class UserModel
 */
export class UserModel {
  public buc = "";
  public name = "";
  public cardNumber = "";
  public creditLimit = 0;
  public balance = 0;
  public minPayment = 0;
  public percentile = "";
  public cardName = "";
  public cutoff = "";
  public extracts: Array<ExtractModel> = [];
  private _originalExtracts: any[] = [];

  /**
   * Creates an instance of UserModel.
   * @param {string} _buc
   * @param {string} _name
   * @param {string} _cardNumber
   * @param {string} _creditLimit
   * @param {string} _balance
   * @param {string} _minPayment
   * @param {string} _cardName
   * @param {string} _cutoff
   * @param {Array<any>} _extracts
   * @param {boolean} _saveAllExtracts
   * @memberof UserModel
   */
  constructor(
    _buc: string,
    _name: string,
    _cardNumber: string,
    _creditLimit: string,
    _balance: string,
    _minPayment: string,
    _cardName: string,
    _cutoff: string,
    _extracts: Array<any>,
    _saveAllExtracts = false
  ) {
    this.buc = _buc;
    this.name = _name;
    this.cardNumber = _cardNumber;
    this.creditLimit = parseFloat(_creditLimit);
    this.balance = parseFloat(_balance);
    this.minPayment = parseFloat(_minPayment);
    this.cardName = _cardName;
    this.cutoff = _cutoff;
    this.originalExtracts = _extracts;
    let auxExtracts: Array<ExtractModel> = [];
    let con = 0;
    for (let i = 0; i < _extracts.length; i++) {
      _extracts[i].acctStmtId = parseInt(_extracts[i].acctStmtId);
    }
    let extractData: Array<ExtractModel> = _.orderBy(_extracts, [
      "acctStmtId",
    ]).reverse();

    if (!_saveAllExtracts) {
      extractData = extractData.slice(0, 4);
    }

    _.each(extractData, (v: any) => {
      if (v.acctStmtId) {
        auxExtracts.push(new ExtractModel(v.acctStmtId));
      }
    });

    if (auxExtracts.length > 0) {
      this.extracts = auxExtracts;
    }
    this.percentile = this.getUsedCreditPercentile();
  }

  /**
   * Get used credit percentile.
   *
   * @returns {string}
   * @memberof UserModel
   */
  public getUsedCreditPercentile(): string {
    let perc: number = (this.balance / this.creditLimit) * 100;
    return perc.toFixed(2).toString().concat("%");
  }

  /**
   * Get extract count.
   *
   * @returns
   * @memberof UserModel
   */
  public getExtractCount() {
    return this.extracts.length | 0;
  }

  public get originalExtracts(): any[] {
    return this._originalExtracts.slice(0, 4);
  }

  public set originalExtracts(input: any) {
    this._originalExtracts = input;
  }
}
