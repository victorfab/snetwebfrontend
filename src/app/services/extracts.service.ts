import { Injectable } from "@angular/core";
import { DateFormat } from "../enums/date-format.enum";
import { UserModel } from "../models";
import { DataProxyService } from "./data-proxy.service";
import { DataService } from "./data.service";
import { SessionStorageService } from "./tdd/session-storage.service";
import * as moment from "moment";

@Injectable({
  providedIn: "root",
})
export class ExtractsService {
  private URI = "/extracts/";

  private isDummyMode = false;
  private extractsDate = [];

  constructor(
    private dataService: DataService,
    private dataProxyService: DataProxyService,
    private storage: SessionStorageService
  ) {    
    this.isDummyMode = this.storage.getFromLocal('dummy');
  }

  public setEnv(): void {
    this.dataService.setUris(this.storage.getFromLocal("enviroment"));
  }

  public getExtracts(): Promise<any> {
    return new Promise((resolve, reject)=> {
      
      if (this.isDummyMode) {
       this.dataService.dummyRequest('assets/data/extracts.json')
          .subscribe((response) => {
            this.processUserData(response);
            this.getExtractsDate(response);
            resolve(response);
          }); // DUMMY MODE
      } else {
        this.dataService
        .restRequest(
          this.URI,
          "GET",
          {},
          "user",
          this.storage.getFromLocal('app-access'),
          this.storage.getFromLocal('client')
        )
        .subscribe({
          next: (data) => {
            this.processUserData(data);
            this.getExtractsDate(data);
            resolve(data);
          },
          error: () => reject(),
        });
      }
      
    })
  }

  /**
   * Process user data and save them in the local storage.
   *
   * @private
   * @param {Response} response
   * @memberof PreloaderComponent
   */
  private processUserData(response: Response): void {
    const p: any = response;
    const { cardRec } = Object.keys(this.dataProxyService.getCCData()).length > 0 ? this.dataProxyService.getCCData() : this.storage.getFromLocal('ccdata');

    const usr: UserModel = new UserModel(
      this.dataProxyService.getBuc(),
      cardRec.cardInfo.cardEmbossName,
      cardRec.cardInfo.cardNum,
      '',
      '',
      '',
      cardRec.cardInfo.acctRef.acctInfo.desc,
      cardRec.cardInfo.closeStmtDt,
      p.acctStmtRec,
      true
    );
    this.dataProxyService.setUserData(usr);
  }

  private getExtractsDate (extracts: any) {
    this.extractsDate = [];
    extracts.acctStmtRec.forEach(element => {
      this.extractsDate.push(element.acctStmtInfo.stmtDt);
      this.extractsDate.push(element.acctStmtId);
    });
    for (let i = 0; i < this.extractsDate.length; i += 2) {
      if (this.extractsDate[i] === '10101' || this.extractsDate[i] === '010101') {
        let mostRecentMove = moment().add(1, 'd');
        this.extractsDate[i] = mostRecentMove.format(DateFormat.YYYY_MM_DD);
      } else {
        let year = this.extractsDate[i].slice(0, 2);
        let month = this.extractsDate[i].slice(2, 4);
        let day = this.extractsDate[i].slice(4);
        this.extractsDate[i] = `20${year}-${month}-${day}`;
      }
    }
    this.storage.saveInLocal("extractsDates", this.extractsDate);
  }
}
