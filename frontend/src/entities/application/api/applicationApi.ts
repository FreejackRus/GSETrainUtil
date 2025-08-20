import { apiClient } from '../../../shared/api';
import type { Application, CreateApplicationRequest } from '../model/types';

export const applicationApi = {
  // create: async (data: CreateApplicationRequest): Promise<Application> => {
  //   const fd = new FormData();
  //
  //   if (data.id != null) fd.append('id', String(data.id));
  //   fd.append('status', data.status);
  //   fd.append('userId', String(data.userId));
  //   fd.append('performer', data.performer);
  //   fd.append('currentLocation', data.currentLocation);
  //
  //   data.requestTrains.forEach((t, ti) => {
  //     fd.append(`requestTrains[${ti}][trainNumber]`, t.trainNumber);
  //
  //     t.carriages.forEach((c, ci) => {
  //       fd.append(`requestTrains[${ti}][carriages][${ci}][carriageNumber]`, c.carriageNumber);
  //       fd.append(`requestTrains[${ti}][carriages][${ci}][carriageType]`, c.carriageType);
  //
  //       if (c.carriagePhotos?.carriage) {
  //         fd.append(
  //             `requestTrains[${ti}][carriages][${ci}][carriagePhotos][carriage]`,
  //             c.carriagePhotos.carriage
  //         );
  //       }
  //       if (c.carriagePhotos?.equipment) {
  //         fd.append(
  //             `requestTrains[${ti}][carriages][${ci}][carriagePhotos][equipment]`,
  //             c.carriagePhotos.equipment
  //         );
  //       }
  //
  //       c.equipments.forEach((e, ei) => {
  //         fd.append(
  //             `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][equipmentName]`,
  //             e.equipmentName
  //         );
  //         if (e.serialNumber) {
  //           fd.append(
  //               `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][serialNumber]`,
  //               e.serialNumber
  //           );
  //         }
  //         if (e.macAddress) {
  //           fd.append(
  //               `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][macAddress]`,
  //               e.macAddress
  //           );
  //         }
  //         fd.append(
  //             `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][typeWork]`,
  //             e.typeWork
  //         );
  //
  //         // новые ключи фото: equipment | serial | mac
  //         if (e.photos?.equipment) {
  //           fd.append(
  //               `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][photos][equipment]`,
  //               e.photos.equipment
  //           );
  //         }
  //         if (e.photos?.serial) {
  //           fd.append(
  //               `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][photos][serial]`,
  //               e.photos.serial
  //           );
  //         }
  //         if (e.photos?.mac) {
  //           fd.append(
  //               `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][photos][mac]`,
  //               e.photos.mac
  //           );
  //         }
  //       });
  //     });
  //   });
  //
  //   const res = await apiClient.post('/applications', fd, {
  //     headers: { 'Content-Type': 'multipart/form-data' },
  //   });
  //
  //   // бэк отвечает { success, data } — вернём data
  //   return res.data.data as Application;
  // },

  create: async (data: CreateApplicationRequest): Promise<Application> => {
    const fd = new FormData();

    if (data.id != null) fd.append('id', String(data.id));
    fd.append('status', data.status);
    fd.append('userId', String(data.userId));
    fd.append('performer', data.performer);
    fd.append('currentLocation', data.currentLocation);

    // 1) JSON-часть (без файлов) — это ОБЯЗАТЕЛЬНО
    const requestTrainsJson = data.requestTrains.map((t) => ({
      trainNumber: t.trainNumber,
      carriages: t.carriages.map((c) => ({
        carriageNumber: c.carriageNumber,
        carriageType: c.carriageType,
        // carriagePhotos НЕ добавляем сюда — это файлы ниже
        equipments: c.equipments.map((e) => ({
          equipmentName: e.equipmentName,
          serialNumber: e.serialNumber ?? undefined,
          macAddress: e.macAddress ?? undefined,
          typeWork: e.typeWork, // тип работ на уровне оборудования
          // photos НЕ добавляем сюда — это файлы ниже
        })),
      })),
    }));
    fd.append('requestTrains', JSON.stringify(requestTrainsJson));

    // 2) Файлы — строго по ключам, которые ожидает бэкенд
    data.requestTrains.forEach((t, ti) => {
      t.carriages.forEach((c, ci) => {
        if (c.carriagePhotos?.carriage) {
          fd.append(
            `requestTrains[${ti}][carriages][${ci}][carriagePhotos][carriage]`,
            c.carriagePhotos.carriage,
          );
        }
        if (c.carriagePhotos?.equipment) {
          fd.append(
            `requestTrains[${ti}][carriages][${ci}][carriagePhotos][equipment]`,
            c.carriagePhotos.equipment,
          );
        }

        c.equipments.forEach((e, ei) => {
          if (e.photos?.equipment) {
            fd.append(
              `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][photos][equipment]`,
              e.photos.equipment,
            );
          }
          if (e.photos?.serial) {
            fd.append(
              `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][photos][serial]`,
              e.photos.serial,
            );
          }
          if (e.photos?.mac) {
            fd.append(
              `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][photos][mac]`,
              e.photos.mac,
            );
          }
        });
      });
    });
    console.log(fd);

    const res = await apiClient.post('/applications', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }, // можно и не указывать — axios сам проставит boundary
    });

    return res.data.data as Application;
  },

  getAll: async (): Promise<Application[]> => {
    const response = await apiClient.get('/applications');
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  // Получить заявки пользователя
  getUserApplications: async (userId: number): Promise<Application[]> => {
    const response = await apiClient.get(`/applications?userId=${userId}`);
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  getById: async (id: string): Promise<Application> => {
    const response = await apiClient.get(`/applications/${id}`);
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  update: async (id: string, data: Partial<CreateApplicationRequest>): Promise<Application> => {
    const response = await apiClient.put(`/applications/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/applications/${id}`);
  },

  // Сохранить черновик
  saveDraft: async (fd: FormData): Promise<Application> => {
    const res = await apiClient.post('/applications/draft', fd);
    return res.data.data;
  },

  // Получить все черновики
  getDrafts: async (userId: number, userRole: string = 'engineer'): Promise<Application[]> => {
    const response = await apiClient.get(
      `/applications/drafts?userId=${userId}&userRole=${userRole}`,
    );
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  // Обновить черновик
  updateDraft: async (id: number, fd: FormData): Promise<Application> => {
    if (!fd.has('id')) fd.append('id', String(id));
    const res = await apiClient.put(`/applications/draft/${id}`, fd);
    return res.data.data;
  },

  // Завершить черновик (перевести в статус completed)
  completeDraft: async (
    id: number,
    data: Partial<CreateApplicationRequest>,
  ): Promise<Application> => {
    try {
      console.log('=== API: Отправка запроса на завершение черновика ===');
      console.log('URL:', `/applications/${id}/complete`);
      console.log('ID черновика:', id);
      console.log('Данные запроса:', data);

      const fd = new FormData();

      // Обязательные поля
      fd.append('status', 'completed');
      if (data.userId != null) fd.append('userId', String(data.userId));
      if (data.performer) fd.append('performer', data.performer);
      if (data.currentLocation) fd.append('currentLocation', data.currentLocation);

      // JSON-часть (без файлов)
      const requestTrainsJson = (data.requestTrains ?? []).map((t) => ({
        trainNumber: t.trainNumber,
        carriages: t.carriages.map((c) => ({
          carriageNumber: c.carriageNumber,
          carriageType: c.carriageType,
          equipments: c.equipments.map((e) => ({
            equipmentName: e.equipmentName,
            serialNumber: e.serialNumber ?? undefined,
            macAddress: e.macAddress ?? undefined,
            typeWork: e.typeWork,
          })),
        })),
      }));
      fd.append('requestTrains', JSON.stringify(requestTrainsJson));

      // Файлы
      (data.requestTrains ?? []).forEach((t, ti) => {
        t.carriages.forEach((c, ci) => {
          if (c.carriagePhotos?.carriage) {
            fd.append(
              `requestTrains[${ti}][carriages][${ci}][carriagePhotos][carriage]`,
              c.carriagePhotos.carriage,
            );
          }
          if (c.carriagePhotos?.equipment) {
            fd.append(
              `requestTrains[${ti}][carriages][${ci}][carriagePhotos][equipment]`,
              c.carriagePhotos.equipment,
            );
          }

          c.equipments.forEach((e, ei) => {
            if (e.photos?.equipment) {
              fd.append(
                `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][photos][equipment]`,
                e.photos.equipment,
              );
            }
            if (e.photos?.serial) {
              fd.append(
                `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][photos][serial]`,
                e.photos.serial,
              );
            }
            if (e.photos?.mac) {
              fd.append(
                `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][photos][mac]`,
                e.photos.mac,
              );
            }
          });
        });
      });

      console.log([...fd.entries()])
      const response = await apiClient.put(`/applications/${id}/complete`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('=== API: Успешное завершение черновика ===');
      console.log('Статус:', response.status);
      console.log('Данные ответа:', response.data);
      
      return response.data.data; // Извлекаем данные из структуры { success, message, data }
    } catch (error) {
      console.error('=== API: Ошибка при завершении черновика ===');
      console.error('ID черновика:', id);
      console.error('Тип ошибки:', error?.constructor?.name);
      console.error('Сообщение:', error?.message);
      console.error('Статус:', error?.response?.status);
      console.error('Данные ошибки:', error?.response?.data);
      console.error('Заголовки ошибки:', error?.response?.headers);
      console.error('Конфигурация запроса:', error?.config);
      console.error('Полная ошибка:', error);
      throw error;
    }
  },

  // Удалить черновик
  deleteDraft: async (id: string): Promise<void> => {
    await apiClient.delete(`/applications/drafts/${id}`);
  },

  // Загрузка файлов
  uploadFiles: async (files: FormData): Promise<{ [key: string]: string }> => {
    const response = await apiClient.post('/applications/upload', files, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
