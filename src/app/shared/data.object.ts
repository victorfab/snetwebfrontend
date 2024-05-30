import { Injectable } from '@angular/core';
import { MoveModel } from './../models';

/**
 * Data object Class to auxiliar in the app
 *
 * @export
 * @class DataObject
 */
@Injectable({
  providedIn: 'root'
})
export class DataObject {

  public filteredData = {};
  public filteredDataAtm = {};
  private rawData = {};
  private dataSource = Array<MoveModel>();

  /**
   * Get the current data
   *
   * @returns {any}
   */
  public getCurrentData(): any {
    return this.rawData;
  }

  /**
   * Set current data
   *
   * @param val {any}
   * @returns {void}
   */
  public setCurrentData(val: any): void {
    this.rawData = val;
  }

  /**
   * Get the selected movements
   *
   * @returns {any}
   */
  public getSelectedMoves(): any {
    const c = JSON.parse(localStorage.getItem('dataSource'));
    if (c) {
      this.dataSource = c;
    }
    return this.dataSource;
  }

  /**
   * Set the selected movements
   *
   * @param val {Array<MoveModel>}
   * @returns {void}
   */
  public setSelectedMoves(val: Array<MoveModel>): void {
    this.dataSource = val;
    localStorage.setItem('dataSource', JSON.stringify(val));
  }
/**
 *Removes the move sin the local storage
 *
 * @memberof DataObject
 */
public clearSelectedMoves() {
    localStorage.removeItem('dataSource');
  }
}
