import moment from "moment";

/**
 *
 *
 * @export
 * @class HistoryModel
 */
export class HistoryModel {
  public IncidentID: string;
  public Category: string;
  public Subcategory: string;
  public OpenTime: string;
  public FechaCompromiso: string;
  public Open: string;
  public ResolutionCode: string;
  public CoseTime: string;
  public CauseCode: string;
  public Numero3: string;
  public IndexedDate: string;
  public codeClass = "orange";
  public status = "En proceso";
  private _folioP = "";

  /**
   * Format values.
   *
   * @memberof HistoryModel
   */
  public formatValues() {
    this.OpenTime = this.applyDateFormat(this.OpenTime);
    this.FechaCompromiso = this.applyDateFormat(this.FechaCompromiso);
    this.CoseTime = this.applyDateFormat(this.CoseTime);
    this.IndexedDate = moment(this.OpenTime, "DD/MM/YYYY")
      .format("YYYY-MM")
      .toString();
    // TODO: Format the category
    // this.Category = this.formatCategory(this.Category);

    if (this.Open?.toLowerCase() === "closed") {
      this.status = "Cerrado";
      if (this.CauseCode !== null) {
        this.getResolutionColor();
      }
    }
  }

  /**
   * Format category.
   *
   * @param {string} category
   * @returns {string}
   * @memberof HistoryModel
   */
  public formatCategory(category: string): string {
    switch (category) {
      case "TARJETA DE CREDITO TARJETAHABIENTES":
        category = "TARJETA DE CREDITO";
        break;
      default:
    }
    return category;
  }

  /**
   * Get the resolution color of the movement.
   *
   * @memberof HistoryModel
   */
  public getResolutionColor(): void {
    if (
      this.CauseCode.toLowerCase().lastIndexOf("favor del banco") > -1 ||
      this.CauseCode.toLowerCase().lastIndexOf("improcedente") > -1
    ) {
      this.codeClass = "grey";
    } else if (
      this.CauseCode.toLowerCase().lastIndexOf("favor del cliente") > -1 ||
      this.CauseCode.toLowerCase().lastIndexOf("atendido") > -1 ||
      this.CauseCode.toLowerCase().lastIndexOf("procedente") > -1
    ) {
      this.codeClass = "softgreen";
    } else {
      this.codeClass = "black";
    }
    if (this.CauseCode.toLowerCase() === "declinado") {
      this.status = "DECLINADO";
      this.codeClass = "red";
    }
  }

  /**
   * Apply date format.
   *
   * @param {string} v
   * @returns {string}
   * @memberof HistoryModel
   */
  public applyDateFormat(v: string): string {
    let res = "";
    if (v) {
      let val: string = v.substr(0, 10);
      res = moment(val, "YYYY-MM-DD").format("DD/MM/YYYY").toString();
    }
    return res;
  }

  /**
   * return the folio P for pre folio
   */
  public get folioP(): string {
    return this._folioP;
  }

  /**
   * set the folio p for pre folio flow
   */
  public set folioP(input: string) {
    this._folioP = input;
  }
}
