import axios from 'axios';
import { urlRequest } from '../../../shared/const';


export const getDevices = async () => {
  try {
    const response = await axios.get(urlRequest);
    return response
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
  }
};
