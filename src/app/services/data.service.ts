import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { catchError, delay, map, timeout } from "rxjs/operators";
import * as _ from "lodash";

// Constants
import { ConstantsService } from "./constants.service";
import { TaggingService } from "./tagging.service";
// Modal component
import { AlertComponent } from "./../partials/alert";
import { DataProxyService } from "./data-proxy.service";
import { SessionStorageService } from "./tdd/session-storage.service";

/**
 * rest service like injectable class
 *
 * @class DataService
 */
@Injectable()
export class DataService {
  /**
   * the enviroment url
   *
   * @private
   * @memberof DataService
   */
  private MDW_URL = "";
  /**
   * the url of the service rest
   *
   * @private
   * @memberof DataService
   */
  private REST_URL = "";
  /**
   * the url of the service catalogs
   *
   * @private
   * @memberof DataService
   */
  private CATALOGS_URL = "";
  /**
   * the url of the service user
   *
   * @private
   * @memberof DataService
   */
  private USER_REST_URL = "";
  /**
   * the url of the service wallet
   *
   * @private
   * @memberof DataService
   */
  private WALLET_REST_URL = "";
  /**
   * the url of the service folios
   *
   * @private
   * @memberof DataService
   */
  private FOLIOS_REST_URL = "";
  /**
   * the url of the service token
   *
   * @private
   * @memberof DataService
   */
  private SSO_TOKEN_URL = "";
  /**
   * the url of the service rating
   *
   * @private
   * @memberof DataService
   */
  private RATING_URL = "";
  /**
   * the url of the service check lock cards
   *
   * @private
   * @memberof DataService
   */
  private CHECK_LOCK_CARDS = "";
  /**
   * the url of the service debit
   *
   * @private
   * @memberof DataService
   */
  private DEBIT_URL = "";

  private CALCULATE_URL = "";

  /**
   * Modal reference
   *
   * @private
   * @type {BsModalRef}
   * @memberof DataService
   */
  private modalRef: BsModalRef;

  private isDummyMode: boolean = false;

  /**
   * Creates an instance of DataService.
   * @param {HttpClient} http
   * @param {ConstantsService} constantsService
   * @param {BsModalService} modalService
   * @param {DataProxyService} dataProxyService
   * @param {TaggingService} taggingService
   * @memberof DataService
   */
  constructor(
    private http: HttpClient,
    private constantsService: ConstantsService,
    private modalService: BsModalService,
    private dataProxyService: DataProxyService,
    private taggingService: TaggingService,
    private storage: SessionStorageService
  ) {
    this.isDummyMode = this.storage.getFromLocal("dummy") || this.dataProxyService.getDummyMode();
  }

  /**
   * vaidates and sets the endpoints
   *
   * @param {string} env
   * @memberof DataService
   */
  public setUris(env: string): void {
    // Search the enviroment
    const enviroment = _.find(this.constantsService.ENVIROMENT, (item) => {
      return item.env === env;
    });
    // Define the API URL
    if (process.env.NODE_ENV === "development") {
      this.MDW_URL = enviroment?.url || "";
    } else {
      this.MDW_URL = "/";
    }

    this.REST_URL = this.MDW_URL.concat("v2/api-backend");
    this.CATALOGS_URL = this.MDW_URL.concat("v2/catalogs");
    this.USER_REST_URL = this.MDW_URL.concat("v1/api-user");
    this.WALLET_REST_URL = this.MDW_URL.concat("v2/cards");
    this.FOLIOS_REST_URL = this.MDW_URL.concat("v2/folios");
    this.SSO_TOKEN_URL = this.MDW_URL.concat("v2/sso");
    this.CHECK_LOCK_CARDS = this.MDW_URL.concat("v1/api-check-lock-cards");
    this.DEBIT_URL = this.MDW_URL.concat("v1/debitcards");
    this.CALCULATE_URL = this.MDW_URL.concat("v1/api-user/calculate");
    this.setRatingUrl(enviroment.rating);
  }

  /**
   * Set the rating URL
   *
   * @param value {string}
   */
  public setRatingUrl(value: string): void {
    this.RATING_URL = value;
  }

  /**
   * Get the rating URL
   */
  public getRatingUrl(): string {
    return this.RATING_URL;
  }

  public getData(url: string): Observable<any> {
    return this.http
      .get(url)
      .pipe(map((data: Response) => this.extractData(data)));
  }

  /**
   * services call and get values
   *
   * @param {string} url
   * @param {String} [type='GET']
   * @param {*} [params={
   *         meta : 'post'
   *       }]
   * @param {string} [service='backend']
   * @param {String} [tokenOauth='']
   * @param {string} [clientId]
   * @param {string} [silentCall] - Will no throw a modal with the error if true
   * @returns {Observable<any>}
   * @memberof DataService
   */
  public restRequest(
    url: string,
    type: string = "GET",
    params: any = {
      meta: "post",
    },
    service = "backend",
    tokenOauth: string = "",
    clientId?: string,
    silentCall?: boolean
  ): Observable<any> {
    const apiUrl: string = this.getApiURL(service);
    let headers: HttpHeaders;
    const value = {
      "Content-Type": "application/json",
      // "Acess-Control-Allow-Origin": "*",
      ...(url === "/token_validator" && { token: tokenOauth }),
    };
    headers = new HttpHeaders(value);
    const options = {
      headers,
      withCredentials: true,
    };
    if (type === "GET") {
      return this.http
        .get(apiUrl.concat(url), { headers: headers, withCredentials: true })
        .pipe(
          map((data: Response) => this.extractData(data)),
          catchError((error: any) =>
            throwError(this.handleError(url, error, service))
          )
        );
    } else {
      return this.http.post(apiUrl.concat(url), params, options).pipe(
        map((data: Response) => this.extractData(data)),
        timeout(90000),
        catchError((error: any) =>
          throwError(this.handleError(url, error, service, silentCall))
        )
      );
    }
  }

  /**
   * Get movements from the endpoint
   *
   * @param ID {string}
   * @returns {any}
   */
  public getMovements(ID: string): Observable<any> {
    if (this.isDummyMode) {
      return this.dummyRequest(`assets/data/extract_${ID}.json`);
    } else {
      const params = {
        extract: ID,
      };
      const headers = new HttpHeaders({
        "Content-Type": "application/json",
      });
      const apiUrl = `${this.USER_REST_URL}/moves/`;

      return this.http.post(apiUrl, params, { headers: headers });
    }
  }

  /**
   * Dummy request
   *
   * @param url {string}
   */
  public dummyRequest(url: string) {
    return this.http.get(url).pipe(
      map((data: Response) => this.extractData(data)),
      catchError((error: any) => throwError(this.handleError(url, error)))
    );
  }

  /**
   * Handle error
   *
   * @param url
   * @param error {Response | any}
   * @param type
   */
  public handleError(
    url: string = "",
    error: Response | any,
    type: string = "",
    avoidErrorMessage = false
  ) {
    if (avoidErrorMessage) {
      const errMsg = error.message ? error.message : error.toString();
      Promise.reject(errMsg);
      return errMsg;
    }

    const options: any = {
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: true,
    };
    if (type !== "catalogs" && type !== "silent") {
      this.modalRef = this.modalService.show(AlertComponent, options);
      if (
        (error.name === "TimeoutError" ||
          error.status == 0 ||
          error.status == 504) &&
        url === "/clarifications/"
      ) {
        this.modalRef.content.type = "timeoutError";
      } else if (error.status == 503 && url === "/clarifications/") {
        this.modalRef.content.type = "servicesErrorClarification";
      } else if (error.name === "Error") {
        this.modalRef.content.type = "cancelExecuteBlock";
      } else {
        this.modalRef.content.type = "servicesError";
      }
    }
    // GA - Tealium
    // const dataLayer = {
    //   17: `step-${type}`,
    //   27: this.modalRef.content.type,
    // };
    // this.taggingService.uTagView(dataLayer);
    // this.taggingService.send('');
    const errMsg = error.message ? error.message : error.toString();
    Promise.reject(errMsg);
    return errMsg;
  }

  /**
   * Get the API URL according to the service
   *
   * @param service {string}
   * @returns {string}
   */
  public getApiURL(service: string): string {
    let apiUrl = "";
    switch (service) {
      case "":
        apiUrl = this.REST_URL;
        break;
      case "config":
      case "token":
        apiUrl = "./";
        break;
      case "user":
        apiUrl = this.USER_REST_URL;
        break;
      case "catalogs":
        apiUrl = this.CATALOGS_URL;
        break;
      case "cards":
        apiUrl = this.WALLET_REST_URL;
        break;
      case "calculate":
        apiUrl = this.CALCULATE_URL;
        break;
      default:
        apiUrl = this.getApiURL2(service);
    }
    return apiUrl;
  }

  /**
   * Get the API URL according to the service 2
   *
   * @param service {string}
   * @returns {string}
   */
  private getApiURL2(service: string): string {
    let url = "";
    switch (service) {
      case "folios":
        url = this.FOLIOS_REST_URL;
        break;
      case "sso_token":
        url = this.SSO_TOKEN_URL;
        break;
      case "rating":
        url = this.RATING_URL;
        break;
      case "check_lock":
        url = this.CHECK_LOCK_CARDS;
        break;
      case "debit":
        url = this.DEBIT_URL;
        break;
      case "dev_url":
        url = "";
        break;
      default:
        url = this.MDW_URL;
    }
    return url;
  }

  /**
   * Extract data
   *
   * @param res {Response}
   * @returns {any}
   */
  private extractData(res: Response): any {
    return res;
  }
}
