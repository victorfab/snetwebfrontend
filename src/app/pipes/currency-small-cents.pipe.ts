import { Pipe, PipeTransform } from '@angular/core';
/**
 *pipe that transforms to CurrencySmallCentsModel
 *
 * @export
 * @class CurrencySmallCentsModel
 * @implements {PipeTransform}
 */
@Pipe({name: 'smallCents'})
export class CurrencySmallCentsPipe implements PipeTransform {
  transform(value: number): string {
    let p = value.toFixed(2).split('.');
    let chars = p[0].split('').reverse();
    let newstr = '';
    let count = 0;
    for (let x of chars) {
        count++;
        if ((count %3) === 1 && count !== 1) {
            newstr = `${x},${newstr}`;
        } else {
            newstr = x + newstr;
        }
    }
    newstr = `$ ${newstr}`;
    let cents: string = p[1].toString();
    return newstr.concat(`.<i class="cents">${cents}</i>`);
  }
}
