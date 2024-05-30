import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { toInteger } from 'lodash';
import { settings } from 'cluster';
import {SessionStorageService} from '../../../services/tdd/session-storage.service';
import {UtilsTddService} from '../../../services/tdd/utils-tdd.service';
import { NavigationService } from '../../../services/navigation.service/navigation.service';

//Taggeo
import { TaggingService } from '../../../services/tagging.service';


/**
 *
 *
 * @export
 * @class ResultTddComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-result-atm',
  templateUrl: './result-atm.component.html',
  providers: [
    NavigationService
  ]
})
export class ResultATMComponent implements OnInit {
  private config: any = {};
  private channel : string = '';
  private amountLabel : string = '';
  private clarificationLabel : string = '';
  private CONSTANTS : any = this.utils.constants();
  private section: string = 'result';
  private block:any = {"operationCancellation":false}
  private questionId: any ={};

  /**
   * Creates an instance of ResultTddComponent.
   * @param {SessionStorageService} storage
   * @param {UtilsTddService} utils
   * @param {NavigationService} navigationService
   * @param {TaggingService} taggingService
   * @memberof ResultTddComponent
   */
  constructor(
    private storage: SessionStorageService,
    private utils: UtilsTddService,
    private navigationService: NavigationService,
    private taggingService: TaggingService
  ) {
  }


  /**
   * Loads initial content.
   *
   * @memberof ResultTddComponent
   */
  ngOnInit() {
    this.channel = this.storage.getFromLocal(this.CONSTANTS.STORAGE.CHANNEL);
    this.utils.scrollTop();
    const serviceResponse : object = this.storage.getFromLocal(this.CONSTANTS.STORAGE.SM_RESPONSE);
    this.block= this.storage.getFromLocal('BlockModel')!=null ? this.storage.getFromLocal('BlockModel'): {"operationCancellation":false};
    this.questionId=this.storage.getFromLocal('questionId');
    const viewValues: any = this.utils.handleServiceManagerRequest(serviceResponse);
    this.viewConfig(viewValues);
    this.loadViewValues();

    // GA - Tealium
    /*const dataLayer: Object = {
      4: this.section,
      17: 'step-result',
    };
    this.taggingService.uTagView(dataLayer);
    this.taggingService.setPageName();
    this.taggingService.send(location.hash);*/

      this.taggingService.view({
        tag_subsection1: "resultatm",
        tag_titulo: "resultatm",
        tag_url: '/resultatm'
      });
  }

  /**
   *
   * Config principal view values.
   *
   * @param {*} viewValues
   * @returns {*}
   * @memberof ResultTddComponent
   */
  viewConfig(viewValues: any) : any {
    if(viewValues.payment) {
      this.amountLabel = this.CONSTANTS.LABELS.PAYMENT_AMOUNT;
      this.clarificationLabel = this.CONSTANTS.LABELS.PAYMENT_DESCRIPTION;
    } else {
      this.amountLabel = this.CONSTANTS.LABELS.CLARIFICATION_AMOUNT;
      this.clarificationLabel = this.CONSTANTS.LABELS.CLARIFICATION_REGISTER;
    }
    const folios = this.orderFolios(viewValues);
    const channelLabel = this.channel ==='default' ? this.CONSTANTS.LABELS.SUPERMOBILE : this.CONSTANTS.LABELS.SUPERWALLET;
    this.config = {
      userFullName : viewValues.name,
      dateTime : viewValues.currentDate,
      opinionDate : viewValues.greater,
      folios: folios,
      sentEmailLetter : true,
      channel: channelLabel,
      amount : {
        label : this.amountLabel,
        value : Math.abs(viewValues.totalAmount)
      },
      clarificationLabel : this.clarificationLabel
    };
  }

  /**
   * Set documentation according to reason selected.
   *
   * @memberof ResultTddComponent
   */
  loadViewValues() : void {
    let viewSettings : any = {}
    const clarificationType : any = this.storage.getFromLocal(this.CONSTANTS.STORAGE.QUESTION_ID);
    switch (5) {
      /*case 2:
        viewSettings = {
          requirementsResult : this.utils.getRequirementsResult(this.CONSTANTS.LABELS.RECEIPT_CORRECT_AMOUNT)
        }
        this.sentInfoTemplate(viewSettings);
        break;
      case 3:
        viewSettings = {
          requirementsResult : this.utils.getRequirementsResult(this.CONSTANTS.LABELS.RECEIPT_RECOGNIZED)
        }
        this.sentInfoTemplate(viewSettings);
        break;
      case 4:
        viewSettings = {
          requirementsResult : this.utils.getRequirementsResult(this.CONSTANTS.LABELS.RECEIPT_PAYMENT)
        }
        this.sentInfoTemplate(viewSettings);
        break;*/
      case 5:
        viewSettings = {
          requirementsResult : this.utils.getRequirementsResult(this.CONSTANTS.LABELS.RECEIPT_RETURN)
        }
        this.sentInfoTemplate(viewSettings);
        break;
      /*case 6:
        viewSettings = {
          requirementsResult : this.utils.getRequirementsResult(this.CONSTANTS.LABELS.LETTER_VOUCHER)
        }
        this.sentInfoTemplate(viewSettings);
        break;
      case 7:
        viewSettings = {
          requirementsResult : this.utils.getRequirementsResult(this.CONSTANTS.LABELS.VOUCHER_CANCEL)
        }
        this.sentInfoTemplate(viewSettings);
        break;
      case 8:
      case 10:
          viewSettings = {
            requirementsResult : this.utils.getRequirementsResult(this.CONSTANTS.LABELS.FORMART_BCOM)
          }
          this.sentInfoTemplate(viewSettings);
          break;
      case 9:
        viewSettings = {
          requirementsResult : this.utils.getRequirementsResult(this.CONSTANTS.LABELS.INE_FORMART)
        }
        this.sentInfoTemplate(viewSettings);
        break;*/
      default:
        break;
    }
  }

  /**
   * Group folios according to location selected by user.
   *
   * @param {*} viewValues
   * @returns {object}
   * @memberof ResultTddComponent
   */
  orderFolios(viewValues : any) : object {
    let folios : object = {};
    if(viewValues.internationalFolio.length > 0 && viewValues.nationalFolio.length > 0){
      folios = {
        national : {
          label: this.CONSTANTS.LABELS.NATIONAL_FOLIO,
          values: viewValues.nationalFolio
        },
        international : {
          label: this.CONSTANTS.LABELS.INTERNATIONAL_FOLIO,
          values : viewValues.internationalFolio
        }
      };
    } else {
      folios = {
        national : {
          label: this.CONSTANTS.LABELS.FOLIO_NUMBER,
          values: _.merge(viewValues.internationalFolio,viewValues.nationalFolio,viewValues.atmFolio)
        }
      };
    }
    return folios;
  }

  /**
   * Create the config to show the view to sent info
   *
   * @param {*} viewSettings
   * @memberof ResultTddComponent
   */
  sentInfoTemplate(viewSettings : any) : void {
    const configAssigend = {
      requirementsResult : viewSettings.requirementsResult,
      warning : true,
      sentEmailLetter : true
    }
    _.assign(this.config, configAssigend);
  }

  /**
   * Method for the finish button.
   *
   * @memberof ResultTddComponent
   */
  public finishApp(): void {
      this.taggingService.link({
        event: 'aclaraciones',
        interaction_category: this.taggingService.getvalues().tag_aclaracion.toString(),
        interaction_action:'resumen',
        interaction_label:'finalizar',
        });
    this.navigationService.goToRoot();
  }
}
