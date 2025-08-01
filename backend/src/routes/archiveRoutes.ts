import { Router } from 'express';
import {
  archiveApplicationPhotos,
  archivePhotosByDateRange,
  getStorageInfo,
  cleanupOldPhotos
} from '../controlers/archive/archiveController';

const router = Router();

/**
 * @route GET /api/archive/application/:applicationId
 * @desc Архивирует фотографии конкретной заявки
 * @access Public
 */
router.get('/application/:applicationId', archiveApplicationPhotos);

/**
 * @route GET /api/archive/date-range
 * @desc Архивирует фотографии за период
 * @query dateFrom - дата начала (YYYY-MM-DD)
 * @query dateTo - дата окончания (YYYY-MM-DD)
 * @access Public
 */
router.get('/date-range', archivePhotosByDateRange);

/**
 * @route GET /api/archive/storage-info
 * @desc Получает информацию о размере хранилища фотографий
 * @access Public
 */
router.get('/storage-info', getStorageInfo);

/**
 * @route DELETE /api/archive/cleanup
 * @desc Очищает старые фотографии
 * @query daysOld - количество дней (по умолчанию 365)
 * @access Public
 */
router.delete('/cleanup', cleanupOldPhotos);

export default router;