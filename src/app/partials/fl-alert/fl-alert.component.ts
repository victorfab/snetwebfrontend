import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  TemplateRef,
} from "@angular/core";
import { AlertType } from "../../enums/alert-type.enum";
import { AlertsTddComponent } from "../../pages/tdd";
import { AlertService } from "../../services/alert.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-fl-alert",
  template: `
    <div
      *ngIf="showAlert"
      class="fl-alert"
      [ngClass]="alertType"
      [style]="style"
    >
      <i [class]="icon" *ngIf="icon"></i>
      <div class="fl-alert__header">
        <strong
          class="fl-alert__title"
          [innerHTML]="sanitize.bypassSecurityTrustHtml(title)"
        ></strong>
        <i class="close-icon" *ngIf="showCloseButton" (click)="hide()"></i>
      </div>
      <div
        *ngIf="!template"
        class="fl-alert__content"
        [innerHTML]="sanitize.bypassSecurityTrustHtml(paragraph)"
      ></div>
      <ng-container [ngTemplateOutlet]="template"></ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlAlertComponent {
  @Input() title = "";
  @Input() paragraph = "";
  @Input() alertType: AlertType = AlertType.INFO;
  @Input() showCloseButton = false;
  @Input() showAlert = true;
  @Input() icon = "warn-icon";
  @Input() template: TemplateRef<any>
  private cdr = inject(ChangeDetectorRef);
  public alertService = inject(AlertService);
  public sanitize = inject(DomSanitizer);

  public get style(): object {
    return {
      "padding-left": this.icon ? "50px" : "1rem",
    };
  }

  public hide(): void {
    this.showAlert = false;
    this.cdr.detectChanges();
  }
}
