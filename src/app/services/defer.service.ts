import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import {
  DeferResponseInterface
} from "../interfaces/defer-response.interface";
import { DataProxyService } from "./data-proxy.service";
import { DataService } from "./data.service";

@Injectable({
  providedIn: "root",
})
export class DeferService {
  private request = inject(DataService);
  private proxy = inject(DataProxyService);

  public fetchMonthsToDefer(
    amount: number,
    currency: string
  ): Observable<DeferResponseInterface> {
    const url = `/defer/amount/${amount}/currency/${currency}`;
    if (this.proxy.getDummyMode()) {
      return this.request.dummyRequest("assets/data/defer.json");
    } else {
      return this.request.restRequest(url, 'GET', null, 'calculate');
    }
  }
}
