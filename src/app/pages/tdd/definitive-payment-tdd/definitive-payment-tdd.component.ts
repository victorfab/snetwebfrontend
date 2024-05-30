import { Component, OnInit } from '@angular/core';

//Services
import {SessionStorageService} from './../../../services/tdd/session-storage.service';
import { NavigationService } from './../../../services/navigation.service/navigation.service';
import { DataProxyService } from './../../../services/data-proxy.service';
import { ResponseModel, QuestionsModel } from './../../../models/';
import {UtilsTddService} from '../../../services/tdd/utils-tdd.service';

/**
 *
 * Definitive Payment component of clarifications 
 * create the view of the definitive payment 
 * @export
 * @class DefinitivePaymentComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-definitive-payment-tdd',
  templateUrl: './definitive-payment-tdd.component.html',
  providers: [
    NavigationService
  ]
})
export class DefinitivePaymentComponentTDD implements OnInit {
  /**
   * Modelo de respuesta en el bloqueo de tarjeta 
   *
   * @type {*}
   * @memberof DefinitivePaymentComponentTDD
   */
  public blocker: any;
  /**
   * Modelo de la respuesta en la alta de aclaraciones 
   *
   * @private
   * @type {any}
   * @memberof DefinitivePaymentComponentTDD
   */
  private responseModel: any;
  /**
   * Modelo de las preguntas realizadas por el usuario 
   *
   * @private
   * @type {QuestionsModel}
   * @memberof DefinitivePaymentComponentTDD
   */
  private questions: QuestionsModel;
  /**
   * Nombre del canal para tener las vistas correctas 
   *
   * @type {string}
   * @memberof DefinitivePaymentComponentTDD
   */
  public nameChanel: string;
  /**
   * Modelo de la respuesta de reposicion de la tarjeta 
   *
   * @private
   * @memberof DefinitivePaymentComponentTDD
   */
  private repositionType = this.storage.getFromLocal('respositionType');
  /**
   * Modelo de respuesta para reposicion de la tarjeta  si tuvo derecho a tener una express
   *
   * @private
   * @memberof DefinitivePaymentComponentTDD
   */
  private cardRepositionResponse = this.storage.getFromLocal('BlockModel')!=null ? this.storage.getFromLocal('BlockModel'): {"operationCancellation":false};
  
  /**
   * monto definitivo 
   *
   * @private
   * @type {number}
   * @memberof DefinitivePaymentComponentTDD
   */
  private amount:number;

  private CONSTANTS : any = this.utils.constants();

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

  public viewValues: any;

  
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
    private utils: UtilsTddService
  ) {
    this.questions = this.dataProxy.getQuestions();
    this.blocker = this.storage.getFromLocal('BlockModel');

  }

  /**
   * Loads initial content.
   *
   * @memberof DefinitivePaymentComponent
   */
  ngOnInit() {
   /* this.smResponse = this.storage.getFromLocal('tdcSmResponse');
    this.responseModel = this.dataProxy.getResponseDAO();*/
    this.smResponse = this.storage.getFromLocal('SMResponse');
    this.responseModel = this.storage.getFromLocal('tdcSmResponse'); 
    this.amount = Math.abs(this.responseModel.wvrinboxrn.monto);
    const serviceResponse : object = this.storage.getFromLocal(this.CONSTANTS.STORAGE.SM_RESPONSE);
  this.viewValues = this.utils.handleServiceManagerRequest(serviceResponse);
    if(this.storage.getFromLocal('chanel')=='default'){
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
    this.navigationService.goToRoot();
  }

}
