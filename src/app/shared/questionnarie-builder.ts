import { inject, Injectable } from "@angular/core";
import { Validators } from "@angular/forms";
import { FormOptions } from "../enums/form-options.enum";
import { Options } from "../interfaces/control-base.interface";
import { ControlSelect, Control, ControlRadio } from "../models/control.model";
import { DataProxyService } from "../services/data-proxy.service";
import { SessionStorageService } from "../services/tdd/session-storage.service";
import {
  CORRECTION_AMOUNT_LINEX,
  LINEX_CONTROLS,
  UNRECOGNIZED_PURCHASE_CONTROLS,
} from "./controls";
import * as _ from "lodash";

@Injectable({
  providedIn: "root",
})
export class QuestionnarieBuilder {
  proxyService = inject(DataProxyService);
  storage = inject(SessionStorageService);

  /**
   * @description Construct a new Questionnarie with the given parameters
   * @param options to customize the controls at execution time
   * @returns
   */
  public getFinalControls(
    options: Partial<Control<any>>[],
    option: FormOptions
  ): any[] {
    // the default controls
    let controls = [];

    switch (option) {
      case FormOptions.LINEX:
        controls = _.cloneDeep(LINEX_CONTROLS);
        controls = [...controls, ...this.getPlaceControls()];
        break;
      case FormOptions.COMISSION:
        controls = _.cloneDeep(UNRECOGNIZED_PURCHASE_CONTROLS);
        controls = [...controls, ...this.getPlaceControls()];
        break;

      case FormOptions.COMISSION_0805:
      case FormOptions.COMISSION_0836:
        const label =
          option === FormOptions.COMISSION_0805
            ? "¿Deseas mantener esta cuenta?"
            : "¿Solicitaste una reposición de tu tarjeta?";

        controls = _.cloneDeep(UNRECOGNIZED_PURCHASE_CONTROLS);
        controls = [
          new ControlRadio().create({
            label,
            name: "keepAccount",
            tag: "radio",
            controlGroup: [
              {
                id: "keep",
                value: "1",
                label: "Sí",
                data: "SI",
              },
              {
                id: "no_keep",
                value: "0",
                label: "No",
                data: "NO",
              },
            ],
            childControls: [
              {
                controlName: "description",
                onValidControl: true,
              },
            ],
            validators: [Validators.required],
          }),
          ...controls,
          ...this.getPlaceControls(),
        ];
        controls[1].show = false;
        break;

      case FormOptions.PAY_MSI_205:
      case FormOptions.PAY_MSI_209:
      case FormOptions.CORRECTION_PROMOTION:
        controls = [...this.getPlaceControls()];
        controls[0].show = true;
        break;
      case FormOptions.CORRECTION:
        controls = _.cloneDeep(CORRECTION_AMOUNT_LINEX);
        controls = [...controls, ...this.getPlaceControls()];
        break;
      case FormOptions.CORRECTION_PROMOTION:
        controls = [...this.getPlaceControls()];
        break;
      default:
        break;
    }
    this.updateQuestionnarie(options, controls);
    return controls;
  }

  /**
   * @description Update every control in the controls param, taking the new value from options
   * @param options - A list with partial Control value
   * @param controls - The complete list of native controls
   */
  public updateQuestionnarie(
    options: Partial<Control<any>>[],
    controls: any[]
  ): void {
    // update controls if options array has values
    options.forEach((option) => {
      const index = controls.findIndex((ctrl) => ctrl.name === option.name);
      controls[index].update({ ...option });
    });
  }

  /**
   * @returns Reusable place and state(filled with states) controls
   */
  public getPlaceControls(): any[] {
    let states: Options[] = [];
    const localStates = this.storage.getFromLocal("states") as any[];
    const toMap = Boolean(localStates?.length)
      ? localStates
      : this.proxyService.getStates();

    states = toMap
    .filter(state => state.clave !== 33)
    .map((state) => ({
      id: state.clave,
      value: state.nombre,
      completeOption: state,
    }));

    return [
      new ControlRadio().create({
        label: "¿Dónde te encuentras en este momento?",
        name: "place",
        tag: "radio",
        showAtQuestionnarie: false,
        controlGroup: [
          {
            label: "En México",
            id: "mx",
            value: "mx",
          },
          {
            label: "En el extranjero",
            id: "ext",
            value: "ext",
          },
        ],
        validators: [Validators.required],
        show: false,
        childControls: [
          {
            controlName: "state",
            expectedValue: "mx",
          },
        ],
      }),
      new ControlSelect().create({
        label: "Selecciona la entidad federativa donde te encuentras:",
        name: "state",
        tag: "select",
        showAtQuestionnarie: false,
        placeholder: "Elige una entidad",
        show: false,
        validators: [Validators.required],
        options: states,
      }),
    ];
  }
}
