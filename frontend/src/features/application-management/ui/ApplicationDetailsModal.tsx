import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
                      Исполнитель: <strong>{application.performer || '-'}</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 12 }}>
            {application.trainNumbers.map((train) => (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <Typography component="span">Поезд: {train} </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {application.carriages.map((carriage, index) =>
                    carriage.train === train ? (
                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1-content"
                          id="panel1-header"
                        >
                          <Typography component="span">
                            Вагон: {carriage.number}, тип вагона: {carriage.type}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="subtitle2" color="textSecondary" mb={2}>
                            Фотографии:
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <Box>
                                <Typography variant="body2" gutterBottom>
                                  Фото вагона №{carriage.number}
                                </Typography>
                                <img
                                  src={`${import.meta.env.VITE_API_STORAGE_PHOTOS_URL}/${
                                    carriage.photo
                                  }`}
                                  alt={`Фото фагона${carriage.number}`}
                                  className={styles.photoImage}
                                />
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <Box>
                                <Typography variant="body2" gutterBottom>
                                  Общее фото оборудования в вагоне №{carriage.number}
                                </Typography>
                                <img
                                  src={`${import.meta.env.VITE_API_STORAGE_PHOTOS_URL}/${
                                    carriage.generalPhotoEquipmentCarriage
                                  }`}
                                  alt={`Общее фото оборудования в вагоне №${carriage.number}`}
                                  className={styles.photoImage}
                                />
                              </Box>
                            </Grid>
                          </Grid>

                          <Typography variant="subtitle2" color="textSecondary" mb={2}>
                            Названия оборудования
                          </Typography>
                          {carriage.equipment.map((equipment) => (
                            <Accordion>
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                              >
                                <Typography variant="subtitle2" fontWeight={400}>
                                  {equipment.name}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography variant="subtitle2" fontWeight={400}>
                                  Серийный номер: {equipment.serialNumber}
                                </Typography>
                                <Typography variant="subtitle2" fontWeight={400}>
                                  MAC-адрес: {equipment.macAddress}
                                </Typography>
                                <Typography variant="subtitle2" fontWeight={400} mb={2}>
                                  Тип работы: {equipment.typeWork}
                                </Typography>
                                <Typography variant="subtitle2" fontWeight={400}>
                                  Фотографии:
                                </Typography>
                                <Grid container spacing={2}>
                                  {equipment.photos.map((photo) => (
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                      <Box>
                                        <Typography variant="body2" gutterBottom>
                                          {photo.type === 'equipment'
                                            ? 'Фото оборудования'
                                            : photo.type === 'serial'
                                            ? 'Фото серийнного номера'
                                            : photo.type === 'mac'
                                            ? 'Фото mac адреса'
                                            : ''}
                                        </Typography>
                                        <img
                                          src={`${import.meta.env.VITE_API_STORAGE_PHOTOS_URL}/${
                                            photo.path
                                          }`}
                                          alt={`Фото фагона${carriage.number}`}
                                          className={styles.photoImage}
                                        />
                                      </Box>
                                    </Grid>
                                  ))}
                                </Grid>
                              </AccordionDetails>
                            </Accordion>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    ) : (
                      <></>
                    ),
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
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
