import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Subscription } from "rxjs";
import { FormOptions } from "../../enums/form-options.enum";
import { Control } from "../../models/control.model";
import { TaggingService } from "../../services/tagging.service";

@Component({
  selector: "app-form",
  templateUrl: "./form.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnDestroy {
  @Output() valueChanges: EventEmitter<any> = new EventEmitter<any>();

  @Input() set controlList(controlList: any[]) {
    this.controls = controlList;
    this.configureControls();
  }
  @Input() patchDelay = 20;

  private controls: any[] = [];
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private taggingService = inject(TaggingService);
  private subscriptions: Subscription[] = [];
  public formGroup: FormGroup;
  public formOptions = FormOptions;
  public formOption: FormOptions;
  public proxyForm: any = null;
  public invalidForm = true;

  private readonly MAX_CHARACTER = 240;

  constructor() {
    this.formOption = localStorage.getItem("option") as FormOptions;
    
  }

  private createForm(): void {
    this.formGroup = this.fb.group({});

    this.proxyForm = this.createProxy(this.formGroup);

    this.controls.forEach((ctrl) => {
      if (ctrl.show) {
        const { name, control } = ctrl.toFormControl();
        this.proxyForm.addControl(name, control);
      }
    });
    this.updateFormValidation();
  }

  public submit(): void {
    const formValue = this.proxyForm.value;
    
    const nameList: string[] = Object.keys(formValue);
    const value: object[] = [];

    nameList.forEach((controlName) => {
      const control = this.controls.find((ctrl) => ctrl.name === controlName);
      value.push({
        value: formValue[controlName],
        ...(control.options?.length &&
          (() => {
            const option = control.options.find(
              (option) => option.id.toString() === formValue[controlName]
            );
            return {
              stringValue: option?.value?.toUpperCase(),
            };
          })()),
        ...(control.controlGroup?.length &&
          (() => {
            const option = control.controlGroup.find(
              (option) => option.value.toString() === formValue[controlName]
            );
            return {
              stringValue: option?.label?.toUpperCase(),
            };
          })()),
        name: controlName,
        question: control.label,
        ...(control.controlGroup && { options: control.controlGroup }),
        show: control.showAtQuestionnarie,
        shortLabel: control.shortLabel
      });
    });
    this.valueChanges.emit({
      questionnarie: value,
      patch: this.formGroup.value,
    });
  }

  public async patch(controlVale: any) {
    const names = Object.keys(controlVale);
    for (const iterator of names) {
      await this.putValue(iterator, controlVale);
    }
  }

  async putValue(controlName: string, obj: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.proxyForm.get(controlName).setValue(obj[controlName]);
        const search = this.controls.find((ctrl) => ctrl.name === controlName);
        if (search.detectChangesOnBlur) {
          this.blur(search);
          this.updateFormValidation();
        }
        resolve(obj[controlName]);
      }, this.patchDelay);
    });
  }

  trackByFn(index: number, item: any): number {
    return item.name;
  }

  /**
   * Will intercept all addControl calls from FormGroup
   * and will start to listen changes on the control
   * to avoid calling listenChanges after every addControl on all places
   * @param target
   * @private
   */
  private createProxy(target: FormGroup): FormGroup {
    const handler = {
      get: (target: any, prop: string, receiver: FormGroup) => {
        if (prop === "addControl") {
          return (name: string, control: any) => {
            const result = Reflect.apply(target[prop], target, [name, control]);
            const ctrl = this.controls.find((c) => c.name === name);
            if (ctrl.detectChanges) {
              const sub = ctrl.startInteraction(
                this.controls,
                receiver,
                (control: object) => {
                  this.update();
                  this.updateFormValidation();
                }
              );

              if (sub) {
                this.subscriptions = [sub];
              }
            }

            return result;
          };
        }
        return target[prop];
      },
    };
    return new Proxy(target, handler);
  }

  private configureControls(): void {
    if (!this.formOption) {
      return;
    }

    switch (this.formOption) {
      case FormOptions.LINEX:
        // this.controls.push(
        //   this.controlFactory.buildControl<ControlSelect>("select")
        // );
        break;
      default:
        break;
    }

    this.createForm();
  }

  public update(): void {
    this.controls = [...this.controls];
    this.updateFormValidation();
    this.cdr.detectChanges();
  }

  public blur(control: Control<any>): void {
    if (control.detectChangesOnBlur) {
      control.handleDependencies(
        this.proxyForm,
        this.controls,
        {
          value: this.proxyForm.get(control.name)?.value,
          control,
        },
        true
      );
      this.update();
    }
  }

  private updateFormValidation(): void {
    this.invalidForm =
      this.proxyForm.invalid || this.proxyForm.status === "INVALID";
    this.cdr.detectChanges();
  }

  public validateMaxLength(value: string) {
    if (value?.length >= this.MAX_CHARACTER) {
      return false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
