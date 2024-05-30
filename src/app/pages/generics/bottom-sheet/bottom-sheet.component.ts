import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { SessionStorageService } from '../../../services/tdd/session-storage.service';
import { MessageType } from '../../../enums/message-type.enum';
import { Router } from '@angular/router';
import { SessionStorageService as Session } from 'angular-web-storage';
import { DataProxyService } from '../../../services/data-proxy.service';
import { AlertService } from '../../../services/alert.service';
import { TaggingService } from '../../../services/tagging.service';
import * as _ from 'lodash';
import { MoveType } from '../../../enums/move-type.enum';
import { NavigationService } from '../../../services/navigation.service/navigation.service';
import * as md5 from 'blueimp-md5';

@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html'
})
export class BottomSheetComponent implements OnInit, OnDestroy {

  @Output() onCloseModal: EventEmitter<any> = new EventEmitter();
  _class: string
  _classType: string;
  moreMoves: boolean = false;
  selectedOption: string = '';
  indexOption: number;

  messageTypes = MessageType;
  messageType: MessageType = MessageType.CONTRATACION_ERROR;

  flowTypes = MoveType;
  flowType: MoveType = MoveType.CORRPROM;
  close: string = 'Cancelar';
  htmlElement = document.querySelector('html') as HTMLElement;
  navigationService = inject(NavigationService);
  dataProxyService = inject(DataProxyService);

  constructor(private bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
              private storage: SessionStorageService,
              private router: Router,
              private sessionStorage: Session,
              private proxyService: DataProxyService,
              private alertService: AlertService,
              private taggingService: TaggingService) { }

  ngOnDestroy(): void {
    const cdkContainer = document.querySelector('.cdk-overlay-container') as HTMLElement;
    cdkContainer.style.width = '0%';
    this.alertService.closeAlert();
  }

  ngAfterViewInit(): void {
    const cdkContainer = document.querySelector('.cdk-overlay-container') as HTMLElement;
    cdkContainer.style.width = '100%';
    window.scrollTo(0,0);
    this.htmlElement.style.overflow = 'hidden'
  }

  ngOnInit(): void {
    this._class = this.data.cssClass;
    this.selectedFlow();

    if (this.data.type === 'info') {
      this.selectedOption = this.data.mainButton;
      const background = document.querySelector('.cdk-global-overlay-wrapper') as HTMLElement;
      background.style.backgroundColor = '#FFFFFF';
      const cdkContainer = document.querySelector('.cdk-overlay-container') as HTMLElement;
      cdkContainer.style.width = '100%';
    }
    this.close = this.data.flow === 'correccionMontoLinex' ? 'Cerrar':
                 this.data.flow === 'otroMonto' ? 'Cerrar':
                 this.data.flow === 'liquidar' ? 'Cerrar': 'Cancelar';
    this.setDataLayer();
  }

  closeBottomSheet(breakFlow: boolean) {
    let prefolio = this.storage.getFromLocal('prefolios');

    if (prefolio) {
      this.taggingService.link({
        event: "aclaraciones",
        interaction_category: "aclaraciones_cargos",
        interaction_action: "cerrar_bottom_sheet",
        interaction_label: "regresar",
        interaction_url: 'aclaraciones/popup_movimiento_en_proceso/prefolio'
      });
    } else {
      this.taggingService.link({
        event: "aclaraciones",
        interaction_category: "bottom_sheet",
        interaction_action: "cerrar_bottom_sheet",
        interaction_label: "Cancelar",
      });
    }

    this.htmlElement.style.overflow = 'scroll'
    if (this.close === 'Cancelar' && breakFlow) {
      this.storage.saveInLocal('prefolios', false);
      this.storage.saveInLocal('alreadyFlow', false);
      this.onCloseModal.emit('cancel');
      this.proxyService.cleanData();
    }
    this.bottomSheetRef.dismiss();
  }

  selectedFlow() {
    this.messageType = this.data.flow === 'tddCompraSeguro' ? MessageType.COMPRA_SEGURO_TDD :
                       this.data.flow === 'correccionMontoLinex' ? MessageType.CONTRATACION_ERROR :
                       this.data.flow === 'correccionPromocion' ? MessageType.LIQUIDAR_CORRECCION :
                       this.data.flow === 'otroMonto' ? MessageType.OTRO_MONTO:
                       this.data.flow === 'prefolio' ? MessageType.PREFOLIO:
                       this.data.flow === 'liquidar' ? MessageType.LIQUIDAR : MessageType.ERROR;
  }

  handlerOptions(option: any, index: number) {
    if (option.requestDescription) {
      this.sessionStorage.set('BS_SELECTED', option.requestDescription);
    }
    this.data.options.forEach((item) => (item.checked = false));
    option.checked = true;
    this.indexOption = index;
    this.selectedOption = option.label;
    this.moreMoves = this.selectedOption === 'No reconozco este cargo' ? true: false;
    if (this.data.options[this.indexOption]?.onClick) {
      this.data.options[this.indexOption]?.onClick(this.alertService);
    } else {
      this.alertService.closeAlert();
    }
    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: "aclaraciones_cargos",
      interaction_action: "opcion_bottom_sheet",
      interaction_label: option.label
    });
    if (this.data?.onOptionChange) {
      this.data?.onOptionChange(option.label);
    }
  }

  selectMoreMoves() {
    this.htmlElement.style.overflow = 'scroll'
    this.onCloseModal.emit('moreMoves');
    this.storage.saveInLocal('alreadyFlow', true);
    this.bottomSheetRef.dismiss();
    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: "aclaraciones_cargos",
      interaction_action: "bottom_sheet",
      interaction_label: "seleccionar_mas_movimientos",
    });
  }

  goToClarifications(){
    this.htmlElement.style.overflow = 'scroll';
    this.bottomSheetRef.dismiss();
    this.router.navigate(["questionnaire"]);
    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: "aclaraciones_cargos",
      interaction_action: "bottom_sheet",
      interaction_label: "levantar_aclaracion",
      interaction_url: 'aclaraciones/popup_movimiento_en_proceso/prefolio'
    });
  }

  action() {
    this.htmlElement.style.overflow = 'scroll';
    const option = this.data.options[this.indexOption];
    if (option && option.ticket) {
      this.sessionStorage.set('ticket', option.ticket);
    }
    if (this.data.type === 'interactive') {
      this.data.mainButtonAction(this.router, this.data.options[this.indexOption].ruta);
    } else {
      this.data.mainButtonAction(this.router, this.data.options[0].ruta);
    }
    this.bottomSheetRef.dismiss();
    // this.storage.saveInLocal('alreadyFlow', true);

    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: "aclaraciones_cargos",
      interaction_action: "opcion_bottom_sheet",
      interaction_label: this.data.mainButton,
    });
  }

    /**
   * Sets the dataLayer for Google Analytics
   *
   * @memberof WelcomeComponent
   * @returns {void}
   */
    public setDataLayer(): void {
      const userID = md5(this.dataProxyService.getBuc(), "mx-aclaraciones-cs");

      const channel = this.dataProxyService.getChannel();
      let section = "santander_supermovil";
      if (channel !== "default") {
        section = "santander_superwallet";
      }

      switch (this.messageType) {

        /* Se agrega el el taggeo para el bottom sheet del flujo de prefolio.
           El resto de flujos se trabajara en un incrementral
          MessageType.COMPRA_SEGURO_TDD
          MessageType.CONTRATACION_ERROR
          MessageType.LIQUIDAR
          MessageType.OTRO_MONTO
          MessageType.PREFOLIO
          MessageType.LIQUIDAR
        */
        case MessageType.PREFOLIO:
          this.taggingService.view({
            tag_subsection1: "aclaraciones_cargos",
            tag_titulo: "|aclaraciones|popup_movimiento_en_proceso_autorizacion|prefolio|",
            tag_url: "aclaraciones/popup_movimiento_en_proceso_autorizacion/prefolio",
            tag_userId: userID,
            tag_tipoUsuario: "prefolio",
            tag_tipoDeTarjeta: [
              this.dataProxyService.getCreditCardFullData().cardDesc,
            ],
            tag_procedencia: [section],
          });
          break;

        default:
          break;
      }
    }
}
