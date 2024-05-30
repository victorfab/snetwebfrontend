import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
/**
 *transforms the date to custom format
 *
 * @export
 * @class FormatSmDate
 * @implements {PipeTransform}
 */
@Pipe({name: 'formatSwDate'})
export class FormatSwDatePipe implements PipeTransform {
  public transform(value: Date): string {
    let s=  moment(value).format('DD MMMM, YYYY').toString();

    let p = s.toUpperCase();

    return p;
  }
}

