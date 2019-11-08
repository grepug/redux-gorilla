import { createMutationHook } from '../../src/lib/createMutationHook';
import { CreateMutationHookOptions } from '../../src/lib/types';

type Options<Params> = Omit<
  CreateMutationHookOptions<Params>,
  'responseSuccessProperty'
>;

export const useMutation = <Response, Params>(
  url: string,
  dto: new () => Partial<Params>,
  options: Options<Params>,
  fakeSucess: boolean,
) => {
  return createMutationHook<Response, Params>(
    url,
    async () => {
      await new Promise(resolve => setTimeout(resolve, 200));

      const res: any = {
        success: fakeSucess,
      };

      return res as Response;
    },
    {
      responseSuccessProperty: {
        path: 'success',
        isSuccess: v => v,
      },
      ...options,
      dto,
    },
  );
};
