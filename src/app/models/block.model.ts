/**
 * Block object used in the modl window.
 *
 * @export
 * @class BlockModel
 */
export class BlockModel {
  /** If the user wants to get blocked */
  public wishBlock = true;
  /** Transaction result */
  public operationReposition: boolean;
  /** New card number */
  public panReposition = '';
  /** If the cancellation is success */
  public operationCancellation: boolean;
  /** Message if the cancellation is success */
  public operationCancellationMsg = '';
  /** Message if the reposition is success */
  public operationRepositionMsg = '';
}
