import { HistoryModel } from './history.model';

/**
 * HistoryList object used in the history component.
 *
 * @export
 * @class HistoryListModel
 */
export class HistoryListModel {
  public indexedDate: string;
  public historyList: Array<HistoryModel> = [];

  /**
   * Creates an instance of HistoryListModel.
   * @param {string} date
   * @param {Array<HistoryModel>} list
   * @memberof HistoryListModel
   */
  constructor(date: string, list:Array<HistoryModel>){
    this.indexedDate = date;
    this.historyList = list;
  }
}
