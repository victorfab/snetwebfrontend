import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NavigationService } from "../../../../services/navigation.service/navigation.service";
import { UtilsTddService } from "../../../../services/tdd/utils-tdd.service";
import { SessionStorageService } from "../../../../services/tdd/session-storage.service";
import { DataService } from "../../../../services/data.service";
import { HttpClient } from "@angular/common/http";

// Imports Tooltips
import * as _ from "lodash";
import moment, { Moment } from "moment";
import {
  debounce,
  delay,
  distinctUntilChanged,
  fromEvent,
  Subscription,
  timer,
} from "rxjs";
import { TaggingService } from "../../../../services/tagging.service";

@Component({
  selector: "app-filter",
  templateUrl: "./filter.component.html",
  providers: [NavigationService],
})
export class FilterComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() faceLift = false;
  @Input() filterText = "";
  @Input() chanelType = "";
  @Input() filterApply: boolean = false;
  @Input() isCashback: boolean;
  @Input() showIcon = true;
  @Output() dateSelection: EventEmitter<Moment> = new EventEmitter();
  @Output() text: EventEmitter<string> = new EventEmitter();
  @Output() bandFilter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() clear: EventEmitter<void> = new EventEmitter();
  @ViewChild("input") input!: ElementRef<HTMLInputElement>;

  toggleId: string;
  sfApply: boolean = false;
  enable: boolean = false;

  public selectedMonth: string = "";
  public month: Array<number> = [0, 1, 2, 3];

  public textModel = "";
  private readonly INPUT_DELAY = 300;
  private subscriptions: Subscription;

  constructor(private navigationService: NavigationService,
    private tagging: TaggingService) {}

  ngAfterViewInit(): void {
    const event = fromEvent(this.input.nativeElement, "input");
    this.subscriptions = event
      .pipe(
        debounce(() => timer(this.INPUT_DELAY)),
        distinctUntilChanged()
      )
      .subscribe((change: any) => {
        this.inputChange(change.target?.value);
      });
  }
  ngOnInit(): void {
    this.bandFilter.emit(true);
  }

  /* Muestra el "modal" mediante el id y css */
  showToggle() {
    this.tagging.link({
      event: "aclaraciones",
      interaction_category: "mostrar_filtro",
      interaction_action: "mostrar_filtro",
      interaction_label: "Icono Filtro",
    });
    let element = document.getElementById(this.toggleId);
    element.classList.add("animate");
    // this.navigationService.tapBack('filters',  this.hideToggle);
  }

  /* Oculta el modal dependiendo de la accion
   */
  hideToggle() {
    this.tagging.link({
      event: "aclaraciones",
      interaction_category: "ocultar_filtro",
      interaction_action: "aceptar",
      interaction_label: "Aceptar",
    });
    let element = document.getElementById(this.toggleId);
    element.classList.remove("animate");
    element.classList.add("animateReverse");
    setTimeout(function () {
      element.classList.remove("animateReverse");
    }, 700);
    if (this.toggleId === "filterMoves" && this.enable) {
      this.filterApply = true;
    }
    // Tap Back Button
    this.navigationService.tapBack("filters", this.navigationService.goToRoot);
    this.toggleId = "";
  }

  // OBTENER FECHA
  /**
   * regresa el año que se debe consultar
   * recibe el numero de mes que se va a restar a la fecha actual
   *
   * @param {number} month
   * @returns
   * @memberof WelcomeTddComponent
   */
  getMovesYear(month: number) {
    return Number(moment().subtract(month, "months").format("YYYY"));
  }

  /**
   * regresa el mes que se debe mostrar en la vista - filtro
   * recibe el numero de mes que se va a restar a la fecha actual
   *
   * @param {number} month
   * @returns
   * @memberof WelcomeTddComponent
   */
  getMonthName(index: number) {
    if (index === 0) {
      return "Corte actual";
    } else {
      let tempstr = moment().subtract(index, "months").format("MMMM");
      return tempstr.charAt(0).toUpperCase() + tempstr.slice(1);
    }
  }

  /**
   * regresa el mes que se debe consultar
   * recibe el numero de mes que se va a restar a la fecha actual
   *
   * @param {number} month
   * @returns
   * @memberof WelcomeTddComponent
   */
  getMovesMonth(month: number) {
    return Number(moment().subtract(month, "months").format("MM"));
  }

  selectExtract(index: number) {
    if (index === 0) {
      this.selectedMonth = "Corte actual";
    } else {
      this.selectedMonth = moment().subtract(index, "months").format("MMMM");
    }
    this.dateSelection.emit(moment().subtract(index, "M"));
  }

  deleteFilters() {
    this.textModel = "";
    this.inputChange('');
    this.clear.emit();
  }

  showFilterApply() {
    if (this.sfApply) {
      this.sfApply = false;
    } else {
      this.sfApply = true;
    }
  }
  public inputChange(value: string): void {
    this.text.emit(value);
    this.textModel = value;
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}
