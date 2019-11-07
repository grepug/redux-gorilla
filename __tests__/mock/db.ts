import { omitBy, find } from '../utils';

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
      // {
      //   id: 3,
      //   name: 'AirPods',
      // },
    ],
  };

  const findObj = omitBy(query, (_, k: any) => k[0] === '_');
  const res = find(obj[path], findObj);

  return res;
};
