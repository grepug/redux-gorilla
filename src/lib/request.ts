import { queryToString } from './utils';
import { HttpRequestMethod, Method } from './types';

export const request = async <Response>(
  httpRequest: HttpRequestMethod<Response>,
  args: {
    beforeRequest: () => void;
    onResponse: (res: Response) => any;
    onError: (e: any) => void;
    url: string;
    method: Method;
    query?: any;
    body?: any;
  },
) => {
  try {
    args.beforeRequest();
    const queryString = queryToString(args.query);
    const url = args.url + (/\?/.test(args.url) ? '' : '?') + queryString;
    const res: Response = await httpRequest(url, args.method, {
      query: args.query,
      body: args.body,
    });
    args.onResponse(res);
  } catch (e) {
    console.trace('e', e, args.url);
    debugger;
    args.onError(e);
  }
};
