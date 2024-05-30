/**
 * Motive object used in the welcome component.
 *
 * @export
 * @class MotiveModel
 */
export class MotiveModel {

  /* Códigos
   * Prefijo D-: Default
   * 101 : Código default
   * Prefijo IC-: Tiene la tarjeta e interactuó con el comercio
   * 201 : Cargo duplicado
   * 202 : Monto alterado
   * 203 : Cargos adicionales al autorizado
   * 204 : Mercancías o servicios no proporcionados
   * 205 : Devolución no aplicada
   * 206 : Pago por otro medio
   * 207 : Cancelación de servicio
   * 208 : Otro
   */

  public key: string;
  public title: string;
  public description: string;
  public placeholder: string;
  public serviceManagerTranslation: string;

  /**
   * Creates an instance of MotiveModel.
   * @param {string} k
   * @param {string} t
   * @param {string} d
   * @param {string} p
   * @param {string} s
   * @memberof MotiveModel
   */
  constructor(k: string, t: string, d: string, p: string, s: string) {
    this.key = k;
    this.title = t;
    this.description = d;
    this.placeholder = p;
    this.serviceManagerTranslation = s;
  }
}
