import { Injectable, EventEmitter, Output, inject } from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { Router } from "@angular/router";
import { SessionStorageService } from "angular-web-storage";
import moment from "moment";
import { BehaviorSubject } from "rxjs";
import { AlertType } from "../../enums/alert-type.enum";
import { FormOptions } from "../../enums/form-options.enum";
import { MoveType } from "../../enums/move-type.enum";
import { TicketContentType } from "../../enums/ticket-content-type.enum";
import { MoveModel } from "../../models";
import { Control } from "../../models/control.model";
import { BottomSheetComponent } from "../../pages/generics/bottom-sheet/bottom-sheet.component";
import { Utils } from "../../shared/utils";
import { AlertService } from "../alert.service";
import { TaggingService } from "../tagging.service";
import { DateFormat } from "../../enums/date-format.enum";
import { CustomCurrencyPlain } from "../../pipes";
import { NavigationService } from "./navigation.service";
import { SessionStorageService as Session} from "./../../services/tdd/session-storage.service";

@Injectable({
  providedIn: "root",
})
export class FlowsService {
  private ALLOWED_DAYS = 5;
  // private flows: Map<MoveType, string[]> = serviceOptions();
  private session = inject(SessionStorageService);
  private utils = inject(Utils);
  private taggingService = inject(TaggingService);
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

  private modalInstance: BehaviorSubject<BottomSheetComponent> =
    new BehaviorSubject(null);
  public modalInstance$ = this.modalInstance.asObservable();
  public payments: MoveModel[] = [];
  public paymentsMoveModel: MoveModel[] = [];

  constructor(
    private bottomSheet: MatBottomSheet,
    private router: Router,
    private format: CustomCurrencyPlain,
    private save: Session
  ) {}

  mainButtonAction(router: Router, ruta: string) {
    router.navigate([ruta]);
  }

  showSheetOptions(move: MoveModel, params?: any) {
    let selectedFlow: MoveType = move.type;
    let options: Partial<Control<any>>[] = [];

    //TO DO all type flows
    // let prefolios = localStorage.getItem('prefolios');
    // let url = prefolios ? 'aclaraciones/popup_movimiento_en_proceso/prefolio' : '';
    // let typeUser = prefolios ? 'prefolios': '';

    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: 'aclaraciones_cargos',
      interaction_action: "seleccion_movimiento",
      interaction_label: "Seleccionar_movimiento",
      // interaction_url: url,
      // interaction_tipoUsuario: typeUser
    });
    // Means the original move is no longer selectd and the user has selected
    // a move with other clacon type, so will delete prevoius form or optios located in istorage
    if (params.originalFlow && params.originalFlow !== selectedFlow) {
      this.utils.clearSession();
    }
    this.session.set("serviceOption", selectedFlow);
    switch (selectedFlow) {
      case MoveType.COMISION:
        options = [
          {
            name: "description",
            label: `Dinos, ¿Por qué no estás de acuerdo con la comisión?`,
          } as any,
        ];

        localStorage.setItem("option", FormOptions.COMISSION);
        this.router.navigate(["d-questionnarie"]);
        break;

      case MoveType.SEGURO:
      case MoveType.COMPRA:
        this.navigationService.tapBack("bottomSheet", this.navigationService.closeBottomSheet);
        if (move.type === MoveType.SEGURO) {
          options = [
            {
              name: "description",
              label: `Dinos, ¿Por qué no estás de acuerdo con el cobro del seguro?`,
            } as any,
          ];
        }
        const currentDate = moment();
        const moveDate = moment(move.date, DateFormat.DD_MM_YYYY);
        const daysDifference = currentDate.diff(moveDate, "days");
        localStorage.setItem("option", FormOptions.COMISSION);
        this.bodysheet = {
          options: [
            {
              label: "No reconozco este cargo",
              ruta:
                move.type === MoveType.SEGURO
                  ? "d-questionnarie"
                  : "questionnaire",
              ticket: TicketContentType.NORMAL_COMISSION,
              ...(move.type === MoveType.SEGURO && {
                onClick: (aletS: AlertService) => {
                  aletS.show({
                    title: "¿Es la comisión de un seguro?",
                    text: `Haz clic en “<strong>Aclarar este movimiento</strong>” y evita rechazos al seleccionar más movimientos.`,
                    type: AlertType.WARNING,
                    icon: "question-icon",
                  });
                },
              }),
              checked: false,
            },
            {
              label: "No me aplicaron la promoción de MSI",
              ruta: "defer-purchase",
              ticket: TicketContentType.DEFER_PURCHASE,
              checked: false,
              ...(daysDifference <= this.ALLOWED_DAYS && {
                onClick: (aletS: AlertService) => {
                  const daysToPaint = Math.abs(
                    daysDifference - (this.ALLOWED_DAYS + 1)
                  );
                  aletS.show({
                    title: `Espera ${daysToPaint} ${
                      daysToPaint === 1 ? "día" : "días"
                    } antes de levantar esta aclaración.`,
                    text: `Si solicitaste la promoción al comercio <strong>puede tardar hasta 5 días en mostrarse diferidas</strong>. Consulta con el comercio o revisa tu ticket de compra para confirmar la promoción.`,
                    type: AlertType.WARNING,
                    icon: "warn-icon",
                  });
                },
              }),
              requestDescription: 'NO_APP_PROM_MSI',
            },
            {
              label: `Quiero diferir esta compra a meses`,
              ruta: "defer-purchase",
              ticket: TicketContentType.DEFER_PURCHASE,
              checked: false,
              requestDescription: 'DIF_COM_MESES',
            },
          ],
          mainButton: "Aclarar este movimiento",
          mainButtonAction: this.mainButtonAction,
          secondButton: "Seleccionar más movimientos",
          flow: "tdcCompraSeguro",
          type: "interactive",
          cssClass: "tdcCompraSeguro",
          onOptionChange: (option: string) => {
            if (
              option === "No me aplicaron la promoción de MSI" &&
              daysDifference <= this.ALLOWED_DAYS
            ) {
              this.bodysheet.disableMain = true;
            } else {
              this.bodysheet.disableMain = false;
            }
          },
        };
        this.bottomSheet.open(BottomSheetComponent, {
          data: this.bodysheet,
        });
        break;

      // case MoveType.CORRECCION_MONTO_LINEX:
      //   localStorage.setItem("option", FormOptions.CORRECTION);
      //   this.router.navigate(["d-questionnarie"]);
      //   break;

      case MoveType.CORRPROM:
        this.navigationService.tapBack("bottomSheet", this.navigationService.closeBottomSheet);
        // TODO Take the correct amount
        const amount = move.amount;
        this.session.set('corrPromAmount', amount);
        localStorage.setItem("option", FormOptions.CORRECTION_PROMOTION);
        this.bodysheet = {
          options: [{ ruta: "d-questionnarie" }],
          mainButton: "Sí, liquidar",
          mainButtonAction: this.mainButtonAction,
          secondButton: "",
          flow: "correccionPromocion",
          type: "info",
          cssClass: "correccionPromocion",
          additional: {
            amount,
          },
        };
        this.bottomSheet.open(BottomSheetComponent, {
          data: this.bodysheet,
        });
        break;

      case MoveType.CORRPROMLINEX_PMEN:
        this.navigationService.tapBack("bottomSheet", this.navigationService.closeBottomSheet);
        options = [
          {
            name: "pay",
            controlGroup: [
              {
                // label: `El saldo pendiente: $${this.format.transform(
                //   move.amount
                // )}`,
                label: `El saldo pendiente: $ 00,000.00`,
                id: "pending",
                value: "0",
                data: move.amount,
              },
              {
                label: "Otro monto",
                id: "other",
                value: "1",
              },
            ],
          } as any,
        ];
        localStorage.setItem("option", FormOptions.LINEX);
        this.bodysheet = {
          options: [
            // {
            //   label: "Liquidar o adelantar pagos pendientes",
            //   ruta: "d-questionnarie",
            //   ticket: TicketContentType.CANCEL_LINEX,
            //   checked: false,
            // },
            {
              label: "No es el monto acordado",
              ruta: "warning-cancellation",
              checked: false,
            },
          ],
          message: 'Si necesitas liquidar o adelantar pagos de tu crédito por favor llama a SuperLínea para recibir atención personalizada.',
          callButton: {
            text: 'Llamar a SuperLínea',
            phone: 'tel:5551694300'
          },
          mainButton: "Continuar",
          mainButtonAction: this.mainButtonAction,
          secondButton: "",
          flow: "pagoLinex",
          type: "interactive",
          cssClass: "pagoLinex"
        };
        this.bottomSheet.open(BottomSheetComponent, {
          data: this.bodysheet,
        });
        break;

      case MoveType.CORRPROMLINEX_AMOR:
        this.navigationService.tapBack("bottomSheet", this.navigationService.closeBottomSheet);
        options = [
          {
            name: "pay",
            controlGroup: [
              {
                // label: `El saldo pendiente: $${this.format.transform(
                //   move.amount
                // )}`,
                label: `El saldo pendiente: $ 00,000.00`,
                id: "pending",
                value: "0",
                data: move.amount,
              },
              {
                label: "Otro monto",
                id: "other",
                value: "1",
              },
            ],
          } as any,
        ];
        localStorage.setItem("option", FormOptions.LINEX);
        this.bodysheet = {
          options: [
            {
              label: "Yo no solicité esta amortización",
              ruta: "warning-cancellation",
              checked: false,
            },
            {
              label: "No es el monto acordado",
              ruta: "warning-cancellation",
              checked: false,
            },
            // {
            //   label: "Liquidar o adelantar pagos pendientes",
            //   ruta: "d-questionnarie",
            //   checked: false,
            // },
          ],
          mainButton: "Continuar",
          mainButtonAction: this.mainButtonAction,
          message: 'Si necesitas liquidar o adelantar pagos a tu crédito, llama a SuperLínea para recibir atención personalizada.',
          callButton: {
            text: 'Llamar a SuperLínea',
            phone: 'tel:5551694300'
          },
          secondButton: "",
          flow: "amortizacionLinex",
          type: "interactive",
          cssClass: "amortizacionLinex",
        };
        this.bottomSheet.open(BottomSheetComponent, {
          data: this.bodysheet,
        });
        break;
      case MoveType.PREFOLIO:
        this.save.saveInLocal('prefolios', true);
        this.navigationService.tapBack("bottomSheet", this.navigationService.closeBottomSheet);
        this.bodysheet = {
          options: [{ ruta: "welcome" }],
          mainButton: "Regresar",
          mainButtonAction: this.mainButtonAction,
          secondButton: "Levantar aclaración",
          flow: "prefolio",
          type: "info",
          cssClass: "prefolio"
        };
        this.bottomSheet.open(BottomSheetComponent, {
          data: this.bodysheet,
        });
        break;
      default:
        console.warn("No flow detected");
        break;
    }
    try {
      const instance: BottomSheetComponent = (
        this.bottomSheet._openedBottomSheetRef as any
      ).containerInstance._portalOutlet._attachedRef.instance;
      this.modalInstance.next(instance);
    } catch (e) {}
    //containerInstance._portalOutlet._attachedRef.instance
    // Before a form is builded you can update certain controls
    // the QuestionnarieBuilder will trake this options and update the form
    localStorage.setItem("optionValue", JSON.stringify(options));
  }
}
