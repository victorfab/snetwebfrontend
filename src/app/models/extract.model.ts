import { MoveModel } from './move.model';

/**
 * Extract object used in the welcome component.
 *
 * @export
 * @class ExtractModel
 */
export class ExtractModel {
  public id = '';
  public moves: Array<MoveModel> = null;
  public movesATM : Array<MoveModel> = null;
  public payments: Array<MoveModel> = null;

  constructor(_id: string) {
    this.id = _id;
  }

  /**
   * Set the array of movements.
   *
   * @param {Array<MoveModel>} moves
   * @memberof ExtractModel
   */
  public setExtractMoves(moves: Array<MoveModel>): void {
    this.moves = moves;
  }

  /**
   * Get the array of movements.
   *
   * @returns {Array<MoveModel>}
   * @memberof ExtractModel
   */
  public getExtractMoves(): Array<MoveModel> {
    return this.moves;
  }

    /**
   * Set the array of movements.
   *
   * @param {Array<MoveModel>} moves
   * @memberof ExtractModel
   */
  public setExtractMovesATM(moves: Array<MoveModel>): void {
    this.movesATM = moves;
  }

  /**
   * Get the array of movements.
   *
   * @returns {Array<MoveModel>}
   * @memberof ExtractModel
   */
  public getExtractMovesATM(): Array<MoveModel> {
    return this.movesATM;
  }

   /**
   * Set the array of movements.
   *
   * @param {Array<MoveModel>} moves
   * @memberof ExtractModel
   */
   public setExtractPayments(moves: Array<MoveModel>): void {
    this.payments = moves;
  }

  /**
   * Get the array of movements.
   *
   * @returns {Array<MoveModel>}
   * @memberof ExtractModel
   */
  public getExtractPayments(): Array<MoveModel> {
    return this.payments;
  }
}
