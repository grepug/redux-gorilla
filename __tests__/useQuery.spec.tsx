import { renderHook, act } from '@testing-library/react-hooks';
import { useSimpleQuery } from './gorilla/useQuery';
import * as React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { createRootReducer } from './redux/rootReducer';

interface ListResponse {
  id?: number;
  name?: string;
  _page?: number;
  _pageSize?: number;
}

test('test useQuery', async () => {
  const store = createStore(createRootReducer());

  const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  const { result, waitForNextUpdate } = renderHook(
    () =>
      useSimpleQuery<ListResponse, ListResponse>(
        'list',
        {
          _page: 1,
          _pageSize: 2,
        },
        {},
      ),
    { wrapper },
  );

  expect(result.current.res.data).toBe(null);

  await waitForNextUpdate();

  expect(result.current.res.data).toEqual([
    {
      id: 1,
      name: 'iPhone',
    },
    {
      id: 2,
      name: 'iPad',
    },
  ]);

  act(() => result.current.setParams({ name: 'iPhone' }));

  await waitForNextUpdate();

  expect(result.current.res.data).toEqual([{ id: 1, name: 'iPhone' }]);

  act(() => result.current.setParams({ _page: 2 }, { rmParams: ['name'] }));

  expect(result.current.params).toEqual({ _page: 2, _pageSize: 2 });

  await waitForNextUpdate();

  expect(result.current.res.data).toEqual([
    {
      id: 3,
      name: 'AirPods',
    },
    {
      id: 4,
      name: 'MacBook',
    },
  ]);

  act(() => result.current.request());

  await waitForNextUpdate();

  expect(result.current.res.data).toEqual([
    {
      id: 3,
      name: 'AirPods',
    },
    {
      id: 4,
      name: 'MacBook',
    },
  ]);

  expect(result.current.params).toEqual({
    _pageSize: 2,
    _page: 2,
  });

  // retrieve from 'cache', so doesn't need await;
  act(() =>
    result.current.setParams({ name: 'iPhone', _page: 1, _pageSize: 2 }),
  );

  expect(result.current.res.data).toEqual([{ id: 1, name: 'iPhone' }]);
});
