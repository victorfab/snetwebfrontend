import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";

@Component({
  selector: "app-requirement-list",
  template: `
    <div class="requirements">
      <div class="requirements__content">
        <p>
          Para atender tu aclaración de forma personalizada, por favor envíanos
          un correo electrónico con el asunto:
          <strong *ngFor="let item of folios">{{ item }}</strong>
          a:
          <strong>aclaracionescomprastc@santander.com.mx</strong>
        </p>

        <div class="requirements__content__list">
          Incluye la siguiente información:
          <ul>
            <li *ngFor="let item of requirements; let index = index">
              <strong>{{ item.value }}</strong>
            </li>
          </ul>
        </div>
        <p>
          Recuerda, <strong>tienes 5 días</strong> para realizar este trámite.
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequirementListComponent {
  @Input() folios: string[] = [];
  @Input() requirements: any[] = [];
}
