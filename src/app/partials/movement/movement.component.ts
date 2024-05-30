import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  LocalStorageService,
  SessionStorageService,
} from "angular-web-storage";
import { Subscription } from "rxjs";
import { ArrowType } from "../../enums/arrow-type.enum";
import { SelectedMovesService } from "../../services/selected-moves.service";

interface MoveInput {
  value: any[];
}
@Component({
  selector: "app-movement",
  templateUrl: "./movement.component.html",
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovementComponent implements OnInit, OnDestroy {
  @Input() set data(input: MoveInput) {
    this.item = input;
    if (this.item) {
      this.item.value = this.item.value.map((element) => ({
        ...element,
        amount: this.removeSign(element.amount),
      }));
    }
  }
  /**
   * The date to paint at top
   * @Input
   */
  @Input() date: string = "";

  /**
   * The word to search in commerce name
   * @Input
   */
  @Input() searchFilter = "";

  /**
   * Tell to the component if the user can select multiple moves
   * @Input
   */
  @Input() multiple = false;

  /**
   * To set the elements as disabled
   */
  @Input() disabled = false;
  /**
   * The type of arrow in move selection
   */
  @Input() type: ArrowType = ArrowType.DOWN;

  /**
   * Will allow save clacon of the movement on selection
   */
  @Input() saveClaconOnSelection = false;

  /**
   * Evento to send the selected move
   */
  @Output() selectedMove: EventEmitter<any> = new EventEmitter();

  /**
   * To listen the external move unselection
   */
  @Input() listenUnselection = false;

  /**
   * If the multiple selection is disabled will unselect
   * the movements that are not in globalList
   * @Input
   */
  @Input() set globalSelected(globalList: string[]) {
    if (!this.multiple) {
      Object.keys(this.selectedMoves).forEach((id) => {
        if (!globalList.includes(id)) {
          delete this.selectedMoves[id];
        }
      });
    }
  }

  /**
   * Set the moves as selected
   */
  @Input() set preselect(moves: any[]) {
    if (moves) {
      
      const elements = this.item.value.map((value) => value);
      
      moves.forEach((item) => {
        const exist = elements.find((move) => move.id === item.id);
        if (exist) {
          this.select(item);
        }
      });
    }
  }

  @Input() pointerEvents = 'auto';

  @Input() cashbackFlow: string = "";

  public chanelType = "default";

  public item: MoveInput = null;

  /**
   * The map of selected moves
   */
  public selectedMoves: { [key: string]: any } = {};

  public arrowType = ArrowType;

  private subscription: Subscription;

  public preSelectedMoves: any;
  public bandFlow: string = "";

  constructor(
    private cdr: ChangeDetectorRef,
    private session: SessionStorageService,
    private moveService: SelectedMovesService,
    private storage: LocalStorageService
  ) {
    this.chanelType = this.storage.get("chanel");
  }

  ngOnInit(): void {
    if (this.saveClaconOnSelection) {
      this.session.remove("clacon");
    }

    if (this.listenUnselection) {
      this.subscription = this.moveService.deleted$.subscribe((move) => {
        if (move && this.selectedMoves && this.selectedMoves[move.id]) {
          delete this.selectedMoves[move.id];
          this.cdr.detectChanges();
        }
      });
    }
  }

  private removeSign(cant: any) {
    return Math.abs(cant);
  }

  public select(move: any): void {
    // this.cashbackService.saveLocalStorage('multifolio', move);
    if (this.type !== this.arrowType.CLEAR) {
      const exists = Boolean(this.selectedMoves && this.selectedMoves[move.id]);

      if (exists) {
        delete this.selectedMoves[move.id];
      } else {
        if (!this.multiple) {
          this.selectedMoves = {};
        }
        this.selectedMoves[move.id] = move;
      }
    }

    this.updateMoves();
    this.selectedMove.emit(move);
    this.cdr.detectChanges();
  }

  private updateMoves(): void {
    if (this.saveClaconOnSelection) {
      const items = Object.values(this.selectedMoves);
      this.session.set(
        "clacon",
        items.map((item) => item.txrTipoFactura)
      );
    }
  }

  public trackBy(index: number, move: any) {
    return move.id;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
