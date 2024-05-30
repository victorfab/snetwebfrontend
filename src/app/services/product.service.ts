import { Injectable } from "@angular/core";
import {
  LocalStorageService,
  SessionStorageService,
} from "angular-web-storage";
import { BsModalService } from "ngx-bootstrap/modal";
import { catchError, map, Observable, of, tap, throwError } from "rxjs";
import { CardProductResponse, CardRec, ProductResponse } from "../interfaces";
import { DataProxyService } from "./data-proxy.service";
import { DataService } from "./data.service";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private isDummy = this.storage.get("dummy");

  private _isLikeU: boolean | null = null;

  private readonly QUIT_MESSAGE_TIMMER = 1500;

  constructor(
    private request: DataService,
    private storage: LocalStorageService,
    private session: SessionStorageService,
    private dt: DataProxyService,
    private modalService: BsModalService,
    private dataProxi: DataProxyService
  ) {
    this._isLikeU = JSON.parse(this.session.get("isLikeU"));
    this.isDummy = this.storage.get("dummy");
    this.request.setUris(
      this.storage.get("enviroment") || this.dt.getEnviroment()
    );
  }

  public productValidation(product: string): Observable<string> {
    if (this.isDummy) {
      return this.request
        .dummyRequest("assets/data/validate-product.json")
        .pipe(
          map(({ data }: ProductResponse) => {
            this._isLikeU = data === "true";
            this.session.set("isLikeU", data);
            return data;
          })
        );
    } else {
      const api = `/validate/product/${product}`;
      return this.request
        .restRequest(
          api,
          "GET",
          null,
          "user"
        )
        .pipe(
          map((result: ProductResponse) => {
            this._isLikeU = result.data === "true";
            this.session.set("isLikeU", result.data);
            return result.data;
          }),
          catchError((e) => {
            setTimeout(() => {
              this.modalService.hide();
            }, this.QUIT_MESSAGE_TIMMER);
            return throwError(() => new Error(e));
          })
        );
    }
  }

  public get isLikeU() {
    return this._isLikeU;
  }

  public setDummy(value: boolean): void {
    this.isDummy = value;
  }

  /**
   * Get the card data depending on the product
   * @param {string} product - The product name
   * @param {boolean} silenCall - A boolean indicating that the api call
   * will no throw a error message
   * @returns
   */
  public getCardProduct(
    product: string,
    silenCall = false
  ): Observable<CardRec> {
    if (this.isDummy) {
      return this.request.dummyRequest("assets/data/get-product.json").pipe(
        map((response: CardProductResponse) => {
          return response?.cardRec[0];
        }),
        tap((result) => {

          if (!result) {
            return;
          }
          const { cardInfo } = result;

          const outstanding = cardInfo.acctRef?.acctInfo?.acctBal.find(
            (item) =>
              item?.balType.balTypeValues.toLowerCase() === "outstanding"
          );

          let balance = 0;

          if (outstanding) {
            balance = Number(outstanding.curAmt.amt);
          }

          this.session.set("ccData", {
            buc: "",
            name: cardInfo.cardEmbossName,
            cardNumber: cardInfo.cardNum,
            cardName: cardInfo.desc,
            cardBrand: cardInfo.brand,
            saldo: balance,
          });
        })
      );
    } else {
      const api = `/product/${product}`;

      return this.request
        .restRequest(
          api,
          "GET",
          null,
          "cards",
          this.storage.get("app-access") || " ",
          this.storage.get("client") || " ",
          silenCall
        )
        .pipe(
          map((response: CardProductResponse) => {
            return response?.cardRec[0];
          }),
          tap((result) => {
            if (!result) {
              return;
            }
            const { cardInfo } = result;
            const outstanding = cardInfo.acctRef?.acctInfo?.acctBal.find(
              (item) =>
                item?.balType.balTypeValues.toLowerCase() === "outstanding"
            );

            let balance = 0;

            if (outstanding) {
              balance = Number(outstanding.curAmt.amt);
            }

            this.session.set("ccData", {
              buc: "",
              name: cardInfo.cardEmbossName,
              cardNumber: cardInfo.cardNum,
              cardName: cardInfo.desc,
              cardBrand: cardInfo.brand,
              saldo: balance,
            });
          })
        );
    }
  }

  public get getCardLikeURetrieved(): boolean {
    return Boolean(this.session.get("ccData"));
  }
}
