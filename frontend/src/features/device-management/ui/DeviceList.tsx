import { useEffect, useState } from 'react';
import { deviceApi, type Device } from '../../../entities/device';
import './DeviceList.css';

export const DeviceList = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await deviceApi.getDevices();
      
      // Безопасная проверка структуры данных
      if (response && response.data && Array.isArray(response.data)) {
        setDevices(response.data);
      } else {
        console.warn('Неожиданная структура данных:', response);
        setDevices([]);
      }
    } catch (err) {
      console.error('Ошибка при загрузке устройств:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки устройств');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    
    // Обновляем список каждые 10 секунд
    const interval = setInterval(fetchDevices, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'активен':
        return 'device-list__status--active';
      case 'inactive':
      case 'неактивен':
        return 'device-list__status--inactive';
      case 'pending':
      case 'ожидание':
        return 'device-list__status--pending';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <section className="device-list">
        <div className="device-list__loading">
          Загрузка устройств...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="device-list">
        <div className="device-list__error">
          {error}
        </div>
      </section>
    );
  }

  if (devices.length === 0) {
    return (
      <section className="device-list">
        <div className="device-list__empty">
          Устройства не найдены
        </div>
      </section>
    );
  }

  return (
    <section className="device-list">
      {devices.map(({ name, id, count, status }) => (
        <article className="device-list__item" key={id}>
          <p className="device-list__name">{name}</p>
          <p className={`device-list__status ${getStatusClass(status)}`}>
            {status}
          </p>
          <p className="device-list__count">{count}</p>
        </article>
      ))}
    </section>
  );
};