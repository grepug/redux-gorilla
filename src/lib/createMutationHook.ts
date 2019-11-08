import { myDispatch } from './utils';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import {
  InitialState,
  ActionDataType,
  HttpRequestMethod,
  MutationTuple,
  CreateMutationHookOptions,
  Method,
} from './types';
import { useEffect, useCallback, useMemo } from 'react';
import { useRequest } from './useRequest';
import { usePrevious } from './usePrevious';

export const createMutationHook = <Response, DataTransferObject>(
  url: string,
  httpRequest: HttpRequestMethod<Response>,
  options: CreateMutationHookOptions<DataTransferObject>,
) => {
  const dispatch = myDispatch(useDispatch());
  type ReduxInitialState = {
    gorilla: InitialState<Response, DataTransferObject>;
  };

  const getState = (state: ReduxInitialState) => {
    return state.gorilla.mutations[url];
  };

  const mutationState = useSelector<
    ReduxInitialState,
    ReturnType<typeof getState>
  >(getState, shallowEqual);

  const initialDto = options.dto;

  //
  useEffect(() => {
    if (mutationState == null) {
      dispatch([url, ActionDataType.INIT_MUTATION], {
        mutationParams: initialDto ? new initialDto() : {}
      });
    }
  }, [!mutationState]);

  const { request } = useRequest(
    httpRequest,
    {
      actionDataType: ActionDataType.MUTATION,
      key: url,
      url,
      canRequest: !!mutationState,
      responseSuccessProperty: options.responseSuccessProperty,
      method: Method.POST,
      body: mutationState
        ? mutationState.dto
        : options.dto
        ? new options.dto()
        : {},
    },
    [mutationState],
  );

  const loading= mutationState?.res.loading ?? false
  const prevLoading = usePrevious(loading);
  // status of mutation
  useEffect(() => {
    if (!loading && prevLoading) {
      options.onMutated?.()
    }
  }, [loading]);

  const setDto = useCallback(
    (DataTransferObject: Partial<DataTransferObject>) => {
      dispatch([url, ActionDataType.SET_DTO], {
        dto: DataTransferObject,
      });
    },
    [dispatch],
  );

  const res: MutationTuple<Response> = useMemo(
    () => mutationState?.res ?? new MutationTuple(),
    [mutationState],
  );

  const dto = useMemo(
    () => mutationState?.dto ?? ({} as DataTransferObject),
    [mutationState],
  );

  useEffect(() => {
    options.onDtoChange?.(dto);
  }, [dto]);

  const resetDto = useCallback(() => {
    setDto(initialDto ? new initialDto() : {});
  }, [initialDto]);

  const mutate = useCallback(() => {
    const body = options.transformDto?.(dto);
    const isValid = options.shouldMutate?.(dto) ?? true;
    if (isValid) {
      request({ body });
    }
  }, [dto, request])

  return {
    res,
    dto,
    setDto,
    mutate,
    resetDto,
  };
};
