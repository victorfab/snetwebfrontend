import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { ChildControl } from "../interfaces/control-base.interface";

export const invalidDefault = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === "" || value === 0) {
      return { required: true };
    }
    return null;
  };
};

export const setError = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    return { pending: true };
  };
};
