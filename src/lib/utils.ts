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
