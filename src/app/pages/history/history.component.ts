import { Component, OnInit, HostListener } from "@angular/core";
import { Subscription } from "rxjs";
import { Router, ActivatedRoute } from "@angular/router";
import { DataProxyService } from "./../../services/data-proxy.service";
// Services
import { NavigationService } from "./../../services/navigation.service/navigation.service";
import { DataService } from "./../../services/data.service";
import { ConstantsService } from "./../../services/constants.service";
import { TaggingService } from "../../services/tagging.service";
import { UtilsService } from "../../services/utils.service";
import { OsService } from "./../../services/os.service/os.service";
// Models
import { HistoryModel, HistoryListModel } from "./../../models/";

import moment from "moment";
import * as _ from "lodash";
import * as md5 from "blueimp-md5";
import { error } from "protractor";

/**
 *
 *
 * @export
 * @class HistoryComponent
 * @implements {OnInit}
 */
@Component({
  selector: "app-history",
  templateUrl: "./history.component.html",
  providers: [DataService, TaggingService, NavigationService, OsService],
})
export class HistoryComponent implements OnInit {
  /**
   * show the overlay
   *
   * @memberof HistoryComponent
   */
  public isLoading = true;
  /**
   * contains all tickets list
   *
   * @type {Array<any>}
   * @memberof HistoryComponent
   */
  public fullList: Array<any> = [];
  /**
   * contains all tickets selected for send toggle
   *
   * @type {Array<string>}
   * @memberof HistoryComponent
   */
  public selected: Array<string> = [];
  /**
   * contains the enviroment
   *
   * @private
   * @type {*}
   * @memberof HistoryComponent
   */
  private enviroment: any;
  private subscription: Subscription;
  /**
   * contains if the status is dommy
   *
   * @private
   * @memberof HistoryComponent
   */
  private dummyMode = false;
  /**
   * contains the token generated
   *
   * @private
   * @memberof HistoryComponent
   */
  private token = "";

  private readonly CLOSED_STATUS = "closed";

  /**
   * Creates an instance of HistoryComponent.
   * @param {Router} router
   * @param {ActivatedRoute} route
   * @param {DataProxyService} dataProxyService
   * @param {DataService} dataService
   * @param {TaggingService} taggingService
   * @param {ConstantsService} constantsService
   * @param {NavigationService} navigationService
   * @param {OsService} OsService
   * @memberof HistoryComponent
   */
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataProxyService: DataProxyService,
    private dataService: DataService,
    private taggingService: TaggingService,
    private constantsService: ConstantsService,
    private navigationService: NavigationService,
    private utilService: UtilsService,
    private osService: OsService
  ) {}
  /**
   * Angular Lifecycle hook: When the component it is initialized.
   *
   * @memberof HistoryComponent
   */
  public ngOnInit(): void {
    // Get and Set the enviroment
    this.dataService.restRequest("config.json", "GET", {}, "config").subscribe(
      (response) => this.parseConfiguration(response),
      (error) => this.dataProxyService.setEnviroment("dev")
    );
  }
  /**
   * Listen the interaction of the user and validate the native session.
   *
   * @param {Event} $event
   * @memberof HistoryComponent
   */
  @HostListener("window:scroll", ["$event"])
  public onWindowScroll($event: Event): void {
    this.navigationService.validateSession();
  }
  /**
   * Format the title.
   *
   * @param {string} v
   * @returns {string}
   * @memberof HistoryComponent
   */
  public formatTitle(v: string): string {
    moment.locale("es");
    return moment(v, "YYYY-MM").format("MMMM, YYYY");
  }
  /**
   * Open/Close the selected item.
   *
   * @param {string} val
   * @param {string} id
   * @returns {boolean}
   * @memberof HistoryComponent
   */
  public toggleItem(val: string, id: string): boolean {
    let element = document.getElementById("arrow" + id);

    if (element.classList.contains("active")) {
      element.classList.remove("active");
    } else {
      element.classList.add("active");
    }

    const idx: number = _.findIndex(this.selected, (v: string) => {
      return v === val;
    });
    this.navigationService.validateSession();
    let res = false;
    if (idx > -1) {
      this.selected.splice(idx, 1);
    } else {
      this.selected.push(val);
      res = true;
    }
    return res;
  }
  /**
   * Check if the item is selected.
   *
   * @param {string} val
   * @returns {boolean}
   * @memberof HistoryComponent
   */
  public checkIfSelected(val: string): boolean {
    const idx: number = _.findIndex(this.selected, (v: string) => {
      return v === val;
    });
    return idx > -1 ? true : false;
  }
  /**
   * Parse the alias of the configuration.
   *
   * @private
   * @param {*} config
   * @memberof HistoryComponent
   */
  private parseConfiguration(config: any): void {
    // Search the enviroment
    this.enviroment = _.find(this.constantsService.ENVIROMENT, (item) => {
      return item.env === config.ENV_VAR;
    });
    if (!_.isUndefined(this.enviroment)) {
      this.dataProxyService.setEnviroment(this.enviroment.env);
      this.dataService.setUris(this.enviroment.env);
      this.getSsoToken();
    } else {
      this.handleError("No enviroment");
    }
  }
  /**
   * Get SSO token according to OS and channel.
   *
   * @private
   * @memberof PreloaderComponent
   */
  private getSsoToken(): void {
    let tokenSSO: any = null;
    if (
      this.osService.getOs().ios &&
      !(
        window.hasOwnProperty("Connect") &&
        window.Connect.hasOwnProperty("getSSOToken")
      )
    ) {
      this.getQueryParams(null);
    } else {
      try {
        tokenSSO = window.Connect.getSSOToken();
      } catch (err) {}
      this.getQueryParams(tokenSSO);
    }
  }
  /**
   * Get the params in the URL.
   *
   * @private
   * @memberof HistoryComponent
   */
  private getQueryParams(tokenSSO: string): void {
    (window as any).ssotokenResponse = null;
    let paramDummy: any = "";
    this.route.queryParams.subscribe((params) => {
      this.token = tokenSSO ? decodeURIComponent(tokenSSO) : params["token"];
      paramDummy = params["dummy"];
      // paramDummy = 'true';
      this.dataProxyService.setDummyMode(false);
      if (paramDummy === "true") {
        this.dummyMode = paramDummy;
        this.dataProxyService.setDummyMode(true);
      }
      if (this.dummyMode) {
        this.getHistory();
      } else {
        this.getID();
      }
    });
  }

  /**
   * Process token OAuth.
   *
   * @private
   * @param {*} r
   * @memberof HistoryComponent
   */
  private processTokenOAuth(r: any): void {
    this.dataProxyService.setAccessToken(r.access_token);
  }
  /**
   * Get the ID from the token validator.
   *
   * @private
   * @memberof HistoryComponent
   */
  private getID(): void {
    this.dataService
      .restRequest("/token_validator", "POST", null, "sso_token", this.token)
      .subscribe(
        (response) => {
          if (response.id) {
            this.dataProxyService.setIdToken(response.id);
            this.dataProxyService.setBuc(response.buc);
            // this.initTagging();
            this.getHistory();
          }
        },
        (error) => this.handleError(error)
      );
  }
  /**
   * Initialize tagging.
   *
   * @private
   * @memberof HistoryComponent
   */
  private initTagging(): void {
    // GA - Tealium
    /* const userID = md5(this.dataProxyService.getBuc(), 'mx-aclaraciones-cs');
    this.taggingService.setUserID(userID);
    const dataLayer = {
      1: 'santander supermovil',
      2: 'clarifications',
      3: 'consult',
      4: 'clarifications list',
      17: 'step-show clarifications',
      18: 'consult of clarifications',
    };
    this.taggingService.uTagView(dataLayer);
    this.taggingService.send('');*/
  }
  /**
   * Get the history from the middleware.
   *
   * @private
   * @memberof HistoryComponent
   */
  private getHistory(): void {
    if (this.dummyMode) {
      this.dataService
        .restRequest("assets/data/history.json", "GET", {}, "config")
        .subscribe(
          (response) => {
            this.processHistory(this.filteredResponse(response));
          },
          (error) => this.handleError(error)
        );
    } else {
      this.dataService
        .restRequest(
          "/folios",
          "GET",
          {},
          "folios",
          this.dataProxyService.getAccessToken()
        )
        .subscribe((response: any[]) => {
          this.processHistory(this.filteredResponse(response));
        });
    }
  }
  /**
   * Process the response of the microservice.
   *
   * @private
   * @param {*} r
   * @memberof HistoryComponent
   */
  private processHistory(r: any): void {
    // this.subscription.unsubscribe();
    this.isLoading = false;
    let received: Array<HistoryModel> = [];
    _.each(r, (v: any) => {
      let item: HistoryModel = new HistoryModel();
      item.IncidentID = v.IncidentID;
      item.Category = v.Category;
      item.Subcategory = v.Subcategory;
      item.OpenTime = v.OpenTime;
      item.FechaCompromiso = v.FechaCompromiso;
      item.Open = v.Open;
      item.ResolutionCode = v.ResolutionCode;
      item.CoseTime = v.CoseTime;
      item.CauseCode = this.getCause(v.CauseCode);
      item.Numero3 = v.Numero3;
      // Format the values of each item
      item.formatValues();
      // TODO Change this for the real folio
      item.folioP = v.folioOrigen;
      received.push(item);
    });
    // Group each item by date
    let grouped: Object = _.chain(received)
      .groupBy("IndexedDate")
      .map((list, date) => ({ list, date }))
      .value();
    // Add each item to the list
    _.each(grouped, (v: any) => {
      _.each(v.list, (l: any) => {
        if (l.IncidentID.indexOf("H") >= 0) {
          l.status = "Cerrado";
          l.hFolio = true;
        }
      });
      this.fullList.push(v);
    });
    // Sort the formatted dates in descending order
    this.fullList = _.sortBy(this.fullList, (o) => {
      return moment(o.date);
    }).reverse();
  }
  /**
   * Get the formatted cause.
   *
   * @private
   * @param {string} cause
   * @returns {string}
   * @memberof HistoryComponent
   */
  private getCause(cause: string): string {
    let formattedCause = cause;
    if (cause !== null) {
      if (cause.toLowerCase().lastIndexOf("favor del banco") > -1) {
        formattedCause = "IMPROCEDENTE";
      } else if (cause.toLowerCase().lastIndexOf("favor del cliente") > -1) {
        formattedCause = "PROCEDENTE";
      }
    }
    return formattedCause;
  }

  /**
   * Handle error.
   *
   * @param error {any}
   * @returns {void}
   */
  /**
   *
   *
   * @private
   * @param {*} error
   * @memberof HistoryComponent
   */
  private handleError(error: any): void {
    this.router.navigate(["no-connection"]);
  }
  /**
   * Opener Light Box.
   *
   * @param {*} event
   * @param {*} id
   * @memberof HistoryComponent
   */
  public tooltipOpener(event, id) {
    //Define tooltipeText
    let ttText1 =
      "En esta sección aparecerán todas las aclaraciones que ha levantado";
    let ttText2 =
      " por este y otros medios (Contact Center, Sucursales, SuperLínea) ";
    let ttText3 = "de un período de 6 meses atrás a la fecha actual.";

    let ttText = `${ttText1}${ttText2}${ttText3}`;

    let y = event.clientY;
    let x = event.clientX;
    let tooltip = document.getElementById("tooltip-box");
    let backdrop = document.getElementById("backdrop");
    let tooltipText = document.getElementById("tooltip-text");
    let flagBorder = document.getElementById("flag-border");
    let flagColor = document.getElementById("flag-color");

    tooltipText.innerHTML = ttText;
    tooltip.style.top = y + 20 + window.scrollY + "px";
    tooltip.style.position = "absolute";
    flagColor.style.left = x - 14 + "px";
    flagBorder.style.left = x - 14 + "px";
    backdrop.classList.remove("tooltip-hide");
    tooltip.classList.remove("tooltip-hide");
  }

  private isFolioP(folio: string): boolean {
    if (!folio) return false;
    return folio.startsWith("P");
  }

  private filteredResponse(response): any[] {
    return response.filter((folio) => {
      if (this.isFolioP(folio?.IncidentID)) {
        return folio?.Open?.toLowerCase() !== this.CLOSED_STATUS;
      }
      return true;
    });
  }
}
