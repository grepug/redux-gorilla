import {
  InitialState,
  GetDataType,
  CreateQueryHookOptions,
  ActionDataType,
  QueryTuple,
  Pagination,
  HttpRequestMethod,
  Method,
} from './types';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { useEffect, useCallback, useMemo } from 'react';
import { useRequest } from './useRequest';
import { useInterval } from './useInterval';
import { usePrevious } from './usePrevious';
import { myDispatch, getQueryKey, isPartialEqual } from './utils';
import get from 'lodash.get';

export const createQueryHook = <Response, Selected, QueryParams>(
  url: string,
  getData: GetDataType<Response, Selected>,
  options: CreateQueryHookOptions<QueryParams>,
  httpRequest: HttpRequestMethod<Response>,
) => {
  type ReduxInitialState = {
    gorilla: InitialState<Response, QueryParams>;
  };

  const dispatch = myDispatch(useDispatch());
  const { isRequestOnMount } = options;

  const getState = (state: ReduxInitialState) => {
    return state.gorilla.query[url];
  };

  const queryState = useSelector<
    ReduxInitialState,
    ReturnType<typeof getState>
  >(getState, shallowEqual);

  const queryParams = queryState ? queryState.params : options.queryParams;
  const key = getQueryKey(url, queryParams);
  const queryParamString = key.split('?')[1];

  useEffect(() => {
    if (queryState == null) {
      dispatch([key, ActionDataType.INIT], {
        queryParams,
      });
    } else if (!queryState.res[queryParamString]) {
      dispatch([key, ActionDataType.INIT_RES], {
        queryParams,
      });
    }
  }, [!!queryState, queryParams, queryParamString]);

  const { request } = useRequest(
    httpRequest,
    {
      key,
      url,
      actionDataType: ActionDataType.QUERY,
      query: queryParams,
      method: Method.GET,
      canRequest: !!queryState && !!queryState.res[queryParamString],
    },
    [queryState, queryParamString],
  );

  // poll
  useInterval(() => request(), {
    delay: options.poll || null,
  });

  // offline cache
  // useOfflineCache({
  //   key,
  //   cacheStrategy,
  //   onSaveCache: state =>
  //     localStorage.setItem('offlineCache', JSON.stringify(state)),
  // });

  const queryParamKeyLength = Object.keys(get(queryState, 'res', {})).length;

  const prevQueryParam = usePrevious(queryParams);

  const prevQueryParamKeyLength = usePrevious(queryParamKeyLength);

  const prevQueryParamString = usePrevious(queryParamString);

  useEffect(() => {
    if (queryState && queryState.res[queryParamString]) {
      // const isUseOfflineCache =
      //   cacheStrategy === CacheStrategyType.CACHE_FIRST &&
      //   !!queryState.res[queryParamString].data;
      const isLoading = queryState.res[queryParamString].loading;
      const isQueryParamKeyLengthEqual =
        prevQueryParamKeyLength === queryParamKeyLength;

      // 新增 queryParam key 时请求，通过 `setParam()` 方法触发；
      const isKeysChangeRequest =
        prevQueryParamKeyLength && !isQueryParamKeyLengthEqual;

      // 当切换已请求过的 params 时，再次请求
      const isRefetch_ =
        isQueryParamKeyLengthEqual && prevQueryParamString !== queryParamString;

      if (
        !isLoading &&
        (isRequestOnMount || isKeysChangeRequest || isRefetch_)
      ) {
        // const isRefetch = cacheStrategy === CacheStrategyType.CACHE_AND_FETCH;
        request();
      }
    }
  }, [key, !!queryState, queryParamString, queryParamKeyLength]);

  const setParams = useCallback(
    (
      queryParams: Partial<QueryParams>,
      opts: { forceUpdate?: boolean } = {},
    ) => {
      if (
        opts.forceUpdate &&
        queryParamString &&
        isPartialEqual(queryParams, prevQueryParam)
      ) {
        return request();
      }
      dispatch([key, ActionDataType.SET_QUERY_PARAMS], {
        isForceUpdate: !!opts.forceUpdate,
        queryParams,
      });
    },
    [dispatch],
  );

  const res: QueryTuple<Response> = useMemo(
    () => get(queryState, `res.${queryParamString}`, new QueryTuple()),
    [queryState, queryParamString],
  );

  const params = useMemo(
    () => (queryState ? queryState.params : ({} as QueryParams)),
    [queryState],
  );

  const data = useMemo(() => {
    const { data, page } = get(queryState, `res.${queryParamString}`, {});
    return getData(
      (data || null) as (Response | null),
      (page || null) as (Pagination | null),
    );
  }, [queryState, queryParamString, getData]);

  return {
    res,
    params,
    data,
    setParams,
    request,
  };
};
