import { inject } from "@angular/core";
import { TaggingService } from "../../services/tagging.service";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { NavigationService } from "../../services/navigation.service/navigation.service";
import { SessionStorageService } from "../../services/tdd/session-storage.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-header-ticketv2",
  template: `
    <div
      class="ticket"
      [class]="getCssClass"
      [ngClass]="{'ticket--bordered': addBorderToBottom }"
    >
      <!-- TOAST MESSAGE -->
      <p class="ticket-toast">
        <i class="ticket-toast__icon"></i>
        {{ toastMessage }}
      </p>
      <div class="ticket__content">
        <div class="ticket__header">
          <i class="santander-mini"></i>
          <span class="ticket__header__title">{{ ticketTitle }}</span>

          <i class="santander-close" (click)="closeBtn()"></i>
        </div>
        <span class="ticket__subtitle" *ngIf="subTitle">{{ subTitle }}</span>
        <!-- PROJECTION CONTENT -->
        <ng-content></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderTicketV2Component {
  @Input() toastMessage = "";
  @Input() ticketTitle = "";
  @Input() subTitle = "";
  @Input() addBorderToBottom = true;
  @Input() colorHeader: string = "success";
  @Output() close: EventEmitter<void> = new EventEmitter();
  private taggingService = inject(TaggingService);
  private navigationService = inject(NavigationService);
  private storage = inject(SessionStorageService);
  private router = inject(Router);

  public closeBtn(): void {

    const prefolio = this.storage.getFromLocal('prefolios');
    if (prefolio) {
      this.taggingService.link({
        event: 'aclaraciones',
        interaction_category: 'aclaraciones_cargos',
        interaction_action: 'comprobante_prefolio',
        interaction_label: 'mensaje_importante',
        interaction_url: 'aclaraciones/comprobante_movimiento_en_proceso/prefolio'
        });
      localStorage.removeItem('prefolios');
    }



    let path = this.router.url === '/result' ? this.taggingService.typeClarificationTDC() : this.taggingService.typeClarificationTDD();
    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: this.taggingService
        .getvalues()
        .tag_aclaracion.toString(),
      interaction_action: "compronante",
      interaction_label: "cerrar",
      interaction_url: path,
    });
    this.navigationService.goToRoot();
    this.close.emit();
  }

  public get getCssClass(): string {
    return `ticket--${this.colorHeader}`;
  }
}

/**
 * Shows the user name and date
 * Ussed into tdd and tdc tickets
 */
@Component({
  selector: "app-ticket-user-data",
  template: `
    <div class="user-content">
      <i class="success-icon icon-margin"></i>
      <p class="client-name">
        {{ clientName | titlecase }}, su solicitud fue recibida.
      </p>
      <span class="client-date">{{ date }} </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketUserData {
  @Input() clientName = "";
  @Input() date = "";
}
