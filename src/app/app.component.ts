import { Component, inject } from "@angular/core";
import { AlertService } from "./services/alert.service";
import 'zone.js';
import moment from 'moment';
/**
 * App Component
 */
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent {
  public alertService = inject(AlertService);
  constructor() {
    this.getMobileOperatingSystem();
  }

  public getMobileOperatingSystem() {
    try {
      let userAgent = navigator.userAgent || navigator.vendor;
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        document.body.style.letterSpacing = "-0.5px";
      }
    } catch (e) {}
  }
}
