import { Component, OnInit, inject } from "@angular/core";
import { SessionStorageService } from "angular-web-storage";
import * as md5 from "blueimp-md5";
import { DateFormat } from "../../enums/date-format.enum";
import { TicketContentType } from "../../enums/ticket-content-type.enum";
import { MoveModel, QuestionsModel } from "../../models";
import { CustomCurrencyPlain } from "../../pipes";
import { DataProxyService } from "../../services/data-proxy.service";
import { DataService } from "../../services/data.service";
import { DeferService } from "../../services/defer.service";
import { SmRequestService } from "../../services/sm-request.service";
import { TaggingService } from "../../services/tagging.service";
import { Utils } from "../../shared/utils";
import { BsModalRef } from "ngx-bootstrap/modal";
import { NavigationService } from "../../services/navigation.service/navigation.service";

@Component({
  selector: "app-defer-purchase",
  templateUrl: "./defer-purchase.component.html",
  providers: [Utils, CustomCurrencyPlain],
})
export class DeferPurchaseComponent implements OnInit {
  public proxy = inject(DataProxyService);
  public utils = inject(Utils);
  public dataService = inject(DataService);
  private format = inject(CustomCurrencyPlain);
  private session = inject(SessionStorageService);
  private smRequest = inject(SmRequestService);
  private taggingService = inject(TaggingService);
  private dataProxyService = inject(DataProxyService);
  private deferService = inject(DeferService);
  private navigationService = inject(NavigationService);

  selectedOption: number = 0;
  public move: MoveModel = null;
  public screenConfig = null;

  constructor() {
    if (this.proxy.getDataSelected().length) {
      this.move = this.proxy.getDataSelected()[0];
      this.screenConfig = {
        total: this.format.transform(this.move?.amount),
        totalLabel: `Total: $${this.format.transform(this.move?.amount)}`,
        options: [],
      };
    }
  }

  ngOnInit(): void {
    this.navigationService.tapBack('defer');
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    this.setDataLayer();

    this.utils.openModal("loader");
    this.deferService.fetchMonthsToDefer(this.move.amount, this.move.currencyType).subscribe({
      next: (response) => {
        if (response.amounts) {
          this.screenConfig.options = response.amounts.map((amount) => ({
            label: amount.descripcion,
            id: amount.respuesta,
            total: amount.total,
            checked: false,
          }));
          this.utils.closeModal();
        }
      },
      complete: () => {
        this.utils.closeModal();
      },
      error: () => {
        this.utils.closeModal();
      },
    });
  }

  handlerOption(option: any) {
    this.session.set("defer", {
      ...option,
      total: this.screenConfig.totalLabel,
    });
    this.screenConfig.options.forEach((item) => (item.checked = false));
    option.checked = true;
    this.selectedOption = option.id;
  }
  action() {
    let ticketOption = this.session.get("ticket");
    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: "diferir_compra",
      interaction_action: "diferir_compra",
      interaction_label: "Aceptar",
    });
    this.utils.openModal("loader");
    const option = this.session.get("defer");
    this.smRequest.getDefferRequest({
      Preguntas: "Selecciona el plazo",
      Respuestas: option.id,
    });
    if (this.proxy.getDummyMode()) {
      this.proxy.setQuestions(new QuestionsModel());
      this.dataService
        .dummyRequest("assets/data/sm-response.json")
        .subscribe((response) =>
          this.utils.handleServiceManagerRequest(
            response,
            new QuestionsModel(),
            {
              format: DateFormat.DD_MMMM_YYYY_HH_mm,
              ...(ticketOption ===
                TicketContentType.AMOUNT_CORRECTION_LINEX && {
                route: "result",
              }),
            }
          )
        );
    } else {
      this.dataService
        .restRequest(
          "/clarifications/",
          "POST",
          JSON.stringify(
            this.smRequest.getDefferRequest({
              Preguntas: "Selecciona el plazo",
              Respuestas: option.id,
            })
          ),
          "",
          this.proxy.getAccessToken()
        )
        .subscribe((response) =>
          this.utils.handleServiceManagerRequest(
            response,
            new QuestionsModel(),
            {
              format: DateFormat.DD_MMMM_YYYY_HH_mm,
              ...(ticketOption ===
                TicketContentType.AMOUNT_CORRECTION_LINEX && {
                route: "result",
              }),
            }
          )
        );
    }
    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: "diferir_compra",
      interaction_action: "aceptar",
      interaction_label: "aceptar",
    });
  }

  userTrackBy(index, option) {
    return option.id;
  }

  public get enableButton(): boolean {
    return this.screenConfig.options.some(({ checked }) => checked);
  }

  public setDataLayer(): void {
    const userID = md5(this.dataProxyService.getBuc(), "mx-aclaraciones-cs");

    const channel = this.dataProxyService.getChannel();
    let section = "santander_supermovil";
    if (channel !== "default") {
      section = "santander_superwallet";
    }

    this.taggingService.view({
      tag_subsection1: "aclaraciones",
      tag_titulo: "/aclaraciones_cargos/diferir_MSI",
      tag_url: "/aclaraciones_cargos/diferir_MSI",
      tag_userId: userID,
      tag_tipoDeTarjeta: [
        this.dataProxyService.getCreditCardFullData().cardDesc,
      ],
      tag_procedencia: [section],
    });
  }
}
