import { FormControl, FormGroup, ValidatorFn } from "@angular/forms";
import { Subscription } from "rxjs";

export type ControlType = "text" | "number" | "radio" | "select";

export interface ControlBase<T> {
  /**
   * @description Control label short to use at summary screen only
   */
  shortLabel?: string;
  /**
   * @description Control label text
   */
  label: string;
  /**
   * @description Control placeholder text
   */
  placeholder: string;
  /**
   *  @description Control name
   */
  name: string;
  /** @description Control tag input, text area etc */
  tag: string;
  /**
   * @description Control type(text, number, radio, select, textarea)
   */
  type?: ControlType;
  /**
   * @description Show or hide the control
   */
  show?: boolean;
  /**
   * @description Control array validators
   */
  validators: ValidatorFn[];

  /**
   * @description Validate if want to listen control changes
   */
  detectChanges: boolean;

  /**
   * @description Tells the control if the changes will be executed on control blur
   * if is activated then detectChanges will not work
   * @see Control  listenChanges
   */
  detectChangesOnBlur: boolean;

  /**
   * @description Delay to execute detect changes
   */
  detectChangesDelay?: number;

  /**
   * @description To handle show or hide dependent controls
   */
  childControls: ChildControl[];

  /**
   * @description To handle show or hide at summary screen
   */
  showAtQuestionnarie?: boolean;

  /**
   * @description Create a partial instance of Control
   * @param {Partial} props
   */
  create(props: Partial<T>): ControlBase<T>;

  /**
   * @description Create an object to use as form control
   */
  toFormControl(): { name: string; control: FormControl };

  /**
   * Start to listen value changes of control
   * @param nativeControls - the native list of controls
   * @param form - The form created using native control list
   * @param callback - Function - used to execute tasks after value
   * change(normally detect changes)
   */
  startInteraction(
    nativeControls: object[],
    form: FormGroup,
    callback?: Function
  ): Subscription | null;

  /**
   * @description Control method for custom logic on control value change
   * @param form - The form created using native control list
   * @param nativeControls - the native list of controls
   * @param value - The current value of control
   * @param blur - Tells the method that the call comes from control blur method
   * @returns a subscription to unsubscribe
   */
  handleDependencies: (
    form: FormGroup,
    nativeControls: object[],
    value: any,
    blur?: boolean
  ) => void;

  /**
   * @description Get principal or control props
   */
  get props(): object;

  /**
   * @description will update this object with the new properties
   * @param partial - some properties to update
   */
  update(partial: Partial<ControlBase<T>>): ControlBase<T>;
}

/**
 * @description Provide a model for Control child controls
 */
export interface ChildControl {
  /**
   * @description The control name
   */
  controlName: string;
  /**
   * @description The expected value to show
   */
  expectedValue?: any;
  /**
   * @description To show the control when the form control is valid
   */
  onValidControl?: boolean;
  /**
   * @description Will update the origina control with returned value
   * @example {label: 'test'}
   */
  updateWith?: Function;
}

export interface Options {
  id: any;
  value: any;
  completeOption: any;
}
