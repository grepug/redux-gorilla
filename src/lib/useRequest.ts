import {
  ActionDataType,
  HttpRequestMethod,
  RequestStatus,
  Method,
} from './types';
import { request } from './request';
import { useDispatch } from 'react-redux';
import { useCallback, useRef } from 'react';
import { myDispatch } from './utils';
import get from 'lodash.get';

export const useRequest = <Response, Params>(
  httpRequest: HttpRequestMethod<Response>,
  {
    actionDataType,
    key,
    url,
    canRequest,
    query,
    body,
    method,
    responseSuccessProperty,
  }: {
    actionDataType: ActionDataType;
    key: string;
    url: string;
    canRequest: boolean;
    method: Method;
    responseSuccessProperty: {
      path: string;
      isSuccess: (v: any) => boolean;
    };
    query?: Params;
    body?: Params;
  },
  deps: any[] = [],
) => {
  const dispatch = myDispatch(useDispatch());
  const isLoadingRef = useRef(false);

  const requestMethod = useCallback(
    (
      opts: {
        body?: any;
        query?: any;
      } = {},
    ) => {
      if (!canRequest) return;
      request<Response>(httpRequest, {
        beforeRequest: () => {
          isLoadingRef.current = true;
          dispatch([key, actionDataType, RequestStatus.LOADING]);
        },
        onResponse: res => {
          isLoadingRef.current = false;

          if (actionDataType === ActionDataType.MUTATION) {
            const isSuccessVal = get(res, responseSuccessProperty.path);
            const isSuccess = responseSuccessProperty.isSuccess(isSuccessVal);

            if (!isSuccess) {
              return dispatch([key, actionDataType, RequestStatus.ERROR]);
            }
          }

          return dispatch([key, actionDataType, RequestStatus.SUCESS], {
            payload: res,
          });
        },
        onError: () => {
          isLoadingRef.current = false;
          return dispatch([key, actionDataType, RequestStatus.ERROR]);
        },
        url,
        body: opts.body || body,
        query: opts.query || query,
        method,
      });
    },
    [url, key, ...deps],
  );

  return {
    request: requestMethod,
    getIsLoading: () => isLoadingRef.current,
  };
};
