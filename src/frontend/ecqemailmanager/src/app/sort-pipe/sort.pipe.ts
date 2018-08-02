import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort',
  pure: false
})
export class SortPipe implements PipeTransform {

  private transformTerm = (term: string) => term.toLowerCase().replace(/\s/g, '');

  private getChainedProp(obj: any, key: string) {

    if (key.indexOf('.') === -1) return obj[key];

    let [currentLevelKey, ...nextLevelKeys] = key.split('.');

    return this.getChainedProp(obj[currentLevelKey], nextLevelKeys.join('.'))

  }

  transform(items: any[], ...keys: string[]): any {
    if (!items) return items;
    return items
      .map(i => ({
        original: i,
        sortKey: ''
      }))
      .map(i => {
        if (keys.length)
          i.sortKey = keys.map(key => this.transformTerm(this.getChainedProp(i.original, key))).join('~');
        else
          i.sortKey = this.transformTerm(i.original);
        return i;
      })
      .sort((a, b) => {
        return a.sortKey < b.sortKey ? -1 : a.sortKey === b.sortKey ? 0 : 1;
      })
      .map(i => i.original);
  }

}
