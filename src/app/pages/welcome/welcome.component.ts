import { CurrencyPipe } from "@angular/common";
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { Observable, Subscription, lastValueFrom, of, timer } from "rxjs";
import { delay, map, take } from "rxjs/operators";

import { ExtractModel, MoveModel, UserModel } from "../../models";
import { DataProxyService } from "../../services/data-proxy.service";
import { DataService } from "../../services/data.service";
import { NavigationService } from "../../services/navigation.service/navigation.service";
import { TaggingService } from "../../services/tagging.service";
import { SessionStorageService } from "../../services/tdd/session-storage.service";
import { DataObject } from "../../shared/data.object";

import { SessionStorageService as Session } from "angular-web-storage";
import * as md5 from "blueimp-md5";
import * as _ from "lodash";
import moment from "moment";
import { FormOptions } from "../../enums/form-options.enum";
import { MessageType } from "../../enums/message-type.enum";
import { TabOptions } from "../../enums/tab.enum";
import { FlowsService } from "../../services/navigation.service/flows.service";
import { ProductService } from "../../services/product.service";
import { Utils } from "../../shared/utils";
import { serviceOptions } from "../../shared/service-options.constant";
import { MoveType } from "../../enums/move-type.enum";
import { DateFormat } from "../../enums/date-format.enum";
import { MovesService } from "../../services/moves.service";
/**
 *
 *
 * @export
 * @class WelcomeComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: "app-welcome",
  templateUrl: "./welcome.component.html",
  providers: [
    DataService,
    DataObject,
    TaggingService,
    NavigationService,
    CurrencyPipe,
  ],
})
export class WelcomeComponent implements OnInit, OnDestroy {
  filterApply = false;
  filterName = "";
  sfApply = false;

  public isScrolled = false;
  public isHideNav = false;
  public counter = 0;
  public selectedItems: any = [];
  protected subscription: Subscription;
  protected movementsSubscription: Subscription[] = [];
  protected dataHandler = Array<MoveModel>();
  protected hiddenMovements = Array<MoveModel>();
  protected hiddenMovementsATM = Array<MoveModel>();
  protected selectionHandler = Array<MoveModel>();
  protected MovementsInProccess = Array<MoveModel>();
  protected ccData: any;
  public userData: UserModel;
  public navToggle = false;
  public movToggle = false;
  public reversoToggle = false;
  protected isLoading = false;
  public filterDesc = "";
  protected currentFilter: string;
  protected currentExtract = "";
  public dateArraysQuantity = 0;
  public dateArraysQuantityAtm = 0;
  public isFirstLoad = true;
  public bottomReached: boolean;
  protected scrollDisabled = false;
  protected countDown;
  protected count = 3;
  public isMovementsVisible = false;
  public selectedFilterValue = -9999;
  public isFiltered = false;
  public extract = 0;
  public consumerMovements = true;

  public tabOptions = TabOptions;
  public selectedTab: TabOptions = TabOptions.CONSUMER;
  public messageTypes = MessageType;
  public messageType: MessageType = MessageType.TDC_OTHER;

  public formOptions = FormOptions;
  private session = inject(Session);
  public activeFlow: string = "";
  public backup: any;
  public filterMoves: MoveModel[] = [];
  public edit: any;

  /**
   * @description a function that contains logic to be executed after the edition event
   */
  public actionAfterEditOrCancell!: Function;
  /**
   * @description Tabs to be dsisabled
   */
  public disabledTabs = {
    [TabOptions.ATM]: true,
    [TabOptions.CASHBACK]: true,
  };
  public alertConfig = {
    title: "¡Nuevas funciones!",
    text: "Ahora también puedes levantar una aclaración si un comercio no aplicó una promoción de MSI.",
  };
  public welcomeMessage = "Seleccione un movimiento para comenzar:";
  /**
   * @description uset to save the flow option after edition event
   */
  public originalFlow: MoveType | null = null;

  private SCROLL_VALUE = 100;

  private movesRetrieved = false;
  private movesInProcesRetrieved = false;
  private inPocessMoves = [];

  /**
   * Creates an instance of WelcomeComponent.
   * @param {DataService} dataService
   * @param {DataProxyService} dataProxyService
   * @param {TaggingService} taggingService
   * @param {NavigationService} navigationService
   * @param {Router} router
   * @param {DataObject} dataObject
   * @param {CurrencyPipe} currencyPipe
   * @param storage
   * @memberof WelcomeComponent
   */
  constructor(
    private dataService: DataService,
    public dataProxyService: DataProxyService,
    private taggingService: TaggingService,
    private navigationService: NavigationService,
    public router: Router,
    private dataObject: DataObject,
    private storage: SessionStorageService,
    private product: ProductService,
    private flows: FlowsService,
    private utils: Utils,
    private sesion: Session,
    private moveService: MovesService
  ) {
    localStorage.removeItem("tagData");
    localStorage.removeItem("prefolios");
    localStorage.removeItem("questionsTDC");
    // Bind methods for the navigation rules
    this.toggleNav = this.toggleNav.bind(this);
    this.toggleMov = this.toggleMov.bind(this);
    this.product.setDummy(this.dataProxyService.getDummyMode());
    this.originalFlow = this.session.get("serviceOption");
  }

  /**
   * Loads initial content :: User data and previously selected items.
   *
   * @memberof WelcomeComponent
   */
  public ngOnInit() {
    // Navigation rules
    // this.navigationService.setTitle('Alta de aclaraciones');

    this.product.productValidation("LikeU").subscribe();
    this.isMovementsVisible = false;
    this.navigationService.tapBack("welcome", this.navigationService.goToRoot);

    this.dataService.setUris(this.dataProxyService.getEnviroment());
    if (this.dataProxyService.getDataSelected()) {
      this.counter = this.dataProxyService.getDataSelected().length;
    }
    if (this.dataProxyService.getDataSelected()) {
      this.dataHandler = this.dataProxyService.getDataSelected();
      this.selectionHandler = this.dataProxyService.getDataSelected();
    }

    this.userData = this.dataProxyService.getUserData();

    this.userData.extracts.forEach(extract => {
      extract.moves = [];
      extract.movesATM = [];
    });

    this.ccData = this.dataProxyService.getCCData();
    this.bottomReached = false;
    if (this.userData.extracts.length > 0) {
      // fetch all data
      this.loadInProcesMoves();
      this.fetchMoves();
    }
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
    // GA - Tealium
    this.setDataLayer();
    this.storage.saveInLocal("alreadyFlow", false);

    // Clear all data
    this.dataHandler = [];
    this.selectedItems = [];
    this.counter = 0;
    this.utils.clearSession();
    this.dataProxyService.cleanData();
  }

  private fetchMoves(): void {
    const calls = [];
    for (let i = 0; i < this.userData.extracts.length; i++) {
      calls.push(lastValueFrom(this.getInitMovements(i)));
    }
    const promise = <any>Promise;
    promise
      .allSettled(calls)
      .then((response: any[]) => {
        response.forEach(({ status, value }, index) => {

          if (status === "fulfilled") {
            this.loadMoves(value, index);
          }
        });

        this.movesRetrieved = true;
        if (this.movesInProcesRetrieved) {
          this.pushMoveIntoExtract();
        }
      })
      .catch(() => {
        this.movesRetrieved = true;
      });
  }

  /**
   * Put all in process moves into his correct extract
   */
  private pushMoveIntoExtract(): void {
    if (this.movesRetrieved) {
      // put the unique extract to all moves
      if (this.userData.extracts.length === 1) {
        this.inPocessMoves = this.inPocessMoves.map((move) => ({
          ...move,
          txrNumExtracto: this.userData.extracts[0].id,
        }));
        this.inPocessMoves.forEach((move) => {
          this.putToFirstExtract(move);
        });
        this.updateChargeList();
        return;
      } else if (this.userData.extracts.length >= 2) {
        for (let i = 0; i < 2; i++) {
          const extract = this.userData.originalExtracts[i];
          if (
            !extract.acctStmtInfo.stmtDt.includes("010101") &&
            !extract.acctStmtInfo.stmtDt.includes("10101")
          ) {
            const extractDate = moment(
              extract.acctStmtInfo.stmtDt,
              DateFormat.YY_MM_DD
            ).format(DateFormat.YYYY_MM_DD);
            this.inPocessMoves.forEach((move) => {
              if (
                moment(move.date, DateFormat.DD_MM_YYYY).isBefore(
                  extractDate
                ) ||
                moment(move.date, DateFormat.DD_MM_YYYY).isSame(extractDate)
              ) {
                move.txrNumExtracto = extract.acctStmtId;
                this.userData.extracts[i].moves = [
                  ...this.userData.extracts[i].moves,
                  move,
                ];
              } else {
                this.putToFirstExtract(move);
              }
            });
          }
        }
        this.updateChargeList();
      }
    }
  }

  public putToFirstExtract(move: MoveModel): void {
    this.userData.extracts[0].moves = [
      ...(this.userData.extracts[0].moves || []),
      move,
    ];
    move.txrNumExtracto = this.userData.extracts[0].id;
  }
  /**
   * Update the render list to show the new ones
   * @returns
   */
  private updateChargeList(): number {
    const combinated = [];
    this.hiddenMovements = [];
    _.each(this.userData.extracts, (element) => {
      if (element.moves) {
        _.each(element.moves, (move, index) => {
          if (
            (combinated.length < 20 && index <= 19) ||
            move.type === MoveType.PREFOLIO
          ) {
            combinated.push(move);
          } else {
            this.hiddenMovements.push(move);
            this.hiddenMovements = _.sortBy(
              this.hiddenMovements,
              "typeDate"
            ).reverse();
          }
        });
      }
    });

    const groupedMovements = _.groupBy(combinated, "date");
    this.dataObject.filteredData = groupedMovements;
    this.dataObject.filteredData = this.sortDateKeys();
    this.dateArraysQuantity = Object.keys(this.dataObject.filteredData).length;
    return combinated.length;
  }

  /**
   * Fetch moves with pending flag
   */
  private loadInProcesMoves(): void {
    this.moveService.pendingMoves().subscribe({
      next: (data) => {
        this.inPocessMoves = data.map((move) =>
          this.utils.transformMove(move, null)
        );
        if (this.movesRetrieved) {
          this.pushMoveIntoExtract();
        }
        this.movesInProcesRetrieved = true;
      },
      error: () => {
        this.movesInProcesRetrieved = true;
      },
    });
  }

  /**
   * Fetch the original moves
   * @param response The service response
   * @param extractIndex The index of extract
   */
  private loadMoves(response: any, extractIndex): void {
    // MXSLCUSTSE-10044
    response.acctTrnRecCajeros = this.movementsFilter(
      response.acctTrnRecCajeros
    );
    response.acctTrnRecComercios = this.movementsFilter(
      response.acctTrnRecComercios
    );

    response.acctTrnRecPagos = this.movementsFilter(response.acctTrnRecPagos);
    this.flows.payments = [...this.flows.payments, ...response.acctTrnRecPagos];
    if (!_.isUndefined(response.acctTrnRecComercios)) {
      // Check if the response has movements
      if (
        response.acctTrnRecComercios.length > 0 ||
        response.acctTrnRecCajeros.length > 0
      ) {
        this.isMovementsVisible = true;
        this.addMovements(extractIndex, response);
        this.updateChargeList();
        const combinatedATM = [];
        this.hiddenMovements = [];
        this.hiddenMovementsATM = [];
        _.each(this.userData.extracts, (element) => {
          if (element.movesATM) {
            _.each(element.movesATM, (move, index) => {
              if (combinatedATM.length < 20 && index <= 19) {
                combinatedATM.push(move);
              } else {
                this.hiddenMovementsATM.push(move);
                this.hiddenMovementsATM = _.sortBy(
                  this.hiddenMovementsATM,
                  "typeDate"
                ).reverse();
              }
            });
          }
        });

        this.dataObject.filteredData = this.sortDateKeys();
        const groupedMovementsATM = _.groupBy(combinatedATM, "date");
        this.dataObject.filteredDataAtm = groupedMovementsATM;
        this.dataObject.filteredDataAtm = this.sortDateKeysAtm();
        this.dateArraysQuantityAtm = Object.keys(
          this.dataObject.filteredDataAtm
        ).length;
      }
    }
    // Order the movements by date
    this.dataObject.filteredData = this.sortDateKeys();
    this.dataObject.filteredDataAtm = this.sortDateKeysAtm();
  }

  public checkMove(): void {
    const [move] = <MoveModel[]>this.dataProxyService.getDataSelected();
    const route =
      move.type === MoveType.SEGURO ? "d-questionnarie" : "questionnaire";

    this.actionAfterEditOrCancell = () => {
      this.router.navigate([route]);
    };
  }

  ngAfterViewInit(): void {
    this.flows.modalInstance$.subscribe({
      next: (modal) => {
        if (modal) {
          modal.onCloseModal.subscribe({
            next: (value) => {
              this.activeFlow = value;
              this.navigationService.tapBack(
                "welcome",
                this.navigationService.goToRoot
              );
              if (this.activeFlow === "moreMoves") {
                this.checkMove();
                this.alertConfig = {
                  title: "¿No encuentras un movimiento?",
                  text: `Para facilitar el alta de tu aclaración, ocultamos los movimientos que no pueden adjuntarse o sumarse en esta aclaración.
                  Si necesitas solicitar la aclaración de un movimiento no disponible, podrás realizarla al concluir el proceso actual.`,
                };
                this.welcomeMessage =
                  "Selecciona las demás compras que quieras aclarar:";
                const compraSeguro = [MoveType.COMPRA, MoveType.SEGURO];
                this.userData.extracts.forEach((move) => {
                  if (move.moves !== null && move.moves.length > 0) {
                    move.moves.forEach((move) => {
                      if (compraSeguro.includes(move.type)) {
                        this.filterMoves.push(move);
                      }
                    });
                  }
                });
                const groupedMovements = _.groupBy(this.filterMoves, "date");
                this.dataObject.filteredData = groupedMovements;
                this.dataObject.filteredData = this.sortDateKeys();
                this.dateArraysQuantity = Object.keys(
                  this.dataObject.filteredData
                ).length;

                this.actionAfterEditOrCancell = () => {
                  const [move] = this.dataHandler;
                  if (this.dataHandler.length > 1) {
                    this.router.navigate(["questionnaire"]);
                  } else if (move.type === MoveType.SEGURO) {
                    this.router.navigate(["d-questionnarie"]);
                  } else {
                    this.router.navigate(["questionnaire"]);
                  }
                };
              } else if (this.activeFlow === "cancel") {
                this.dataHandler = [];
                this.selectedItems = [];
                this.counter = 0;
              }
            },
          });
        }
      },
    });
    this.edit = this.storage.getFromLocal("editFlow");
  }

  /**
   * change of movements to display
   * @param value  boolean value
   */
  public changeMoves(option: TabOptions) {
    this.selectedTab = option;

    this.messageType = this.product.isLikeU
      ? this.messageTypes.TDC_LIKEU
      : this.messageTypes.TDC_OTHER;

    // this.consumerMovements = value;
    this.dataHandler = [];
    this.dataProxyService.setDataSource(this.dataHandler);
    this.counter = this.dataHandler.length;
  }

  /**
   * Sets the dataLayer for Google Analytics
   *
   * @memberof WelcomeComponent
   * @returns {void}
   */
  public setDataLayer(): void {
    const userID = md5(this.dataProxyService.getBuc(), "mx-aclaraciones-cs");

    const channel = this.dataProxyService.getChannel();
    let section = "santander_supermovil";
    if (channel !== "default") {
      section = "santander_superwallet";
    }

    this.taggingService.view({
      tag_subsection1: "aclaraciones",
      tag_titulo: "aclaraciones|welcome_tdc",
      tag_url: "/aclaraciones/welcomeTDC",
      tag_userId: userID,
      tag_tipoDeTarjeta: [
        this.dataProxyService.getCreditCardFullData().cardDesc,
      ],
      tag_procedencia: [section],
    });
  }

  /**
   * Method that is called when welcome component is destroyed.
   *
   * @memberof WelcomeComponent
   */
  public ngOnDestroy() {
    // window.removeEventListener('scroll', this.scroll, true);
  }

  /**
   * Submit filter form.
   *
   * @param {Event} $event
   * @memberof WelcomeComponent
   */
  public submitFilterForm($event: Event): void {
    document.getElementById("inlineFormInputGroup").blur();
    const itemSelectedDimention = this.consumerMovements ? "20" : "55";
    // this.taggingService.setDimenson(itemSelectedDimention, 'used');
    // this.taggingService.send('');
  }

  /**
   * Get the first 20 movements of the credit card ordered by list.
   *
   * @private
   * @param {number} extractIndex
   * @memberof WelcomeComponent
   */
  private getInitMovements(extractIndex: number): Observable<any> {
    this.extract += 1;
    const ID = this.getExtractId(extractIndex);
    this.currentFilter = ID;
    return this.dataService.getMovements(ID);
  }

  /**
   * Get more movements from the next extract.
   *
   * @private
   * @param {number} extractIndex
   * @memberof WelcomeComponent
   */
  private getMoreMovements(extractIndex: number): void {
    if (!_.isUndefined(this.userData.extracts[extractIndex + 1])) {
      this.getInitMovements(extractIndex + 1);
    }
  }

  /**
   * Add the movements from the response to the extract.
   *
   * @private
   * @param {*} extractIndex
   * @param {*} response
   * @memberof WelcomeComponent
   */
  private addMovements(extractIndex: any, response: any): void {
    const moves: MoveModel[] = [];
    let movesAtm: MoveModel[] = [];
    _.each(response.acctTrnRecComercios, (v: any) => {
      const dateStr: string = moment(v.acctTrnInfo.stmtDt, "YYYY-MM-DD").format(
        "DD-MM-YYYY"
      );
      const periodStr: string = moment(dateStr, "DD-MM-YYYY").format(
        "MMMM YYYY"
      );
      const fecha = this.formatDate(v.acctTrnInfo.stmtDt);
      const parsedStrDate = dateStr.split("-");
      const typedDate = new Date(
        Number(parsedStrDate[2]),
        Number(parsedStrDate[1]) - 1,
        Number(parsedStrDate[0])
      );
      const nmove: MoveModel = new MoveModel(
        v.acctTrnId,
        v.acctTrnInfo.trnType.desc,
        v.acctTrnInfo.totalCurAmt.amt.toString(),
        dateStr,
        periodStr,
        v.acctTrnInfo.networkTrnData.merchNum,
        v.acctTrnInfo.networkTrnData.merchName,
        v.acctTrnInfo.origCurAmt.curCode.curCodeValue,
        fecha,
        v.acctTrnInfo.trnTime,
        v.acctTrnInfo.networkTrnData.posEntryCapability,
        v.acctTrnInfo.totalCurAmt.amt,
        this.ccData.cardRec.cardInfo.acctRef.acctInfo.fiData.branchIdent,
        v.acctTrnId,
        this.userData.extracts[extractIndex].id,
        v.acctTrnInfo.salesSlipRefNum,
        v.acctTrnInfo.trnType.trnTypeCode,
        v.acctTrnInfo.cardRef.cardInfo.cardNum,
        typedDate
      );
      nmove.type = v.acctTrnInfo.type;
      nmove.currencyType = v.acctTrnInfo?.totalCurAmt?.curCode?.curCodeValue;
      moves.push(nmove);
    });
    _.each(response.acctTrnRecCajeros, (v: any) => {
      if (v.acctTrnInfo.statusReverso != "REV01") {
        const dateStr: string = moment(
          v.acctTrnInfo.stmtDt,
          "YYYY-MM-DD"
        ).format("DD-MM-YYYY");
        const periodStr: string = moment(dateStr, "DD-MM-YYYY").format(
          "MMMM YYYY"
        );
        const fecha = this.formatDate(v.acctTrnInfo.stmtDt);
        const parsedStrDate = dateStr.split("-");
        const typedDate = new Date(
          Number(parsedStrDate[2]),
          Number(parsedStrDate[1]) - 1,
          Number(parsedStrDate[0])
        );
        const nmove: MoveModel = new MoveModel(
          v.acctTrnId,
          v.acctTrnInfo.trnType.desc,
          v.acctTrnInfo.totalCurAmt.amt.toString(),
          dateStr,
          periodStr,
          v.acctTrnInfo.networkTrnData.merchNum,
          v.acctTrnInfo.networkTrnData.merchName,
          v.acctTrnInfo.origCurAmt.curCode.curCodeValue,
          fecha,
          v.acctTrnInfo.trnTime,
          v.acctTrnInfo.networkTrnData.posEntryCapability,
          v.acctTrnInfo.totalCurAmt.amt,
          this.ccData.cardRec.cardInfo.acctRef.acctInfo.fiData.branchIdent,
          v.acctTrnId,
          this.userData.extracts[extractIndex].id,
          v.acctTrnInfo.salesSlipRefNum,
          v.acctTrnInfo.trnType.trnTypeCode,
          v.acctTrnInfo.cardRef.cardInfo.cardNum,
          typedDate,
          "",
          "",
          v.acctTrnInfo.statusReverso
        );
        nmove.currencyType = v.acctTrnInfo?.totalCurAmt?.curCode?.curCodeValue;
        movesAtm.push(nmove);
      }
    });
    _.each(response.acctTrnRecPagos, (v: any) => {
      const dateStr: string = moment(v.acctTrnInfo.stmtDt, "YYYY-MM-DD").format(
        "DD-MM-YYYY"
      );
      const periodStr: string = moment(dateStr, "DD-MM-YYYY").format(
        "MMMM YYYY"
      );
      const fecha = this.formatDate(v.acctTrnInfo.stmtDt);
      const parsedStrDate = dateStr.split("-");
      const typedDate = new Date(
        Number(parsedStrDate[2]),
        Number(parsedStrDate[1]) - 1,
        Number(parsedStrDate[0])
      );
      const nmove: MoveModel = new MoveModel(
        v.acctTrnId,
        v.acctTrnInfo.trnType.desc,
        v.acctTrnInfo.totalCurAmt.amt.toString(),
        dateStr,
        periodStr,
        v.acctTrnInfo.networkTrnData.merchNum,
        v.acctTrnInfo.networkTrnData.merchName,
        v.acctTrnInfo.origCurAmt.curCode.curCodeValue,
        fecha,
        v.acctTrnInfo.trnTime,
        v.acctTrnInfo.networkTrnData.posEntryCapability,
        v.acctTrnInfo.totalCurAmt.amt,
        this.ccData.cardRec.cardInfo.acctRef.acctInfo.fiData.branchIdent,
        v.acctTrnId,
        this.userData.extracts[extractIndex].id,
        v.acctTrnInfo.salesSlipRefNum,
        v.acctTrnInfo.trnType.trnTypeCode,
        v.acctTrnInfo.cardRef.cardInfo.cardNum,
        typedDate
      );
      nmove.type = v.acctTrnInfo.type;
      nmove.currencyType = v.acctTrnInfo?.totalCurAmt?.curCode?.curCodeValue;
      this.flows.paymentsMoveModel.push(nmove);
    });
    movesAtm = _.sortBy(movesAtm, "typeDate").reverse();
    this.userData.extracts[extractIndex].moves = moves;
    this.userData.extracts[extractIndex].movesATM = movesAtm;
  }

  /**
   * Listen the interaction of the user and validate the native session.
   *
   * @private
   * @param {Event} $event
   * @memberof WelcomeComponent
   */
  @HostListener("window:scroll", ["$event"])
  private onWindowScroll($event: Event): void {
    this.navigationService.validateSession();
    this.isScrolled = window.pageYOffset > 0;

    if (
      !this.scrollDisabled &&
      !this.filterDesc.length &&
      !this.filterApply &&
      this.activeFlow !== "moreMoves"
    ) {
      const height = document.documentElement.scrollHeight - this.SCROLL_VALUE;
      const position = window.pageYOffset + window.innerHeight;
      const next = position >= height;

      if (next) {
        this.bottomReached = true;
        if (!this.isFirstLoad) {
          this.showNextItems();
        }
        if (this.isFirstLoad) {
          this.isFirstLoad = false;
          this.countDown = timer(0, 1000).pipe(
            take(this.count),
            map(() => --this.count)
          );
          this.countDown.subscribe(
            (x) => {},
            (err) => {},
            () => {
              this.scrollDisabled = false;
            }
          );
        }
      }
    }
  }

  /**
   * Sort the array of movements by date.
   *
   * @private
   * @returns {*}
   * @memberof WelcomeComponent
   */
  private sortDateKeys(): any {
    const dates = Object.keys(this.dataObject.filteredData);
    // Format the dates
    const formattedDates: string[] = [];
    const sortedDates: string[] = [];
    const sortedMovements: any = {};
    _.each(dates, (date) => {
      formattedDates.push(moment(date, "DD-MM-YYYY").format("YYYYMMDD"));
    });
    // Sort the formatted dates in descending order
    const sorting = _.sortBy(formattedDates, (o) => {
      return moment(o);
    }).reverse();
    // Format again the sorted dates
    _.each(sorting, (date) => {
      sortedDates.push(moment(date, "YYYYMMDD").format("DD-MM-YYYY"));
    });
    // Add all movements in the sorted order
    _.each(sortedDates, (date) => {
      sortedMovements[date] = this.dataObject.filteredData[date];
    });
    return sortedMovements;
  }

  /**
   * Sort the array of movements by date.
   *
   * @private
   * @returns {*}
   * @memberof WelcomeComponent
   */
  private sortDateKeysAtm(): any {
    const dates = Object.keys(this.dataObject.filteredDataAtm);
    // Format the dates
    const formattedDates: string[] = [];
    const sortedDates: string[] = [];
    const sortedMovements: Object = {};
    _.each(dates, (date) => {
      formattedDates.push(moment(date, "DD-MM-YYYY").format("YYYYMMDD"));
    });
    // Sort the formatted dates in descending order
    const sorting = _.sortBy(formattedDates, (o) => {
      return moment(o);
    }).reverse();
    // Format again the sorted dates
    _.each(sorting, (date) => {
      sortedDates.push(moment(date, "YYYYMMDD").format("DD-MM-YYYY"));
    });
    // Add all movements in the sorted order
    _.each(sortedDates, (date) => {
      sortedMovements[date] = this.dataObject.filteredDataAtm[date];
    });
    return sortedMovements;
  }

  /**
   * Add the hidden movements to the list and empty the array after that.
   *
   * @private
   * @memberof WelcomeComponent
   */
  private addHiddenMovements(): void {
    let movementsDates = Object.keys(this.dataObject.filteredData);
    let movementsDatesATM = Object.keys(this.dataObject.filteredData);
    let temporalHidden = [];
    let temporalHiddenATM = [];
    if (this.isConsumerTab) {
      if (this.hiddenMovements.length > 19) {
        temporalHidden = this.hiddenMovements.slice(
          20,
          this.hiddenMovements.length
        );
        this.hiddenMovements = this.hiddenMovements.slice(0, 19);
      }
      _.each(this.hiddenMovements, (movement) => {
        // Check if the date of the movement are on list
        const dateFound = _.find(movementsDates, (o) => o === movement.date);
        if (_.isUndefined(dateFound)) {
          this.dataObject.filteredData[movement.date] = [];
          this.dataObject.filteredData[movement.date].push(movement);
        } else {
          this.dataObject.filteredData[movement.date].push(movement);
        }
        movementsDates = Object.keys(this.dataObject.filteredData);
      });
      this.dataObject.filteredData = this.sortDateKeys();
      this.hiddenMovements =
        temporalHidden.length > 0 ? temporalHidden : Array<MoveModel>();
    } else {
      if (this.hiddenMovementsATM.length > 19) {
        temporalHiddenATM = this.hiddenMovementsATM.slice(
          20,
          this.hiddenMovementsATM.length
        );
        this.hiddenMovementsATM = this.hiddenMovementsATM.slice(0, 19);
      }
      _.each(this.hiddenMovementsATM, (movement) => {
        // Check if the date of the movement are on list
        const dateFound = _.find(movementsDatesATM, (o) => o === movement.date);
        if (_.isUndefined(dateFound)) {
          this.dataObject.filteredDataAtm[movement.date] = [];
          this.dataObject.filteredDataAtm[movement.date].push(movement);
        } else {
          this.dataObject.filteredDataAtm[movement.date].push(movement);
        }
        movementsDatesATM = Object.keys(this.dataObject.filteredDataAtm);
      });
      this.dataObject.filteredDataAtm = this.sortDateKeysAtm();
      this.hiddenMovementsATM =
        temporalHiddenATM.length > 0 ? temporalHiddenATM : Array<MoveModel>();
    }
  }

  /**
   * Show the hidden movements and the movements of the next extract.
   *
   * @private
   * @memberof WelcomeComponent
   */
  private showNextItems(): void {
    this.scrollDisabled = false;
    this.bottomReached = false;
    // Show the hidden movements
    if (
      (this.hiddenMovements.length > 0 && this.isConsumerTab) ||
      (this.hiddenMovementsATM.length > 0 && this.isAtmTab)
    ) {
      this.addHiddenMovements();
    }
    const decrement: number = Number(this.currentFilter) - 1;
    // Check if the next extract exists
    const decrementIndex: number = this.getExtractIndex(String(decrement));
    if (decrement >= 0 && decrementIndex !== -1) {
      this.filterExtractsById(String(decrement), true, true);
      this.currentFilter = String(decrement);
    }
    this.dateArraysQuantity = Object.keys(this.dataObject.filteredData).length;
    this.dateArraysQuantityAtm = Object.keys(
      this.dataObject.filteredDataAtm
    ).length;
  }

  /**
   * Keep Hidden prevents from open in the initial filter.
   *
   * @private
   * @param {string} ID
   * @param {boolean} [keepHidden=false]
   * @param {boolean} [append=false]
   * @param {boolean} [showOnlyExtract=false]
   * @returns {void}
   * @memberof WelcomeComponent
   */
  private filterExtractsById(
    ID: string,
    keepHidden: boolean = false,
    append: boolean = false,
    showOnlyExtract: boolean = false
  ): void {
    if (this.isLoading || typeof ID === "undefined") {
      return;
    }
    const extracts: ExtractModel[] = this.userData.extracts;
    const currentSearchIndex: number = this.getExtractIndex(ID);
    this.currentFilter = ID;
    if (
      !_.isUndefined(extracts[currentSearchIndex]) &&
      currentSearchIndex !== -1
    ) {
      if (
        !extracts[currentSearchIndex].moves &&
        !extracts[currentSearchIndex].movesATM
      ) {
        this.loadExtract(ID);
      } else {
        this.evaluateIndex(extracts, currentSearchIndex, ID, append);
      }
    }
    this.bottomReached = false;
  }

  /**
   * Evaluate index.
   *
   * @private
   * @param {Array<ExtractModel>} a
   * @param {*} b
   * @param {*} c
   * @param {*} d
   * @memberof WelcomeComponent
   */
  private evaluateIndex(a: ExtractModel[], b: any, c: any, d: any) {
    const extracts = a;
    const currentSearchIndex = b;
    const ID = c;
    const append = d;
    if (extracts[currentSearchIndex].moves.length > 0) {
      this.currentFilter = ID;
    }
    const idx: number = _.findIndex(extracts, (o: ExtractModel) => {
      return String(o.id) === String(ID);
    });
    if (idx > -1) {
      // if (this.isFirstLoad) {
      //   // this.isFirstLoad = false;
      //   this.loadExtract(ID);
      // } else {
      if (append) {
        let combinated = [];
        let combinatedAtm = [];
        _.each(extracts, (element) => {
          if (element.moves) {
            combinated = _.unionBy(combinated, element.moves, "id");
          }
          if (element.movesATM) {
            combinatedAtm = _.unionBy(combinatedAtm, element.movesATM, "id");
          }
        });
        this.dataObject.filteredData = _.groupBy(combinated, "date");
        this.dataObject.filteredData = this.sortDateKeys();
        this.dataObject.filteredDataAtm = _.groupBy(combinatedAtm, "date");
        this.dataObject.filteredDataAtm = this.sortDateKeysAtm();
      } else {
        this.dataObject.filteredData = _.groupBy(extracts[idx].moves, "date");
        this.dataObject.filteredData = this.sortDateKeys();
        this.dataObject.filteredDataAtm = _.groupBy(
          extracts[idx].movesATM,
          "date"
        );
        this.dataObject.filteredDataAtm = this.sortDateKeysAtm();
      }
      // }
      this.dateArraysQuantity = Object.keys(
        this.dataObject.filteredData
      ).length;
      this.dateArraysQuantityAtm = Object.keys(
        this.dataObject.filteredDataAtm
      ).length;
    } else {
      this.loadExtract(ID);
    }
  }

  /**
   * Show filtered movements.
   *
   * @private
   * @param {string} ID
   * @memberof WelcomeComponent
   */
  showFilteredMovements(ID: string): void {
    const extracts: ExtractModel[] = this.userData.extracts;
    const idx: number = this.getExtractIndex(ID);
    this.isFiltered = false;
    if (!_.isUndefined(extracts[idx]) && idx !== -1) {
      if (extracts[idx].moves) {
        if (this.activeFlow === "moreMoves") {
          this.dataObject.filteredData = _.groupBy(
            extracts[idx].moves.filter(
              (move) =>
                move.type === MoveType.COMPRA || move.type === MoveType.SEGURO
            ),
            "date"
          );
        } else {
          this.dataObject.filteredData = _.groupBy(extracts[idx].moves, "date");
        }
        this.dataObject.filteredData = this.sortDateKeys();
      } else {
        this.dataObject.filteredData = {};
      }
      this.dateArraysQuantity = Object.keys(
        this.dataObject.filteredData
      ).length;

      if (extracts[idx].movesATM) {
        this.dataObject.filteredDataAtm = _.groupBy(
          extracts[idx].movesATM,
          "date"
        );
        this.dataObject.filteredDataAtm = this.sortDateKeysAtm();
      } else {
        this.dataObject.filteredDataAtm = {};
      }
      this.dateArraysQuantityAtm = Object.keys(
        this.dataObject.filteredDataAtm
      ).length;
    }

    this.filterApply = true;
    this.filterName = document.getElementById("extractLabel-" + ID).textContent;
  }

  /**
   * Check if is the first load.
   *
   * @private
   * @param {*} ID
   * @param {*} idx
   * @memberof WelcomeComponent
   */
  private checkFirstLoad(ID: any, idx: any): void {
    const extracts: ExtractModel[] = this.userData.extracts;
    // Get the first 20 movements
    this.dataObject.filteredData = this.getInitialMovements(ID, idx);
    this.dataObject.filteredDataAtm = this.getInitialMovementsAtm(ID, idx);
    this.dataObject.filteredData = this.sortDateKeys();
    if (Object.keys(this.dataObject.filteredData).length < 20) {
      const nextExtractIndex = Number(idx) + 1;
      if (!_.isUndefined(extracts[nextExtractIndex])) {
        this.checkFirstLoad(extracts[nextExtractIndex].id, nextExtractIndex);
      }
    } else {
      this.isFirstLoad = false;
    }
  }

  /**
   * Get initial movements.
   *
   * @private
   * @param {string} ID
   * @param {number} idx
   * @returns {Object}
   * @memberof WelcomeComponent
   */
  private getInitialMovements(ID: string, idx: number): any {
    const extracts: ExtractModel[] = this.userData.extracts;
    // Get the first 20 movements of the extract
    let aux = _.take(extracts[idx].moves, 20);
    // Check if there are 20 movements
    let difference: number = Math.abs(aux.length - 20);
    let increment: number = idx;
    while (difference > 0) {
      if (!_.isUndefined(extracts[increment])) {
        // If the movements are lower than 20, get the difference from the next extract
        if (!extracts[increment].moves) {
          this.loadExtract(extracts[increment].id);
        }
        difference = Math.abs(aux.length - 20);
        const restOfMovements = _.take(extracts[increment].moves, difference);
        aux = _.unionBy(aux, restOfMovements, "id");
        increment++;
      } else {
        difference = 0;
      }
    }
    return _.groupBy(aux, "date");
  }

  /**
   * Get initial movements.
   *
   * @private
   * @param {string} ID
   * @param {number} idx
   * @returns {Object}
   * @memberof WelcomeComponent
   */
  private getInitialMovementsAtm(ID: string, idx: number): any {
    const extracts: ExtractModel[] = this.userData.extracts;
    // Get the first 20 movements of the extract
    let aux = _.take(extracts[idx].movesATM, 20);
    // Check if there are 20 movements
    let difference: number = Math.abs(aux.length - 20);
    let increment: number = idx;
    while (difference > 0) {
      if (!_.isUndefined(extracts[increment])) {
        // If the movements are lower than 20, get the difference from the next extract
        if (!extracts[increment].movesATM) {
          this.loadExtract(extracts[increment].id);
        }
        difference = Math.abs(aux.length - 20);
        const restOfMovements = _.take(
          extracts[increment].movesATM,
          difference
        );
        aux = _.unionBy(aux, restOfMovements, "id");
        increment++;
      } else {
        difference = 0;
      }
    }
    return _.groupBy(aux, "date");
  }

  /**
   * Get initial movements.
   *
   * @private
   * @param {string} ID
   * @param {number} idx
   * @returns {Object}
   * @memberof WelcomeComponent
   */
  private getInitialPayments(ID: string, idx: number): any {
    const extracts: ExtractModel[] = this.userData.extracts;
    // Get the first 20 movements of the extract
    let aux = _.take(extracts[idx].payments, 20);
    // Check if there are 20 movements
    let difference: number = Math.abs(aux.length - 20);
    let increment: number = idx;
    while (difference > 0) {
      if (!_.isUndefined(extracts[increment])) {
        // If the movements are lower than 20, get the difference from the next extract
        if (!extracts[increment].payments) {
          this.loadExtract(extracts[increment].id);
        }
        difference = Math.abs(aux.length - 20);
        const restOfMovements = _.take(
          extracts[increment].payments,
          difference
        );
        aux = _.unionBy(aux, restOfMovements, "id");
        increment++;
      } else {
        difference = 0;
      }
    }
    return _.groupBy(aux, "date");
  }

  /**
   * Load Extract.
   *
   * @private
   * @param {string} ID
   * @memberof WelcomeComponent
   */
  private loadExtract(ID: string) {
    this.isLoading = true;
    this.currentExtract = ID;
    const extractIndex = this.getExtractIndex(ID);
    if (
      extractIndex !== -1 &&
      !_.isUndefined(this.userData.extracts[extractIndex])
    ) {
      if (
        !this.userData.extracts[extractIndex].moves &&
        !_.isUndefined(this.userData.extracts[extractIndex].movesATM)
      ) {
        if (this.dataProxyService.getDummyMode()) {
          const dataURI = `assets/data/extract_${ID}.json`;
          this.movementsSubscription[ID] = this.dataService
            .dummyRequest(dataURI)
            .subscribe((response) => this.processExtractQuery(response, ID));
        } else {
          this.movementsSubscription[ID] = this.dataService
            .restRequest(
              "/moves/",
              "POST",
              {
                extract: ID,
              },
              "user",
              this.dataProxyService.getAccessToken()
            )
            .subscribe(
              (response) => {
                this.processExtractQuery(response, ID);
              },
              (error) => this.handleError(error)
            );
        }
      } else {
        this.filterExtractsById(ID, true);
      }
    }
  }

  /**
   * Process Extract Query.
   *
   * @private
   * @param {*} item
   * @param {string} ID
   * @memberof WelcomeComponent
   */
  private processExtractQuery(item: any, ID: string) {
    // MXSLCUSTSE-10044
    item.acctTrnRecCajeros = this.movementsFilter(item.acctTrnRecCajeros);
    item.acctTrnRecComercios = this.movementsFilter(item.acctTrnRecComercios);
    if (item.acctTrnRecPagos) {
      item.acctTrnRecPagos = this.movementsFilter(item.acctTrnRecPagos);
      this.flows.payments = [...this.flows.payments, ...item.acctTrnRecPagos];
    }
    this.movementsSubscription[ID].unsubscribe();
    moment.locale("es");
    const extractQuery = this.getExtractIndex(this.currentExtract);
    const currentExtract: ExtractModel = this.userData.extracts[extractQuery];
    if (!_.isUndefined(currentExtract)) {
      if (!currentExtract.moves) {
        const moves: MoveModel[] = [];
        const movesAtm: MoveModel[] = [];
        _.each(item.acctTrnRecComercios, (v: any) => {
          const dateStr: string = moment(
            v.acctTrnInfo.stmtDt,
            "YYYY-MM-DD"
          ).format("DD-MM-YYYY");
          const periodStr: string = moment(dateStr, "DD-MM-YYYY").format(
            "MMMM YYYY"
          );
          const fecha = this.formatDate(v.acctTrnInfo.stmtDt);
          const nmove: MoveModel = new MoveModel(
            v.acctTrnId,
            v.acctTrnInfo.trnType.desc,
            v.acctTrnInfo.totalCurAmt.amt.toString(),
            dateStr,
            periodStr,
            v.acctTrnInfo.networkTrnData.merchNum,
            v.acctTrnInfo.networkTrnData.merchName,
            v.acctTrnInfo.origCurAmt.curCode.curCodeValue,
            fecha,
            v.acctTrnInfo.trnTime,
            v.acctTrnInfo.networkTrnData.posEntryCapability,
            v.acctTrnInfo.totalCurAmt.amt,
            this.ccData.cardRec.cardInfo.acctRef.acctInfo.fiData.branchIdent,
            v.acctTrnId,
            ID,
            v.acctTrnInfo.salesSlipRefNum,
            v.acctTrnInfo.trnType.trnTypeCode,
            v.acctTrnInfo.cardRef.cardInfo.cardNum
          );
          nmove.type = v.acctTrnInfo.type;
          nmove.currencyType =
            v.acctTrnInfo?.totalCurAmt?.curCode?.curCodeValue;
          moves.push(nmove);
        });
        _.each(item.acctTrnRecCajeros, (v: any) => {
          if (v.acctTrnInfo.statusReverso != "REV01") {
            const dateStr: string = moment(
              v.acctTrnInfo.stmtDt,
              "YYYY-MM-DD"
            ).format("DD-MM-YYYY");
            const periodStr: string = moment(dateStr, "DD-MM-YYYY").format(
              "MMMM YYYY"
            );
            const fecha = this.formatDate(v.acctTrnInfo.stmtDt);
            const nmove: MoveModel = new MoveModel(
              v.acctTrnId,
              v.acctTrnInfo.trnType.desc,
              v.acctTrnInfo.totalCurAmt.amt.toString(),
              dateStr,
              periodStr,
              v.acctTrnInfo.networkTrnData.merchNum,
              v.acctTrnInfo.networkTrnData.merchName,
              v.acctTrnInfo.origCurAmt.curCode.curCodeValue,
              fecha,
              v.acctTrnInfo.trnTime,
              v.acctTrnInfo.networkTrnData.posEntryCapability,
              v.acctTrnInfo.totalCurAmt.amt,
              this.ccData.cardRec.cardInfo.acctRef.acctInfo.fiData.branchIdent,
              v.acctTrnId,
              ID,
              v.acctTrnInfo.salesSlipRefNum,
              v.acctTrnInfo.trnType.trnTypeCode,
              v.acctTrnInfo.cardRef.cardInfo.cardNum,
              v.acctTrnInfo.stmtDt,
              "",
              "",
              v.acctTrnInfo.statusReverso
            );
            nmove.currencyType =
              v.acctTrnInfo?.totalCurAmt?.curCode?.curCodeValue;
            movesAtm.push(nmove);
          }
        });
        _.each(item.acctTrnRecPagos, (v: any) => {
          if (v.acctTrnInfo.statusReverso != "REV01") {
            const dateStr: string = moment(
              v.acctTrnInfo.stmtDt,
              "YYYY-MM-DD"
            ).format("DD-MM-YYYY");
            const periodStr: string = moment(dateStr, "DD-MM-YYYY").format(
              "MMMM YYYY"
            );
            const fecha = this.formatDate(v.acctTrnInfo.stmtDt);
            const nmove: MoveModel = new MoveModel(
              v.acctTrnId,
              v.acctTrnInfo.trnType.desc,
              v.acctTrnInfo.totalCurAmt.amt.toString(),
              dateStr,
              periodStr,
              v.acctTrnInfo.networkTrnData.merchNum,
              v.acctTrnInfo.networkTrnData.merchName,
              v.acctTrnInfo.origCurAmt.curCode.curCodeValue,
              fecha,
              v.acctTrnInfo.trnTime,
              v.acctTrnInfo.networkTrnData.posEntryCapability,
              v.acctTrnInfo.totalCurAmt.amt,
              this.ccData.cardRec.cardInfo.acctRef.acctInfo.fiData.branchIdent,
              v.acctTrnId,
              ID,
              v.acctTrnInfo.salesSlipRefNum,
              v.acctTrnInfo.trnType.trnTypeCode,
              v.acctTrnInfo.cardRef.cardInfo.cardNum,
              v.acctTrnInfo.stmtDt,
              "",
              "",
              v.acctTrnInfo.statusReverso
            );
            nmove.currencyType =
              v.acctTrnInfo?.totalCurAmt?.curCode?.curCodeValue;
            this.flows.paymentsMoveModel.push(nmove);
          }
        });
        this.userData.extracts[extractQuery].moves = moves;
        this.userData.extracts[extractQuery].movesATM = movesAtm;
        this.checkFirstLoad(ID, extractQuery);
      }
    }
    this.isLoading = false;
    if (this.isFirstLoad) {
      this.getInitialMovements(ID, extractQuery);
      this.getInitialMovementsAtm(ID, extractQuery);
      this.getInitialPayments(ID, extractQuery);
      this.filterExtractsById(this.currentFilter, false, true);
    } else {
      this.filterExtractsById(this.currentFilter, true, true);
    }
  }

  /**
   * Hide cancelled movements MXSLCUSTSE-10044
   * @param {any} movementList - The movement list
   * @returns {any[]}
   */
  public movementsFilter(movementList: any[]): any[] {
    if (!movementList) {
      return [];
    }
    return [
      ...movementList.filter((movement) => {
        return movement.acctTrnInfo.trnType?.cancelledInd === "false";
      }),
    ];
  }

  /**
   * Get extract index.
   *
   * @private
   * @param {string} ID
   * @returns {number}
   * @memberof WelcomeComponent
   */
  private getExtractIndex(ID: string): number {
    const cix: number = _.findIndex(
      this.userData.extracts,
      (o: ExtractModel) => {
        return String(o.id) === String(ID);
      }
    );
    return cix;
  }

  /**
   * Get last extract Id.
   *
   * @private
   * @returns {string}
   * @memberof WelcomeComponent
   */
  private getLastExtractId(): string {
    return this.userData.extracts[0].id;
  }

  /**
   * Get extract Id from an index.
   *
   * @private
   * @param {number} index
   * @returns
   * @memberof WelcomeComponent
   */
  private getExtractId(index: number) {
    return this.userData.extracts[index].id;
  }

  /**
   * Get filter date name.
   *
   * @param {string} ID
   * @returns {string}
   * @memberof WelcomeComponent
   */
  getFilterDateName(ID: string): string {
    if (ID === undefined) {
      return "";
    }
    if (ID === this.getLastExtractId()) {
      if (this.dataProxyService.getChannel() === "default") {
        return "Periodo actual";
      } else {
        return "Corte actual";
      }
    } else {
      const idx: number = _.findIndex(this.userData.extracts, { id: ID });

      if (idx > -1) {
        let dateNumber = moment(
          this.userData.cutoff,
          "YYYY-MM-DD",
          "es"
        ).subtract(idx, "months");

        const dateNameTo = dateNumber.format("DD [de] MMMM ");
        dateNumber = dateNumber.add(1, "days");
        dateNumber = dateNumber.subtract(1, "months");
        const dateNameFrom = dateNumber.format("[Del] DD [de] MMMM [al] ");

        return `${dateNameFrom}${dateNameTo}`;
      }
      return "";
    }
  }

  /**
   * Filter By Desc.
   *
   * @param {string} evt
   * @memberof WelcomeComponent
   */
  filterByDesc(evt: string): void {
    this.filterDesc = evt;
    this.dateArraysQuantity = 0;
    this.dateArraysQuantityAtm = 0;
    // Get the extracts
    const extracts: ExtractModel[] = this.userData.extracts;
    const extrIdx: number = this.getExtractIndex(this.currentFilter);
    if (evt === "") {
      if (extrIdx !== -1) {
        if (!_.isUndefined(extracts[extrIdx])) {
          this.dataObject.filteredData = this.filterAllElements(extracts);
          this.dataObject.filteredDataAtm = this.filterAllElementsAtm(extracts);
          // this.dataObject.filteredData = this.sortDateKeys();
          this.dateArraysQuantity = Object.keys(
            this.dataObject.filteredData
          ).length;
          this.dateArraysQuantityAtm = Object.keys(
            this.dataObject.filteredDataAtm
          ).length;
        } else {
          this.filterExtractsById(this.currentFilter, true);
        }
      } else {
        const filter = Number(this.currentFilter) + 1;
        this.filterExtractsById(String(filter), true);
      }
    } else {
      this.dataObject.filteredData = this.filterAllElements(extracts);
      this.dataObject.filteredData = this.sortDateKeys();
      this.dataObject.filteredDataAtm = this.filterAllElementsAtm(extracts);
      this.dataObject.filteredDataAtm = this.sortDateKeysAtm();
      this.dateArraysQuantity = Object.keys(
        this.dataObject.filteredData
      ).length;
      this.dateArraysQuantityAtm = Object.keys(
        this.dataObject.filteredDataAtm
      ).length;
    }

    if (evt === "") {
      this.filterApply = false;
      this.filterName = "";
      this.sfApply = false;
    } else {
      this.filterApply = true;
      this.filterName = evt;
    }
  }

  /**
   * Filter show
   *
   * @memberof WelcomeComponent
   */
  showFilterApply() {
    if (this.sfApply) {
      this.sfApply = false;
    } else {
      this.sfApply = true;
    }
  }

  /**
   * Filter all elements.
   *
   * @private
   * @param {Array<ExtractModel>} extracts
   * @returns {*}
   * @memberof WelcomeComponent
   */
  private filterAllElements(extracts: ExtractModel[]): any {
    const content: any = [];
    const fullObject: any = [];
    _.each(extracts, (element) => {
      if (element.moves && element.moves.length > 0) {
        const tmp = _.filter(element.moves, (o: MoveModel) => {
          if (this.filterDesc) {
            return (
              o.txrComercio
                .toString()
                .toLowerCase()
                .indexOf(this.filterDesc.toLowerCase()) > -1
            );
          } else {
            if (this.activeFlow === "moreMoves") {
              return o.type === MoveType.COMPRA || o.type === MoveType.SEGURO;
            }
            return o;
          }
        });
        content.push(tmp);
      }
    });
    _.each(content, (movesArray) => {
      _.each(movesArray, (moves) => {
        fullObject.push(moves);
      });
    });
    return _.groupBy(fullObject, "date");
  }

  /**
   * Filter all elements.
   *
   * @private
   * @param {Array<ExtractModel>} extracts
   * @returns {*}
   * @memberof WelcomeComponent
   */
  private filterAllElementsAtm(extracts: ExtractModel[]): any {
    const content: any = [];
    const fullObject: any = [];
    _.each(extracts, (element) => {
      if (element.movesATM && element.movesATM.length > 0) {
        const tmp = _.filter(element.movesATM, (o: MoveModel) => {
          if (this.filterDesc) {
            return (
              o.txrComercio
                .toString()
                .toLowerCase()
                .indexOf(this.filterDesc.toLowerCase()) > -1
            );
          } else {
            return o;
          }
        });
        content.push(tmp);
      }
    });
    _.each(content, (movesArray) => {
      _.each(movesArray, (moves) => {
        fullObject.push(moves);
      });
    });
    return _.groupBy(fullObject, "date");
  }

  /**
   * Highlight the title according to the filter.
   *
   * @param {string} title
   * @returns {string}
   * @memberof WelcomeComponent
   */
  highlightTitle(title: string): string {
    if (!this.filterDesc || this.filterDesc.length === 0) {
      return title;
    }
    return title.replace(new RegExp(this.filterDesc, "gi"), (match) => {
      return `<span class="highlightText">${match}</span>`;
    });
  }

  /**
   * Check If Selected.
   *
   * @public
   * @param {string} id
   * @param {string} extract
   * @returns
   * @memberof WelcomeComponent
   */
  public checkIfSelected(id: string, extract: string, amount: number) {
    const idx = _.findIndex(
      this.dataProxyService.getDataSelected(),
      (o: MoveModel) => {
        return (
          o.id === id && o.txrNumExtracto === extract && o.amount === amount
        );
      }
    );
    if (idx > -1) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Create range.
   *
   * @param {number} limit
   * @returns
   * @memberof WelcomeComponent
   */
  createRange(limit: number) {
    const items: number[] = [];
    for (let i = 1; i <= limit; i++) {
      items.push(i);
    }
    return items;
  }

  /**
   * Retrieve parsed date.
   *
   * @param {*} dateToBeParsed
   * @returns
   * @memberof WelcomeComponent
   */
  retrieveParsedDate(dateToBeParsed: any) {
    moment.locale("es");
    if (
      this.dataProxyService.getChannel() === "SWAL" ||
      this.dataProxyService.getChannel() === "swal"
    ) {
      return moment(dateToBeParsed, "DD-MM-YYYY").format("DD MMMM, YYYY");
    } else {
      return moment(dateToBeParsed, "DD-MM-YYYY").format(
        "dddd DD [de] _MMMM, YYYY"
      );
    }
  }

  /**
   * Retrieve date from position at.
   *
   * @param {number} n
   * @returns {string}
   * @memberof WelcomeComponent
   */
  retrieveDateFromPositionAt(n: number): string {
    const obj = Object.keys(this.dataObject.filteredData)[n];
    if (obj === undefined) {
      return obj;
    } else {
      return obj.toString();
    }
  }

  /**
   * Retrieve date from position at.
   *
   * @param {number} n
   * @returns {string}
   * @memberof WelcomeComponent
   */
  retrieveDateFromPositionAtAtm(n: number): string {
    const obj = Object.keys(this.dataObject.filteredDataAtm)[n];
    if (obj === undefined) {
      return obj;
    } else {
      return obj.toString();
    }
  }

  /**
   * Retrieve parsed date from position at.
   *
   * @param {number} n
   * @returns
   * @memberof WelcomeComponent
   */
  retrieveParsedDateFromPositionAt(n: number) {
    const obj = Object.keys(this.dataObject.filteredData)[n];
    if (obj === undefined) {
      return obj;
    } else {
      return this.retrieveParsedDate(obj.toString());
    }
  }

  /**
   * Retrieve parsed date from position at.
   *
   * @param {number} n
   * @returns
   * @memberof WelcomeComponent
   */
  retrieveParsedDateFromPositionAtATM(n: number) {
    const obj = Object.keys(this.dataObject.filteredDataAtm)[n];
    if (obj === undefined) {
      return obj;
    } else {
      return this.retrieveParsedDate(obj.toString());
    }
  }

  /**
   * Retrieve parsed date from position at.
   *
   * @param {number} n
   * @returns
   * @memberof WelcomeComponent
   */
  retrieveParsedDateFromPositionAtWallet(n: number) {
    const obj = Object.keys(this.dataObject.filteredData)[n];
    return this.retrieveParsedDate(obj.toString());
  }

  /**
   * Retrieve parsed date from position at.
   *
   * @param {number} n
   * @returns
   * @memberof WelcomeComponent
   */
  retrieveParsedDateFromPositionAtWalletATM(n: number) {
    const obj = Object.keys(this.dataObject.filteredDataAtm)[n];
    return this.retrieveParsedDate(obj.toString());
  }

  /**
   * Get Movements.
   *
   * @param {number} n
   * @returns
   * @memberof WelcomeComponent
   */
  getMovements(n: number) {
    const obj = Object.keys(this.dataObject.filteredData)[n];
    return this.dataObject.filteredData[obj];
  }

  /**
   * Get Movements.
   *
   * @param {number} n
   * @returns
   * @memberof WelcomeComponent
   */
  getMovementsATM(n: number) {
    const obj = Object.keys(this.dataObject.filteredDataAtm)[n];
    return this.dataObject.filteredDataAtm[obj];
  }

  /**
   * Toggle nav.
   *
   * @memberof WelcomeComponent
   */
  toggleNav(): void {
    // Check if the div is open
    if (!this.navToggle) {
      this.navigationService.tapBack("filters", this.toggleNav);
    } else {
      this.navigationService.tapBack(
        "filters",
        this.navigationService.goToRoot
      );
    }
    this.navigationService.validateSession();
    this.navToggle = !this.navToggle;
    this.isHideNav = !this.isHideNav;
    // GA - Tealium
    // const itemSelectedDimention = this.consumerMovements ? '21' : '56';
    // this.taggingService.setDimenson(itemSelectedDimention, 'used');
    // this.taggingService.send('');
  }

  /**
   * Toggle mov.
   *
   * @private
   * @memberof WelcomeComponent
   */
  toggleMov(): void {
    // Check if the div is open
    if (!this.movToggle) {
      this.navigationService.tapBack("filters", this.toggleMov);
    } else {
      this.navigationService.tapBack(
        "filters",
        this.navigationService.goToRoot
      );
    }
    this.navigationService.validateSession();
    this.movToggle = !this.movToggle;
    this.isHideNav = !this.isHideNav;
    if (this.isHideNav) {
      document.body.style.overflow = "hidden";
      this.createMovements();
    } else {
      document.body.style.overflow = "auto";
      this.selectedItems = [];
    }
    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: "detalle_movimientos",
      interaction_action: "detalle_movimientos",
      interaction_label: "ver movimientos seleccionados",
      interaction_url: "aclaraciones/welcome_tdc",
    });
  }

  /**
   * Order movements by date.
   *
   * @private
   * @memberof WelcomeComponent
   */
  private createMovements(): void {
    this.selectedItems = [];
    try {
      for (let x = 0; x < this.dataProxyService.getDataSelected().length; x++) {
        this.selectedItemsPush(this.dataHandler[x]);
      }
      this.selectedItems.forEach((element, index) => {
        this.selectedItems[index].data = _.orderBy(
          element.data,
          "txrHrTxr",
          "desc"
        );
      });
      this.selectedItems = _.orderBy(this.selectedItems, "dateKey");
    } catch (error) {}
  }

  /**
   * Handle item for commerce payments.
   *
   * @public
   * @param {MoveModel} val
   * @param {string} period
   * @param {string} [type='']
   * @memberof WelcomeComponent
   */
  public handleItem(
    val: MoveModel,
    period: string,
    atmFlag: boolean,
    type: string = ""
  ) {
    const idx: any = _.find(
      this.dataHandler,
      {
        id: val.id,
        txrNumExtracto: val.txrNumExtracto,
        amount: val.amount,
      },
      0
    );
    if (idx) {
      const cindex: number = this.dataHandler.indexOf(idx);
      this.dataHandler.splice(cindex, 1);
    } else {
      if (this.activeFlow !== "moreMoves") {
        this.dataHandler = [];
      }

      if (atmFlag) {
        this.dataHandler = [];
      }
      const mv: MoveModel = new MoveModel(
        val.id,
        val.desc,
        val.amount.toString(),
        val.date,
        period,
        val.txrCodigoCom,
        val.txrComercio,
        val.txrDivisa,
        val.txrFecha,
        val.txrHrTxr,
        val.txrModoEntrada,
        val.txrMonto,
        this.ccData.cardRec.cardInfo.acctRef.acctInfo.fiData.branchIdent,
        val.txrMovExtracto,
        val.txrNumExtracto,
        val.txrReferencia,
        val.txrTipoFactura,
        val.txrPAN,
        moment(val.date, "YYYY-MM-DD").toDate(),
        "",
        "",
        val.statusReverso
      );
      mv.type = val.type;
      mv.currencyType = val.currencyType;

      this.dataHandler.push(mv);

      let flow = this.storage.getFromLocal("alreadyFlow");

      if (!flow && this.isConsumerTab) {
        this.flows.showSheetOptions(val, {
          originalFlow: this.originalFlow,
        });
        this.storage.saveInLocal("alreadyFlow", true);
      }
    }

    this.dataProxyService.setDataSource(this.dataHandler);
    this.storage.saveInLocal("isAtm", this.isConsumerTab);
    this.counter = this.dataHandler.length;
    this.navigationService.validateSession();
  }

  /**
   * Add the selected items to the array.
   *
   * @private
   * @param {*} item
   * @memberof WelcomeComponent
   */
  private selectedItemsPush(item: any) {
    const splited = item.date.split("-");
    const dateKey = `${splited[2]}${splited[1]}${splited[0]}`;
    if (this.getIndexAt(item.date) === -1) {
      this.selectedItems.push({ key: item.date, dateKey, data: [] });
    }
    this.selectedItems[this.getIndexAt(item.date)].data.push(item);
  }

  /**
   * Select items split.
   *
   * @param {*} item
   * @memberof WelcomeComponent
   */
  selectedItemsSplit(item) {
    const idx: any = _.find(
      this.dataHandler,
      {
        id: item.id,
        txrNumExtracto: item.txrNumExtracto,
      },
      0
    );
    const cindex: number = this.dataHandler.indexOf(idx);
    this.dataHandler.splice(cindex, 1);
    this.dataProxyService.dataSourceSelected(this.dataHandler);
    const idx2 = _.find(
      this.selectedItems[this.getIndexAt(item.date)].data,
      item
    );
    this.selectedItems[this.getIndexAt(item.date)].data.splice(idx2, 1);
    this.counter = this.dataHandler.length;
    this.createMovements();
    // GA - Tealium
    // const itemSelectedDimention = this.consumerMovements ? '24' : '54';
    // this.taggingService.setDimenson(itemSelectedDimention, 'used');
    // this.taggingService.send('');
  }

  /**
   * Get index at.
   *
   * @param {string} key
   * @returns
   * @memberof WelcomeComponent
   */
  getIndexAt(key: string) {
    const idx = -1;
    for (let x = 0; x < this.selectedItems.length; x++) {
      if (this.selectedItems[x].key === key) {
        return x;
      }
    }
    return idx;
  }

  /**
   * Handle error.
   *
   * @private
   * @param {*} error
   * @memberof WelcomeComponent
   */
  private handleError(error: any) {
    // this.router.navigate(['no-connection']);
  }

  /**
   * Format Date.
   *
   * @private
   * @param {string} v
   * @returns {string}
   * @memberof WelcomeComponent
   */
  private formatDate(v: string): string {
    return moment(v, "YYMMDD").format("YYYY-MM-DD[T06:00:00+00:00]").toString();
  }

  /**
   * Opener Light Box.
   *
   * @param {*} event
   * @param {*} id
   * @memberof WelcomeComponent
   */
  public tooltipOpener(event, id) {
    // Define tooltipeText
    let ttText = "";

    switch (id) {
      case 1:
        ttText =
          "Por favor toque “x” para eliminar un movimiento que ya no desee mandar a aclarar.";
        break;
      case 2:
        ttText = "Compras en locales o centros comerciales";
        break;
      case 3:
        ttText = "Retiros en cajero automático";
        break;
      default:
        ttText =
          "Es importante señalar que se pueden aclarar movimientos de hasta 3 meses anteriores a la fecha actual.";
        break;
    }

    const y = event.clientY;
    const x = event.clientX;
    const tooltip = document.getElementById("tooltip-box");
    const backdrop = document.getElementById("backdrop");
    const tooltipText = document.getElementById("tooltip-text");
    const flagBorder = document.getElementById("flag-border");
    const flagColor = document.getElementById("flag-color");

    tooltipText.innerHTML = ttText;
    tooltip.style.top = y + 20 + "px";
    tooltip.style.position = "fixed";
    flagColor.style.left = x - 14 + "px";
    flagBorder.style.left = x - 14 + "px";
    backdrop.classList.remove("tooltip-hide");
    tooltip.classList.remove("tooltip-hide");
  }

  hideMovReverso() {
    this.MovementsInProccess.push(this.dataHandler[0]);
    this.dataHandler.splice(0, 1);
    this.dataProxyService.setDataSource(this.dataHandler);
  }

  validateMoveReversoselected(move) {
    let value = false;
    const index = _.findIndex(this.MovementsInProccess, (o) => {
      return o.id === move;
    });
    if (index >= 0) {
      value = true;
    }
    return value;
  }

  /**
   * metodo que recibe del hijo la accion de continuar
   * guarda los movimientos seleccionados en sesion y navega a el cuestionario
   *
   * @memberof WelcomeComponent
   */
  executeContinue(): void {
    if (this.edit || this.activeFlow === "moreMoves") {
      this.taggingService.link({
        event: "aclaraciones",
        interaction_category: "aclaraciones_cargos",
        interaction_action: "seleccion_movimiento",
        interaction_label: "continuar",
        interaction_url: "aclaraciones/welcome_tdc",
      });
      this.actionAfterEditOrCancell();
      return;
    }

    // Send the movements to the GA
    const movements = this.dataProxyService.getDataSelected();
    const movementsIds: number[] = [];
    const amounts: string[] = [];

    movements.forEach((element) => {
      movementsIds.push(element.id);
      amounts.push(element.txrMonto);
    });
    /*this.taggingService.setDimenson('8', movementsIds.join());
    this.taggingService.setDimenson('16', amounts.join());
    this.taggingService.send('');*/

    this.navigationService.validateSession();
    if (this.storage.getFromLocal("isAtm")) {
      this.taggingService.link({
        event: "aclaraciones",
        interaction_category: "aclaraciones_atm",
        interaction_action: "click_boton",
        interaction_label: "continuar",
      });
      this.router.navigate(["questionnaire"]);
    } else {
      this.taggingService.link({
        event: "aclaraciones",
        interaction_category: "aclaraciones_cashback",
        interaction_action: "click_boton",
        interaction_label: "continuar",
      });
      this.validateMovementAtm();
    }
  }

  validateMovementAtm(): void {
    // statusReverso ==='REV02'Operación en Proceso de ser Reversada

    if (this.dataProxyService.getDataSelected()[0].statusReverso === "REV02") {
      this.createMovements();
      this.toggleReverso();

      this.hideMovReverso();
    } else {
      this.storage.saveInLocal("states", this.dataProxyService.getStates());
      this.storage.saveInLocal(
        "multifolio",
        this.dataProxyService.getDataSelected()
      );
      this.storage.saveInLocal("chanel", this.dataProxyService.getChannel());
      this.storage.saveInLocal(
        "enviroment",
        this.dataProxyService.getEnviroment()
      );
      this.storage.saveInLocal("userdata", this.dataProxyService.getUserData());
      this.storage.saveInLocal(
        "categoria",
        "TARJETA DE CREDITO TARJETAHABIENTES"
      );
      this.router.navigate(["questionarie-atm"]);
    }
  }

  /**
   * Toggle nav.
   *
   * @private
   * @memberof WelcomeComponent
   */
  toggleReverso(): void {
    // Check if the div is open
    if (!this.reversoToggle) {
      this.navigationService.tapBack("filters", this.toggleNav);
    } else {
      this.navigationService.tapBack(
        "filters",
        this.navigationService.goToRoot
      );
    }
    this.navigationService.validateSession();
    this.reversoToggle = !this.reversoToggle;
    this.isHideNav = !this.isHideNav;
  }

  public get isConsumerTab(): boolean {
    return this.selectedTab === this.tabOptions.CONSUMER;
  }

  public get isAtmTab(): boolean {
    return this.selectedTab === this.tabOptions.ATM;
  }

  public get isCashbackTab(): boolean {
    return this.selectedTab === this.tabOptions.CASHBACK;
  }

  public get selectedMoves(): boolean {
    return this.counter > 0;
  }
}
