import { createMutationHook } from '../../src/lib/createMutationHook';
import axios from 'axios';
import { CreateMutationHookOptions } from '../../src/lib/types';

export const useMutation = <Response, Params>(
  url: string,
  dto: new () => Partial<Params>,
  options: CreateMutationHookOptions<Params>,
) => {
  return createMutationHook<Response, Params>(
    url,
    async (url, _, { body }) => {
      console.count('mutate');
      console.log('body', JSON.stringify(body));

      const res: any = await axios.post(url, body).then(res => res.data);
      return res as Response;
    },
    { ...options, dto },
  );
};
