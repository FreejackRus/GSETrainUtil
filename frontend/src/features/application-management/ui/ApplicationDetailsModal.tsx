import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Train as TrainIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Memory as MemoryIcon,
  Photo as PhotoIcon,
} from '@mui/icons-material';
import styles from './ApplicationDetailsModal.module.css';
import type { Application } from '../../../entities/application/model/types';

interface ApplicationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  application: Application | null;
}

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  open,
  onClose,
  application,
}) => {
  if (!application) return null;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Черновик';
      case 'completed':
        return 'Завершена';
      case 'cancelled':
        return 'Отменена';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  console.log('application', application);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <BuildIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" component="div">
              Заявка #{application.id}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Детальная информация о заявке
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: 'white' }}>
        <Grid container spacing={3}>
          {/* Основная информация */}
          <Grid size={{ xs: 12 }}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <CalendarIcon color="primary" />
                  Основная информация
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Статус:
                      </Typography>
                      <Chip
                        label={getStatusText(application.status)}
                        color={getStatusColor(application.status) as any}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Дата создания: <strong>{formatDate(application.createdAt)}</strong>
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Тип работ:{' '}
                      <strong>
                        {Array.from(
                          new Set(
                            application.carriages
                              .flatMap((item) => item.equipment)
                              .map((item) => item.typeWork),
                          ),
                        )
                          .filter(Boolean)
                          .join(', ') || '-'}
                      </strong>
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Исполнитель: <strong>{application.performer || '-'}</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Информация о поезде и вагоне */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <TrainIcon color="primary" />
                  Поезд и вагон
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <TrainIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Номер поездов: <strong>{application.trainNumbers.join(', ') || '-'}</strong>
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CarIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Тип вагонов:{' '}
                    <strong>
                      {application.carriages.map((item) => item.type).join(', ') || '-'}
                    </strong>
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CarIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Номера вагонов:{' '}
                    <strong>
                      {application.carriages.map((item) => item.number).join(', ') || '-'}
                    </strong>
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Местоположение: <strong>{application.currentLocation || '-'}</strong>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Выполненные работы */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <BuildIcon color="primary" />
                  Выполненные работы
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {'Информация о выполненных работах не указана'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Оборудование */}
          {application.carriages.flatMap((item) => item.equipment) && (
            <Grid size={{ xs: 12 }}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <MemoryIcon color="primary" />
                    Оборудование ({application.carriages.flatMap((item) => item.equipment).length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    {application.carriages
                      .flatMap((item) => item.equipment)
                      .map((item, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                          <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                {item.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Серийный номер: {item.serialNumber || '-'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                MAC-адрес: {item.macAddress || '-'}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Фотографии */}
          <Grid size={{ xs: 12 }}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <PhotoIcon color="primary" />
                  Фотографии
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  {application.carriages
                    .map((item) => item.photo)
                    .map(
                      (item, index) =>
                        item && (
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Box>
                              <Typography variant="body2" gutterBottom>
                                Фото вагона №{index + 1}
                              </Typography>
                              <img
                                src={`${import.meta.env.VITE_API_STORAGE_PHOTOS_URL}/${item}`}
                                alt={`Фото вагона №${index + 1}`}
                                className={styles.photoImage}
                              />
                            </Box>
                          </Grid>
                        ),
                    )}
                  {application.carriages
                    .map((item) => item.generalPhotoEquipmentCarriage)
                    .map(
                      (item, index) =>
                        item && (
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Box>
                              <Typography variant="body2" gutterBottom>
                               Общее фото оборудования в вагоне № {index + 1}
                              </Typography>
                              <img
                                src={`${import.meta.env.VITE_API_STORAGE_PHOTOS_URL}/${item}`}
                                alt={`Общее фото оборудования в вагоне №${index + 1}`}
                                className={styles.photoImage}
                              />
                            </Box>
                          </Grid>
                        ),
                    )}
                  {application.carriages
                    .map((item) => item.equipment)
                    .map((item1, index1) =>
                      item1.map((item2, index2) =>
                        item2.photos.map((item3) => (
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Box>
                              <Typography variant="body2" gutterBottom>
                                Фото{' '}
                                {item3.type === 'serial'
                                  ? 'серийного номера оборудования'
                                  : item3.type === 'mac'
                                  ? 'mac адреса оборудования'
                                  : 'оборудования'}{' '}
                                №{index2 + 1} вагона №{index1 + 1}
                              </Typography>
                              <img
                                src={`${import.meta.env.VITE_API_STORAGE_PHOTOS_URL}/${item3.path}`}
                                alt={`Фото ${
                                  item3.type === 'serial'
                                    ? 'серийного номера оборудования'
                                    : item3.type === 'mac'
                                    ? 'mac адреса оборудования'
                                    : 'оборудования'
                                } №${index2 + 1} вагона №${index1 + 1}`}
                                className={styles.photoImage}
                              />
                            </Box>
                          </Grid>
                        )),
                      ),
                    )}

                  {application.photo && (
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          Общее фото
                        </Typography>
                        <img
                          src={`${import.meta.env.VITE_API_STORAGE_PHOTOS_URL}/${
                            application.photo
                          }`}
                          alt="Общее фото"
                          className={styles.photoImage}
                        />
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {!application.carriages.map((item) => item.photo).filter(Boolean).length &&
                  !application.photo && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: 'center', py: 2 }}
                    >
                      Фотографии не прикреплены
                    </Typography>
                  )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};
