/**
 * State object used in the questionarie.
 *
 * @export
 * @class StateModel
 */
export class StateModel {
  public clave = 0;
  public nombre = '';

  /**
   * Creates an instance of StateModel.
   * @param {number} _id
   * @param {string} _desc
   * @memberof StateModel
   */
  constructor(_id: number, _desc: string) {
    this.clave  = _id;
    this.nombre = _desc;
  }
}
