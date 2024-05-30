import { Pipe, PipeTransform } from '@angular/core';
/**
 *custom currency with cents
 *
 * @export
 * @class CustomCurrency
 * @implements {PipeTransform}
 */
@Pipe({name: 'customCurrency'})
export class CustomCurrencyPipe implements PipeTransform {
  public transform(value: number | string, avoidCentClass = false, concatDollar = false): string {
    let p = null;
    if (typeof value === 'string') {
      p = Number(value).toFixed(2).split('.')
    } else if (typeof value === 'number') {
      p = value.toFixed(2).split('.');
    }
    
    let chars = p[0].split('').reverse();
    let newstr = '';
    let count = 0;
    for (let x of chars) {
        count++;
        if(count%3 === 1 && count !== 1 && chars[count - 1] !== '-') {
            newstr = `${x},${newstr}`;
        } else {
            newstr = x + newstr;
        }
    }
    let cents: string = p[1].toString();
    newstr = newstr.concat(`.${ cents }<i class="coin">&nbsp;MXN</i>`);
    if (concatDollar) {
      return `$ ${newstr}`;
    }
    return newstr;
  }
}
/**
 * custom currency with MXN
 *
 * @export
 * @class CustomCurrencyPlain
 * @implements {PipeTransform}
 */
@Pipe({name: 'customCurrencyPlain'})
export class CustomCurrencyPlain implements PipeTransform {
  public transform(value: number): string {
    let p = value.toFixed(2).split('.');
    let chars = p[0].split('').reverse();
    let newstr = '';
    let count = 0;
    for (let x of chars) {
        count++;
        if(count%3 === 1 && count !== 1) {
            newstr = `${x},${newstr}`;
        } else {
            newstr = x + newstr;
        }
    }
    let cents: string = p[1].toString();

    return newstr.concat(`.${ cents } MXN`);
  }
}
/**
 *transforms the date to custom format
 *
 * @export
 * @class CustomMovesDate
 * @implements {PipeTransform}
 */
@Pipe({name: 'customMovesDate'})
export class CustomMovesDate implements PipeTransform {
  public transform(value: string): string {
    let p = value.split('_');
    p[0]= p[0].charAt(0).toUpperCase() + p[0].slice(1);
    p[1]= p[1].charAt(0).toUpperCase() + p[1].slice(1);

    return `${ p[0] + p[1] } `;
  }
}

