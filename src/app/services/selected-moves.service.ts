import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DateFormat } from '../enums/date-format.enum';
import moment from 'moment';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SelectedMovesService {

  /**
   * To save and listen selected moves as array
   */
  private selectedMoves = new BehaviorSubject<any[]>([]);
  public selectedMoves$ = this.selectedMoves.asObservable();

  /**
   * To count and listen the selected moves count
   */
  private selectedCount = new BehaviorSubject<number>(0);
  public selectedCount$ = this.selectedCount.asObservable();

  /**
   * To listen which move has been deleted from the list
   */
  
  public deleted$: Subject<any> = new Subject();

  constructor() { }

  public setSelectedMoves(input: any[]): void {
    const data =  input = input.filter(move => move.value.length > 0);
    this.selectedMoves.next(_.orderBy(data, 'key', 'asc'));
  }

  public deleteMove(move: any): void {

    const index = this.selectedMoves.value.findIndex(({ key }) =>
      moment(key).format(DateFormat.YYYY_MM_DD) === moment(move.date).format(DateFormat.YYYY_MM_DD));

    let moves = [...this.selectedMoves.value];
    
    moves[index].value = moves[index].value.filter(({ id }) => id !== move.id);

    if (moves[index].value.length === 0) {
      moves.splice(index, 1);
    }

    this.decreaseCcounter();
    moves = moves.filter(move => move.value.length > 0);
    this.selectedMoves.next(moves);
    this.deleted$.next(move);
  }


  public increaseCounter(): void {
    this.selectedCount.next(this.selectedCount.value + 1);
  }

  public decreaseCcounter(): void {    
    this.selectedCount.next(this.selectedCount.value - 1);
  }

  public resetCounter(): void {
    this.selectedCount.next(0);
  }
}
