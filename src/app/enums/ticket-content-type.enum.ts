/**
 * @description To set what kind of body should the ticket show
 * @see ResultComponent
 */
export enum TicketContentType {
    NORMAL_COMISSION = 'normal_comision',
    DEFER_PURCHASE = 'diferir_compra',
    AMOUNT_CORRECTION_LINEX = 'correccion_monto_line',
    CANCEL_LINEX = 'cancelar_linex',
    PROMOTION_CORRECTION = 'correccion_promocion',
    AMORTIZATION = 'amortizacion_cancelacion_linex',
    PREFOLIO = 'prefolio'
}
