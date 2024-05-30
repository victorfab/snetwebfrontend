import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Router } from "@angular/router";
import {
  SessionStorageService,
  LocalStorageService,
} from "angular-web-storage";
import { firstValueFrom, Subscription } from "rxjs";
import { CashBack } from "../../../enums/cashback.enum";
import { CashbackService } from "../../../services/cashback/cashback.service";
import { SelectedMovesService } from "../../../services/selected-moves.service";
import { TaggingService } from "../../../services/tagging.service";
import { UtilsTddService } from "../../../services/tdd/utils-tdd.service";
import moment, { Moment } from "moment";
import { ExtractsService } from "../../../services/extracts.service";
import { MovesService } from "../../../services/moves.service";
import { DataObject } from "../../../shared/data.object";
import { ProductService } from "../../../services/product.service";
import { MoveModel } from "../../../models";
import { FilterPipe } from "../../../pipes/filter.pipe";
import { NavigationService } from "../../../services/navigation.service/navigation.service";
import { SessionStorageService as ST } from "../../../services/tdd/session-storage.service";

@Component({
  selector: "app-pantalla-cashback",
  templateUrl: "./pantalla-cashback.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DataObject, FilterPipe, NavigationService],
})
export class PantallaCashbackComponent implements OnInit, OnDestroy {
  text = "";
  bandFilter: boolean;

  private selectedMoves: any[] = [];
  private cashback: any;
  public clacon!: CashBack;
  private cashbackType = CashBack;

  public movements: any[] = [];

  public selected: { [key: string]: any } = {};

  public selectedMovesHeader = [];

  public openMoves = false;

  private subscription: Subscription;

  public selectedM: string[] = [];

  public wasFiltered = false;
  public readonly FILTER_DELAY = 500;
  private movesBack: any[] = [];
  private readonly CASHBACK_DAYS = 29;

  public showMoves = false;

  constructor(
    private cashbackService: CashbackService,
    public moveService: SelectedMovesService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private utiLs: UtilsTddService,
    private ts: TaggingService,
    private extracts: ExtractsService,
    private moves: MovesService,
    private productService: ProductService,
    private filter: FilterPipe,
    private navigation: NavigationService,
    public session: SessionStorageService,
    public storage: LocalStorageService,
    public st: ST
  ) {
    const clacon = (this.session.get("clacon") || []) as string[];
    if (clacon.length) {
      this.clacon = clacon[0] as CashBack;
    }
    this.moveService.resetCounter();

    this.extracts.setEnv();
  }

  ngOnInit() {
    this.navigation.tapBack("cashback");
    const multiFolio = (this.storage.get("multifolio") as any[]) || [];

    if (multiFolio && multiFolio.length > 0) {
      this.cashback = multiFolio[0];
    }

    if (this.cashbackService.getEditFlow() !== "true") {
      this.cashbackService.saveLocalStorage("cashbackTicket", this.cashback);
    }
    this.ts.view({
      tag_subsection1: "aclaraciones",
      tag_titulo: "aclaraciones|cashback-movements",
      tag_url: "/cashback-movements",
    });

    if (this.clacon === this.cashbackType.NOMINA) {
      this.movements = this.cashbackService.getSessionMoves();
      this.movesBack = this.cashbackService.getSessionMoves();
    }

    // Subscribe to the service to listen if the move is deleted by an external component
    this.subscription = this.moveService.deleted$.subscribe((change) => {
      const exists = this.existMove(change?.id);
      // If the move exists in the component memory will be deleted
      if (change && exists) {
        this.deleteMove(change);
      }
    });

    this.selectedM = this.cashbackService.getTotalMoves("multifolio");

    if (this.clacon === this.cashbackType.LIKEU) {
      this.fetchExtractsAndMoves();
    }
  }

  public select(move: any): void {
    if (this.wasFiltered) {
      return;
    }
    if (this.existMove(move.id)) {
      this.deleteMove(
        { ...move, date: this.utiLs.dateToYYYYMMDD(move.date) },
        true
      );
    } else {
      this.selected[move.id] = move;
      this.cdr.detectChanges();
      this.moveService.setSelectedMoves([
        ...this.utiLs.classifyMoves(this.selectedMovesHeader, {
          ...move,
          date: this.utiLs.dateToYYYYMMDD(move.date),
        }),
      ]);

      this.selectedMoves.push(move);
      sessionStorage.setItem("multifolio", JSON.stringify(this.selectedMoves));

      this.moveService.increaseCounter();
    }
    this.updateSelected();
  }

  public get enableContinue(): boolean {
    return Boolean(this.selected) && Object.keys(this.selected).length > 0;
  }

  public next(): void {
    this.ts.link({
      event: "aclaraciones",
      interaction_action: "seleccion_movimientos",
      interaction_category: "detalle_movimientos",
      interaction_label: "seleccion movimientos",
    });

    this.ts.link({
      event: "aclaraciones",
      interaction_action: "continar",
      interaction_category: "seleccion_movimientos",
      interaction_label: "continuar",
    });
    this.router.navigate(["questionnaireTDD"]);
  }

  private updateSelected(): void {
    this.selected = { ...this.selected };
    this.cdr.detectChanges();
  }

  getBandFilter(event: any) {
    if (event === false) {
      this.ngOnInit();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public get product(): boolean {
    return this.clacon === this.cashbackType.LIKEU;
  }

  private getExtractId() {
    let extractsDate = this.cashbackService.getLocalStorage("extractsDates");

    let abonoDate = moment(this.utiLs.dateToYYYYMMDD(this.cashback.date));

    let startDate = moment(
      this.utiLs.dateToYYYYMMDD(this.cashback.date)
    ).subtract(this.CASHBACK_DAYS, "d");

    for (let index = 0; index < extractsDate._value.length; index += 2) {
      let date = extractsDate._value[index];

      let selectedExtract: Moment = moment(date);
      if (
        selectedExtract.isSameOrBefore(abonoDate) &&
        selectedExtract.isAfter(startDate)
      ) {
        return extractsDate._value[index + 1];
      }
    }
  }

  /**
   * Will delete the most recently selected
   * @param {MoveModel} move The move to be deleted
   * @void
   */
  private deleteMove(move: MoveModel, runDeletionOnSerive = false): void {
    delete this.selected[move.id];

    // Should not run when the move is deleted by the external service SelectedMovesService
    if (runDeletionOnSerive) {
      this.moveService.deleteMove(move);
    }

    this.selectedMoves = this.selectedMoves.filter((mo) => mo.id !== move.id);

    sessionStorage.setItem("multifolio", JSON.stringify(this.selectedMoves));

    this.cdr.detectChanges();
  }

  /**
   * Validate if the move exist in the current component
   * @param {string} moveId - The move id to validate
   * @returns
   */
  private existMove(moveId: string): boolean {
    return (
      Boolean(moveId) &&
      Boolean(this.selected[moveId]) &&
      this.selectedMoves.find((move) => move.id === moveId)
    );
  }

  private async fetchExtractsAndMoves() {
    if (!this.productService.getCardLikeURetrieved) {
      const call = this.productService.getCardProduct("LikeU");
      await firstValueFrom(call);
      this.cdr.detectChanges();
      this.fetchExtracts();
      return;
    }

    this.fetchExtracts();
  }

  private fetchExtracts(): void {
    this.extracts.getExtracts().then((data) => {
      let id = this.getExtractId();
      this.moves.getInitMovements(id).then((response) => {
        this.movements = response.map((movement) => ({
          ...movement,
          key: this.utiLs.dateToYYYYMMDD(movement.key),
        }));
        this.movesBack = this.movements;
        this.cdr.detectChanges();
      });
    });
  }

  public filterData(): void {
    this.wasFiltered = true;
    this.selectedM = this.cashbackService.getTotalMoves("multifolio");
    this.movements = this.filter.transform(this.movesBack, this.text);
    this.cdr.detectChanges();
    setTimeout(() => {
      this.wasFiltered = false;
      this.cdr.detectChanges();
    }, this.FILTER_DELAY);
  }

  public getText(text: string): void {
    this.text = text;
    this.filterData();
  }

  public get getData(): any {
    return this.product
      ? this.session.get("ccData")
      : this.st.getFromLocal("userdata");
  }
}
