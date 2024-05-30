import {
  EventEmitter,
  Injectable,
  NgZone,
  Output,
  inject,
} from "@angular/core";
import * as _ from "lodash";
import { SessionStorageService } from "../tdd/session-storage.service";
import { DataProxyService } from "../data-proxy.service";
import { MatBottomSheet } from "@angular/material/bottom-sheet";

/**
 * Window interface for the TypeScript compiler
 */
declare global {
  interface Window {
    Connect: any;
    userDidTapBackButton: Function;
    webkit: any;
    ssotokenResponse: Function;
  }
}

/**
 * Navigation class that uses the global Connect variable
 *
 *
 *
 *
 * @export
 * @class NavigationService
 */
@Injectable({
  providedIn: "root",
})
export class NavigationService {
  private storage = inject(SessionStorageService);
  private proxyService = inject(DataProxyService);
  private bottomSheet = inject(MatBottomSheet);
  @Output() onCloseModal: EventEmitter<any> = new EventEmitter();

  /**
   *Creates an instance of NavigationService.
   * @param {NgZone} zone
   * @memberof NavigationService
   */
  constructor(private zone: NgZone) {}

  /**
   * Go to the previous section of the native app
   *
   * @returns {void}
   */
  public goToRoot(): void {
    if (
      window.hasOwnProperty("webkit") &&
      typeof window.webkit.messageHandlers != "undefined" &&
      window.webkit.messageHandlers.hasOwnProperty("Connect")
    ) {
      try {
        window.webkit.messageHandlers.Connect.postMessage(
          '{ "name": "goToRoot","parameters": "null", "callbackName": "null" }'
        );
      } catch (e) {}
    } else if (typeof window.Connect.goToRoot === "function") {
      try {
        window.Connect.goToRoot();
      } catch (e) {}
    }
  }

  /**
   * Function that hides the tooltip screen
   *
   *
   * @memberof NavigationService
   */
  public hideTooltip() {
    let tooltip = document.getElementById("tooltip-box");
    let backdrop = document.getElementById("backdrop");
    backdrop.classList.add("tooltip-hide");
    tooltip.classList.add("tooltip-hide");
  }

  /**
   * When the users tap the native back button
   *
   * @param section {string}
   * @param cb {Function}
   * @returns {void}
   */
  public tapBack(section: string = "", cb: Function = undefined): void {
    this.hideTooltip();
    window.userDidTapBackButton = () => {
      switch (section) {
        case "welcome":
        case "filters":
        case "bottomSheet":
          this.zone.run(() => cb());
          break;
        case "cashback":
        case "questionnaire":
        case "questionnaire-atm":
        case "summary":
        case "section":
        case "defer":
        case "d-questionnarie":
          if (
            window.hasOwnProperty("webkit") &&
            typeof window.webkit.messageHandlers != "undefined" &&
            window.webkit.messageHandlers.hasOwnProperty("Connect")
          ) {
            try {
              window.webkit.messageHandlers.Connect.postMessage(
                '{"name": "goBack","parameters": "null","allbackName": "null" }'
              );
            } catch (error) {}
          } else if (typeof window.Connect.goToRoot === "function") {
            try {
              window.Connect.goBack();
            } catch (e) {}
          }
          break;
        case "resultTDD":
          this.goToRoot();
          break;
        default:
          return false;
      }
    };
  }

  /**
   * Validate the native app session
   *
   * @returns {void}
   */
  public validateSession(): void {
    if (
      window.hasOwnProperty("webkit") &&
      typeof window.webkit.messageHandlers != "undefined" &&
      window.webkit.messageHandlers.hasOwnProperty("Connect")
    ) {
      try {
        window.webkit.messageHandlers.Connect.postMessage(
          '{ "name": "validaSesion",  "parameters": "null", "callbackName": "null" }'
        );
      } catch (error) {}
    } else if (typeof window.Connect.validaSesion === "function") {
      try {
        window.Connect.validaSesion();
      } catch (e) {}
    }
  }

  /**
   * Hide the native back button
   *
   * @returns {void}
   */
  public hideBackButton(): void {
    if (
      window.hasOwnProperty("webkit") &&
      typeof window.webkit.messageHandlers != "undefined" &&
      window.webkit.messageHandlers.hasOwnProperty("Connect")
    ) {
      try {
        window.webkit.messageHandlers.Connect.postMessage(
          '{ "name": "hideBackButton", "parameters": null, "callbackName": null }'
        );
      } catch (e) {}
    } else if (typeof window.Connect.hideBackButton === "function") {
      try {
        window.Connect.hideBackButton();
      } catch (e) {}
    }
  }

  /**
   * Hide bottomsheet
   */

  closeBottomSheet() {
    try {
      let htmlElement = document.querySelector("html") as HTMLElement;
      htmlElement.style.overflow = "scroll";
    } catch (error) {
      console.error(error);
    }
    this.storage.saveInLocal("alreadyFlow", false);
    this.onCloseModal.emit("cancel");
    this.proxyService.cleanData();
    this.bottomSheet.dismiss();
  }
}
