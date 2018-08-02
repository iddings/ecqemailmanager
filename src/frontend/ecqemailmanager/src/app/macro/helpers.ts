export const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));


export const ordinal = (i: number) => {
  let onesPlace = i - Math.floor(i/10) * 10;
  switch (true) {
    case i === 1: return 'st';
    case i === 2: return 'nd';
    case i === 3: return 'rd';
    case (i >= 4 && i<= 20) || onesPlace >= 4: return 'th';
    case onesPlace === 1: return 'st';
    case onesPlace === 2: return 'nd';
    case onesPlace === 3: return 'rd';
    default: return '??';
  }
};


export const prettyJoin = (items: any[]): string =>
  items.map((v, i, a) =>
    `${v}${i < a.length - 1 && a.length !== 2 ? ', ' : a.length === 2 ? ' ' : ''}${i == a.length - 2 ? 'and ' : ''}`
  ).join('');


export const ALL = '*';

export const splitCronField = (value: string): string|number[] =>
  (
    value === ALL ? ALL :
      (value || '').split(',').map(v => parseInt(v))
  );


export const combineCronField = (value: number[]) => value.join(',');


export const booleanToNumeric = (value: boolean[])  =>
  value.map((b,i) => ({index: i, value: b}))
    .filter(o => o.value)
    .map(o => o.index);


export const numericToBoolean = (value: number[], options: any[]) =>
  options
    .map((_,i) => value.indexOf(i) !== -1);


export const range = (start: number, end: number): number[] => {
  let out = [];
  for (let i=start;i<=end;i++)
    out.push(i);
  return out;
};
