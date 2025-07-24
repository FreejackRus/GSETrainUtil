import { getDevices } from '../../widgets/ListDevice/api/getDevices';
import { getObjectOrError } from '../checkers';
import type { TDevice, TResponse } from '../types/typeDevice';

export const arrayValidDevices = async () => {
  const validResponse = getObjectOrError<TResponse>(await getDevices());
  const arrayValid = getObjectOrError<TDevice[]>(validResponse.data);

  return arrayValid;
};
