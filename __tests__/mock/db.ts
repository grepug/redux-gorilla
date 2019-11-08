import { omitBy, find, getSkip } from '../../src/lib/utils';

interface RequestData {
  list: {
    id: number;
    name: string;
  }[];
}

export const getRequestData = (path: keyof RequestData, query: any) => {
  const obj: RequestData = {
    list: [
      {
        id: 1,
        name: 'iPhone',
      },
      {
        id: 2,
        name: 'iPad',
      },
      {
        id: 3,
        name: 'AirPods',
      },
      {
        id: 4,
        name: 'MacBook',
      },
      {
        id: 5,
        name: 'Apple Watch',
      },
    ],
  };

  let resObj = obj[path];

  // _page, _pageSize
  const { _page, _pageSize } = query;

  if (_page && _pageSize) {
    const skip = getSkip(_page, _pageSize);
    resObj = resObj.filter((_, i) => i >= skip && i < skip + _pageSize);
  }

  const findObj = omitBy(query, (_, k: any) => k[0] === '_');

  const res = find(resObj, findObj);

  return res;
};
