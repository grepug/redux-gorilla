export class Pagination {
  current = 1;
  total = 0;
  hasNoMore = false;
  totalCount = 0;
}

export class QueryTuple<Response> {
  data: Response | null = null;
  loading = false;
  error = false;
}

export interface QueryState<Response, QueryParams> {
  res: Record<string, QueryTuple<Response>>;
  params: QueryParams;
}

export class MutationTuple<Response> {
  success = false;
  loading = false;
  message: string | null = null;
  errMsg: string | null = null;
  data: Response | null = null;
}

export interface MutationState<Response, DataTransferObject> {
  res: MutationTuple<Response>;
  dto: DataTransferObject;
}

export enum RequestStatus {
  SUCESS = 'success',
  ERROR = 'error',
  LOADING = 'loading',
}

export type Action = {
  type: string;
  payload?: any;
  page?: Pagination;
  queryParams?: any;
  mutationParams?: any;
  dto?: any;
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

  INIT_MUTATION = 'initMutation',
  MUTATION = 'mutation',
  SET_DTO = 'setDTO',
}

export class InitialState<Response, Params> {
  query: Partial<Record<string, QueryState<Response, Params>>> = {};
  mutations: Partial<Record<string, MutationState<Response, Params>>> = {};
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

export interface CreateMutationHookOptions<DataTransferObject> {
  dto?: DataTransferObject;
  onMutated?: () => void;
}

export type HttpRequestMethod<Response> = (
  url: string,
  method: Method,
  config: {
    body?: any;
    query?: any;
  },
) => Promise<Response>;

export enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}
