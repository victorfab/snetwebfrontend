import { Pipe, PipeTransform } from "@angular/core";
import { MoveItem } from "../interfaces/move-item.interface";

@Pipe({
  name: "moveListFilter",
})
export class MoveListFilterPipe implements PipeTransform {
  transform(
    input: Map<string, MoveItem<any>[]>,
    query = ""
  ): Map<string, MoveItem<any>[]> {
    if (!query) {
      return input;
    }
    const map: Map<string, MoveItem<any>[]> = new Map();
    for (const [key, value] of input) {
      const filtered = value.filter(
        (move) =>
          move.description.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      );
      if (filtered.length) {
        map.set(key, filtered);
      }
    }
    return map;
  }
}
