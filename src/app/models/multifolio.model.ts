/**
 * Multifolio object used on the clarification request.
 *
 * @export
 * @class MultifolioModel
 */
export class MultifolioModel {
  /**
   *
   * the AcctTrnId the id of movement
   * @type {string}
   * @memberof MultifolioModel
   */
  public AcctTrnId: string;
  /**
   *
   * the AcctStmtId the extract of movement
   * @type {string}
   * @memberof MultifolioModel
   */
  public AcctStmtId: string;

  public Date?: string;
}
