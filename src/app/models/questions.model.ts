import { BlockModel, MotiveModel, SituationModel } from './';
import moment from 'moment';

/**
 * Questions object used in the questionarie.
 *
 * @export
 * @class QuestionsModel
 */
export class QuestionsModel {
  public hasCard: number;
  public cardLastSixDigits: string;
  public cardMonth: string;
  public cardYear: string;
  public cardExpiration: string;
  public period: string;
  public haveContact: string;
  public motive: MotiveModel;
  public additionalComments: string;
  public location = 0;
  public state: string;
  public whatHappens: SituationModel;
  public missingDD: string;
  public optionsDD: string[] = [];
  public missingMM: string = null;
  public optionsMM: Array<{ value: string, label: string }> = [];
  public missingYY: string;
  public optionsYY: Number[] = [];
  public missingDate: string;
  public isValidCardExpiration: boolean;
  public isValidCardNumber: boolean;
  public blocker: BlockModel = new BlockModel();
  public defaultMotive: MotiveModel = new MotiveModel('D-101', 'Seleccione un motivo', '', '', '');
  public defaultState = 'Elije una entidad';
  public situations: Array<SituationModel> = [
    new SituationModel(
      'S-01',
      'La reporté como robada o extraviada.'
    ),
    new SituationModel(
      'S-02',
      'Nunca la tuve conmigo.',
    ),
    new SituationModel(
      'S-03',
      'Me la robaron o la extravié y no la he reportado.',
    ),
  ];
  public canBlockCard = false;
  public lostDate = '';
  public lostDateValid = false;
  public motives: Array<MotiveModel> = [
    new MotiveModel(
      'IC-201',
      'Cargo duplicado',
      'Describa lo que <strong>sucedió</strong>:',
      'Ejem.: No reconozco el cargo porque me aparece en más de una ocasión.',
      'El cargo que hice está duplicado'
    ),
    new MotiveModel(
      'IC-202',
      'Monto alterado',
      '¿Cuál es el importe que <strong>autorizó y reconoce</strong>?',
      'Ejem.: Es de $120,000.00 el monto que si reconozco.',
      'El importe está alterado (solicitar pagaré firmado por cliente)'
    ),
    new MotiveModel(
      'IC-203',
      'Cargos adicionales al autorizado',
      'Indique los datos del (los) <strong>consumo(s) que sí reconoce</strong>:',
      'Ejem.: ID 2429384 - Compra en Liverpool',
      'Procesaron transacciones adicionales a la que autoricé(solicitar pagaré firmado por cliente)'
    ),
    new MotiveModel(
      'IC-204',
      'Mercancías o servicios no<br>proporcionados',
      '<strong>Comentarios</strong> adicionales',
      'Ejem.: Nunca me llegó mi mercancía',
      'Mercancía o servicios no recibidos'
    ),
    new MotiveModel(
      'IC-205',
      'Devolución no aplicada',
      '<strong>Comentarios</strong> adicionales',
      'Ejem.: No me han hecho mi devolución.',
      'La mercancía o servicios estaban defectuosos o difieren de lo acordado'
    ),
    new MotiveModel(
      'IC-206',
      'Pago por otro medio',
      'Describa lo que <strong>sucedió</strong>',
      'Ejem.: No hice el pago a través de este medio.',
      'Pagué por otro medio(solicitar comprobante de pago)'
    ),
    new MotiveModel(
      'IC-207',
      'Cancelación de servicio',
      '<strong>Comentarios</strong> adicionales',
      'Ejem.: No estoy de acuerdo con el cobro del servicio, por lo cual lo cancelo.',
      'Cancelé el servicio(solicitar información de cancelación: fecha, clave, comprobante)'
    ),
    new MotiveModel(
      'IC-208',
      'Otro',
      '<strong>Especificar</strong>',
      'Ejem.: Detallar lo más detalladamente la situación',
      'Otro (especificar en el cuadro de notas/comentarios)'
    )
  ];

  /**
   * Creates an instance of QuestionsModel.
   * @memberof QuestionsModel
   */
  constructor() {
    this.resetValues();
  }

  /**
   * Check if the lost date is valid.
   *
   * @returns {boolean}
   * @memberof QuestionsModel
   */
  public lostDateIsValid(): boolean {
    let res = false;
    this.lostDate = '';
    let validation = this.missingDD && this.missingMM && this.missingYY;
    if (validation) {
      let fullDate: string = this.twoNumberFmt(this.missingDD)
            .concat('-').concat(this.twoNumberFmt(this.missingMM))
            .concat('-').concat(this.twoNumberFmt(this.missingYY));
      let selectedDate = moment(fullDate, 'DD-MM-YYYY', true);
      if (selectedDate.isValid()) {
        const now = moment();
        const lmt = moment().subtract(10, 'year');
        let inRange = (selectedDate >= lmt) && (now >= selectedDate);
        if (inRange){
          this.lostDate = selectedDate.format('YYYY-MM-DD').toString();
          res = true;
        }
      }
    }
    this.lostDateValid = res;
    return res;
  }

  /**
   * Two number format.
   *
   * @param {*} val
   * @returns {string}
   * @memberof QuestionsModel
   */
  public twoNumberFmt(val: any): string {
    let response: string = val.toString();
    if(response.length < 2){
      response = ('0').concat(response);
    }
    return response;
  }

  /**
   * Check card expiration validity.
   *
   * @memberof QuestionsModel
   */
  public checkCardExpirationValidity(): void {
    const now = moment();
    const trans: string  = this.cardExpiration.replace(' / ', '-');
    const expDate = moment(trans, 'MM-YY', true);
    this.isValidCardExpiration = false;

    if (expDate.isValid()){
      if (expDate.year() >= now.year() && expDate.year() <= (now.year() + 5)) {
        this.isValidCardExpiration = true;
      }
    }
  }

  /**
   * Check card number validity.
   *
   * @memberof QuestionsModel
   */
  public checkCardNumberValidity(): void {
    this.isValidCardNumber = false;
    if (this.cardLastSixDigits.toString().length === 6 && parseInt(this.cardLastSixDigits) > 0){
      this.isValidCardNumber = true;
    }
  }

  /**
   * Branch navigation.
   *
   * @returns {boolean}
   * @memberof QuestionsModel
   */
  public isValid(): boolean {
    let result = false;
    if (Number(this.hasCard) === 1) {
      if (Number(this.haveContact) === 1) {
        if (this.additionalComments.length < 5 ) {
          if (this.state !== "Elije una entidad") {
            this.state = "Elije una entidad";
            return result;
          } 
        } else {
          result = this.hasCardValid();
        }
      } else {
        result = this.hasCardValid();
      }
    } else if (Number(this.hasCard) === 2) {
      result = this.hasNotCardValid();
    } 
    return result;
  }

  /**
   * Branch navigation.
   *
   * @returns {boolean}
   * @memberof QuestionsModel
   */
  public hasCardValid(): boolean{
    if (this.haveContact === '2' && this.validateState()) {
      if (this.blocker.wishBlock){
        this.canBlockCard = true;
      }
      return true;
    } else {
      this.canBlockCard = false;
      if (this.additionalComments.length > 1 && this.validateState()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Branch navigation.
   *
   * @returns {boolean}
   * @memberof QuestionsModel
   */
  public hasNotCardValid():boolean{
    if (this.state !== this.defaultState) {
      if (this.whatHappens === this.situations[0]) {
        if (this.lostDateIsValid()) {
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  }

  /**
   * Validate state.
   *
   * @returns {boolean}
   * @memberof QuestionsModel
   */
  public validateState(): boolean {
    if (this.state !== this.defaultState) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Set selection range
   *
   * @param {*} input
   * @param {*} selectionStart
   * @param {*} selectionEnd
   * @memberof QuestionsModel
   */
  public setSelectionRange(input: any, selectionStart: any, selectionEnd: any): void {
    if (input.setSelectionRange) {
      input.focus();
      input.setSelectionRange(selectionStart, selectionEnd);
      input.selectionEnd = input.value.length;
    } else if (input.createTextRange) {
      let range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    }
  }

  /**
   * Soft reset No Path.
   *
   * @memberof QuestionsModel
   */
  public softResetNoPath(): void {
    this.missingDD = null;
    // Set the days
    if (this.optionsDD.length === 0) {
      for(let dayi = 1; dayi <= 31; dayi++) {
        this.optionsDD.push(this.twoNumberFmt(dayi));
      }
    }
    this.missingMM = null;
    // Set the months
    if (this.optionsMM.length === 0) {
      moment.locale('es');
      const months = moment.monthsShort();
      months.forEach((item, index) => {
        this.optionsMM.push({
          value: this.twoNumberFmt(index + 1),
          label: item.toUpperCase().replace(/\./g, ''),
        });
      });
    }
    this.missingYY = null;
    // Set the months
    if (this.optionsYY.length === 0) {
      const year = moment().year();
      const yearMinusten = year - 10;
      for (let yeari = year; yeari >= yearMinusten; yeari--) {
        this.optionsYY.push(yeari);
      }
    }
    this.missingDate = '';
    this.lostDateValid=false;
    this.state = this.defaultState;
    this.location = 0;
  }

  /**
   * Reset NO Path.
   *
   * @memberof QuestionsModel
   */
  public resetNOPath(): void {
    this.period = '';
    this.whatHappens = new SituationModel();
    this.canBlockCard = false;
    this.softResetNoPath();
    this.location = 0;
  }

  /**
   * Reset YES Path.
   *
   * @memberof QuestionsModel
   */
  public resetYESPath(): void {
    this.cardLastSixDigits = '';
    this.cardExpiration = '';
    this.cardMonth = '0';
    this.cardYear = '0';
    this.haveContact = '0';
    this.motive = this.defaultMotive;
    this.state = this.defaultState;
    this.location = 0;
    this.additionalComments = '';
    this.isValidCardNumber = false;
    this.isValidCardExpiration = false;
    this.canBlockCard = false;
  }

  /**
   * Reset to initial values except for the has Card option.
   *
   * @memberof QuestionsModel
   */
  public resetHard(): void {

    this.resetNOPath();
    this.resetYESPath();
  }

  /**
   * Reset to initial values.
   *
   * @memberof QuestionsModel
   */
  public resetValues(): void {
    this.hasCard = 0;
    this.resetHard();
  }
}
