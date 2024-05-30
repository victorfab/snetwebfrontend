/**
 * @author ljmeza@santander.com.mx
 * MOdified by magutierrezco
 * @description
 *  Creating a Custom Debounce Click Directive in Angular
 *  https://coryrylan.com/blog/creating-a-custom-debounce-click-directive-in-angular
 */
import { Directive, EventEmitter, HostListener, 
    Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * clase que previene la ejecucion de un doble click en algun elemento
 * Implementacion como directiva
 * 
 *
 * @export
 * @class DebounceClickDirective
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Directive({
  selector: '[appDebounceClick]'
})
export class DebounceClickDirective implements OnInit, OnDestroy {
    /**tiempo de delay para dar click */
    @Input() private debounceTime = 500;
    /**emmiter para detener el doble click */
    @Output() private debounceClick = new EventEmitter();
    /** contador de clicks*/
    private clicks = new Subject();
    /**subscriber para cachar el click */
    private subscription: Subscription;

    /**
     * Creates an instance of DebounceClickDirective.
     * @memberof DebounceClickDirective
     */
    constructor() {}

    /**
     * Loads initial content.
     * cuando se inicializa el componente se subscribe al pipe 
     * chachando el emitter del evento
     *
     * @memberof DebounceClickDirective
     */
    public ngOnInit() {
        this.subscription = this.clicks.pipe(
            debounceTime(this.debounceTime)
        ).subscribe((e) => this.debounceClick.emit(e));
    }

    /**
     * Method that is called when welcome component is destroyed.
     * cuando se destruye el componente que implementa la directiva 
     * ejecuta el metodo unsuscribe
     *
     * @memberof DebounceClickDirective
     */
    public ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    /**
     * Click event
     * previene el doble click en el componente que implemente la directiva
     *
     * @param {*} event
     * @memberof DebounceClickDirective
     */
    @HostListener('click', ['$event'])
    public clickEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        this.clicks.next(event);
    }
}
