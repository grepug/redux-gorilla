import {
  CacheStrategyType,
  InitialState,
  GetDataType,
  CreateQueryHookOptions,
  ActionDataType,
  OptionsPage,
  QueryTuple,
  Pagination,
  HttpRequestMethod,
} from './types';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { useEffect, useCallback, useMemo } from 'react';
import { useRequest } from './useRequest';
import { useInterval } from './useInterval';
import { usePrevious } from './usePrevious';
import { myDispatch, getQueryKey } from './utils';
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
  const { cacheStrategy, isRequestOnMount } = options;

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

  const { request } = useRequest(httpRequest, {
    key,
    url,
    queryParamString,
    page: options.page as OptionsPage,
    queryState,
    params: {
      ...queryParams,
    },
  });

  // poll
  useInterval(() => request({}), {
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
        const isRefetch = cacheStrategy === CacheStrategyType.CACHE_AND_FETCH;
        request({ isRefetch });
      }
    }
  }, [key, !!queryState, queryParamString, queryParamKeyLength]);

  const changePage = useCallback(
    (fetchPage?: number) => {
      if (queryState && queryState.res[queryParamString]) {
        const { hasNoMore } = queryState.res[queryParamString].page;

        if (fetchPage) {
          // 分页选择器
          dispatch([key, ActionDataType.CHANGE_CURRENT_PAGE], {
            page: {
              current: fetchPage,
            },
          });
          request({ fetchPage });
        } else if (!hasNoMore) {
          // TODO
          // 触底加载更多
          request({});
        }
      }
    },
    [queryState, request],
  );

  const setParams = useCallback(
    (queryParams: Partial<QueryParams>) => {
      dispatch([key, ActionDataType.SET_QUERY_PARAMS], {
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
    changePage,
    setParams,
    request,
  };
};
