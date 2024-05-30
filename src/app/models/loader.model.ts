/**
 * Loader object used in the modal window.
 *
 * @export
 * @class LoaderModel
 */
export class LoaderModel {
  public defaultMessage = 'Espere unos segundos, favor de no salir de la aplicación estamos procesando su información';
  public message: string = this.defaultMessage;

  constructor(message = '') {
    if (message) {
      this.message = message;
    }
  }

  /**
   * Gets the message.
   *
   * @returns {string}
   * @memberof LoaderModel
   */
  public getMessage(): string {
    return this.message;
  }

  /**
   * Sets the message.
   *
   * @param {string} value
   * @memberof LoaderModel
   */
  public setMessage(value: string): void {
    this.message = value;
  }
}
