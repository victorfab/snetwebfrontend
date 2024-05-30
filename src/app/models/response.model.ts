/**
 * Response object used in the summary component.
 *
 * @export
 * @class ResponseModel
 */
export class ResponseModel {
  public CARD_SHOW_LIMIT = 4;
  public result = 501;
  public folio: string;
  public iFolio: string;
  public oldCard: string;
  public newCard: string;
  public totalAmount: number;
  public dateCommitment: string;
  public needsLetter = false;
  public cancelConfirmationNeeded = false;
  public name: string;
  public payment: string;
  public greater: any;
  public internationalFolio: string;
  public nationalFolio: string;
  public atmFolio: string;
  public amount: number;
  public currentDate: string;
  public visaCard: string;
  private _cashbackFolio: string;
  public type: string;
  public paymentAmount: number;
  public email: string;
  /**
   * Abono definitivo
   */
  private _definitive = false;
  /**
   * Abono temporal
   */
  private _temporary = false;

  public get temporary(): boolean {
    return this._temporary;
  }

  public set temporary(value: boolean) {
    this._temporary = value;
  }

  public get definitive(): boolean {
    return this._definitive;
  }

  public set definitive(value: boolean) {
    this._definitive = value;
  }

  /**
   * Set date commitment.
   *
   * @param {string} v
   * @memberof ResponseModel
   */
  public setVisaCard(v: string): void {
    this.visaCard = v;
  }

  /**
   * Get date of the commitment.
   *
   * @returns {string}
   * @memberof ResponseModel
   */
  public getVisaCard(): string {
    return this.visaCard;
  }

  /**
   * Set the date of the commitment.
   *
   * @param {string} v
   * @memberof ResponseModel
   */
  public setDateCommitment(v: string): void {
    this.dateCommitment = v;
  }

  /**
   * Get the date commitment.
   *
   * @returns {string}
   * @memberof ResponseModel
   */
  public getDateCommitment(): string {
    return this.dateCommitment;
  }

  /**
   * Set the old card.
   *
   * @param {string} v
   * @memberof ResponseModel
   */
  public setOldCard(v: string): void {
    const l: number = v.length;
    this.oldCard = v.substring(l - this.CARD_SHOW_LIMIT, l);
  }

  /**
   * Set payment.
   *
   * @param {string} v
   * @memberof ResponseModel
   */
  public setPayment(v: string): void {
    this.payment = v;
  }

  /**
   * Set the greater date.
   *
   * @param {*} v
   * @memberof ResponseModel
   */
  public setGreaterDate(v: any, format = null): void {
    let value = null;
    if (v && v !== "Invalid date") {
      const defaultFormat = "DD [de] MMMM [de] YYYY";
      value = v.format(Boolean(format) ? format : defaultFormat);
    }
    this.greater = value;
  }

  /**
   * Get the greater date.
   *
   * @returns {*}
   * @memberof ResponseModel
   */
  public getGreaterDate(): any {
    return this.greater;
  }

  /**
   * Set the international folio.
   *
   * @param {*} v
   * @memberof ResponseModel
   */
  public setInternationalFolio(v: any): void {
    this.internationalFolio = v;
  }

  /**
   * Get the international folio.
   *
   * @returns {string}
   * @memberof ResponseModel
   */
  public getInternationalFolio(): string {
    return this.internationalFolio;
  }

  /**
   * Set the national folio.
   *
   * @param {*} v
   * @memberof ResponseModel
   */
  public setNationalFolio(v: any): void {
    this.nationalFolio = v;
  }

  /**
   * Get the international folio.
   *
   * @returns {string}
   * @memberof ResponseModel
   */
  public getAtmFolio(): string {
    return this.atmFolio;
  }

  /**
   * Set the national folio.
   *
   * @param {*} v
   * @memberof ResponseModel
   */
  public setAtmFolio(v: any): void {
    this.atmFolio = v;
  }

  /**
   * Get the national folio.
   *
   * @returns {string}
   * @memberof ResponseModel
   */
  public getNationalFolio(): string {
    return this.nationalFolio;
  }

  /**
   * Set the amount.
   *
   * @param {number} v
   * @memberof ResponseModel
   */
  public setAmount(v: number): void {
    this.amount = v;
  }

  /**
   * Set the current date.
   *
   * @param {string} v
   * @memberof ResponseModel
   */
  public setCurrentDate(v: string): void {
    this.currentDate = v;
  }

  /**
   * Set the new card.
   *
   * @param {string} v
   * @memberof ResponseModel
   */
  public setNewCard(v: string): void {
    const l: number = v.length;
    this.newCard = v.substring(l - this.CARD_SHOW_LIMIT, l);
  }

  /**
   * Set the name.
   *
   * @param {string} v
   * @memberof ResponseModel
   */
  public setName(v: string) {
    const aux = v.replace("/", " ");
    this.name = aux;
  }

  /**
   * Set the result.
   *
   * @param {number} v
   * @memberof ResponseModel
   */
  public setResult(v: number): void {
    this.result = v;
  }

  /**
   * Get the result.
   *
   * @returns {number}
   * @memberof ResponseModel
   */
  public getResult(): number {
    return this.result;
  }

  /**
   * Get Total Amount.
   *
   * @param {number} v
   * @memberof ResponseModel
   */
  public setTotalAmount(v: number): void {
    this.totalAmount = v;
  }

  /**
   * Get Total Amount.
   *
   * @returns {number}
   * @memberof ResponseModel
   */
  public getTotalAmount(): number {
    return this.totalAmount;
  }

  public get cashbackFolio(): string {
    return this._cashbackFolio;
  }

  public set cashbackFolio(v: string) {
    this._cashbackFolio = v;
  }

  public setTypePayment(v: string) {
    this.type = v;
  }

  public setPaymentAmount(v: number) {
    this.paymentAmount = v;
  }
  /* Codes
    301, // Clarification approved
    401, // Clarification denied
    501, // Clarification queued
    601  // User request for later
  */

    /**
   * Set date commitment.
   *
   * @param {string} v
   * @memberof ResponseModel
   */
    public setEmail(v: string): void {
      this.email = v;
    }

    /**
     * Get date of the commitment.
     *
     * @returns {string}
     * @memberof ResponseModel
     */
    public getEmail(): string {
      return this.email;
    }
}
