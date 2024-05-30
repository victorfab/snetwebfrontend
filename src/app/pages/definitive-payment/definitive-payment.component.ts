import { Component, OnInit } from '@angular/core';

//Services
import {SessionStorageService} from './../../services/tdd/session-storage.service';
import { NavigationService } from './../../services/navigation.service/navigation.service';
import { DataProxyService } from './../../services/data-proxy.service';
import { ResponseModel, QuestionsModel } from './../../models/';
import { TaggingService } from './../../services/tagging.service';

/**
 *
 * Definitive Payment component of clarifications 
 * create the view of the definitive payment 
 * @export
 * @class DefinitivePaymentComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-definitive-payment',
  templateUrl: './definitive-payment.component.html',
  providers: [
    NavigationService,
    TaggingService
  ]
})
export class DefinitivePaymentComponent implements OnInit {
  public blocker: any;
  private responseModel: ResponseModel;
  private questions: QuestionsModel;
  public nameChanel: string;
  private repositionType = this.storage.getFromLocal('respositionType');
  private cardRepositionResponse = this.storage.getFromLocal('cardRepositionResponse');
  
  

  /**
   *
   * values ​​obtained of service mannager 
   * @type {*}
   * @memberof DefinitivePaymentComponent
   */
  public smResponse: any;
  /**
   *
   * validate type Screen
   * @type {boolean}
   * @memberof DefinitivePaymentComponent
   */
  public validateScreen: boolean = true;
  /**
   *
   * list of clarifications with folio type I
   * @type {Array<string>}
   * @memberof DefinitivePaymentComponent
   */
  public foliosI: Array<string> = [];
  /**
   *
   *list of clarifications with folio type H
   * @type {Array<string>}
   * @memberof DefinitivePaymentComponent
   */
  public foliosH: Array<string> = [];
  
  /**
   *Creates an instance of DefinitivePaymentComponent.
   * @param {SessionStorageService} storage
   * @param {DataProxyService} dataProxy
   * @param {NavigationService} navigationService
   * @memberof DefinitivePaymentComponent
   */
  constructor(
    private storage: SessionStorageService,
    public dataProxy: DataProxyService,
    private navigationService: NavigationService,
    private taggingService: TaggingService
  ) {
    this.questions = this.dataProxy.getQuestions();
    this.blocker = this.questions.blocker;
  }

  /**
   * Loads initial content.
   *
   * @memberof DefinitivePaymentComponent
   */
  ngOnInit() {
    this.smResponse = this.storage.getFromLocal('tdcSmResponse');
    this.responseModel = this.dataProxy.getResponseDAO();

    

    if(this.dataProxy.getChannel()=='default'){
      this.nameChanel = "SuperMóvil";
    }else{
      this.nameChanel = "SuperWallet";
    }



    /**Validate Screen
     * let split=this.smResponse.Messages[0][6];
     */
    let split='';

    for(let item of this.smResponse.Messages[0]){
      if(item.includes("Abono:")){
        split= item;
      }
    }

    let splited= split.split(" "); 

    if(this.smResponse.wvrinboxrn.AptoDefinitivo && splited[1] === 'false'){
      this.validateScreen = false;
    }

    /**
     * list Folios Internacionales
     */
    this.foliosInt();
    /**
     * list Folios Nacionales
     */
    this.foliosNal();
    this.taggingService.setvalues("aclaraciones","aclaraciones/definitivePayment");
    this.taggingService.view({
      tag_subsection1: 'aclaraciones',
      tag_titulo: 'aclaraciones/definitivePayment',
      tag_url: '/aclaraciones/definitivePayment',    
    });
  }



  /**
   *
   * Obtener Folios Nacionales 
   * @memberof DefinitivePaymentComponent
   */
  public foliosNal(){



        //Folios Nacionales
        let nacional;

        for(let item of this.smResponse.Messages[0]){
          if(item.includes("Nacional:")){
            nacional= item;
            break;
          }else{
            nacional="NULL";
          }
        }

        if(nacional != "NULL"){

          nacional = nacional.split(': ');
          nacional = nacional[1].split(' ');



          // FOLIOS NACIONALES
          for(let nal of nacional){
            if(nal.match('H') && nal != 'undefined'){
              this.foliosH.push(nal);
            }else if(nal != 'undefined'){
              this.foliosI.push(nal);
            }

          }
        }


  }

  /**
   *
   * Obtener Folios Internacionales
   * @memberof DefinitivePaymentComponent
   */
  public foliosInt(){


    
    //let intern= this.smResponse.Messages[0][1];
    let intern;
    for(let item of this.smResponse.Messages[0]){
      if(item.includes("Internacional:")){
        intern= item;
        break;
      }else{
        intern="NULL";
      }
    }


    if(intern != "NULL"){
      intern = intern.split(': ');
      intern = intern[1].split(' ');

      /**
     * Folios Internacionales
     */
      for(let int of intern){
        if(int.match('H') && int != 'undefined'){
          this.foliosH.push(int);
        }else if(int != 'undefined'){
          this.foliosI.push(int);
        }
      }
    }

  }



  /**
   * Method for the finish button.
   *
   * @memberof ResultTddComponent
   */
  public finishApp(): void {
    const values = this.taggingService.getvalues(); 
    const tag = values.tag_aclaracion && values.tag_aclaracion.length ? values.tag_aclaracion[0]: '';
   this.taggingService.link({
    event: 'aclaraciones',
      interaction_category: tag.toString(), 
      interaction_action:'resumen', 
      interaction_label:'finalizar'
    });
    this.navigationService.goToRoot();
  }

}
