import { Component, OnInit } from '@angular/core';
import { DataProxyService } from './../../services/data-proxy.service';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TaggingService } from './../../services/tagging.service';

// Services
import { NavigationService } from './../../services/navigation.service/navigation.service';
import { type } from 'os';
import { HttpClient } from '@angular/common/http';

/**
 * Modal windows
 *
 * @class AlertComponent
 */
@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  providers: [
    NavigationService,
    TaggingService
  ]
})
export class AlertComponent implements OnInit {

  public type = '';
  /**
   * Flag to enable analitycs register.
   *
   * @memberof AlertComponent
   */
  public clickContinue = false;
/**
 *Creates an instance of AlertComponent.
 * @param {DataProxyService} dataProxyService
 * @param {BsModalRef} bsModalRef
 * @param {NavigationService} navigationService
 * @param {Router} router
 * @param {BsModalService} modalService
 * @memberof AlertComponent
 */
constructor(
    private dataProxyService: DataProxyService,
    private bsModalRef: BsModalRef,
    private navigationService: NavigationService,
    private router: Router,
    private modalService: BsModalService,
    private taggingService: TaggingService,
    private http: HttpClient
    ) {
    }

  /**
   * Angular Lifecycle hook: When the component it is initialized
   *
   * @returns {void}
   */
  public ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close the modal window
   *
   * @returns {void}
   */
  public cancelExecuteBlock(): void {
    this.accept(false);
  }

  /**
   * When the user clicks on accept button
   *
   * @returns {void}
   */
  public accept(isFinalized): void {
    if(isFinalized){
      //this.taggingService.setDimenson('27', 'Finalizar');
      //this.taggingService.send('');
    }
    this.navigationService.goToRoot();
  }

  /**
   * redirect to the questions screen
   *
   *
   * @memberof AlertComponent
   */
  public goToQuestions(){
    //this.taggingService.setDimenson('27', 'Ir a cuestionario');
    //this.taggingService.send('');
    for (let i = 1; i <= this.modalService.getModalsCount(); i++) {
      this.modalService.hide(i);
    };
    document.getElementById('body').style.removeProperty('overflow');
    document.getElementById('body').classList.remove("modal-open");
    this.router.navigate(['questionnaire']);
  }

  /**
   * Close the modal window
   *
   * @returns {void}
   *
   *
   * @memberof AlertComponent
   */
  public cancelBlocker(): void {
    // const values = this.taggingService.getvalues();
    // const tag = values.tag_aclaracion && values.tag_aclaracion.length ? values.tag_aclaracion[0]: '';
    const prefolio = localStorage.getItem('prefolios');
    let typeUser = prefolio ? 'prefolio': '';
    this.taggingService.link({
      event: "aclaraciones",
      interaction_category: 'aclaraciones_cargos',
      interaction_action:'bloqueo_total',
      interaction_label:'cancelar',
      interaction_tipoUsuario: typeUser
      })
    this.dataProxyService.getQuestionsStatusService().emit('cancelBlocker');

  }

  /**
   * Close the modal window
   *
   * @returns {void}
   */
  public executeBlocker(): void {
    if(!this.clickContinue){
      //this.taggingService.setDimenson('27', 'Tarjeta a bloquear');
      //this.taggingService.send('');
      if(this.type==="block-one" || this.type==="block-two"){
        // const values = this.taggingService.getvalues();
        // const tag = values.tag_aclaracion && values.tag_aclaracion.length ? values.tag_aclaracion[0]: '';
        const prefolio = localStorage.getItem('prefolios');
        let typeUser = prefolio ? 'prefolio': '';
        this.taggingService.link({
          event: "aclaraciones",
          interaction_category: 'aclaraciones_cargos',
          interaction_action:'bloqueo_total',
          interaction_label:'confirmar',
          interaction_tipoUsuario: typeUser
          })
      }

      this.dataProxyService.getQuestionsStatusService().emit('executeCardBlock');
    }
  }
}
