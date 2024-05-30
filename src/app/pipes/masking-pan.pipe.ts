import { Pipe, PipeTransform } from '@angular/core';
/**
 *hide the info of the card and return only the last digits
 *
 * @export
 * @class MaskingPan
 * @implements {PipeTransform}
 */
@Pipe({name: 'maskingPan'})
export class MaskingPan implements PipeTransform {
  transform(value: string, end = false): string {
    let newstr = '';
    newstr = value.replace(' ', '');
    newstr = newstr.replace('/', '');
    newstr = newstr.replace('-', '');

    if (end) {
      return `*${newstr.substring(newstr.length -4, newstr.length)}`
    }

    newstr =  newstr.substring(0,4).
              concat('**').
              concat(newstr.substring(newstr.length -4, newstr.length));
    return newstr;
  }
}
