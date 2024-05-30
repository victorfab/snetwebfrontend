import { Validators } from "@angular/forms";
import {
  Control,
  ControlRadio,
  ControlSelect,
  ControlTexArea,
} from "../models/control.model";
import { invalidDefault } from "./validators";
import { CustomCurrencyPlain } from "../pipes";

export const LINEX_CONTROLS = [
  new ControlRadio().create({
    label: "¿Cuánto quieres pagar?",
    name: "pay",
    tag: "radio",
    controlGroup: [],
    validators: [Validators.required],
    show: true,
    childControls: [
      {
        controlName: "amount",
        expectedValue: "1",
      },
      {
        controlName: "alreadyPay",
        expectedValue: "0",
        updateWith: (value) => {
          const format = new CustomCurrencyPlain();
          // return { label: `¿Ya pagaste los $${format.transform(value)}?` };
          return { label: `¿Ya pagaste los $00,000.00?` };
        },
      },
    ],
  }),
  new Control().create({
    label: "Ingresa el monto que quieres pagar",
    name: "amount",
    tag: "input",
    type: "formated",
    validators: [Validators.required, invalidDefault()],
    show: false,
    detectChangesOnBlur: true,
    childControls: [
      {
        controlName: "payApplication",
        onValidControl: true,
      },
      {
        controlName: "alreadyPay",
        updateWith: (value) => {
          const format = new CustomCurrencyPlain();
          return { label: `¿Ya pagaste los $${format.transform(value)}?` };
        },
      },
    ],
  }),
  new ControlRadio().create({
    label: "¿Cómo quieres que se aplique tu pago?",
    name: "payApplication",
    tag: "radio",
    controlGroup: [
      {
        label: "Aplicar a cuota",
        id: "quota",
        value: "0",
        message:
          "Tus próximos pagos serán menores y seguirás pagando el mismo número de mensualidades.",
      },
      {
        label: "Aplicar a plazo",
        id: "term",
        value: "1",
        message:
          "Tus próximos pagos serán menores y seguirás pagando el mismo número de mensualidades.",
      },
    ],
    show: false,
    childControls: [
      {
        controlName: "alreadyPay",
        onValidControl: true,
      },
    ],
    validators: [Validators.required],
  }),
  new ControlRadio().create({
    label: "¿Ya pagaste los ${exp} MXN?",
    name: "alreadyPay",
    tag: "radio",
    controlGroup: [
      {
        label: "Si",
        id: "si",
        value: "1",
        message: "Tendrás que seleccionar el depósito en el siguiente paso.",
      },
      {
        label: "No",
        id: "no",
        value: "0",
        message: "Recuerda pagar al terminar.",
      },
    ],
    validators: [Validators.required],
    show: false,
    childControls: [
      {
        controlName: "place",
        onValidControl: true,
      },
    ],
  }),
];

export const CORRECTION_CONTROLS = [
  new ControlRadio().create({
    label: "¿Dónde te encuentras en este momento?",
    name: "place",
    tag: "radio",
    controlGroup: [
      {
        id: "mx",
        label: "En México",
        value: "mx",
      },
      {
        id: "ext",
        label: "En el extranjero",
        value: "ext",
      },
    ],
    childControls: [
      {
        controlName: "entity",
        expectedValue: "mx",
      },
    ],
    validators: [Validators.required],
  }),
  new ControlSelect().create({
    label: "Selecciona la entidad federativa donde te encuentras:",
    tag: "select",
    placeholder: "Selecciona",
    name: "entity",
    options: [],
    show: false,
    validators: [Validators.required],
  }),
];

export const UNRECOGNIZED_PURCHASE_CONTROLS = [
  new ControlTexArea().create({
    label:
      "Dinos, ¿Por qué no estás de acuerdo con {la comisión|el cobro del seguro}?",
    name: "description",
    tag: "textarea",
    message: "1 de 240 caracteres",
    validators: [Validators.required, Validators.minLength(5), Validators.maxLength(240)],
    detectChangesOnBlur: true,
    childControls: [
      {
        controlName: "place",
        onValidControl: true,
      },
    ],
    shortLabel: 'Descripción'
  }),
];

export const CORRECTION_AMOUNT_LINEX = [
  new ControlRadio().create({
    label: "¿Cuál es el motivo de tu aclaración?",
    tag: "radio",
    detectChanges: true,
    name: "motive",
    validators: [Validators.required],
    controlGroup: [
      {
        id: "cancell",
        label: "Lo contraté por error, quiero cancelarlo",
        value: "cancell",
      },
      {
        id: "incorrect_amount",
        label: "El monto del crédito no es el acordado",
        value: "incorrect_amount",
      },
    ],
    childControls: [
      {
        controlName: 'amount',
        expectedValue: 'incorrect_amount'
      },
      {
        controlName: 'place',
        expectedValue: 'cancell'
      }
    ]
  }),
  new Control().create({
    label: "Ingresa el monto que esperabas recibir",
    name: "amount",
    tag: "input",
    type: "formated",
    validators: [Validators.required, invalidDefault()],
    show: false,
    detectChangesOnBlur: true,
    childControls: [
      {
        controlName: "place",
        onValidControl: true,
      },
    ],
  }),
];
