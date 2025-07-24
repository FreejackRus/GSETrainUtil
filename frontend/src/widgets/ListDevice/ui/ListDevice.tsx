import { useEffect, useState } from 'react';
import type { TDevice, TResponse } from '../../../shared/types/typeDevice';
import { arrayValidDevices } from '../../../shared/transformation/arrayValidDevices';
import './listDevice.scss';

export const ListDevice = () => {
  const [data, setData] = useState<TDevice[]>();
  useEffect(() => {
    const seconds = 10;
    const intervalTime = seconds * 1000;
     arrayValidDevices().then((data) => {
        setData(data);
        console.log(data);
      });
    const updateListArray = setInterval(() => {
      arrayValidDevices().then((data) => {
        setData(data);
        console.log(data);
      });
    }, intervalTime);
    return () => clearInterval(updateListArray);
  }, []);

  return (
    <section className="list-device">
      {data?.map(({ name, id, count, status }) => (
        <article className="list-device__item" key={id}>
          <p className="list-device__name">{name}</p>
          <p className="list-device__status">{status}</p>
          <p className="list-device__count">{count}</p>
        </article>
      ))}
    </section>
  );
};
