import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  LocalStorageService,
  SessionStorageService,
} from "angular-web-storage";
import { catchError, delay, map, Observable, of, throwError } from "rxjs";
import * as _ from "lodash";
import { DataService } from "../data.service";
import { CashbackResponse } from "../../interfaces";
import { BsModalService } from "ngx-bootstrap/modal";
import { CashBack } from "../../enums/cashback.enum";
import { MonthCall } from "../../interfaces/cashback-month-call.interface";

@Injectable({
  providedIn: "root",
})
export class CashbackService {
  private base = "";

  private readonly QUIT_MESSAGE_TIMMER = 1500;

  constructor(
    private session: SessionStorageService,
    private request: DataService,
    private storage: LocalStorageService,
    private modalService: BsModalService
  ) {
    this.request.setUris(this.storage.get("enviroment"));
  }

  public fetchCashback({ year, month }: MonthCall): Observable<any[]> {
    const api = `/movements/payment/year/${year}/month/${month}`;

    if (this.storage.get("dummy")) {
      return this.request
        .dummyRequest("assets/data/cashbak.json")
        .pipe(map((result: CashbackResponse) => result.acctTrnRecMovimientos));
    }

    return this.request
      .restRequest(
        api,
        "GET",
        null,
        "debit",
        this.storage.get("app-access"),
        this.storage.get("client")
      )
      .pipe(
        map((result: CashbackResponse) => result.acctTrnRecMovimientos),
        catchError((e) => {
          setTimeout(() => {
            this.modalService.hide();
          }, this.QUIT_MESSAGE_TIMMER);
          return of([]);
        })
      );
  }

  public getSessionMoves(): any[] {
    return this.session.get("result");
  }

  public saveLocalStorage(name: string, move: any) {
    localStorage.setItem(name, JSON.stringify(move));
  }

  public getLocalStorage(name: string) {
    return JSON.parse(localStorage.getItem(name ? name : "Sin datos"));
  }

  public cashbackFlow(isFlow: boolean) {
    if (isFlow) {
      localStorage.setItem("isCashbackFlow", "true");
    } else {
      localStorage.setItem("isCashbackFlow", "false");
    }
  }

  public getFlow() {
    return localStorage.getItem("isCashbackFlow");
  }

  public getTotalMoves(move: string) {
    return JSON.parse(sessionStorage.getItem(move));
  }

  public editFlow(flow: string) {
    localStorage.setItem("editFlow", flow);
  }

  public getEditFlow() {
    return localStorage.getItem("editFlow");
  }

  //cambiar la key al clacon cuando este disponible
  public getCardType(move: any) {
    switch (move?.txrTipoFactura) {
      case CashBack.NOMINA:
        return "Tarjeta de nómina";
      case CashBack.LIKEU:
        return "tajeta LikeU";
      default:
        return "Sin datos";
    }
  }
}
