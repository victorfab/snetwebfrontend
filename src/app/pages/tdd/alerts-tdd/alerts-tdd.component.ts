import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertsTddService } from '../../../services/tdd/alerts-tdd.service';
import { TaggingService } from './../../../services/tagging.service';
import { Router } from '@angular/router';
import { NavigationService } from './../../../services/navigation.service/navigation.service';
/**
 *
 * component use for create alerts button
 * @export
 * @class AlertsTddComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-alerts-tdd',
  templateUrl: './alerts-tdd.component.html',
  providers: [
    NavigationService,
    TaggingService
  ]
})
export class AlertsTddComponent implements OnInit, OnDestroy {
  /**
   *Creates an instance of AlertsTddComponent.
   * @memberof AlertsTddComponent
   */


  visible = false;
  @Input() value_header = "";
  message: number;
  subscription: Subscription;
  titles = [
    'Bloqueo de Tarjeta',
    '¡Atención!'
  ];
  instructions = [
    '<p class="description-lock-card" id=" description-lock-card " >Para evitar que le sigan haciendo cargos y continuar con la aclaración es necesario llevar a cabo un <span class="bold">Bloqueo Total</span> de su tarjeta.<br /><br /></p><span class="action-not-return-lock-card bold" >Esta acción NO puede revertirse.<br>Tendrá un costo establecido en su contrato.</span>',
    'Lo sentimos, el sistema no reconoce que su tarjeta ha sido reportada como robada o extraviada, para evitar que le sigan haciendo cargos favor de  volver a contestar el cuestionario con la opción “Me la robaron o la extravié y no la he reportado” o comuníquese a la <span class="bold">Super<span class="bold mRed">Línea</span></span><br />Desde CDMX y el interior de la República<br /><span class="bold">55 5169 4300 </span><br />para levantar su aclaración.',
    'Al no realizar el bloqueo de la tarjeta de débito, queda bajo su responsabilidad seguir recibiendo cargos.',
    'Por el momento no es posible realizar su petición.<br />Por favor inténtelo más tarde o comuníquese a la <span class="bold">Super<span class="bold mRed">Línea</span></span><br />Desde CDMX y el interior de la República<br /><span class="bold">55 5169 4300 </span><br />para levantar su aclaración.',
    'Para levantar su aclaración, favor de comunicarse a la <span class="bold">Super<span class="bold mRed">Línea</span></span><br />Desde CDMX y el interior de la República<br /><span class="bold">55 5169 4300 </span>',
    'Su tarjeta ya fue bloqueada, para evitar que le sigan haciendo cargos favor de  volver a contestar el cuestionario con la opción ” La reporté como robada o extraviada” o comuníquese a la <span class="bold">Super<span class="bold mRed">Línea</span></span><br> Desde CDMX y del interior de la República<br><span class="bold">55 5169 4300</span><br> para levantar su aclaración.',
    '<p class="description-lock-card" id=" description-lock-card ">Para evitar que le sigan haciendo cargos y continuar con la aclaración es necesario llevar a cabo un <span class="bold">Bloqueo Total</span> de su tarjeta.<br /><br /></p><span class="action-not-return-lock-card bold" >Esta acción NO puede revertirse.</span>'
  ];
  value_step = 1;
  texto = '';
  title = '';
  textBotton: string = 'Confirmar';

  /**
   *Creates an instance of AlertsTddComponent.
   * @param {AlertsMain} alertsMain
   * @memberof AlertsTddComponent
   */
  constructor(private alertsMain: AlertsTddService,
    private taggingService: TaggingService,
    private navigationService: NavigationService,
    private router: Router) {

    this.subscription = this.alertsMain.getMessage()
      .subscribe(
        message => {
          //this.value_label_step = message.response.title;
          this.setAlert(message.response.number, message.response.title, message.response.visibility);
        }
      )

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  /**
   *
   * Init method
   * @memberof AlertsTddComponent
   */
  ngOnInit() {
  }



  /**
   *
   * Recibir Mensaje Tip Alerta
   * @param {number} step
   * @param {number} title
   * @param {boolean} visibility
   * @memberof AlertsTddComponent
   */
  setAlert(step: number, title: number, visibility: boolean) {

    if (title >= 0) {
      this.title = this.titles[title]
    }
    this.texto = this.instructions[step];
    this.visible = visibility;
    this.value_step = step;
    if (this.value_step === 6 || this.value_step === 0 ) {
      this.textBotton = 'Aceptar';
      this.taggingService.view({
        tag_aclaracion: ['bloqueo_de_tarjeta_popup'],
        tag_subsection1: 'aclaraciones',
        tag_titulo: 'aclaraciones|bloqueo_de_tarjeta_popup',
        tag_url: 'aclaraciones/bloqueo_de_tarjeta_popup'
      });
    }

  }

  /**
   *
   * create  a Alert Button with message
   * @param {number} step
   * @param {boolean} visibility
   * @param {number} title
   * @memberof AlertsTddComponent
   */
  alertButton(step: number, visibility: boolean, title: number) {
    if (step === 2) {
      this.taggingService.link({
        event: "aclaraciones",
        interaction_category: 'aclaraciones_cargos',
        interaction_action: 'popup_debemos_bloquear_tu_tarjeta',
        interaction_label: 'cancelar',
        interaction_url: 'aclaraciones/bloqueo_de_tarjeta_popup'
      })
    } else {
      this.taggingService.link({
        event: "aclaraciones",
        interaction_category: 'aclaraciones_cargos',
        interaction_action: 'popup_debemos_bloquear_tu_tarjeta',
        interaction_label: 'aceptar',
        interaction_url: 'aclaraciones/bloqueo_de_tarjeta_popup'
      })
    }
    this.alertsMain.sendMessage(step, visibility, title);
    this.title = '';
  }
  goToQuestions() {
    this.router.navigate(['questionnaireTDD']);
  }

  accept() {
    //this.taggingService.setDimenson('27', 'Finalizar');
    //this.taggingService.send('');
    this.navigationService.goToRoot();
  }

  public get isBlockAlert(): boolean {
    return this.value_step === 0 || this.value_step === 6;
  }


}
