import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { AlertConfig } from "../interfaces/alert-config.interface";

@Injectable({
  providedIn: "root",
})
export class AlertService {
  private HIDE_ALERT_DELAY = 1000;

  private alertConfig: BehaviorSubject<AlertConfig> = new BehaviorSubject(null);
  public alertConfig$ = this.alertConfig.asObservable();

  public cssClass = "fadeIn";
  private timeOut = null;

  constructor() {}

  public show(config: AlertConfig): void {
    clearTimeout(this.timeOut);
    this.cssClass = "to-up";
    this.alertConfig.next(config);
  }

  public closeAlert(): void {
    this.cssClass = "to-bottom";
    this.timeOut = setTimeout(() => {
      this.alertConfig.next(null);
    }, this.HIDE_ALERT_DELAY);
  }
}
