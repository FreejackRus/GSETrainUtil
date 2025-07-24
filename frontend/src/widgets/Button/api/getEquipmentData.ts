import axios from 'axios';
import { urlRequest } from '../../../shared/const';

export const getEquipmentData = async () => {
  try {
    const response = await axios.get(urlRequest);

    return response;
  } catch (error) {}
};
