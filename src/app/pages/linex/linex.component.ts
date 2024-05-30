import { Component, OnInit, inject } from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { Router } from "@angular/router";
import { SessionStorageService } from "angular-web-storage";
import moment, { Moment } from "moment";
import { DateFormat } from "../../enums/date-format.enum";
import { TicketContentType } from "../../enums/ticket-content-type.enum";
import { MoveItem } from "../../interfaces/move-item.interface";
import { QuestionsModel } from "../../models";
import { DataProxyService } from "../../services/data-proxy.service";
import { DataService } from "../../services/data.service";
import { Utils } from "../../shared/utils";
import { BottomSheetComponent } from "../generics/bottom-sheet/bottom-sheet.component";
import { SmRequestService } from "../../services/sm-request.service";
import { TaggingService } from "../../services/tagging.service";
import { FlowsService } from "../../services/navigation.service/flows.service";

@Component({
  selector: "app-linex",
  templateUrl: "./linex.component.html",
  providers: [Utils],
})
export class LinexComponent implements OnInit {
  private taggingService = inject(TaggingService);
  public request = inject(DataService);
  public proxy = inject(DataProxyService);
  public router = inject(Router);
  public session = inject(SessionStorageService);
  public utils = inject(Utils);
  public bottomSheet = inject(MatBottomSheet);
  public smRequest = inject(SmRequestService);
  public flows = inject(FlowsService);

  public movements: Map<string, MoveItem<any>[]> = new Map();
  public backupMoves: Map<string, MoveItem<any>[]> = new Map();

  public selectedMove: MoveItem<any>[] = [];
  public text = "";
  private bodysheet!: any;

  constructor() {
    this.session.remove('payments');
    const channel = this.proxy.getChannel();
    let section = "santander_supermovil";
    if (channel !== "default") {
      section = "santander_superwallet";
    }
    this.executeAction = this.executeAction.bind(this);
    this.taggingService.view({
      tag_subsection1: "aclaraciones",
      tag_titulo: "/pago",
      tag_url: "/linex",
      tag_tipoDeTarjeta: [
        this.proxy.getCreditCardFullData().cardDesc,
      ],
      tag_procedencia: [section],
    });
  }

  ngOnInit(): void {
    const payments: any[] = this.flows.payments;
    payments.forEach((move) => {
      const date = move.acctTrnInfo.stmtDt;
      const mapElement = this.movements.get(date);
      const parsedMove = {
        id: date,
        amount: move.acctTrnInfo.totalCurAmt.amt,
        description: move.acctTrnInfo.networkTrnData.merchName,
        fullItem: move,
      };
      const value = Boolean(mapElement)
        ? [...mapElement, parsedMove]
        : [parsedMove];
      this.movements.set(date, value);
      this.backupMoves.set(date, value);
    });
  }

  public updateSelected(move: MoveItem<any>): void {
    move.selected = true;
    const index = this.selectedMove.findIndex(m => m.fullItem.acctTrnId === move.fullItem.acctTrnId);
    if (index !== -1) {
      this.selectedMove = this.selectedMove.filter(m => m.fullItem.acctTrnId !== move.fullItem.acctTrnId);
      this.session.set('payments', this.selectedMove);
      move.selected = false;
    } else {
      this.selectedMove.push(move);
      this.session.set('payments', this.selectedMove);
    }
  }

  public next(): void {
    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: "seleccion_abono",
      interaction_action: "enviar",
      interaction_label: "Enviar",
    });
    const formValue = this.session.get("patch");
    const tipoPago = formValue.pay; // saldo pendiente = 0 || otro monto = 1;
    this.session.set("ticket", TicketContentType.AMORTIZATION);
    if (Number(tipoPago) === 1) {
      // No ha realizado el abono y eligio otro monto
      this.bodysheet = {
        options: [
          {
            ruta: "result",
          },
        ],
        mainButton: "Estoy de acuerdo",
        mainButtonAction: this.executeAction,
        secondButton: "Cancelar",
        flow: "otroMonto",
        type: "info",
        cssClass: "otroMonto",
      };
      this.bottomSheet.open(BottomSheetComponent, {
        data: this.bodysheet,
      });
    }
    if (Number(tipoPago) === 0) {
      // no ha
      this.bodysheet = {
        options: [
          {
            ruta: "result",
          },
        ],
        mainButton: "Si, acepto",
        mainButtonAction: this.executeAction,
        secondButton: "Cancelar",
        flow: "liquidar",
        type: "info",
        cssClass: "liquidar",
        additional: {
          amount: this.session.get('ticket_amount')
        }
      };
      this.bottomSheet.open(BottomSheetComponent, {
        data: this.bodysheet,
      });
    }
  }
  public executeAction(...args: any[]): void {
    const request: any = this.smRequest.getRequest();
    this.utils.openModal("loader");
    if (this.proxy.getDummyMode()) {
      this.request
        .dummyRequest("assets/data/sm-response.json")
        .subscribe((response) => {
          this.utils.handleServiceManagerRequest(response, new QuestionsModel(), {
            format: DateFormat.DD_MMMM_YYYY_HH_mm,
          });
          this.router.navigate(["result"]);
        });
    } else {
      this.request
        .restRequest(
          "/clarifications/",
          "POST",
          JSON.stringify(
            request
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
                route: "result",
            }
          )
        );
    }

  }

  public back(): void {
    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: "seleccion_abono",
      interaction_action: "regresar",
      interaction_label: "Regresar",
    });
    this.router.navigate(["d-questionnarie"]);
  }

  public getFilter(filter: Moment): void {
    if (!filter) {
      this.movements = new Map(this.backupMoves);
      return;
    }
    let coincidences = false;
    const date = filter.format(DateFormat.YYYY_MM);
    for (const [key, value] of this.backupMoves) {
      const keyDate = moment(key).format(DateFormat.YYYY_MM);
      if (date === keyDate) {
        this.movements.clear();
        this.movements.set(key, value);
        coincidences = true;
        break;
      }
    }
    if (!coincidences) {
      this.movements.clear();
    }
  }
}
