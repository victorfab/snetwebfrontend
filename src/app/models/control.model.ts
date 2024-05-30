import { FormControl, FormGroup, ValidatorFn } from "@angular/forms";
import { debounceTime, distinctUntilChanged, Subscription } from "rxjs";
import {
  ControlBase,
  ControlType,
  ChildControl,
  Options,
} from "../interfaces/control-base.interface";
import { setError } from "../shared/validators";

export class Control<T> implements ControlBase<T> {
  shortLabel: string = '';
  label: string = "";
  placeholder: string = "";
  name: string = "";
  tag: string = "";
  type?: ControlType | undefined = "text";
  show?: boolean | undefined = true;
  validators: ValidatorFn[] = [];
  detectChanges: boolean = true;
  detectChangesDelay?: number | undefined = 0;
  childControls: ChildControl[] = [];
  detectChangesOnBlur = false;
  showAtQuestionnarie = true;

  create(props: Partial<T>): ControlBase<T> {
    Object.assign(this, props);
    return this;
  }

  toFormControl(): { name: string; control: FormControl<any> } {
    return { name: this.name, control: new FormControl("", this.validators) };
  }

  /**
   * @description Will subscribe to the formControl for listen value changes
   * @param nativeControls - The original list of control
   * @param form - The created form group
   * @param callback - A function to execute after listen changes
   */
  startInteraction(
    nativeControls: object[],
    form: FormGroup<any>,
    callback?: Function
  ): Subscription | null {
    const currentControl = form.get(this.name);
    if (this.detectChangesOnBlur) {
      currentControl.setValidators([...this.validators, setError()]);
      return currentControl.valueChanges
        .pipe(
          debounceTime(this.detectChangesDelay || 0),
          distinctUntilChanged()
        )
        .subscribe((value: any) => {
          if (currentControl.valid) {
            currentControl.setValidators([...this.validators]);
            // currentControl.setValidators([...this.validators, setError()]);
            currentControl.updateValueAndValidity();
          }
        });
    }

    if (!this.detectChanges) {
      return null;
    }

    if (!currentControl) {
      return null;
    }

    return currentControl.valueChanges
      .pipe(debounceTime(this.detectChangesDelay || 0), distinctUntilChanged())
      .subscribe((value: any) => {
        this.handleDependencies(form, nativeControls, { value, control: this });

        if (callback) {
          callback(this);
        }
      });
  }

  handleDependencies = (
    form: FormGroup<any>,
    nativeControls: any[],
    value: any,
    blur?: boolean
  ) => {
    if (blur) {
      const control = form.get(this.name);
      if (control?.errors?.pending && Object.keys(control.errors).length === 1) {
        control.setErrors(null);
        control.setValidators([...this.validators]);
        control.updateValueAndValidity();
      }
    }

    const names = this.childControls.map((dep) => dep.controlName);

    const childControls = nativeControls.filter((ctrl: any) =>
      names.includes(ctrl.name)
    );

    childControls.forEach((control: any, index) => {
      const dependetControl = this.childControls[index];

      this.updateChildControlsOnValueChange(control, index, value);

      this.toggleChildControls(
        control,
        dependetControl,
        form,
        value,
        nativeControls
      );
    });
  };

  get props(): object {
    return {
      label: this.label,
      placeholder: this.placeholder,
      name: this.name,
      type: this.type,
    };
  }

  update(partial: Partial<ControlBase<T>>): this {
    Object.assign(this, partial);
    return this;
  }

  private deleteDependentControls(
    control: Control<any>,
    nativeControls,
    form: FormGroup
  ) {
    control.childControls.forEach((childControl) => {
      const ctrl = nativeControls.find(
        (ctrl) => ctrl.name === childControl.controlName
      );
      ctrl.show = false;

      if (form.get(ctrl.name)) {
        form.removeControl(ctrl.name);

        if (ctrl.childControls.length) {
          this.deleteDependentControls(ctrl, nativeControls, form);
        }
      }
    });
  }

  /**
   * @descreiption To update the child controls on this control value change
   * @param control - The native control(this)
   * @param index - The control index
   * @param - The formControl value
   */
  private updateChildControlsOnValueChange(
    control: Control<any>,
    index: number,
    value: any
  ): void {
    //check updates
    const dep = this.childControls[index];
    //if the dependenci has updateWith function then update the control
    if (dep.updateWith) {
      const valueToUpdate = value.control?.controlGroup?.find((ctrl) =>
        Boolean(ctrl.data)
      );

      control.update({
        ...dep.updateWith(
          Boolean(valueToUpdate) ? valueToUpdate.data : value.value
        ),
      });
    }
  }

  /**
   * @description This method will show or hide the current control
   * and when the curren control is hidden then will look for his childControls and will be
   * hide
   * @param control - The native control
   * @param  dependetControl The dependen child control
   * @param form The reactive formGroup
   * @param value The reactive form control value
   * @params nativeControls - The original array of controls
   */

  private toggleChildControls(
    control: Control<any>,
    dependetControl: ChildControl,
    form: FormGroup,
    value: any,
    nativeControls: any[]
  ): void {
    let show = control.show;

    if (dependetControl.onValidControl && form.get(this.name)) {
      show = form.get(this.name)?.valid;
    } else if (Boolean(dependetControl.expectedValue)) {
      show = value.value === dependetControl.expectedValue;
    }

    if (show) {
      if (!form.get(control.name)) {
        form.addControl(control.name, control.toFormControl().control);
      }
    } else if (form.get(control.name)) {
      // when the form will be deleted then should hide all its child controls
      this.deleteDependentControls(control, nativeControls, form);
      form.removeControl(control.name);
    }

    control.show = show;
  }
}

export class ControlRadio extends Control<ControlRadio> {
  detectChangesOnBlur = false;
  controlGroup!: {
    label: string;
    id: string;
    value: string;
    message?: string;
    data?: any;
  }[];
}

export class ControlTexArea extends Control<ControlTexArea> {
  message: string = "";
  rows: number = 4;
  cols: number = 10;
  detectChangesOnBlur = false;

  public override get props(): Partial<ControlTexArea> {
    return {
      label: this.label,
      placeholder: this.placeholder,
      name: this.name,
      type: this.type,
      rows: this.rows,
      cols: this.cols,
    };
  }
}

export class ControlSelect extends Control<ControlSelect> {
  detectChangesOnBlur = false;
  options: Options[] = [];
}
