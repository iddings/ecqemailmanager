import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  private transformTerm = (term: string) => term.toLowerCase().replace(/\s/g, '');

  private getChainedProp(obj: any, key: string) {

    if (key.indexOf('.') === -1) return obj[key];

    let [currentLevelKey, ...nextLevelKeys] = key.split('.');

    return this.getChainedProp(obj[currentLevelKey], nextLevelKeys.join('.'))

  }

  transform(items: Iterable<any>, query: string, ...keys: string[]): any {
    if (!items) return items;
    query = this.transformTerm(query);
    let arrayItems = Array.from(items);
    let booleanSlice = arrayItems
      .map(i => {
        if (keys.length)
          return keys.map(key => this.transformTerm(this.getChainedProp(i, key))).join('~');
        return this.transformTerm(i);
      })
      .map(i => i.indexOf(query) !== -1);
    return arrayItems.filter((_,i) => booleanSlice[i]);
  }

}
