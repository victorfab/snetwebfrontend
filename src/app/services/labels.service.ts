import { Injectable } from '@angular/core';
import * as _ from 'lodash';

/**
 * Labels used in components as a constants
 *
 * @class LabelsService
 */
@Injectable()
export class LabelsService {
    public success: string;
    public congrats: string;
    public description: string[];
    public restrictions: string[];
    public warning: string;
    public cardNumber: string;
    public oldCardTitle: string;
    public newCardTitle: string;
    public amountPaid: string;
    public amountAclaration: string;

    constructor() {
        this.success = 'Su solicitud fue recibida';
        this.congrats = '¡Gracias por la espera,';
        this.description = [
            'Hemos dado de alta su<br/>aclaración',
            'Hemos realizado un abono<br/>temporal a su tarjeta',
            'Por seguridad hemos<br/>bloqueado la tarjeta',
        ];
        this.restrictions = [
            'Carta firmada que contenga el detalle de lo sucedido.',
            'Comprobante de compra con el importe correcto de la transacción realizada.',
            'Comprobante de compra con el importe del (los) cargo(s) que sí reconoce.',
            'Comprobante que demuestre el pago al comercio.',
            'Comprobante de devolución emitido por el comercio.',
            'Copia de su identificación oficial (por ambos lados).',
            'Copia de su CURP.',
            'Formato BCOM-488 que enviaremos al correo que tenemos registrado.',
            'Copia del comprobante con la fecha de entrega comprometida por el comercio.',
            'Comprobante o folio de cancelación.',
        ];
        this.warning = 'Esta información deberá enviarla en máximo 5 días naturales, colocando en el asunto del correo el número de folio que le proporcionamos a continuación.';
        this.cardNumber = 'Número de tarjeta'
        this.oldCardTitle = 'Número de tarjeta bloqueada';
        this.newCardTitle = 'Nuevo número de tarjeta';
        this.amountPaid = 'Monto abonado';
        this.amountAclaration = 'Monto de la aclaración';
    }

    /**
     * Get the success string
     *
     * @returns {string}
     */
    public getSuccess(): string {
        return this.success;
    }

    /**
     * Get the congrats concatenated with the name
     *
     * @param name {string}
     * @returns {string}
     */
    public getCongrats(name: string): string {
        return `${this.congrats} ${name}!`;
    }

    /**
     * Get the description if exists
     *
     * @param index {number}
     * @returns {string}
     */
    public getDescription(index: number): string {
        return (!_.isUndefined(this.description[index])) ? this.description[index] : '' ;
    }

    /**
     * Get the restriction if exists
     *
     * @param index {number}
     * @returns {string}
     */
    public getRestrictions(index: number): string {
        return (!_.isUndefined(this.restrictions[index])) ? this.restrictions[index] : '' ;
    }

    /**
     * Get the warning string
     *
     * @returns {string}
     */
    public getWarning(): string {
        return this.warning;
    }

    /**
     * Get card number string
     *
     * @returns {string}
     */
    public getCardNumber(): string{
        return this.cardNumber;
    }

    /**
     * Get old card title string
     *
     * @returns {string}
     */
    public getOldCardTitle(): string {
        return this.oldCardTitle;
    }

    /**
     * Get the new card title string
     *
     * @returns {string}
     */
    public getNewCardTitle(): string {
        return this.newCardTitle;
    }

    /**
     * Get the amount paid tring
     *
     * @returns {string}
     */
    public getAmountPaid(): string {
        return this.amountPaid;
    }

    /**
     * Get the amount of the aclaration string
     *
     * @returns {string}
     */
    public getAmountAclaration(): string {
        return this.amountAclaration;
    }
}
