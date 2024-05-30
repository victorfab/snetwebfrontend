/**
 * Credit Card Full Data.
 *
 * @export
 * @class CreditCardFullDataModel
 */
export class CreditCardFullDataModel {
  public cardNumber: string;
  public buc: string;
  public account: string;
  public sucursalAp: string;
  public cardBrand: string;
  public userName: string;
  public balance: number;
  public creditLimit: number;
  public minPayment: number;
  public limit: number;
  public cutoffData: string;
  public cardType: string;
  public cardDesc: string;
  public cardProductID: number;

  /**
   * Creates an instance of CreditCardFullDataModel.
   * @param {string} _cn
   * @param {string} _buc
   * @param {string} _account
   * @param {string} _sucursalAp
   * @param {string} _cb
   * @param {string} _un
   * @param {number} _bl
   * @param {number} _mp
   * @param {string} _cd
   * @param {string} _ct
   * @param {number} _limit
   * @param {string} _cdesc
   * @param {number} [_cp=2]
   * @memberof CreditCardFullDataModel
   */
  constructor(
    _cn: string,
    _buc: string,
    _account: string,
    _sucursalAp: string,
    _cb: string,
    _un: string,
    _bl: number,
    _mp: number,
    _cd: string,
    _ct: string,
    _limit: number,
    _cdesc: string,
    _cp = 2
  ) {
    this.cardNumber = _cn;
    this.buc = _buc;
    this.account = _account;
    this.sucursalAp = _sucursalAp;
    this.cardBrand = _cb;
    this.userName = this.formatName(_un);
    this.balance = _bl;
    this.minPayment = _mp;
    this.cutoffData = _cd;
    this.cardType = _ct;
    this.creditLimit = _limit;
    this.cardDesc = _cdesc;
    this.cardProductID = _cp;
  }
  /**
   * Format the name of the user.
   *
   * @param {string} v
   * @returns {string}
   * @memberof CreditCardFullDataModel
   */
  public formatName(v: string): string {
    let res = '';
    if (!Boolean(v)) {
      return res;
    }
    res = v.replace('/', ' ');
    return res;
  }
}
