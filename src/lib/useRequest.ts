import {
  OptionsPage,
  ActionDataType,
  QueryStatus,
  QueryState,
  HttpRequestMethod,
} from './types';
import { request } from './request';
import { useDispatch } from 'react-redux';
import { useCallback, useRef } from 'react';
import { myDispatch } from './utils';
import get from 'lodash.get';

export const useRequest = <Response, QueryParams>(
  httpRequest: HttpRequestMethod<Response>,
  {
    key,
    url,
    queryParamString,
    queryState,
    page,
    params,
  }: {
    key: string;
    url: string;
    queryParamString: string;
    queryState?: QueryState<Response, QueryParams>;
    page?: OptionsPage;
    params?: any;
  },
) => {
  const dispatch = myDispatch(useDispatch());
  const isLoadingRef = useRef(false);

  const requestMethod = useCallback(
    ({
      isRefetch = false,
      isRefetchCurrent = false,
      fetchPage,
    }: {
      isRefetch?: boolean;
      isRefetchCurrent?: boolean;
      fetchPage?: number;
    }) => {
      if (!queryState || !queryState.res[queryParamString]) return;

      const res = queryState.res[queryParamString];
      let pageQuery = {};
      if (page) {
        // if is refetch, set current to 1;
        const current = isRefetch
          ? 1
          : isRefetchCurrent
          ? res.page.current
          : fetchPage
          ? fetchPage
          : res.page.current;

        pageQuery = {
          [page.queryParamNames.pageSize]: page.pageSize || 20,
          [page.queryParamNames.current]: current,
        };
      }
      const query = {
        ...params,
        ...pageQuery,
      };

      request<Response>(httpRequest, {
        beforeRequest: () => {
          isLoadingRef.current = true;
          dispatch([key, ActionDataType.QUERY, QueryStatus.LOADING]);
        },
        onResponse: res => {
          isLoadingRef.current = false;

          if (page) {
            const total: number = get(res, page.responseParamPath.total);
            const current: number = get(res, page.responseParamPath.current);
            const totalCount: number = get(
              res,
              page.responseParamPath.totalCount,
            );

            return dispatch(
              [
                key,
                ActionDataType.QUERY,
                QueryStatus.SUCESS,
                `curPage=${current}&total=${total}`,
              ],
              {
                payload: res,
                page: {
                  current,
                  total,
                  totalCount,
                  hasNoMore: current >= total,
                },
              },
            );
          }

          return dispatch([key, ActionDataType.QUERY, QueryStatus.SUCESS], {
            payload: res,
          });
        },
        onError: () => {
          isLoadingRef.current = false;
          return dispatch([key, ActionDataType.QUERY, QueryStatus.ERROR]);
        },
        url,
        query,
      });
    },
    [page, url, key, queryState, queryParamString],
  );

  return {
    request: requestMethod,
    getIsLoading: () => isLoadingRef.current,
  };
};
