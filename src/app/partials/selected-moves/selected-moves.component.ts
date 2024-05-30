import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { ArrowType } from "../../enums/arrow-type.enum";
import { SelectedMovesService } from "../../services/selected-moves.service";
import { TooltipService } from '../../services/tooltip.service';

@Component({
  selector: "app-selected-moves",
  templateUrl: "./selected-moves.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedMovesComponent implements OnInit {
  @Input() chanelType = "default";

  @Input() set open(open: boolean) {
    this.isOpen = open;
    if (this.modal && open) {
      this.renderer.addClass(this.modal.nativeElement, "animate");
    } else if (this.modal && !open) {
      this.close();
    }
  }

  @Output() closed: EventEmitter<boolean> = new EventEmitter();

  @ViewChild("modal") modal!: ElementRef<HTMLDivElement>;

  public arrowType = ArrowType;

  public isOpen = false;

  constructor(
    private renderer: Renderer2,
    public moveService: SelectedMovesService,
    private tooltip: TooltipService
  ) {}

  ngOnInit(): void {}

    /**
   * muestra el lightbox del child tooltip
   * genera el mensaje del tooltip y lo pasa como parametro al child
   *
   * @param {*} evt
   * @param {*} id
   * @memberof WelcomeTddComponent
   */
     public showTooltip(evt: any, id) {
      this.tooltip.showTooltip(evt,id);
    }

  public close(): void {
    this.closed.emit(true);
    if (this.modal) {
      this.renderer.removeClass(this.modal.nativeElement, "animate");
      this.renderer.addClass(this.modal.nativeElement, "animateReverse");
      setTimeout(() => {
        this.renderer.removeClass(this.modal.nativeElement, "animateReverse");
      }, 700);
    }
  }
}
