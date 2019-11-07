import { renderHook, act } from '@testing-library/react-hooks';
import { getUrl, ReduxProvider } from './constants';
import { useMutation } from './gorilla/useMutation';

class InfoDto {
  id?: number;
  name: string | null = null;
}

test('should mutate', async () => {
  const { result, waitForNextUpdate } = renderHook(
    () => useMutation(getUrl('/items'), InfoDto, {}),
    {
      wrapper: ReduxProvider,
    },
  );

  act(() => result.current.setDto({ name: 'GrePuG' }));

  expect(result.current.dto.name).toEqual('GrePuG');

  act(() => result.current.mutate());

  expect(result.current.res.loading).toBe(true);

  await waitForNextUpdate();

  expect(result.current.res.loading).toBe(false);
  expect(result.current.res.error).toBe(false);
  expect(result.current.res.success).toBe(true);

  act(() => result.current.resetDto());

  expect(result.current.dto).toEqual(new InfoDto());
});
