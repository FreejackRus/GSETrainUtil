import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete
} from '@mui/material';
import {
  Archive as ArchiveIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
  DateRange as DateRangeIcon,
  List as ListIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { archiveApi, StorageInfo, CleanupResult } from '../../../entities/archive';
import { applicationApi } from '../../../entities/application';

interface ApplicationOption {
  id: number;
  label: string;
  applicationNumber: number;
  status: string;
  createdAt: string;
}

export const ArchiveManagement: React.FC = () => {
  const navigate = useNavigate();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Состояние для архивирования заявки
  const [applicationId, setApplicationId] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationOption | null>(null);
  const [applications, setApplications] = useState<ApplicationOption[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  
  // Состояние для архивирования за период
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  
  // Состояние для очистки
  const [cleanupDays, setCleanupDays] = useState<number>(365);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);

  useEffect(() => {
    loadStorageInfo();
    loadApplications();
  }, []);

  const loadStorageInfo = async () => {
    try {
      setLoading(true);
      const info = await archiveApi.getStorageInfo();
      setStorageInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки информации о хранилище');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setLoadingApplications(true);
      const response = await applicationApi.getAll();
      const applicationOptions: ApplicationOption[] = response.map(app => ({
        id: app.id,
        label: `Заявка №${app.applicationNumber} (ID: ${app.id}) - ${app.status}`,
        applicationNumber: app.applicationNumber,
        status: app.status,
        createdAt: app.createdAt
      }));
      setApplications(applicationOptions);
    } catch (err) {
      console.error('Ошибка загрузки заявок:', err);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleDownloadApplicationArchive = async () => {
    const targetId = selectedApplication?.id || (applicationId ? parseInt(applicationId) : null);
    
    if (!targetId) {
      setError('Выберите заявку из списка или введите ID заявки');
      return;
    }

    // Проверяем, существует ли заявка в списке
    const applicationExists = applications.some(app => app.id === targetId);
    if (!applicationExists && applications.length > 0) {
      setError(`Заявка с ID ${targetId} не найдена. Доступные заявки: ${applications.map(app => `ID ${app.id} (№${app.applicationNumber})`).join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await archiveApi.downloadApplicationArchive(targetId);
      setSuccess(`Архив заявки ID ${targetId} успешно скачан`);
      setApplicationId('');
      setSelectedApplication(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при скачивании архива заявки';
      if (errorMessage.includes('не найдена') && applications.length > 0) {
        setError(`${errorMessage}. Доступные заявки: ${applications.map(app => `ID ${app.id} (№${app.applicationNumber})`).join(', ')}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDateRangeArchive = async () => {
    if (!dateFrom || !dateTo) {
      setError('Выберите период для архивирования');
      return;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      setError('Дата начала не может быть больше даты окончания');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await archiveApi.downloadArchiveByDateRange(dateFrom, dateTo);
      setSuccess(`Архив за период ${dateFrom} - ${dateTo} успешно скачан`);
      setDateFrom('');
      setDateTo('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при скачивании архива за период');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const result: CleanupResult = await archiveApi.cleanupOldPhotos(cleanupDays);
      setSuccess(
        `Очистка завершена. Удалено ${result.deletedFiles} файлов, освобождено ${result.freedSpaceFormatted}`
      );
      setCleanupDialogOpen(false);
      // Обновляем информацию о хранилище
      await loadStorageInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при очистке старых фотографий');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Вернуться в главное меню
      </Button>
      
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ArchiveIcon />
        Управление архивами фотографий
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearMessages}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={clearMessages}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Информация о хранилище */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StorageIcon />
                Информация о хранилище
              </Typography>
              
              {loading && !storageInfo ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress />
                </Box>
              ) : storageInfo ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Общий размер:</Typography>
                    <Chip label={storageInfo.sizeFormatted} color="primary" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Количество файлов:</Typography>
                    <Chip label={storageInfo.totalFiles} color="secondary" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Количество папок:</Typography>
                    <Chip label={storageInfo.folders} color="default" size="small" />
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={loadStorageInfo}
                    disabled={loading}
                  >
                    Обновить
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Не удалось загрузить информацию о хранилище
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Архивирование заявки */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DownloadIcon />
                Архивирование заявки
              </Typography>
              
              <Autocomplete
                options={applications}
                getOptionLabel={(option) => option.label}
                value={selectedApplication}
                onChange={(event, newValue) => {
                  setSelectedApplication(newValue);
                  setApplicationId(newValue ? newValue.id.toString() : '');
                }}
                loading={loadingApplications}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Выберите заявку"
                    placeholder="Начните вводить номер заявки или ID"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingApplications ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Или введите ID заявки вручную:
              </Typography>
              
              <TextField
                fullWidth
                label="ID заявки"
                type="number"
                value={applicationId}
                onChange={(e) => {
                  setApplicationId(e.target.value);
                  setSelectedApplication(null);
                }}
                sx={{ mb: 2 }}
                placeholder="Введите ID заявки"
                size="small"
              />
              
              <Button
                variant="contained"
                onClick={handleDownloadApplicationArchive}
                disabled={loading || (!applicationId && !selectedApplication)}
                startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                fullWidth
              >
                Скачать архив заявки
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Список доступных заявок */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ListIcon />
                Доступные заявки
              </Typography>
              
              {loadingApplications ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress />
                </Box>
              ) : applications.length > 0 ? (
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Номер заявки</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Дата создания</TableCell>
                        <TableCell align="center">Действие</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id} hover>
                          <TableCell>{app.id}</TableCell>
                          <TableCell>{app.applicationNumber}</TableCell>
                          <TableCell>
                            <Chip 
                              label={app.status} 
                              size="small"
                              color={app.status === 'completed' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(app.createdAt).toLocaleDateString('ru-RU')}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedApplication(app);
                                setApplicationId(app.id.toString());
                              }}
                              startIcon={<DownloadIcon />}
                            >
                              Выбрать
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Заявки не найдены
                </Typography>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={loadApplications}
                  disabled={loadingApplications}
                >
                  Обновить список
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Архивирование за период */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DateRangeIcon />
                Архивирование за период
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Дата начала"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Дата окончания"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                onClick={handleDownloadDateRangeArchive}
                disabled={loading || !dateFrom || !dateTo}
                startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                fullWidth
              >
                Скачать архив за период
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Очистка старых фотографий */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DeleteIcon />
                Очистка старых фотографий
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Удаление фотографий старше указанного количества дней для освобождения места на диске.
              </Typography>
              
              <Button
                variant="outlined"
                color="warning"
                onClick={() => setCleanupDialogOpen(true)}
                startIcon={<DeleteIcon />}
              >
                Настроить очистку
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Диалог очистки */}
      <Dialog open={cleanupDialogOpen} onClose={() => setCleanupDialogOpen(false)}>
        <DialogTitle>Очистка старых фотографий</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Будут удалены все фотографии старше указанного количества дней.
            Это действие необратимо!
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Удалить фотографии старше</InputLabel>
            <Select
              value={cleanupDays}
              onChange={(e) => setCleanupDays(e.target.value as number)}
              label="Удалить фотографии старше"
            >
              <MenuItem value={30}>30 дней</MenuItem>
              <MenuItem value={90}>90 дней</MenuItem>
              <MenuItem value={180}>180 дней</MenuItem>
              <MenuItem value={365}>1 год</MenuItem>
              <MenuItem value={730}>2 года</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCleanupDialogOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleCleanupPhotos}
            color="warning"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            Очистить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};