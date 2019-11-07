import { Action } from './types';
import { Dispatch } from 'redux';
import { ACTION_TYPE_SEPARATOR } from './constants';

export const queryToString = (obj: any) => {
  return obj
    ? Object.keys(obj)
        .reduce((acc, el) => {
          return `${acc}&${el}=${obj[el]}`;
        }, '')
        .slice(1)
    : '';
};

export const isPartialEqual = (obj: any, originalObj: any) => {
  return Object.keys(obj).every((el: any) => obj[el] === originalObj[el]);
};

// export const getOfflineCache = () => {
//   const dataStr = localStorage.getItem('offlineCache');
//   return dataStr ? repairOfflineCache(JSON.parse(dataStr)) : null;
// };

// const repairOfflineCache = <Response>(state: {
//   query: Record<string, QueryTuple<Response>>;
// }) => {
//   let query: Record<string, QueryTuple<Response>> = {};
//   Object.keys(state.query).forEach(name => {
//     const { loading, error, data } = state.query[name];
//     if (loading || error || (Array.isArray(data) && data.length > 1)) {
//       query[name] = new QueryTuple();
//     }
//   });

//   if (!Object.keys(query).length) {
//     return state;
//   }

//   return update(state, {
//     query: {
//       $merge: query,
//     },
//   });
// };

export const debounce = (func: (...args: any[]) => any, delay: number) => {
  let inDebounce: null | number = null;
  return (...args: any[]) => {
    inDebounce && clearTimeout(inDebounce);
    inDebounce = setTimeout(() => func(...args), delay);
  };
};

export const myDispatch = (dipsatch: Dispatch<Action>) => (
  typeArr: any[],
  args: any = {},
) => {
  return dipsatch({
    type: typeArr.join(ACTION_TYPE_SEPARATOR),
    ...args,
  });
};

export const getQueryKey = (url: string, params: any) => {
  return `${url}?${queryToString(params)}`;
};

export const keys = <T>(obj: T): (keyof T)[] => Object.keys(obj) as (keyof T)[];

export const omitBy = <T>(
  obj: T,
  func: (val: T[keyof T], key: keyof T) => boolean,
): Partial<T> => pick(obj, keys(obj).filter(k => !func(obj[k], k)));

export const pickBy = <T>(
  obj: T,
  func: (val: T[keyof T], key: keyof T) => boolean,
) => pick(obj, keys(obj).filter(k => func(obj[k], k)));

export const pick = <T extends Object>(
  obj: T,
  arr: (keyof T)[],
): Partial<T> => {
  let newObj: Partial<T> = {};
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      if (arr.includes(k)) {
        newObj[k] = obj[k];
      }
    }
  }
  return newObj;
};

export const find = <T>(arr: T[], props: Partial<T>): T[] =>
  arr.filter(el => partialEqual(el, props));

export const partialEqual = <T>(obj: Partial<T>, obj2: Partial<T>) => {
  const objKeys = keys(obj);
  const obj2Keys = keys(obj2);
  const longerObj = objKeys.length >= obj2Keys.length ? obj : obj2;
  const shorterObj = objKeys.length < obj2Keys.length ? obj : obj2;

  for (const k in shorterObj) {
    if (shorterObj.hasOwnProperty(k)) {
      if (shorterObj[k] !== longerObj[k]) return false;
    }
  }
  return true;
};

export const getSkip = (page: number, pageSize: number) =>
  (page - 1) * pageSize;
