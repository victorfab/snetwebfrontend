import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
/**
 *transforms the date to custom format
 *
 * @export
 * @class FormatSmDate
 * @implements {PipeTransform}
 */
@Pipe({name: 'formatSmDate'})
export class FormatSmDatePipe
 implements PipeTransform {
  public transform(value: Date): string {
    let s=  moment(value).format('dddd DD [de] _MMMM, YYYY').toString();
    let p = s.split('_');
    p[0]= p[0].charAt(0).toUpperCase() + p[0].slice(1);
    p[1]= p[1].charAt(0).toUpperCase() + p[1].slice(1);

    return `${ p[0] + p[1] } `;
  }
}

