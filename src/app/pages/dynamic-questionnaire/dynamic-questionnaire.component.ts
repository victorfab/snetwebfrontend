import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  inject,
} from "@angular/core";
import { Router } from "@angular/router";
import { SessionStorageService } from "angular-web-storage";
import { DateFormat } from "../../enums/date-format.enum";
import { FormOptions } from "../../enums/form-options.enum";
import { TicketContentType } from "../../enums/ticket-content-type.enum";
import { MoveModel, QuestionsModel } from "../../models";
import { DataProxyService } from "../../services/data-proxy.service";
import { DataService } from "../../services/data.service";
import { QuestionnarieBuilder } from "../../shared/questionnarie-builder";
import { Utils } from "../../shared/utils";
import { BottomSheetComponent } from "../generics/bottom-sheet/bottom-sheet.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { FormComponent } from "../../partials/form/form.component";
import { SmRequestService } from "../../services/sm-request.service";
import { TaggingService } from "../../services/tagging.service";
import * as md5 from "blueimp-md5";
import { NavigationService } from "../../services/navigation.service/navigation.service";

@Component({
  selector: "app-dynamic-questionnaire",
  templateUrl: "./dynamic-questionnaire.component.html",
  providers: [Utils],
})
export class DynamicQuestionnaireComponent implements OnInit, AfterViewInit {
  @ViewChild(FormComponent) form!: FormComponent;
  public controls = [];
  private builder = inject(QuestionnarieBuilder);
  public formOption: FormOptions;
  private session = inject(SessionStorageService);
  private router = inject(Router);
  public proxy = inject(DataProxyService);
  public dataService = inject(DataService);
  public utils = inject(Utils);
  public bottomSheet = inject(MatBottomSheet);
  public smRequest = inject(SmRequestService);
  public taggingService = inject(TaggingService);
  private navigationService = inject(NavigationService);

  private bodysheet: any = {
    options: [],
    mainButton: "",
    mainButtonAction: this.mainButtonAction,
    secondButton: "",
    flow: "",
    type: "",
    cssClass: "",
  };

  constructor() {
    this.formOption = localStorage.getItem("option") as FormOptions;
    const value = JSON.parse(localStorage.getItem("optionValue"));
    this.controls = this.builder.getFinalControls(value, this.formOption);
    this.executeAction = this.executeAction.bind(this);
  }
  ngAfterViewInit(): void {
    // const existentQuestionnarie = this.session.get("patch");
    // if (existentQuestionnarie) {
    //   this.form.patch(existentQuestionnarie);
    // }
  }

  ngOnInit(): void {
    this.navigationService.tapBack('d-questionnarie');
    this.setDataLayer();
  }

  /**
   * @description Will get the form value and process the value param
   * to send in request or save
   * @param value - The form value ojb patch = valueForm, questionnarie array of questions
   * @returns
   */
  public getQuestionnarie(value: any): void {
    this.session.set("patch", value.patch);
    this.session.set("questionnarie", value.questionnarie);

    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: "cuestionario",
      interaction_action: "cargos",
      interaction_label: "enviar",
    });
    switch (this.formOption) {
      case FormOptions.CORRECTION:
        const motive = value.questionnarie.find(
          (control) => control.name === "motive"
        );
        if (motive.value === "cancell") {
          this.session.set("ticket", TicketContentType.CANCEL_LINEX);
          const move: MoveModel = this.proxy.getDataSelected()[0];
          this.bodysheet = {
            options: [{ ruta: "result" }],
            mainButton: "Sí, cancelar crédito",
            mainButtonAction: this.executeAction,
            secondButton: "",
            flow: "correccionMontoLinex",
            type: "info",
            cssClass: "correccionMontolinex",
            additional: {
              amount: move?.amount,
            },
          };
          this.bottomSheet.open(BottomSheetComponent, {
            data: this.bodysheet,
          });
          return;
        } else {
          this.session.set("ticket", TicketContentType.AMOUNT_CORRECTION_LINEX);
          this.session.set("ticket_amount", value?.patch?.amount);
          this.router.navigate(["summary"]);
          return;
        }
        break;
      case FormOptions.CORRECTION_PROMOTION:
        this.session.set("ticket", TicketContentType.PROMOTION_CORRECTION);
        this.executeAction();
        break;
      case FormOptions.LINEX:
        const formValue = value.patch;

        const paymentType = formValue.pay; // saldo pendiente = 0 || otro monto = 1
        const paymentMade = formValue.alreadyPay; // si || no
        // to use in next screens
        const payment = value.questionnarie.find(({ name }) => name === "pay");
        const paymentValue = payment.options.find(
          ({ value }) => value === payment.value
        );

        let amount = 0;
        if (paymentValue.value === "1") {
          amount = Number(formValue.amount);
        } else {
          amount = Number(paymentValue.data);
        }

        this.session.set("ticket_amount", amount);

        // Ya realizo el abono
        if (paymentMade && Number(paymentMade) === 1) {
          this.router.navigate(["linex"]);
          return;
        }

        this.session.set("ticket", TicketContentType.AMORTIZATION);
        if (Number(paymentMade) === 0 && Number(paymentType) === 1) {
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
        }
        if (Number(paymentMade) === 0 && Number(paymentType) === 0) {
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
              amount,
            },
          };
        }

        this.bottomSheet.open(BottomSheetComponent, {
          data: this.bodysheet,
        });

        break;
      default:
        this.router.navigate(["/summary"]);
        break;
    }
  }

  mainButtonAction(router: Router, ruta: string) {
    router.navigate([ruta]);
  }

  public executeAction(...args: any[]): void {
    this.smRequest.getRequest();
    this.utils.openModal("loader");
    if (this.proxy.getDummyMode()) {
      this.dataService
        .dummyRequest("assets/data/sm-response.json")
        .subscribe((response) => {
          this.utils.handleServiceManagerRequest(response, new QuestionsModel(), {
            format: DateFormat.DD_MMMM_YYYY_HH_mm,
            route: "result"
          });
        });
    } else {
      this.dataService
      .restRequest(
        "/clarifications/",
        "POST",
        JSON.stringify(
          this.smRequest.getRequest()
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

  public setDataLayer(): void {
    const userID = md5(this.proxy.getBuc(), "mx-aclaraciones-cs");

    const channel = this.proxy.getChannel();
    let section = "santander_supermovil";
    if (channel !== "default") {
      section = "santander_superwallet";
    }

    this.taggingService.view({
      tag_subsection1: "aclaraciones",
      tag_titulo: "aclaraciones_cargos/cuestionario",
      tag_url: "/aclaraciones_cargos/cuestionario",
      tag_userId: userID,
      tag_tipoDeTarjeta: [
        this.proxy.getCreditCardFullData().cardDesc,
      ],
      tag_procedencia: [section],
    });
  }

}
