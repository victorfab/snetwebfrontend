import { OnInit, Component } from '@angular/core';
import { FormGroup, Validators, FormControl, AbstractControl, NG_VALIDATORS } from '@angular/forms';

import { Router } from '@angular/router';

import { SessionStorageService } from '../../../services/tdd/session-storage.service';
import { TaggingService } from '../../../services/tagging.service';
import { NavigationService } from '../../../services/navigation.service/navigation.service';

/**
 * amount validator
 * @param amount
 */
function amountValidator(amount: AbstractControl): { [key: string]: boolean } | null {
  const amountAux = amount.value;
  if (amountAux === 0) {
    return null;
  } else {
    if (amountAux % 100 === 0 || amountAux % 50 === 0) {
      return null;
    }
  }
  return {'amount': true}
}

/**
 * amount validator
 * @param describe
 */
function ValidateDescription(describe: AbstractControl): { [key: string]: boolean } | null {
  const describeAux = describe.value;
  if (describeAux.trim().length >= 5) {
    return null;
  } else {
    return {'description': true}
  }

}

@Component({
  selector: 'questionarie-atm',
  templateUrl: './questionnaire-atm.component.html',
  providers: [
    NavigationService,
    {
      provide: NG_VALIDATORS,
      useValue: amountValidator,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useValue: ValidateDescription,
      multi: true
    }
  ],
})
export class QuestionnaireATMComponent implements OnInit {

  /**
   *  form of the questionary
   *
   * @type {FormGroup}
   * @memberof EntityViewComponent
   */
  public questionnaire: FormGroup;
  /**
   * tener todas las ubicaciones para alta de alcaracion
   *
   * @type {*}
   * @memberof QuestionnaireATMComponent
   */
  public states: any;
  /**
   * Estados que solamente se van a mostrar
   *
   * @type {*}
   * @memberof QuestionnaireATMComponent
   */
  public statesShow: any;
  /**
   * Movimientos seleccionados por el cliente
   *
   * @type {*}
   * @memberof QuestionnaireATMComponent
   */
  public moves: any;
  /**
   * total de un movimiento seleccionado
   *
   * @type {*}
   * @memberof QuestionnaireATMComponent
   */
  public trxAmoutn: any;
  /**
   * factura del movimiento
   *
   * @type {*}
   * @memberof QuestionnaireATMComponent
   */
  public trnTypeCode: any;
  /**
   * bandera que indica si esa operacion es permitida o no
   *
   * @type {boolean}
   * @memberof QuestionnaireATMComponent
   */
  public opNoPermitida: boolean = false;
  /**
   * bandera que indica si es una operacion tipo orden de pago o retiro sin tarjeta
   *
   * @type {boolean}
   * @memberof QuestionnaireATMComponent
   */
  public ordenPago: boolean = false;
  /** SECTION NAME TB BUTTON */
  private section: string = 'questionnaire';
  wasDescriptionValid: boolean;

  constructor(
    private storage: SessionStorageService,
    private router: Router,
    private taggingService: TaggingService,
    private navigationService: NavigationService
  ) {
    this.states = this.storage.getFromLocal('states');
  }

  /**
   * Motivos de alta de aclaracion
   *
   * @memberof QuestionnaireATMComponent
   */
  public motives = [
    {
      key: 1, value: 'El ATM no me dio el dinero que solicité'
    }, /*NO ENTREGO EFECTIVO  */
    {
      key: 2, value: 'Tengo un retiro en ATM que yo no hice'
    }, /*NO RECONOCE RETIRO*/
    {
      key: 3, value: 'Tengo un retiro en ATM que yo no hice'
    }, /*ORDENES DE PAGO CASO PARA MOSTRAR PANTALLA DE CONTACTE A SUPERLINEA*/
  ]

  /**
   * metodo abstracto para tener el metodo get del componente hasCard
   *
   * @readonly
   * @memberof EntityViewComponent
   */
  get hasCard() {
    return this.questionnaire.get('hasCard');
  }

  /**
   * metodo abstracto para tener el metodo get del componente amount
   *
   * @readonly
   * @memberof EntityViewComponent
   */
  get amount() {
    return this.questionnaire.get('amount');
  }

  /**
   * metodo abstracto para tener el metodo get del componente motive
   *
   * @readonly
   * @memberof EntityViewComponent
   */
  get motive() {
    return this.questionnaire.get('motive');
  }

  /**
   * metodo abstracto para tener el metodo get del componente entity
   *
   * @readonly
   * @memberof EntityViewComponent
   */
  get entity() {
    return this.questionnaire.get('entity');
  }

  /**
   * metodo abstracto para tener el metodo get del componente contactATM
   *
   * @readonly
   * @memberof EntityViewComponent
   */
  get contactATM() {
    return this.questionnaire.get('contactATM');
  }


  /**
   * metodo abstracto para tener el metodo get del componente description
   *
   * @readonly
   * @memberof EntityViewComponent
   */
  get description() {
    return this.questionnaire.get('description');
  }


  /**
   * caso 1 retiro con tarjeta
   *      tiene la tarjeta en su poder -> SI
   *      que fue lo que paso / el atm no me dio el dinero que solicite
   *      cuanto dinero solicito
   *      cuanto le dio el ATM
   *      donde se encuentra
   *      entidad federativa
   * caso 2 retiro con tarjeta
   *      tiene la tarjeta en su poder -> Si
   *      que fue lo que paso / Tengo un retiro que no hice
   *      interactuo con el cajero -> NO
   *      Describa lo que sucedio
   *      donde se encuentra
   *      Entidad federativa
   * caso 3 Retiro sin tarjeta
   *        que fue lo que paso / el ATM no me dio el dinero que solicité
   *      cuanto solicito
   *      cuanto le dio el cajero
   *      En donde se encuentra
   *      Entidad federativa
   *
   * @memberof QuestionnaireATMComponent
   */
  public createForm() {
    this.questionnaire = new FormGroup({
      hasCard: new FormControl(''),
      motive: new FormControl('',),
      contactATM: new FormControl('NO'),
      description: new FormControl('', [ValidateDescription]),
      amount: new FormControl(0.0, [
        Validators.max(this.trxAmoutn),
        amountValidator
      ]),
      amoutnOrigin: new FormControl(this.trxAmoutn),
      entity: new FormControl(''),
      entitySelected: new FormControl('', [Validators.required])
    });
    // es ordenes de pago //
    if (this.trnTypeCode !== '2561') {
      this.motives.splice(2, 1);
    } else {
      this.motives.splice(1, 1);
      this.questionnaire.controls['hasCard'].setValue('si');
      this.ordenPago = true;
    }
    this.checkDescription();
  }

  private checkDescription(): void {
    this.questionnaire.get('description').valueChanges.subscribe(() => {
      if (!this.wasDescriptionValid) {
        this.wasDescriptionValid = this.questionnaire.get('description').valid;
      }
    });
  }


  /**
   * Metodo para enviar valor de hascard y desiciones de que pregunta mostrar
   * @param value valor para hascard
   */
  public setValueCard(value: any) {
    if (value === 'si' && (this.hasCard.value === '' || this.hasCard.value === 'no')) {
      this.questionnaire.controls['hasCard'].setValue('si');
      this.questionnaire.controls['motive'].setValue('');
      this.questionnaire.controls['motive'].enable();
      this.questionnaire.controls['entity'].setValue('');
      this.questionnaire.controls['entitySelected'].setValue('');
      this.questionnaire.controls['description'].setValue('');
      this.wasDescriptionValid = false;
    } else if (value === 'no' && (this.hasCard.value === '' || this.hasCard.value === 'si')) {
      this.questionnaire.controls['hasCard'].setValue('no');
      this.questionnaire.controls['motive'].setValue(this.motives[1]);
      this.questionnaire.controls['motive'].disable();
      this.questionnaire.controls['entity'].setValue('');
      this.questionnaire.controls['entitySelected'].setValue('');
      this.questionnaire.controls['description'].setValue('');
      this.wasDescriptionValid = false;
    }
  }

  /**
   * Revisar si el cliente esta en la republica o fuera de ella
   * @param value states clave
   */
  public setValueEntity(value: any): void {
    const entity = this.questionnaire.get('entity').value;
    if (value === 1 && (entity === false || entity === '')) {
      this.questionnaire.controls['entity'].setValue(true);
      this.questionnaire.controls['entitySelected'].reset();
    } else if (value === 2 && (entity === true || entity === '')) {
      this.questionnaire.controls['entity'].setValue(false);
      this.questionnaire.controls['entitySelected'].setValue(this.states[32].clave);
    }
  }

  /**
   * si tuvo contacto con el cajero ATM
   * @param value
   */
  public setValueContactATM(value: boolean) {
    if (value) {
      this.questionnaire.controls['contactATM'].setValue(value);
    }
  }


  /**
   *
   * get Interaction View of questionary
   * @param {*} motive
   * @param {string} description
   * @param {string} commerceInt
   * @returns {Array<any>}
   * @memberof UtilsTddService
   */
  private getInteractionView() {
    let questions: any;
    const hasCard = this.questionnaire.get('hasCard').value === 'si' ? 'SI' : 'NO';
    /*{key: 1, value: "El ATM no me dio el dinero que solicité"}*/
    const motive = this.questionnaire.get('motive').value;

    let subcategory = '';
    questions = [
      {key: 'TARJETA EN SU PODER', value: hasCard, id: 'hasCard'},
      {key: 'MOTIVO DE LA ACLARACION', value: motive.value.toUpperCase(), id: 'reason'},
      {key: motive.value, value: 'SI'},
      {key: 'MOTIVO', value: this.questionnaire.get('description').value, id: 'description'}
    ];
    switch (motive.key) {
      case 1:
        questions.push({key: 'CUANTO SOLICITO', value: this.trxAmoutn, id: 'howMuchRequest'});
        questions.push({
          key: 'CUANTO LE DIO EL CAJERO',
          value: this.questionnaire.get('amount').value,
          id: 'howMuchGet'
        });
        questions.push({
          key: 'MONTO TOTAL DE LA ACLARACION',
          value: this.trxAmoutn - this.questionnaire.get('amount').value,
          id: 'totalAmount'
        });
        subcategory = 'NO ENTREGO EFECTIVO';
        break;
      case 2:
        questions.push({
          key: 'INTERACTUO CON EL CAJERO ATM',
          value: this.questionnaire.get('contactATM').value,
          id: 'interactiveAtm'
        })
        questions.push({
          key: 'MONTO TOTAL DE LA ACLARACION',
          value: this.trxAmoutn,
          id: 'totalAmount'
        });
        subcategory = 'NO RECONOCE RETIRO';
        break;
      case 3:
        questions.push({
          key: 'MONTO TOTAL DE LA ACLARACION',
          value: this.trxAmoutn,
          id: 'totalAmount'
        });
        subcategory = 'ORDENES DE PAGO';
        break;
    }

    questions.push({
      key: 'UBICACION ACTUAL',
      value: this.questionnaire.get('entitySelected').value,
      id: 'entitySelected'
    });


    const adittionaldata = {
      description: [this.questionnaire.get('description').value],
      lostdate: '',
      location: this.questionnaire.get('entitySelected').value
    }
    const question = [];
    questions.forEach(element => {
      question.push({Preguntas: element.key.toUpperCase(), Respuestas: element.value});
    });

    this.storage.saveInLocal('additionaldata', adittionaldata);
    this.storage.saveInLocal('viewQuestions', questions);
    this.storage.saveInLocal('questionnaire', question);
    this.storage.saveInLocal('subcategory', subcategory);
  }

  /**
   * Enviar a la pantalla de resumen
   */
  public executeContinue() {
    this.getInteractionView();
    let tagcategory = '';
    switch (this.storage.getFromLocal('subcategory')) {
      case 'NO ENTREGO EFECTIVO':
        tagcategory = 'atm_no_dio_dinero_solicite';
        break;
      case 'NO RECONOCE RETIRO':
        tagcategory = 'atm_retiro_no_hice';
        break;
      case 'ORDENES DE PAGO':
        tagcategory = 'atm_orden_de_pago';
        break;
    }
 
    this.taggingService.link({
      event: 'aclaraciones',
      interaction_category: tagcategory,
      interaction_action: 'cuestionario',
      interaction_label: 'continuar',
    });
    this.taggingService.view({
      tag_subsection1: 'questionnairetdd',
      tag_titulo: 'questionnaireatm',
      tag_aclaracion: [tagcategory],
    });
    this.router.navigate(['summary-atm']);
  }


  /**
   * validar motivo con base al tipo de movimiento
   * @param motive motivo
   */
  public validateMotive(motive: any) {
    if (this.trnTypeCode === '2561' && motive.key === 3) {
      this.opNoPermitida = true;
    } else {
      this.questionnaire.controls['description'].setValue('');
      this.wasDescriptionValid = false;
      this.questionnaire.controls['amount'].setValue('0.0');
      this.questionnaire.controls['entity'].setValue('');
      this.questionnaire.controls['entitySelected'].setValue('');
    }

  }

  /**
   * Inicio
   */
  public ngOnInit() {
    // TB BUTTON SM O WALL
    document.getElementById('body').style.removeProperty('overflow');
    this.navigationService.tapBack(this.section);
    this.states = this.storage.getFromLocal('states');
    this.statesShow = this.states.slice(0, this.states.length - 1);
    this.moves = this.storage.getFromLocal('multifolio');
    this.trxAmoutn = this.moves[0].txrMonto.toString().replace('-', '');
    this.trnTypeCode = this.moves[0].txrTipoFactura;
    this.createForm();
    this.taggingService.setvalues('questionnaireatm', 'questionnaireatm');
    this.taggingService.view({
      tag_subsection1: 'questionnaireatm',
      tag_titulo: 'questionnaireatm',
      tag_url: '/questionnaireatm'
    });

  }

}
