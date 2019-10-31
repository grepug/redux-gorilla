import {
  Action,
  ActionDataType,
  InitialState,
  RequestStatus,
  QueryTuple,
  MutationTuple,
} from './types';
import update from 'immutability-helper';
import { ACTION_TYPE_SEPARATOR } from './constants';

export const gorillaReducerFactory = (
  options: {
    getInitialState?: () => any;
  } = {},
) => (
  state = options.getInitialState
    ? options.getInitialState()
    : new InitialState(),
  action: Action,
) => {
  const [key, dataType, status] = action.type.split(ACTION_TYPE_SEPARATOR) as [
    string,
    ActionDataType,
    RequestStatus,
  ];

  const [url, paramsString] = key.split('?');

  if (dataType === ActionDataType.QUERY) {
    switch (status) {
      case RequestStatus.SUCESS:
        // handle page data
        if (action.page) {
          return update(state, {
            query: {
              [url]: {
                res: {
                  [paramsString]: {
                    data: {
                      $apply: (s: any | any[]) => {
                        const isArr = Array.isArray(s);
                        const { current } = action.page!;
                        if (!isArr) {
                          return [action.payload];
                        }
                        s[current - 1] = action.payload;
                        return s;
                      },
                    },
                    page: {
                      $apply: (page: any) => {
                        return {
                          ...page,
                          ...action.page,
                          current: page.current,
                        };
                      },
                    },
                    loading: {
                      $set: false,
                    },
                    error: {
                      $set: false,
                    },
                  },
                },
              },
            },
          });
        }
        return update(state, {
          query: {
            [url]: {
              res: {
                [paramsString]: {
                  data: {
                    $set: action.payload,
                  },
                  loading: {
                    $set: false,
                  },
                  error: {
                    $set: false,
                  },
                },
              },
            },
          },
        });
      case RequestStatus.LOADING:
        return update(state, {
          query: {
            [url]: {
              res: {
                [paramsString]: {
                  loading: {
                    $set: true,
                  },
                  error: {
                    $set: false,
                  },
                },
              },
            },
          },
        });
      case RequestStatus.ERROR:
        return update(state, {
          query: {
            [url]: {
              res: {
                [paramsString]: {
                  loading: {
                    $set: false,
                  },
                  error: {
                    $set: true,
                  },
                },
              },
            },
          },
        });
      default:
        return state;
    }
  } else if (dataType === ActionDataType.CHANGE_CURRENT_PAGE) {
    return update(state, {
      query: {
        [url]: {
          res: {
            [paramsString]: {
              page: {
                current: {
                  $set: action.page!.current,
                },
              },
            },
          },
        },
      },
    });
  } else if (dataType === ActionDataType.INIT) {
    return update(state, {
      query: {
        $merge: {
          [url]: {
            res: {
              [paramsString]: new QueryTuple(),
            },
            params: action.queryParams || {},
          },
        },
      },
    });
  } else if (dataType === ActionDataType.INIT_RES) {
    return update(state, {
      query: {
        [url]: {
          res: {
            $merge: {
              [paramsString]: new QueryTuple(),
            },
          },
        },
      },
    });
  } else if (dataType === ActionDataType.REST_RES) {
    return update(state, {
      query: {
        [url]: {
          res: {
            [paramsString]: {
              $set: new QueryTuple(),
            },
          },
        },
      },
    });
  } else if (dataType === ActionDataType.SET_QUERY_PARAMS) {
    return update(state, {
      query: {
        [url]: {
          params: {
            $merge: action.queryParams || {},
          },
          res: {
            [paramsString]: {
              $apply: (res: any) => {
                if (action.isForceUpdate) {
                  return new QueryTuple();
                }
                return res;
              },
            },
          },
        },
      },
    });
  } else if (dataType === ActionDataType.INIT_MUTATION) {
    return update(state, {
      mutations: {
        $merge: {
          [url]: {
            res: new MutationTuple(),
            dto: {},
          },
        },
      },
    });
  } else if (dataType === ActionDataType.MUTATION) {
    switch (status) {
      case RequestStatus.LOADING:
        return update(state, {
          mutations: {
            [url]: {
              res: {
                $merge: {
                  loading: true,
                },
              },
            },
          },
        });
      case RequestStatus.SUCESS:
        return update(state, {
          mutations: {
            [url]: {
              res: {
                $merge: {
                  success: true,
                  loading: false,
                  error: false,
                  data: action.payload,
                  // TODO error message
                },
              },
            },
          },
        });
      case RequestStatus.ERROR:
        return update(state, {
          mutations: {
            [url]: {
              res: {
                $merge: {
                  success: false,
                  loading: false,
                  error: true,
                },
              },
            },
          },
        });
    }
  } else if (dataType === ActionDataType.SET_DTO) {
    return update(state, {
      mutations: {
        [url]: {
          dto: {
            $merge: action.dto || {},
          },
        },
      },
    });
  }

  return state;
};
