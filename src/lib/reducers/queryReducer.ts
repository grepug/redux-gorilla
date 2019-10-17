import {
  Action,
  ActionDataType,
  InitialState,
  QueryStatus,
  QueryTuple
} from "../types";
import update from "immutability-helper";
import { ACTION_TYPE_SEPARATOR } from "../constants";

export const queryReducerFactory = (
  options: {
    getInitialState?: () => any;
  } = {}
) => (
  state = options.getInitialState
    ? options.getInitialState()
    : new InitialState(),
  action: Action
) => {
  const [key, dataType, status] = action.type.split(ACTION_TYPE_SEPARATOR) as [
    string,
    ActionDataType,
    QueryStatus
  ];

  const [url, paramsString] = key.split("?");

  if (dataType === ActionDataType.QUERY) {
    switch (status) {
      case QueryStatus.SUCESS:
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
                      }
                    },
                    page: {
                      $apply: (page: any) => {
                        return {
                          ...page,
                          ...action.page,
                          current: page.current
                        };
                      }
                    },
                    loading: {
                      $set: false
                    },
                    error: {
                      $set: false
                    }
                  }
                }
              }
            }
          });
        }
        return update(state, {
          query: {
            [url]: {
              res: {
                [paramsString]: {
                  data: {
                    $set: action.payload
                  },
                  loading: {
                    $set: false
                  },
                  error: {
                    $set: false
                  }
                }
              }
            }
          }
        });
      case QueryStatus.LOADING:
        return update(state, {
          query: {
            [url]: {
              res: {
                [paramsString]: {
                  loading: {
                    $set: true
                  },
                  error: {
                    $set: false
                  }
                }
              }
            }
          }
        });
      case QueryStatus.ERROR:
        return update(state, {
          query: {
            [url]: {
              res: {
                [paramsString]: {
                  loading: {
                    $set: false
                  },
                  error: {
                    $set: true
                  }
                }
              }
            }
          }
        });
      default:
        return state;
    }
  }
  if (dataType === ActionDataType.CHANGE_CURRENT_PAGE) {
    return update(state, {
      query: {
        [url]: {
          res: {
            [paramsString]: {
              page: {
                current: {
                  $set: action.page!.current
                }
              }
            }
          }
        }
      }
    });
  }
  if (dataType === ActionDataType.INIT) {
    return update(state, {
      query: {
        $merge: {
          [url]: {
            res: {
              [paramsString]: new QueryTuple()
            },
            params: action.queryParams || {}
          }
        }
      }
    });
  }
  if (dataType === ActionDataType.INIT_RES) {
    return update(state, {
      query: {
        [url]: {
          res: {
            $merge: {
              [paramsString]: new QueryTuple()
            }
          }
        }
      }
    });
  }
  if (dataType === ActionDataType.SET_QUERY_PARAMS) {
    return update(state, {
      query: {
        [url]: {
          params: {
            $merge: action.queryParams || {}
          }
        }
      }
    });
  }
  return state;
};
