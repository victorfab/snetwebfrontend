import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filter",
})
export class FilterPipe implements PipeTransform {
  transform(list: any[], query: string): any[] {
    if (!query) {
      return list;
    }

    let filterMoves = JSON.parse(JSON.stringify(list));
    filterMoves.forEach((item) => {
      item.value = item.value.filter(
        (item) =>
          item.txrComercio.toLowerCase().indexOf(query.toLowerCase()) > -1
      );
    });

    if (filterMoves.length > 0) {
      filterMoves = filterMoves.filter((item) => item.value.length > 0);
    }

    return filterMoves;
  }
}
