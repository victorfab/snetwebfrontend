import moment from 'moment';
import { MoveType } from '../enums/move-type.enum';

/**
 * Move object used by the welcome component.
 *
 * @export
 * @class MoveModel
 */
export class MoveModel {
  public id = '';
  public desc = '';
  public amount = 0;
  public currency = '';
  public date = '';
  public parsedDate = '';
  public period = '';
  public typeDate = new Date();

  // Multifolio movimientos
  public txrCodigoCom = '';
  public txrComercio = '';
  public txrDivisa = '';
  public txrFecha = '';
  public txrHrTxr = '';
  public txrModoEntrada = '';
  public txrMonto = '';
  public txrMovExtracto = '';
  public txrNumExtracto = '';
  public txrReferencia = '';
  public txrSucursalAp = '';
  public txrTipoFactura = '';
  public txrPAN = '';
  public txrClacon = '';
  public txrRefEmisor = '';
  public statusReverso = '';
  public type: MoveType | null = null;
  public currencyType = '';
  public status = '';

  /**
   * Creates an instance of MoveModel.
   * @param {string} _id
   * @param {string} _desc
   * @param {string} _amount
   * @param {string} _date
   * @param {string} _period
   * @param {string} _txrCodigoCom
   * @param {string} _txrComercio
   * @param {string} _txrDivisa
   * @param {string} _txrFecha
   * @param {string} _txrHrTxr
   * @param {string} _txrModoEntrada
   * @param {string} _txrMonto
   * @param {string} _txrSucursalAp
   * @param {string} _txrMovExtracto
   * @param {string} _txrNumExtracto
   * @param {string} _txrReferencia
   * @param {string} _txrTipoFactura
   * @param {string} _txrPAN
   * @memberof MoveModel
   */
  constructor(
    _id: string,
    _desc: string,
    _amount: string,
    _date: string,
    _period:string,
    _txrCodigoCom:string,
    _txrComercio: string,
    _txrDivisa: string,
    _txrFecha: string,
    _txrHrTxr: string,
    _txrModoEntrada: string,
    _txrMonto: string,
    _txrSucursalAp: string,
    _txrMovExtracto: string,
    _txrNumExtracto: string,
    _txrReferencia: string,
    _txrTipoFactura: string,
    _txrPAN: string,
    _typeDate?:Date,
    _txrClacon?:string,
    _txrRefEmisor?:string,
    _statusReverso?:string) {

    this.id             = _id;
    this.desc           = _desc;
    this.amount         = parseFloat(_amount.replace(',', ''));
    this.currency       = this.getCurrencyAmount(this.amount);
    this.date           = _date;
    this.parsedDate     = moment(_date, 'MM-DD-YYYY', 'es').toString();
    this.period         = _period;
    this.txrCodigoCom   = _txrCodigoCom;
    this.txrComercio    = _txrComercio;
    this.txrDivisa      = _txrDivisa;
    this.txrFecha       = _txrFecha;
    this.txrHrTxr       = _txrHrTxr;
    this.txrModoEntrada = _txrModoEntrada;
    this.txrMonto       = _txrMonto;
    this.txrSucursalAp  = _txrSucursalAp;
    this.txrMovExtracto = _txrMovExtracto;
    this.txrNumExtracto = _txrNumExtracto;
    this.txrReferencia  = _txrReferencia;
    this.txrTipoFactura = _txrTipoFactura;
    this.txrPAN = _txrPAN;
    this.typeDate = _typeDate;
    this.txrClacon = _txrClacon;
    this.txrRefEmisor = _txrRefEmisor;
    this.statusReverso = _statusReverso;
  }

  /**
   * Get the currency formatted amount.
   *
   * @param {number} n
   * @returns {string}
   * @memberof MoveModel
   */
  public getCurrencyAmount(n: number): string {
    let res: string = n.toFixed(2).replace(/./g, (c, i, a) => {
        return i && c !== '.' && ((a.length - i) % 3 === 0) ? ',' + c : c;
    });
    return res;
  }
}
