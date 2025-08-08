import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Fab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Train as TrainIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { workLogApi } from '../../../entities/worklog/api/workLogApi';
import type { WorkLogEntry } from '../../../entities/worklog/model/types';
import './WorkLogDetailPage.css';
import { FALLBACK_DATA, referenceApi } from '../../../shared';

export const WorkLogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workLog, setWorkLog] = useState<WorkLogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedWorkLog, setEditedWorkLog] = useState<WorkLogEntry | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [carriageTypes, setCarriageTypes] = useState<string[]>([]);

  const STORAGE = import.meta.env.VITE_API_STORAGE_PHOTOS_URL as string;

  // Функция для формирования полного URL фотографии
  // const getFullPhotoUrl = (url: string): string => {
  //   if (url.startsWith('http')) {
  //     return url;
  //   }
  //   // Убираем ведущий слеш, если он есть, так как API_BASE_URL уже содержит протокол и домен
  //   const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  //   return `${API_BASE_URL.replace('/api/v1', '')}/${cleanUrl}`;
  // };

  interface PhotoItem {
    label: string;
    url: string;
  }

  function collectPhotos(entry: WorkLogEntry): PhotoItem[] {
    const base = STORAGE.replace(/\/$/, ''); // убираем возможный завершающий слэш
    const items: PhotoItem[] = [];

    // 1) Общее фото заявки
    if (entry.photo) {
      items.push({ label: 'Фото заявки', url: `${base}/${entry.photo}` });
    }

    // 2) Фото вагонов
    entry.carriages.forEach((c) => {
      if (c.photo) {
        items.push({ label: 'Фото вагона', url: `${base}/${c.photo}` });
      }
    });

    // 3) Фото оборудования
    entry.equipmentPhotos.forEach((p) => {
      items.push({ label: 'Фото оборудования', url: `${base}/${p}` });
    });

    // 4) Фото серийного номера
    entry.serialPhotos.forEach((p) => {
      items.push({ label: 'Фото серийного номера', url: `${base}/${p}` });
    });

    // 5) Фото MAC-адреса
    entry.macPhotos.forEach((p) => {
      items.push({ label: 'Фото MAC-адреса', url: `${base}/${p}` });
    });

    return items;
  }

  useEffect(() => {
    referenceApi
      .getAllReferences()
      .then((data) => {
        console.log('API Response:', data);
        if (data && Object.keys(data).length > 0) {
          console.log('Using API data');
          setWorkTypes(data.typeWork || FALLBACK_DATA.workTypes);
          setCarriageTypes(data.typeWagon || FALLBACK_DATA.carriageTypes);
        } else {
          console.log('Using fallback data - empty response');
          // Используем fallback данные если ответ пустой
          setWorkTypes(FALLBACK_DATA.workTypes);
          setCarriageTypes(FALLBACK_DATA.carriageTypes);
        }
      })
      .catch((error) => {
        console.log('API Error:', error);
        console.log('Using fallback data - error');
        // Используем fallback данные в случае ошибки
        setWorkTypes(FALLBACK_DATA.workTypes);
      });

    if (id) {
      fetchWorkLogDetail(parseInt(id));
    }
  }, [id]);

  const fetchWorkLogDetail = async (entryId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await workLogApi.getWorkLogById(entryId);

      if (response.success) {
        setWorkLog(response.data);
        setEditedWorkLog(response.data);
      } else {
        setError('Не удалось загрузить данные заявки');
      }
    } catch (err) {
      console.error('Ошибка при загрузке заявки:', err);
      setError('Ошибка при загрузке данных заявки');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedWorkLog || !id) return;

    try {
      const response = await workLogApi.updateWorkLogById(parseInt(id), editedWorkLog);

      if (response.success) {
        setWorkLog(response.data);
        setEditedWorkLog(response.data);
        setIsEditing(false);
      } else {
        setError('Не удалось сохранить изменения');
      }
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      setError('Ошибка при сохранении изменений');
    }
  };

  const handleCancel = () => {
    setEditedWorkLog(workLog);
    setIsEditing(false);
  };

  const getStatusIcon = (entry: WorkLogEntry) => {
    if (entry.completedJob && entry.completedJob.trim() !== '') {
      return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
    }
    return <AccessTimeIcon sx={{ color: '#ff9800' }} />;
  };

  const getStatusText = (entry: WorkLogEntry) => {
    if (entry.completedJob && entry.completedJob.trim() !== '') {
      return 'Выполнено';
    }
    return 'В работе';
  };

  const getStatusColor = (entry: WorkLogEntry) => {
    if (entry.completedJob && entry.completedJob.trim() !== '') {
      return 'success';
    }
    return 'warning';
  };

  const getWorkTypeColor = (workType: string) => {
    switch (workType.toLowerCase()) {
      case 'установка':
        return 'success';
      case 'замена':
        return 'warning';
      case 'ремонт':
        return 'error';
      case 'диагностика':
        return 'info';
      case 'настройка':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const handlePhotoClick = (photo: string) => {
    setSelectedPhoto(photo);
    setPhotoDialogOpen(true);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" className="work-log-detail-page">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !workLog) {
    return (
      <Container maxWidth="lg" className="work-log-detail-page">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Заявка не найдена'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/work-log')}
        >
          Вернуться к списку
        </Button>
      </Container>
    );
  }

  const getFullPhotoUrl = (url: string): string =>
    url.startsWith('http') ? url : `${STORAGE.replace(/\/api\/v1$/, '')}/${url}`;

  const photos = collectPhotos(workLog);

  return (
    <Container maxWidth="lg" className="work-log-detail-page">
      {/* Заголовок */}
      <Paper className="detail-header" elevation={0}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => navigate('/work-log')} className="back-button">
              <ArrowBackIcon />
            </IconButton>
            <Avatar className="request-avatar">
              <AssignmentIcon />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                className="detail-title"
                sx={{
                  fontSize: {
                    xs: '0.8rem',
                    sm: '1.5rem',
                  },
                }}
              >
                Заявка №{workLog.id}
              </Typography>
              <Typography
                variant="subtitle1"
                className="detail-subtitle"
                sx={{
                  fontSize: {
                    xs: '0.8rem',
                    sm: '1rem',
                  },
                }}
              >
                {/* {workLog.typeWork} • {workLog.trainNumber} • Вагон {workLog.carriageNumber} */}
                {workLog.trainNumbers[0]} • Вагон{' '}
                {workLog.carriages.map((item) => item.number).join(', ')}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            {!isEditing ? (
              <Tooltip title="Редактировать">
                <Fab
                  color="primary"
                  size="medium"
                  onClick={() => setIsEditing(true)}
                  className="edit-fab"
                  disabled
                >
                  <EditIcon />
                </Fab>
              </Tooltip>
            ) : (
              <>
                <Tooltip title="Сохранить">
                  <Fab color="primary" size="medium" onClick={handleSave} className="save-fab">
                    <SaveIcon />
                  </Fab>
                </Tooltip>
                <Tooltip title="Отменить">
                  <Fab color="default" size="medium" onClick={handleCancel} className="cancel-fab">
                    <CancelIcon />
                  </Fab>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        {/* Статус и тип работы */}
        <Box display="flex" gap={2} mb={2}>
          <Chip
            icon={getStatusIcon(workLog)}
            label={getStatusText(workLog)}
            color={
              getStatusColor(workLog) as
                | 'success'
                | 'warning'
                | 'error'
                | 'info'
                | 'primary'
                | 'secondary'
                | 'default'
            }
            className="status-chip"
          />
          {/* <Chip
            label={workLog.typeWork}
            color={
              getWorkTypeColor(workLog.typeWork) as
                | 'success'
                | 'warning'
                | 'error'
                | 'info'
                | 'primary'
                | 'secondary'
                | 'default'
            }
            variant="outlined"
          /> */}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper className="detail-section" elevation={2}>
            <Typography variant="h6" className="section-title" gutterBottom>
              <BuildIcon sx={{ mr: 1 }} />
              Основная информация
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Информационные карточки */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    border: '1px solid #2196f3',
                    borderRadius: 2,
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <CalendarTodayIcon sx={{ color: '#1976d2', mr: 1, fontSize: 20 }} />
                      <Typography variant="subtitle2" color="#1976d2" fontWeight={600}>
                        Дата заявки
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#0d47a1">
                      {new Date(workLog.createdAt).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                    border: '1px solid #4caf50',
                    borderRadius: 2,
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationIcon sx={{ color: '#388e3c', mr: 1, fontSize: 20 }} />
                      <Typography variant="subtitle2" color="#388e3c" fontWeight={600}>
                        Местоположение
                      </Typography>
                    </Box>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        value={editedWorkLog?.currentLocation || ''}
                        onChange={(e) =>
                          setEditedWorkLog((prev) =>
                            prev ? { ...prev, currentLocation: e.target.value } : null,
                          )
                        }
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255,255,255,0.8)',
                          },
                        }}
                      />
                    ) : (
                      <Typography variant="body1" fontWeight={600} color="#1b5e20">
                        {workLog.currentLocation}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Информация о поезде и вагоне */}
            <Card
              sx={{
                background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                border: '1px solid #ff9800',
                borderRadius: 2,
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrainIcon sx={{ color: '#f57c00', mr: 1, fontSize: 24 }} />
                  <Typography variant="h6" color="#e65100" fontWeight={700}>
                    Информация о составе
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box>
                      <Typography variant="subtitle2" color="#bf360c" fontWeight={600} gutterBottom>
                        Номер поезда
                      </Typography>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          value={editedWorkLog?.trainNumbers[0] || ''}
                          onChange={(e) =>
                            setEditedWorkLog((prev) =>
                              prev ? { ...prev, trainNumber: e.target.value } : null,
                            )
                          }
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.8)',
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="h5" fontWeight={700} color="#d84315">
                          №{workLog.trainNumbers[0]}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box>
                      <Typography variant="subtitle2" color="#bf360c" fontWeight={600} gutterBottom>
                        Номера вагонов
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="#d84315">
                        {workLog.carriages.map((item) => item.number).join(', ')}
                      </Typography>

                      {/* {isEditing ? (
                        <FormControl fullWidth size="small">
                          <Select
                            // value={editedWorkLog?.carriageType || ''}
                            onChange={(e) =>
                              setEditedWorkLog((prev) =>
                                prev ? { ...prev, carriageType: e.target.value } : null,
                              )
                            }
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255,255,255,0.8)',
                              },
                            }}
                          >
                            {carriageTypes.map((item, index) => (
                              <MenuItem key={`carriagetype-${index}`} value={item}>
                                {item}
                              </MenuItem>
                            ))}

                          </Select>
                        </FormControl>
                      ) : (
                        <Typography variant="body1" fontWeight={600} color="#d84315">
                        </Typography>
                      )} */}
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    {/* <Box>
                      <Typography variant="subtitle2" color="#bf360c" fontWeight={600} gutterBottom>
                        Номер вагона
                      </Typography>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          value={editedWorkLog?.carriageNumber || ''}
                          onChange={(e) =>
                            setEditedWorkLog((prev) =>
                              prev ? { ...prev, carriageNumber: e.target.value } : null,
                            )
                          }
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.8)',
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="h5" fontWeight={700} color="#d84315">
                          №{workLog.carriageNumber}
                        </Typography>
                      )}
                    </Box> */}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Информация об оборудовании */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Box className="info-item">
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Установленное оборудование
                  </Typography>
                  {workLog.equipmentDetails && workLog.equipmentDetails.length > 0 ? (
                    <Box>
                      {workLog.equipmentDetails.map((equipment) => (
                        <Card key={equipment.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                          <CardContent sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Тип оборудования
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {equipment.deviceType}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Количество
                                </Typography>
                                <Typography variant="body1">{equipment.quantity} ед.</Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Серийный номер
                                </Typography>
                                <Typography variant="body1">
                                  {equipment.serialNumber || 'Не указан'}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="textSecondary">
                                  MAC-адрес
                                </Typography>
                                <Typography variant="body1">
                                  {equipment.macAddress || 'Не указан'}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Тип работы
                                </Typography>
                                <Typography variant="body1">
                                  {equipment.typeWork || 'Не указан'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      ))}
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Общее количество оборудования: {workLog.countEquipment} ед.
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    // Fallback для старого формата данных
                    <Box>
                      <Card sx={{ border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="subtitle2" color="textSecondary">
                                Тип оборудования
                              </Typography>
                              {/* {isEditing ? (
                                <TextField
                                  fullWidth
                                  value={editedWorkLog?.equipmentType || ''}
                                  onChange={(e) =>
                                    setEditedWorkLog((prev) =>
                                      prev ? { ...prev, equipmentType: e.target.value } : null,
                                    )
                                  }
                                  size="small"
                                />
                              ) : (
                                <Typography variant="body1">{workLog.equipmentType}</Typography>
                              )} */}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="subtitle2" color="textSecondary">
                                Количество
                              </Typography>
                              <Typography variant="body1">{workLog.countEquipment} ед.</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="subtitle2" color="textSecondary">
                                Серийный номер
                              </Typography>
                              {/* {isEditing ? (
                                <TextField
                                  fullWidth
                                  value={editedWorkLog?.serialNumber || ''}
                                  onChange={(e) =>
                                    setEditedWorkLog((prev) =>
                                      prev ? { ...prev, serialNumber: e.target.value } : null,
                                    )
                                  }
                                  size="small"
                                />
                              ) : (
                                <Typography variant="body1">{workLog.serialNumber}</Typography>
                              )} */}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="subtitle2" color="textSecondary">
                                MAC-адрес
                              </Typography>
                              {/* {isEditing ? (
                                <TextField
                                  fullWidth
                                  value={editedWorkLog?.macAddress || ''}
                                  onChange={(e) =>
                                    setEditedWorkLog((prev) =>
                                      prev ? { ...prev, macAddress: e.target.value } : null,
                                    )
                                  }
                                  size="small"
                                />
                              ) : (
                                <Typography variant="body1">{workLog.macAddress}</Typography>
                              )} */}
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box className="info-item">
                  <Typography variant="subtitle2" color="textSecondary">
                    Выполненная работа
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={editedWorkLog?.completedJob || ''}
                      onChange={(e) =>
                        setEditedWorkLog((prev) =>
                          prev ? { ...prev, completedJob: e.target.value } : null,
                        )
                      }
                      placeholder="Описание выполненной работы..."
                    />
                  ) : (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {workLog.completedJob || 'Работа еще не выполнена'}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Фотографии */}
          {(() => {
            // const photos = Object.entries(workLog.photo)
            //   .filter(([, url]) => url)
            //   .map(([key, url]) => ({ key, url: url! }));

            return (
              photos.length > 0 && (
                <Paper className="detail-section" elevation={2}>
                  <Typography variant="h6" className="section-title" gutterBottom>
                    <PhotoCameraIcon sx={{ mr: 1 }} />
                    Фотографии ({photos.length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    {photos.map(({ label, url }, index) => (
                      <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                        <Card
                          className="photo-card"
                          onClick={() =>
                            handlePhotoClick(
                              typeof url === 'string'
                                ? getFullPhotoUrl(url)
                                : getFullPhotoUrl(url[0]),
                            )
                          }
                          sx={{ cursor: 'pointer' }}
                        >
                          <CardMedia
                            component="img"
                            height="120"
                            image={getFullPhotoUrl(Array.isArray(url) ? url[0] : url)}
                            alt={label}
                            sx={{ objectFit: 'cover' }}
                          />
                          <CardContent sx={{ p: 1 }}>
                            <Typography variant="caption" color="textSecondary">
                              {label}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )
            );
          })()}
        </Grid>

        {/* Боковая панель */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Информация о пользователе */}
          <Paper className="detail-section" elevation={2}>
            <Typography variant="h6" className="section-title" gutterBottom>
              <PersonIcon sx={{ mr: 1 }} />
              Исполнитель
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar className="user-avatar">{workLog.user.name.charAt(0).toUpperCase()}</Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {workLog.user.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {workLog.user.role}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Роль
              </Typography>
              <Typography variant="body1">{workLog.user.role}</Typography>
            </Box>
          </Paper>

          {/* Дополнительная информация */}
          <Paper className="detail-section" elevation={2}>
            <Typography variant="h6" className="section-title" gutterBottom>
              <ScheduleIcon sx={{ mr: 1 }} />
              Дополнительная информация
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box className="info-item">
              <Typography variant="subtitle2" color="textSecondary">
                Дата заявки
              </Typography>
              <Typography variant="body1">
                {new Date(workLog.createdAt).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>

            <Box className="info-item">
              <Typography variant="subtitle2" color="textSecondary">
                Количество оборудования
              </Typography>
              <Typography variant="body1">{workLog.countEquipment}</Typography>
            </Box>

            <Box className="info-item">
              <Typography variant="subtitle2" color="textSecondary">
                Статус
              </Typography>
              <Chip
                label={workLog.completedJob ? 'Выполнено' : 'В работе'}
                color={workLog.completedJob ? 'success' : 'warning'}
                size="small"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Диалог просмотра фото */}
      <Dialog
        open={photoDialogOpen}
        onClose={() => setPhotoDialogOpen(false)}
        maxWidth="md"
        fullWidth
        className="photo-dialog"
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <VisibilityIcon />
            Просмотр фотографии
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPhoto && (
            <Box textAlign="center">
              <img
                src={getFullPhotoUrl(selectedPhoto)}
                alt="Увеличенное фото"
                className="photo-dialog-image"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
