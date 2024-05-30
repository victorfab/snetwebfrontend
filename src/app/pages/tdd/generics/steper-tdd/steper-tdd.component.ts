import { Component, Input, SimpleChanges } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { SessionStorageService } from "angular-web-storage";
import { CashBack } from "../../../../enums/cashback.enum";

/**
 *
 *
 * @export
 * @class SteperTddComponent
 * @implements {OnInit}
 */
@Component({
  selector: "app-steper-tdd",
  templateUrl: "./steper-tdd.component.html",
})
export class SteperTddComponent {
  /**
   *Creates an instance of SteperTddComponent.
   * @param {Router} router
   * @memberof SteperTddComponent
   */

  public isCashbackFlow = false;
  public cashback = CashBack;
  public tabCashback: boolean = false;
  @Input() _tab: boolean;

  constructor(private router: Router,
    private session: SessionStorageService) {
    const clacon = (this.session.get('clacon') || []) as string[];
  
    if (clacon.length > 0) {
      this.isCashbackFlow = (clacon[0] === this.cashback.NOMINA || clacon[0] === this.cashback.LIKEU);
    }
  }
  /**
   *
   *
   * @memberof SteperTddComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes._tab) {
      this.tabCashback = changes._tab.currentValue;      
    }
  }
}
