import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ArrowType } from "../../enums/arrow-type.enum";
import { MoveItem } from "../../interfaces/move-item.interface";

@Component({
  selector: "app-move-item",
  template: `
    <div 
      [ngClass]="{'no-events': !selectable}"
      class="move-item"
      (click)="toggle()">
      <i
        class="move-item__icon"
        [ngClass]="{
          'icon-add': type === arrowType.UP,
          'icon-arrow-down': type === arrowType.DOWN,
          'icon-clear': type === arrowType.CLEAR,
          'selected-item': selected
        }"
      ></i>
      <div class="move-item__box">
        <div class="move-item__box__wrap">
          <span
            class="move-item__description"
            appHighlight
            [word]="description"
            [query]="searchWord"
          >
            {{ description }}
          </span>
          <span class="move-item__amount" [innerHTML]="amount | customCurrency">
          </span>
        </div>
      </div>
    </div>
  `,
})
export class MoveItemComponent {
  @Input() selectable = true;
  @Input() description = "";
  @Input() amount = "";
  @Input() fullMove: MoveItem<any>;
  @Input() type: ArrowType = ArrowType.UP;
  @Input() searchWord = "";
  @Input() selected = false;
  @Output() selectedMove: EventEmitter<any> = new EventEmitter();

  public arrowType = ArrowType;

  public toggle(): void {
    this.selected = !this.selected;
    if (this.fullMove) {
      this.fullMove.selected = this.selected;
    }
    this.selectedMove.emit(this.fullMove);
  }
}
