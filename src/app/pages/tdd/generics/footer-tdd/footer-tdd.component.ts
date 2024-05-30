import { Component, OnInit, EventEmitter, Input, Output } from "@angular/core";
import { SessionStorageService } from "../../../../services/tdd/session-storage.service";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
/**
 * footes de la aplicacion
 * boton de continuar de la app
 *
 * @export
 * @class FooterTddComponent
 * @implements {OnInit}
 */
@Component({
  selector: "app-footer-tdd",
  templateUrl: "./footer-tdd.component.html",
})
export class FooterTddComponent implements OnInit {
  /**activo a desactivo el boton */
  @Input() enable: boolean;
  /**texto a mostrar en el boton */
  @Input() buttonText: string;
  /** id para testing automatizado  */
  @Input() idElement: string;
  /**emisor al padre para continuar */
  @Output() continueClarification = new EventEmitter<any>();

  @Output() continueEdit = new EventEmitter<void>();

  @Input() showEditButton: string = "false";

  @Input() counter = 0;

  @Output() showMoves: EventEmitter<void> = new EventEmitter();
  /**
   *
   *
   * @memberof FooterTddComponent
   */

  /**Channel*/
  chanelType: string = "";

  public showCounter = false;
  /**
   *Creates an instance of FooterTddComponent.
   * @param {SessionStorageService} storage
   * @memberof FooterTddComponent
   */
  constructor(private storage: SessionStorageService,
    private router: Router) {
    //Get Channel
    this.chanelType = this.storage.getFromLocal("chanel");
    //this.chanelType = 'wallet';
    this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe((change: NavigationEnd) => {
      this.showCounter = this.router.url === '/welcomeTDD' || this.isCashabckScreen;
    });
    this.showCounter = this.router.url === '/welcomeTDD' || this.isCashabckScreen;
  }
  /**
   *inicializa el componente
   *
   * @memberof FooterTddComponent
   */
  ngOnInit() {}
  /**
   *Method when is clicked the footer
   *
   * @private
   * @memberof FooterTddComponent
   */
  public continue() {
    this.continueClarification.emit();
  }

  public edit() {
    this.continueEdit.emit();
  }
  public get selectedMoves(): boolean {
    return this.counter > 0;
  }

  public get isWelcomePage(): boolean {
    return this.router.url === '/welcomeTDD';
  }

  public get isCashabckScreen(): boolean {
    return this.router.url === '/cashback-movements';
  }
}
