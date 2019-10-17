export class Pagination {
  current = 1;
  total = 0;
  hasNoMore = false;
  totalCount = 0;
}

export class QueryTuple<Response> {
  data: Response | Response[] | null = null;
  loading = false;
  error = false;
  page = new Pagination();
}

export interface QueryState<Response, QueryParams> {
  res: Record<string, QueryTuple<Response>>;
  params: QueryParams;
}

export enum QueryStatus {
  SUCESS = 'success',
  ERROR = 'error',
  LOADING = 'loading',
}

export type Action = {
  type: string;
  payload?: any;
  page?: Pagination;
  queryParams?: any;
};

export interface InitialStateType<Response> {
  query: Record<string, QueryTuple<Response>>;
  mutations?: Record<string, any>;
}

export enum ActionDataType {
  QUERY = 'query',
  FETCH_NEXT = 'fetchNext',
  CHANGE_CURRENT_PAGE = 'changeCurrentPage',
  INIT = 'initialize',
  INIT_RES = 'initializeRes',
  SET_QUERY_PARAMS = 'setQueryParams',
}

export class InitialState<Response, QueryParams> {
  query: Partial<Record<string, QueryState<Response, QueryParams>>> = {};
}

export interface PageParamNames {
  current: string;
  pageSize: string;
}

export interface OptionsPage {
  responseParamPath: {
    total: string;
    current: string;
    totalCount: string;
    size?: string;
  };
  queryParamNames: PageParamNames;
  pageSize?: number;
}

export enum CacheStrategyType {
  CACHE_AND_FETCH,
  CACHE_FIRST,
  ALWAYS_FETCH,
}

export interface QueryKeyObj {
  url: string;
  params: any;
}

export type GetDataType<T, T1> = (
  data: T | null,
  page: Pagination | null,
) => T1 | null;

export interface CreateQueryHookOptions<T> {
  page?: OptionsPage | true;
  queryParams?: T;
  cacheStrategy?: CacheStrategyType;
  poll?: number;
  isRequestOnMount?: boolean;
}

export type HttpRequestMethod<Response> = (
  url: string,
  method: string,
) => Promise<Response>;
