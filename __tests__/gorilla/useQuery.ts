import { createQueryHook } from '../../src/lib/createQueryHook';
import * as _ from 'lodash';
import { CreateQueryHookOptions, GetDataType } from '../../src/lib/types';
import { getRequestData } from '../mock/db';

export type QueryOptions<Response, QueryParams> = Omit<
  CreateQueryHookOptions<Response, QueryParams>,
  'page'
> & { page?: { pageSize: number } | boolean };

export const useQuery = <Response, Selected, QueryParams>(
  key: string,
  getData: GetDataType<Response, Selected>,
  options: QueryOptions<Response, QueryParams>,
) => {
  return createQueryHook<Response, Selected, QueryParams>(
    key,
    getData,
    options,
    async (url, _, { query }) => {
      const data: any = getRequestData(url as any, query);

      await new Promise(resolve => setTimeout(resolve, 200));

      return data as Response;
    },
  );
};

export const useSimpleQuery = <Response, Params>(
  url: string,
  queryParams: Params,
  options: QueryOptions<Response, Partial<Params>> = {},
) => {
  return useQuery<Response, Response, Params>(url, state => state, {
    isRequestOnMount: true,
    ...options,
    queryParams,
  });
};

export const useSimplePageQuery = <Response, Params>(
  url: string,
  queryParams: Partial<Params>,
  options: QueryOptions<Response, Partial<Params>> = {},
) => {
  return useSimpleQuery<Response, Params>(
    url,
    Object.assign(
      {
        page: 1,
        page_size: 20,
      },
      queryParams,
    ) as any,
    options,
  );
};
