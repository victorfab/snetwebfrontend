import {
  Component,
  OnInit,
  ViewChild,
  forwardRef,
  Renderer2,
  ElementRef,
  OnDestroy,
  ChangeDetectorRef,
  inject,
} from "@angular/core";
import { Location } from "@angular/common";
import { Router, ActivatedRoute, ParamMap, Route } from "@angular/router";
import { SessionStorageService } from "../../../services/tdd/session-storage.service";
import { HttpClient, HttpHeaders, HttpRequest } from "@angular/common/http";
import { DataService } from "../../../services/data.service";
import { UtilsTddService } from "../../../services/tdd/utils-tdd.service";
import { NavigationService } from "../../../services/navigation.service/navigation.service";
//Taggeo

import { TaggingService } from "../../../services/tagging.service";
import * as md5 from "blueimp-md5";

// Import Tooltips
import { TooltipTddComponent } from "../";
import moment, { Moment } from "moment";
import * as _ from "lodash";
import { TabOptions } from "../../../enums/tab.enum";

import {
  SessionStorageService as Session,
  LocalStorageService,
} from "angular-web-storage";
import { CashbackService } from "../../../services/cashback/cashback.service";
import { DateFormat } from "../../../enums/date-format.enum";
import { CashBack } from "../../../enums/cashback.enum";
import { ArrowType } from "../../../enums/arrow-type.enum";
import { ProductService } from "../../../services/product.service";
import { from, mergeMap, Observable, Subscription } from "rxjs";
import { TooltipService } from "../../../services/tooltip.service";
import { MonthCall } from "../../../interfaces/cashback-month-call.interface";
import { QuestionnarieBuilder } from "../../../shared/questionnarie-builder";
import { FormOptions } from "../../../enums/form-options.enum";
import { Control } from "../../../models/control.model";

/**
 * Componente que muestra la pantalla de movimientos
 * posibles a aclarar
 * Ademas de los filtros y el repositorio de movimientos
 *
 * @export
 * @class WelcomeComponentTDD
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: "app-welcome-tdd",
  templateUrl: "./welcome-tdd.component.html",
  providers: [DataService, NavigationService],
})
export class WelcomeTddComponent implements OnInit, OnDestroy {
  // TODO: Check this
  // @ViewChild(forwardRef(() =>TooltipTddComponent),{static:true}) tooltip:TooltipTddComponent;

  @ViewChild("modal") modal!: ElementRef<HTMLDivElement>;
  //SETEO VARIABLES

  // Token
  token: string;

  //Spinner
  spinner: boolean;

  //Filtros

  sfApply: boolean = false;
  filterApply: boolean = false;
  filterName: string = "";
  enable: boolean = false;
  actualFilter: number;

  //Channel
  chanelType: string = "";

  //MOvimientos globales
  globalMoves = [];
  globalMovesATM = [];
  allMoves = [];
  allMovesATM = [];
  viewMoves = [];
  viewMovesATM = [];
  filterMoves = [];
  filterMovesAtm = [];
  filterNameApply = "";

  //Selected Moves
  smSelectedMoves = [];
  viewSelectedMoves = [];

  MovementsInProccess = [];
  //Bandera carga movimientos
  isLoadingMoves: boolean;

  // Assign value to set on hideToggle function
  public toggleId = "";

  // Movement to find
  findMovement = "";

  public tabOptions = TabOptions;
  public selectedTab: TabOptions = TabOptions.CONSUMER;
  public globalCashbackMoves: any[] = [];
  private allCashbackMoves = [];
  public cashbackMoves = [];
  public cashbackSelected = false;
  public isCashbackLoading = false;

  private CASHBACK_DAYS = 59;
  private CASHBACK_DAYS_SESSION = 29;
  public arrowType = ArrowType;
  public cashbackIdList = [];
  public tabCashback: boolean = false;
  private cardSubscription!: Subscription;
  public selectedCashback: any[] = [];
  private readonly FILTER_DELAY = 500;
  public wasFiltered = false;
  public thereMoves: boolean = false;
  private cashbackPlusElements = [];
  private LIMMIT_DAY = 16;

  /**
   *Creates an instance of WelcomeTddComponent.
   * @param {ActivatedRoute} route
   * @param {Router} router
   * @param {Location} location
   * @param {SessionStorageService} storage
   * @param {HttpClient} http
   * @param {DataService} dataService
   * @param {TaggingService} taggingService
   * @param {UtilsTddService} utils
   * @memberof WelcomeTddComponent
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private storage: SessionStorageService,
    private http: HttpClient,
    private dataService: DataService,
    private utils: UtilsTddService,
    private navigationService: NavigationService,
    private ts: TaggingService,
    private session: Session,
    private cashbackService: CashbackService,
    private renderer: Renderer2,
    private sessionStorage: LocalStorageService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private tooltip: TooltipService,
    private taggingService: TaggingService
  ) {
    localStorage.removeItem('tagData');
    //DEC VARIBALES

    //Spinner
    this.spinner = true;

    //GET URL PARAMETERS
    route.paramMap.subscribe((params) => {
      this.token = params.get("token");
    });

    //Get Channel
    this.chanelType = this.storage.getFromLocal("chanel");
    //this.chanelType = 'wallet';

    //For Navigation Rules
    this.hideToggle = this.hideToggle.bind(this);

    //For Taggeo

    //const userID = md5(this.dataProxyService.getBuc(), 'mx-aclaraciones-cs');
    //this.taggingService.setUserID()
    this.session.remove("result");
    this.session.remove("clacon");
    this.utils.clearData();
  }

  /**
   * Metodo que carga las urls al servicio dataService
   * hace el llamado a los movimientos del usuario
   *
   * @memberof WelcomeTddComponent
   */
  ngOnInit() {
    this.saveSession();
    this.dataService.setUris(this.storage.getFromLocal("enviroment"));
    this.isLoadingMoves = true;
    this.callMoveService(0, 0);
    this.getCashback();

    //Tap Back Button
    this.navigationService.tapBack("welcome", this.navigationService.goToRoot);

    //TALIUM TAG
    this.setDataLayer();
    this.clear();
  }

  private getCashback(): void {
    const currentDay = moment().get(DateFormat.DAY_D);

    const currentAndOneBefore = currentDay > this.LIMMIT_DAY;

    const monthsNumber = currentAndOneBefore ? 2 : 3;

    const months = this.utils.getMonthsByNumber(monthsNumber);

    this.isCashbackLoading = true;

    from(this.getMonths(monthsNumber))
      .pipe(mergeMap((request) => this.cashbackService.fetchCashback(request)))
      .subscribe({
        next: (data) => {
          this.cashbackPlusElements = [...this.cashbackPlusElements, ...data];
        },
        complete: () => {
          this.isCashbackLoading = false;
          this.globalCashbackMoves = this.utils.separateByMonth(
            this.utils.movementsFilter(this.cashbackPlusElements),
            months
          );

          this.fillMoves();
        },
        error: (err) => {
          this.isCashbackLoading = false;
          console.log(err);
        },
      });


  }

  /**
   * Fill the cashbackMoves array to paint in view
   * @Void
   */
  private fillMoves(): void {
    this.allCashbackMoves = [];

    let extract = 0;

    for (let i of this.globalCashbackMoves) {
      for (let j of i) {
        this.allCashbackMoves.push(this.utils.generateMove(j, extract));
      }
      extract++;
    }
    this.cashbackMoves = this.generateViewMoves(this.allCashbackMoves);
    if (this.cashbackMoves.length > 0) {
      this.thereMoves = true;
    } else {
      this.thereMoves = false;
    }
  }

  /**
   * Hace el cambio de los movimientos por mes a un array global
   * los movimientos de la vista son generados de la lista global
   * Generar movimientos
   *
   * @memberof WelcomeTddComponent
   */
  generateMovesArray(ignoreCachback = true) {
    this.allMoves = [];
    this.allMovesATM = [];

    let extract = 0;
    for (let i of this.globalMoves) {
      for (let j of i) {
        this.allMoves.push(this.utils.generateMove(j, extract));
      }
      extract += 1;
    }
    this.viewMoves = this.generateViewMoves(this.allMoves);

    extract = 0;

    for (let i of this.globalMovesATM) {
      for (let j of i) {
        // REV01 Operación Reversada no se muestra dado a que no se puede aclarar dado a que el cliente ya tiene su dinero en la cuenta
        if (j.acctTrnInfo.statusReverso != "REV01") {
          this.allMovesATM.push(this.utils.generateMove(j, extract));
        }
      }
      extract += 1;
    }
    this.viewMovesATM = this.generateViewMoves(this.allMovesATM);

    if (!ignoreCachback) {
      this.allCashbackMoves = [];
      extract = 0;

      for (let i of this.globalCashbackMoves) {
        for (let j of i) {
          this.allCashbackMoves.push(this.utils.generateMove(j, extract));
        }
        extract += 1;
      }
      this.cashbackMoves = this.generateViewMoves(this.allCashbackMoves);
      this.selectedCashback = this.smSelectedMoves;
    }
  }

  /**
   * Filtrar Moviemientos
   * Genera un array de el mes seleccionado
   * recibe el indice para tomarlo del arreglo de meses
   * genera la vista del filtro
   *
   * @param {*} moves
   * @param {number} index
   * @memberof WelcomeTddComponent
   */
  generateFilterMoves(moves: any, index: number) {
    this.filterMoves = [];

    for (let i of moves) {
      this.filterMoves.push(this.utils.generateMove(i, index));
    }
    this.viewMoves = this.generateViewMoves(this.filterMoves);
  }
  /**
   * Filtrar Moviemientos de ATM
   * Genera un array de el mes seleccionado
   * recibe el indice para tomarlo del arreglo de meses
   * genera la vista del filtro
   *
   * @param {*} moves
   * @param {number} index
   * @memberof WelcomeTddComponent
   */
  generateFilterMovesAtm(moves: any, index: number) {
    this.filterMovesAtm = [];
    for (let i of moves) {
      this.filterMovesAtm.push(this.utils.generateMove(i, index));
    }
    this.viewMovesATM = this.generateViewMoves(this.filterMovesAtm);
  }

  /**
   * Filtrar Moviemientos
   * Genera un array de el mes seleccionado
   * recibe el indice para tomarlo del arreglo de meses
   * genera la vista del filtro
   *
   * @param {*} moves
   * @param {number} index
   * @memberof WelcomeTddComponent
   */
  generateFilterMovesCashback(moves: any, index: number) {
    this.wasFiltered = true;
    if (!moves) {
      this.cashbackMoves = [];
      return;
    }
    const filterMoves = [];
    for (let i of moves) {
      filterMoves.push(this.utils.generateMove(i, index));
    }
    this.cashbackMoves = this.generateViewMoves(filterMoves);
    this.selectedCashback = this.smSelectedMoves;
    this.addDelay();
  }

  /**
   * change of movements to display
   * @param value  boolean value
   */
  public changeMoves(option: TabOptions) {
    this.selectedTab = option;
    this.smSelectedMoves = [];
    this.selectedCashback = [];
    this.session.remove("clacon");

    this.cashbackSelected = false;

    if (option === TabOptions.CASHBACK) {
      if (!this.productService.getCardLikeURetrieved) {
        this.cardSubscription = this.productService
          .getCardProduct("LikeU", true)
          .subscribe();
      }
      this.clear();
    }
    this.getTab(option);
  }

  public getTab(option: TabOptions) {
    if (option === 3) {
      this.tabCashback = true;
    } else {
      this.tabCashback = false;
    }
  }

  /**
   *
   * FILTRADO POR PALABRAS
   * @param {string} id
   * @memberof WelcomeTddComponent
   */
  inteligentFilter(id: string) {
    this.wasFiltered = true;
    this.selectedCashback = this.smSelectedMoves;
    if (id === "") {
      this.viewMoves = this.generateViewMoves(this.allMoves);
      this.viewMovesATM = this.generateViewMoves(this.allMovesATM);
      this.cashbackMoves = this.generateViewMoves(this.allCashbackMoves);
      this.filterApply = false;
      this.filterName = "";
    } else {
      this.filterMoves = [];
      this.filterApply = true;
      this.filterName = id;
      this.findMovement = id;
      for (let i of this.allMoves) {
        if (i.txrComercio.toLowerCase().indexOf(id.toLowerCase()) > -1) {
          this.filterMoves.push(i);
        }
      }
      this.viewMoves = this.generateViewMoves(this.filterMoves);
      this.filterMoves = [];
      for (let i of this.allMovesATM) {
        if (i.txrComercio.toLowerCase().indexOf(id.toLowerCase()) > -1) {
          this.filterMoves.push(i);
        }
      }
      this.viewMovesATM = this.generateViewMoves(this.filterMoves);

      this.filterMoves = [];
      for (let i of this.allCashbackMoves) {
        if (i.txrComercio.toLowerCase().indexOf(id.toLowerCase()) > -1) {
          this.filterMoves.push(i);
        }
      }
      this.cashbackMoves = this.generateViewMoves(this.filterMoves);
    }
    this.addDelay();
  }
  /**
   *
   * Cambiar letras mayusculas en la busqueda
   * @param {string} commerceName
   * @param {string} findMovement
   * @returns
   * @memberof WelcomeTddComponent
   */
  highlightFilter(commerceName: string, findMovement: string) {
    if (findMovement.length > 0) {
      return commerceName.replace(new RegExp(findMovement, "gi"), (match) => {
        return `<span class="bold">${match}</span>`;
      });
    } else {
      return commerceName;
    }
  }

  /**
   * delete Filters
   *
   * @memberof WelcomeTddComponent
   */
  deleteFilters() {
    this.wasFiltered = true;
    this.findMovement = "";
    this.cdr.detectChanges();
    this.addDelay();
  }

  /**
   * Generar Movimientos Vista
   * genera un mapa con fecha,array
   * la fecha se usa como llave para la vista
   * el array contiene los movimientos de esa fecha
   *
   *
   * @param {*} moves
   * @returns {*}
   * @memberof WelcomeTddComponent
   */
  generateViewMoves(moves: any): any {
    let tempArray = [];
    if (moves.length > 0) {
      for (let move of moves) {
        let index = _.findIndex(tempArray, (o) => {
          return o.key.getTime() === move.typeDate.getTime();
        });
        if (index >= 0) {
          tempArray[index].value.push(move);
        } else {
          tempArray.push({ key: move.typeDate, value: [move] });
        }
      }
    }

    return tempArray;
  }

  /**
   *LLAMADO AL SERVICIO D EMOVIMIENTOS
   *
   * hace el llamado de movimientos
   * se hace el llamado 4 veces o al segundo reintenro
   * una vez terminado el llamado genera el array global y de la vista
   *
   *
   * @private
   * @param {number} month
   * @param {number} retry
   * @memberof WelcomeTddComponent
   */
  private callMoveService(month: number, retry: number) {
    let endpoint = this.getMovesEndpoint(month);
    const httpOptions = this.utils.getHeadersRequest();
    if (this.globalMoves.length < 4) {
      this.http.get(endpoint, httpOptions).subscribe(
        (data: any) => {
          this.globalMoves.push(data.acctTrnRecComercios);
          this.globalMovesATM.push(data.acctTrnRecCajeros);
          this.callMoveService(month + 1, 0);
        },
        (err) => {
          if (retry < 1) {
            this.callMoveService(month, retry + 1);
          } else {
            this.isLoadingMoves = false;
            this.generateMovesArray();
          }
        }
      );
    } else {
      this.isLoadingMoves = false;
      this.generateMovesArray();
    }
  }

  /**
   * Following MXSLCUSTSE-10082 should save acctTrnRecComercios at session
   * @Void
   */
  private saveInSession(): void {
    const temp = [];
    // Flat the moves
    this.globalCashbackMoves.forEach((m) => {
      temp.push(...m);
    });
    const save = temp.some(
      ({ acctTrnInfo }) => acctTrnInfo.trnType.trnTypeCode === CashBack.NOMINA
    );

    const move = this.storage.getFromLocal("multifolio")[0];

    if (save && move) {
      const date = this.utils.dateToYYYYMMDD(move.date);
      const end = moment(date);
      const start = moment(date).subtract(this.CASHBACK_DAYS_SESSION, "d");
      if (!this.viewMoves.length) {
        this.viewMoves = this.generateViewMoves(this.allMoves);
      }

      let elements = this.viewMoves.filter(
        ({ key }) =>
          ((moment(key).isAfter(start) ||
            moment(key).format(DateFormat.YYYY_MM_DD) ===
              start.format(DateFormat.YYYY_MM_DD)) &&
            moment(key).isBefore(end)) ||
          moment(key).format(DateFormat.YYYY_MM_DD) ===
            end.format(DateFormat.YYYY_MM_DD)
      );
      //elements = _.sortBy(elements, 'typeDate').reverse();
      this.session.set("result", elements);
    }
  }

  /**
   *Selected Moves View
   *
   * genera el array que se muestra en el repositorio de movimientos
   * mapa fecha - array
   * @memberof WelcomeTddComponent
   */
  generateSelectedView() {
    this.viewSelectedMoves = [];
    this.viewSelectedMoves = this.generateViewMoves(this.smSelectedMoves);
    this.viewSelectedMoves = _.orderBy(this.viewSelectedMoves, "key", "desc");
  }

  /**
   * Movimientos Seleccionados
   * agrega los movimientos que se vayan seleccionando en la vista
   * a un mapa fecha - array
   * si la fecha del movimiento existe en el mapa lo agrega a su array
   * si no agrega la llave y al array con el movimiento
   *
   * @param {*} move
   * @returns {*}
   * @memberof WelcomeTddComponent
   */
  selectedMoves(move: any): any {
    if (this.wasFiltered) {
      return;
    }
    this.cashbackSelected =
      (this.session.get("clacon") as string[])?.length > 0;

    const index = _.findIndex(this.smSelectedMoves, (o) => {
      return o.id === move.id;
    });

    if (this.isAtmTab) {
      if (index >= 0) {
        this.smSelectedMoves.splice(0, 1);
      } else {
        this.smSelectedMoves = [];
        this.smSelectedMoves.push(move);
      }
    } else {
      if (index >= 0) {
        this.smSelectedMoves.splice(index, 1);

        if (this.isCashbackTab) {
          this.cashbackIdList = [
            ...this.cashbackIdList.filter((id) => id !== move.id),
          ];
        }
      } else {
        if (this.isCashbackTab) {
          this.cashbackIdList = [];
          this.smSelectedMoves = [];
          this.selectedCashback = [];
          this.cashbackIdList.push(move.id);
          this.cashbackIdList = [...this.cashbackIdList];
          this.storage.saveInLocal("multifolio", [move]);
        }

        this.smSelectedMoves.push(move);
      }
      this.checkSelectedElements(move);
    }
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

  /**
   * genera el endpoint que se debe consultar
   * dependiendo de el ambiente y del modo dummy
   *
   * @param {number} month
   * @returns {string}
   * @memberof WelcomeTddComponent
   */
  getMovesEndpoint(month: number): string {
    let endpoint = "";
    if (this.storage.getFromLocal("dummy")) {
      endpoint = "assets/data/moves-tdd." + month + ".json";
    } else {
      endpoint =
        this.dataService.getApiURL("debit") +
        "/movements/years/" +
        this.getMovesYear(month) +
        "/months/" +
        this.getMovesMonth(month);
    }
    return endpoint;
  }

  //GET CLIENT ID
  /**
   * una vez cargado el elemento de la vista
   * esconde el spinner
   *
   * @private
   * @memberof WelcomeTddComponent
   */
  private saveSession(): void {
    // session
    this.spinner = false;
  }

  /**
   * Check if movement is selected and return true
   * to add "active" class.
   *
   * @param {*} element
   * @returns {boolean}
   * @memberof WelcomeTddComponent
   */
  checkSelectedElements(element: any): boolean {
    let value = false;
    const index = _.findIndex(this.smSelectedMoves, (o) => {
      return o.id === element;
    });
    if (index >= 0) {
      value = true;
    }
    return value;
  }

  /**
   * muestra un lightbox cuando se da click
   * filtro o repositorio de movimientos
   *
   * @param {*} id
   * @memberof WelcomeTddComponent
   */

  showToggle() {
    let element = document.getElementById(this.toggleId);
    element.classList.add("animate");

    //Tap Back Button
    this.navigationService.tapBack("filters", this.hideToggle);

    if (this.toggleId === "selectedMovComp") {
      this.ts.link({
        event: "aclaraciones",
        interaction_action: "listado_movimientos",
        interaction_category: "detalle_movimientos",
        interaction_label: "movimientos",
        interaction_url: 'aclaraciones/welcome_tdd'
      });
    } else {
      this.ts.link({
        event: "aclaraciones",
        interaction_action: "mostrar_filtros",
        interaction_category: "mostrar_filtros",
        interaction_label: "filtros",
        interaction_url: 'aclaraciones/welcome_tdd'
      });
    }
  }

  /**
   * esconde un lightbox cuando se da click
   * filtro o repositorio de movimientos
   *
   * @param {*} id
   * @memberof WelcomeTddComponent
   */
  hideToggle() {
    let element = document.getElementById(this.toggleId);
    element.classList.remove("animate");
    element.classList.add("animateReverse");
    setTimeout(function () {
      element.classList.remove("animateReverse");
    }, 700);

    if (this.toggleId === "filtersComp" && this.enable) {
      this.filterApply = true;
    }

    if (this.toggleId === "reversoNotification") {
      this.hideMovReverso();
    }

    //Tap Back Button
    this.navigationService.tapBack("filters", this.navigationService.goToRoot);
    this.toggleId = "";
  }

  /**
   * muestra el lightbox del child tooltip
   * genera el mensaje del tooltip y lo pasa como parametro al child
   *
   * @param {*} evt
   * @param {*} id
   * @memberof WelcomeTddComponent
   */
  public showTooltip(evt: any, id) {
    this.tooltip.showTooltip(evt, id);
  }

  /**
   * metodo que recibe del hijo la accion de continuar
   * guarda los movimientos seleccionados en sesion y navega a el cuestionario
   *
   * @memberof WelcomeTddComponent
   */
  executeContinue() {
    const clacon = this.session.get("clacon") as string[];
    if (clacon && clacon.length) {
      this.ts.link({
        event: "aclaraciones",
        interaction_action: "seleccion_movimiento",
        interaction_category: "aclaraciones_cargos",
        interaction_label: "continuar",
        interaction_url: 'aclaraciones/welcome_tdd'
      });

      this.saveInSession();
      this.router.navigate(["cashback-movements"]);
      return;
    }
    if (this.isConsumerTab) {
      this.taggingService.link({
        event: "aclaraciones",
        interaction_action: "seleccion_de_movimiento",
        interaction_category: "aclaraciones_cargos",
        interaction_label: "continuar",
        interaction_url: 'aclaraciones/welcome_tdd'
      });

      this.storage.saveInLocal("multifolio", this.smSelectedMoves);
      this.router.navigate(["questionnaireTDD"]);
    } else {
      this.taggingService.link({
        event: "aclaraciones",
        interaction_category: "movimientos_atm",
        interaction_action: "click_boton",
        interaction_label: "continuar",
        interaction_url: 'aclaraciones/welcome_tdd'
      });
      this.validateMovementAtm();
    }
  }

  hideMovReverso() {
    this.MovementsInProccess.push(this.smSelectedMoves[0]);
    this.smSelectedMoves.splice(0, 1);
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

  validateMovementAtm() {
    // statusReverso ==='REV02'Operación en Proceso de ser Reversada
    if (this.smSelectedMoves[0].statusReverso === "REV02") {
      this.toggleId = "reversoNotification";
      this.showToggle();
    } else {
      this.storage.saveInLocal("multifolio", this.smSelectedMoves);
      this.router.navigate(["questionarie-atm"]);
    }
  }

  /**
   * muestra la aplicación de los filtros en la vista
   *
   * @memberof WelcomeTddComponent
   */
  showFilterApply() {
    if (this.sfApply) {
      this.sfApply = false;
    } else {
      this.sfApply = true;
    }
  }

  removeSign(cant: any) {
    return Math.abs(cant);
  }

  //TAGGEO
  /**
   * Sets the dataLayer for Google Analytics
   *
   * @memberof WelcomeComponent
   * @returns {void}
   */
  public setDataLayer(): void {
    const userID = md5(this.storage.getFromLocal("buc"), "mx-aclaraciones-cs");
    const channel = this.chanelType;
    let section = "santander_supermovil";
    if (channel !== "default") {
      section = "santander_superwallet";
    }

    this.ts.setvaluesWelcome(
      "aclaraciones",
      "welcometdd",
      userID,
      this.storage.getFromLocal("userdata").cardName,
      section
    );
    // this.taggingService.view(this.ts.getvalues());

    this.ts.view({
      tag_subsection1: "aclaraciones",
      tag_titulo: "aclaraciones|welcome_tdd",
      tag_url: "/aclaraciones/welcomeTDD",
      tag_userId: userID,
      tag_tipoDeTarjeta: this.storage.getFromLocal("userdata").cardName,
      tag_procedencia: [section],
    });

    /*this.taggingService.setUserID(userID);
    const channel = this.chanelType;
    let section = 'Santander SuperMóvil TDD';
    if (channel !== 'default') {
      section = 'Santander SuperWallet TDD';
    }
    const dataLayer = {
      1: section,
      2: 'clarifications',
      3: 'registration',
      4: 'movements list',
      17: 'step-select movements',
      18: 'registration of clarifications',
    };
    this.taggingService.uTagView(dataLayer);
    this.taggingService.setPageName();
    this.taggingService.send(location.hash);*/
  }

  public tagginService(dimension: string, type: string): void {
    /*
        if(type != ''){
          dimension = (type === 'icon') ? '25' : '26';
        }

        this.taggingService.setDimenson(dimension, 'used');
        this.taggingService.send(location.hash);
    */
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

  public closeMovements(): void {
    this.renderer.removeClass(this.modal.nativeElement, "animate");
    this.renderer.addClass(this.modal.nativeElement, "animateReverse");
    setTimeout(() => {
      this.renderer.removeClass(this.modal.nativeElement, "animateReverse");
    }, 700);
    //Tap Back Button
    this.navigationService.tapBack("filters", this.navigationService.goToRoot);
    this.toggleId = "";
  }

  private clear() {
    this.sessionStorage.remove("questionnaire");
    this.sessionStorage.remove("questionId");
    this.sessionStorage.remove("multifolio");
    this.sessionStorage.remove("editFlow");
    this.sessionStorage.remove("isCashbackFlow");
    this.sessionStorage.remove("viewQuestions");
    this.sessionStorage.remove("additionaldata");
    this.sessionStorage.remove("location");
    this.sessionStorage.remove("SMResponse");
    this.sessionStorage.remove("cashbackTicket");
    this.session.remove("multifolio");
    this.sessionStorage.remove("extractsDates");
    this.sessionStorage.remove("listMoves");
  }

  private addDelay(): void {
    setTimeout(() => {
      this.wasFiltered = false;
    }, this.FILTER_DELAY);
  }

  /**
   * Returns a year mont list starting in current month
   * @param size
   */
  private getMonths(size = 2): MonthCall[] {
    const months: MonthCall[] = [];

    for (let i = 0; i < size; i++) {
      const date = moment().subtract(i, DateFormat.MONTH_M);
      months.push({
        month: date.format("M"),
        year: date.get("year").toString(),
      });
    }
    return months;
  }

  ngOnDestroy(): void {
    if (this.cardSubscription) {
      this.cardSubscription.unsubscribe();
    }
  }
}
