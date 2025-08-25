import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  LinearProgress,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Photo as PhotoIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  MoreVert as MoreVertIcon,
  Train as TrainIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { workLogApi } from '../../../entities/worklog';
// import type { WorkLogEntry } from '../../../entities/application/model/types';
import './WorkLogPage.css';
import { apiClient } from '../../../shared';
import {
  formatRussianDate,
  formatRussianDateDocument,
} from '../../../shared/transformation/stringTransform';
import type { WorkLogEntry } from '../../../entities/worklog/model/types';

type SortField = keyof WorkLogEntry | 'none';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'cards' | 'list';
type FilterStatus = 'all' | 'completed' | 'in-progress' | 'started';

interface SortConfig {
  key: SortField;
  direction: SortDirection;
}

export const WorkLogPage = () => {
  const navigate = useNavigate();
  const [workLogEntries, setWorkLogEntries] = useState<WorkLogEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<WorkLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig] = useState<SortConfig>({ key: 'applicationDate', direction: 'desc' });
  const [selectedEntry, setSelectedEntry] = useState<WorkLogEntry | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterWorkType, setFilterWorkType] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  console.log('filteredEntries', filteredEntries);

  useEffect(() => {
    const fetchWorkLog = async () => {
      try {
        setLoading(true);
        const response = await workLogApi.getWorkLog();
        if (response.success) {
          setWorkLogEntries(response.data as unknown as WorkLogEntry[]);
          setFilteredEntries(response.data as unknown as WorkLogEntry[]);
        } else {
          setError('Ошибка при загрузке журнала работ');
        }
      } catch (err) {
        console.error('Error fetching work log:', err);
        setError('Ошибка при загрузке журнала работ');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkLog();
  }, []);

  // Эффект для поиска и фильтрации
  useEffect(() => {
    let filtered = [...workLogEntries];

    // Применяем поиск
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((entry) => {
        // Поиск по номеру заявки
        // if (entry.applicationNumber?.toString().toLowerCase().includes(searchLower)) {
        //   return true;
        // }

        // Поиск по типу работ
        // if (entry.typeWork?.toLowerCase().includes(searchLower)) {
        //   return true;
        // }

        // Поиск по номеру поезда
        if (entry.trainNumbers.map((item) => item.toLowerCase()).includes(searchLower)) {
          return true;
        }

        // Поиск по номеру вагона
        if (entry.carriages.map((item) => item.number.toLowerCase()).includes(searchLower)) {
          return true;
        }

        // Поиск по серийному номеру
        if (entry.serialNumbers.map((item) => item.toLowerCase()).includes(searchLower)) {
          return true;
        }

        // Поиск по MAC-адресу только для точек доступа и маршрутизаторов
        for (const equipment of entry.equipmentDetails) {
          const mac = equipment.macAddress?.toLowerCase();

          if (mac?.includes(searchLower)) {
            return true;
          }
        }

        // Поиск по исполнителю
        if (entry.completedJob?.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Поиск по местоположению
        if (entry.currentLocation?.toLowerCase().includes(searchLower)) {
          return true;
        }

        return false;
      });
    }

    // Применяем фильтр по статусу
    if (filterStatus !== 'all') {
      filtered = filtered.filter((entry) => {
        const status = getEntryStatus(entry);
        return status === filterStatus;
      });
    }

    // Применяем фильтр по типу работ
    if (filterWorkType !== 'all') {
      filtered = filtered.filter((entry) =>
        entry.equipmentDetails?.some((detail) => detail.typeWork === filterWorkType),
      );
    }

    // Применяем сортировку
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof WorkLogEntry];
        let bValue = b[sortConfig.key as keyof WorkLogEntry];

        // Специальная обработка по ключу
        switch (sortConfig.key) {
          case 'createdAt':
            return sortConfig.direction === 'asc'
              ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

          case 'trainNumbers':
            aValue = parseInt(a.trainNumbers?.[0] || '0', 10);
            bValue = parseInt(b.trainNumbers?.[0] || '0', 10);
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;

          case 'carriages':
            aValue = parseInt(a.carriages?.[0]?.number || '0', 10);
            bValue = parseInt(b.carriages?.[0]?.number || '0', 10);
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;

          case 'user':
            aValue = a.user?.name?.toLowerCase() || '';
            bValue = b.user?.name?.toLowerCase() || '';
            return sortConfig.direction === 'asc'
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);

          default:
            // Универсальная строковая сортировка
            aValue = (aValue ?? '').toString().toLowerCase();
            bValue = (bValue ?? '').toString().toLowerCase();
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }
      });
    }

    setFilteredEntries(filtered);
  }, [workLogEntries, searchTerm, sortConfig, filterStatus, filterWorkType]);

  // Функции для определения статуса и цветов
  const getEntryStatus = (entry: WorkLogEntry): FilterStatus => {
    if (entry.equipmentPhoto || entry.equipmentPhotos?.length) return 'completed';
    if (
      entry.serialPhoto ||
      entry.serialPhotos?.length ||
      entry.macPhoto ||
      entry.macPhotos?.length
    ) {
      return 'in-progress';
    }
    return 'started';
  };

  const getStatusText = (entry: WorkLogEntry): string => {
    const status = getEntryStatus(entry);
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'in-progress':
        return 'В работе';
      case 'started':
        return 'Начато';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusColor = (entry: WorkLogEntry): 'success' | 'warning' | 'info' => {
    const status = getEntryStatus(entry);
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'started':
        return 'info';
      default:
        return 'info';
    }
  };

  const getWorkTypeColor = (
    workType: string,
  ): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default' => {
    if (!workType) return 'default';
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

  const getProgressValue = (entry: WorkLogEntry): number => {
    const status = getEntryStatus(entry);
    switch (status) {
      case 'completed':
        return 100;
      case 'in-progress':
        return 60;
      case 'started':
        return 20;
      default:
        return 0;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Не указана';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Неверная дата';
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await workLogApi.getWorkLog();
      if (response.success) {
        setWorkLogEntries(response.data as unknown as WorkLogEntry[]);
        setFilteredEntries(response.data as unknown as WorkLogEntry[]);
      }
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPhotos = (entry: WorkLogEntry) => {
    setSelectedEntry(entry);
    setPhotoDialogOpen(true);
  };

  // const handleDownloadPdf = async (entry: WorkLogEntry, typePdf: string) => {
  //   console.log(entry);
  //   let response;
  //   console.log(typePdf);

  //   try {
  //     if (typePdf === 'Акт монтажа') {
  //       response = await apiClient.post(
  //         '/pdfActInstEquipment',
  //         {
  //           // Если typeWork и applicationNumber есть в equipmentDetails[0], можно взять оттуда
  //           // applicationNumber: entry.id.toString(), // или замени на корректное поле, если нужно
  //           applicationNumber: '__', // или замени на корректное поле, если нужно
  //           equipmentDetails: entry.equipmentDetails
  //             ?.map(({ photos, ...rest }) => rest)
  //             .filter((item) => item.typeWork === 'Монтаж'),

  //           applicationDate: entry.createdAt,
  //           contractNumber: '____________________',
  //         },
  //         {
  //           responseType: 'blob', // Важно: получаем как файл
  //         },
  //       );
  //       const blob = new Blob([response?.data], {
  //         type: 'application/pdf',
  //       });
  //       const url = window.URL.createObjectURL(blob);

  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.download = `Акт монтажа №${entry.id.toString()}.pdf`;
  //       document.body.appendChild(link);
  //       link.click();
  //       link.remove();
  //       window.URL.revokeObjectURL(url);
  //       console.log(response);
  //     } else if (typePdf === 'Акт демонтажа') {
  //       response = await apiClient.post(
  //         '/pdfActDisEquipment',
  //         {
  //           // Если typeWork и applicationNumber есть в equipmentDetails[0], можно взять оттуда
  //           // applicationNumber: entry.id.toString(), // или замени на корректное поле, если нужно
  //           applicationNumber: '__', // или замени на корректное поле, если нужно
  //           equipmentDetails: entry.equipmentDetails
  //             ?.map(({ photos, ...rest }) => rest)
  //             .filter((item) => item.typeWork === 'Демонтаж'),
  //           applicationDate: entry.createdAt,
  //           contractNumber: '____________________',
  //         },
  //         {
  //           responseType: 'blob', // Важно: получаем как файл
  //         },
  //       );
  //       const blob = new Blob([response?.data], {
  //         type: 'application/pdf',
  //       });
  //       const url = window.URL.createObjectURL(blob);

  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.download = `Акт демонтажа №${entry.id.toString()}.pdf`;
  //       document.body.appendChild(link);
  //       link.click();
  //       link.remove();
  //       window.URL.revokeObjectURL(url);
  //       console.log(response);
  //     } else if (typePdf === 'Технический акт') {
  //       response = await apiClient.post(
  //         '/pdfTechnicalActAcceptance',
  //         {
  //           applicationNumber: '__', // или подставь правильное поле
  //           applicationDate: entry.createdAt,
  //           contractNumber: '____________________',
  //           contractDate: '«__».____.____ г.',
  //           equipmentDetails: entry.equipmentDetails?.map(({ photos, ...rest }) => rest),
  //           carriageNumbers: entry.carriages || [],
  //           trainNumber: entry.trainNumbers?.[0] || '',
  //         },
  //         {
  //           responseType: 'blob', // Важно: получаем как файл
  //         },
  //       );
  //       const blob = new Blob([response?.data], {
  //         type: 'application/pdf',
  //       });
  //       const url = window.URL.createObjectURL(blob);

  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.download = `${entry.trainNumbers?.[0]} от ${formatRussianDate(entry.createdAt)}pdf`;

  //       document.body.appendChild(link);
  //       link.click();
  //       link.remove();
  //       window.URL.revokeObjectURL(url);
  //       console.log(response);
  //     } else if (typePdf === 'Заявка') {
  //       response = await apiClient.post(
  //         '/pdfAppWork',
  //         {
  //           // applicationNumber: entry.id.toString(),
  //           applicationNumber: '__',
  //           carriageNumbers: entry.carriages || '',
  //           currentLocation: entry.currentLocation,
  //           equipmentDetails: entry.equipmentDetails,
  //         },
  //         {
  //           responseType: 'blob', // Важно: получаем как файл
  //         },
  //       );
  //       const blob = new Blob([response?.data], {
  //         type: 'application/pdf',
  //       });
  //       const url = window.URL.createObjectURL(blob);

  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.download = `Заявка_№${entry.id.toString()}.pdf`;

  //       document.body.appendChild(link);
  //       link.click();
  //       link.remove();
  //       window.URL.revokeObjectURL(url);
  //     }
  //   } catch {
  //     console.error('Ошибка при скачивании PDF:', error);
  //   }
  // };

  const handleDownloadWord = async (entry: WorkLogEntry, typePdf: string) => {
    console.log(entry);
    let response;
    console.log(typePdf);

    try {
      if (typePdf === 'Акт монтажа') {
        response = await apiClient.post(
          '/wordActInstEquipment',
          {
            // Если typeWork и applicationNumber есть в equipmentDetails[0], можно взять оттуда
            // applicationNumber: entry.id.toString(), // или замени на корректное поле, если нужно
            applicationNumber: '__', // или замени на корректное поле, если нужно
            equipmentDetails: entry.equipmentDetails
              ?.map(({ photos, ...rest }) => rest)
              .filter((item) => item.typeWork === 'Монтаж'),

            applicationDate: entry.createdAt,
            contractNumber: '____________________',
          },
          {
            responseType: 'blob', // Важно: получаем как файл
          },
        );
        const blob = new Blob([response?.data], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `Акт монтажа №${entry.id.toString()}.docx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        console.log(response);
      } else if (typePdf === 'Акт демонтажа') {
        response = await apiClient.post(
          '/wordActDisEquipment',
          {
            // Если typeWork и applicationNumber есть в equipmentDetails[0], можно взять оттуда
            // applicationNumber: entry.id.toString(), // или замени на корректное поле, если нужно
            applicationNumber: '__', // или замени на корректное поле, если нужно
            equipmentDetails: entry.equipmentDetails
              ?.map(({ photos, ...rest }) => rest)
              .filter((item) => item.typeWork === 'Демонтаж'),
            applicationDate: entry.createdAt,
            contractNumber: '____________________',
          },
          {
            responseType: 'blob', // Важно: получаем как файл
          },
        );
        const blob = new Blob([response?.data], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `Акт демонтажа №${entry.id.toString()}.docx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        console.log(response);
      } else if (typePdf === 'Технический акт') {
        response = await apiClient.post(
          '/wordTechnicalActAcceptance',
          {
            applicationNumber: '__', // или подставь правильное поле
            applicationDate: entry.createdAt,
            contractNumber: '____________________',
            contractDate: '«__».____.____ г.',
            equipmentDetails: entry.equipmentDetails?.map(({ photos, ...rest }) => rest),
            carriageNumbers: entry.carriages || [],
            trainNumber: entry.trainNumbers?.[0] || '',
          },
          {
            responseType: 'blob', // Важно: получаем как файл
          },
        );
        const blob = new Blob([response?.data], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${entry.trainNumbers?.[0]} от ${formatRussianDateDocument(
          entry.createdAt,
        )}docx`;

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        console.log(response);
      } else if (typePdf === 'Заявка') {
        response = await apiClient.post(
          '/wordAppWork',
          {
            // applicationNumber: entry.id.toString(),
            applicationNumber: '__',
            carriageNumbers: entry.carriages || '',
            currentLocation: entry.currentLocation,
            equipmentDetails: entry.equipmentDetails,
          },
          {
            responseType: 'blob', // Важно: получаем как файл
          },
        );
        const blob = new Blob([response?.data], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `Заявка_№${entry.id.toString()}.docx`;

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch {
      console.error('Ошибка при скачивании PDF:', error);
    }
  };

  const handleClosePhotoDialog = () => {
    setSelectedEntry(null);
    setPhotoDialogOpen(false);
  };

  const getUniqueWorkTypes = () => {
    const allTypes = workLogEntries
      .flatMap((entry) => entry.equipmentDetails.map((detail) => detail.typeWork))
      .filter(Boolean);

    return Array.from(new Set(allTypes));
  };

  const getPhotoEntries = (photos: WorkLogEntry['photo']) => {
    const photoLabels = {
      carriagePhoto: 'Фото вагона',
      equipmentPhoto: 'Фото оборудования',
      serialPhoto: 'Фото серийного номера',
      macPhoto: 'Фото MAC адреса',
      generalPhoto: 'Общее фото',
      finalPhoto: 'Финальное фото',
    };

    return Object.entries(photos)
      .filter(([, url]) => url)
      .map(([key, url]) => ({
        label: photoLabels[key as keyof typeof photoLabels],
        url: url!,
      }));
  };

  interface PhotoItem {
    label: string;
    url: string;
  }

  // function collectPhotos(entry: WorkLogEntry): PhotoItem[] {
  //   const items: PhotoItem[] = [];
  //
  //   // 1) Общее фото заявки
  //   if (entry.photo) {
  //     items.push({ label: 'Фото заявки', url: `${process.env.VITE_API_STORAGE_PHOTOS_URL}/${entry.photo}` });
  //   }
  //
  //   // 2) Фото вагонов
  //   entry.carriages.forEach((c) => {
  //     if (c.photo) {
  //       items.push({ label: 'Фото вагона', url: `uploads/${c.photo}` });
  //     }
  //   });
  //
  //   // 3) Фото оборудования
  //   entry.equipmentPhotos.forEach((url) => {
  //     items.push({ label: 'Фото оборудования', url: `uploads/${url}` });
  //   });
  //
  //   // 4) Фото серийников
  //   entry.serialPhotos.forEach((url) => {
  //     items.push({ label: 'Фото серийного номера', url: `uploads/${url}` });
  //   });
  //
  //   // 5) Фото MAC-адресов
  //   entry.macPhotos.forEach((url) => {
  //     items.push({ label: 'Фото MAC-адреса', url: `uploads/${url}` });
  //   });
  //
  //   return items;
  // }

  function collectPhotos(entry: WorkLogEntry): PhotoItem[] {
    const items: PhotoItem[] = [];
    const baseUrl = import.meta.env.VITE_API_STORAGE_PHOTOS_URL;

    // 1) Общее фото заявки
    if (entry.photo) {
      items.push({
        label: 'Фото заявки',
        url: `${baseUrl}/${entry.photo}`,
      });
    }

    // 2) Фото вагонов
    entry.carriages.forEach((c) => {
      if (c.photo) {
        items.push({
          label: 'Фото вагона',
          url: `${baseUrl}/${c.photo}`,
        });
      }
    });

    // 3) Фото оборудования
    entry.equipmentPhotos.forEach((p) => {
      items.push({
        label: 'Фото оборудования',
        url: `${baseUrl}/${p}`,
      });
    });

    // 4) Фото серийного номера
    entry.serialPhotos.forEach((p) => {
      items.push({
        label: 'Фото серийного номера',
        url: `${baseUrl}/${p}`,
      });
    });

    // 5) Фото MAC-адреса
    entry.macPhotos.forEach((p) => {
      items.push({
        label: 'Фото MAC-адреса',
        url: `${baseUrl}/${p}`,
      });
    });

    return items;
  }

  const renderWorkLogCard = (entry: WorkLogEntry) => (
    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }} key={entry.id}>
      <Card
        elevation={4}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 8,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Chip
                label={`#${entry.id}`}
                color="primary"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
              {/* <Chip
                sx={{ ml: 2 }}
                // label={entry.typeWork}
                // color={getWorkTypeColor(entry.typeWork)}
                size="small"
                variant="outlined"
              /> */}
            </Box>

            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {entry.typeWork}
          </Typography> */}

          <Box display="flex" alignItems="center" mb={1}>
            <TrainIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Поезд {entry.trainNumbers[0]}, Вагоны{' '}
              {entry.carriages.map((item) => item.number).join(', ')}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {entry.currentLocation || 'Не указано'}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(entry.createdAt)}
            </Typography>
          </Box>

          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Прогресс
              </Typography>
              <Chip label={getStatusText(entry)} color={getStatusColor(entry)} size="small" />
            </Box>
            <LinearProgress
              variant="determinate"
              value={getProgressValue(entry)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/*{entry.equipmentDetails && (*/}
          {/*  <Typography variant="body2" color="text.secondary" mb={1}>*/}
          {/*    <strong>Оборудования:</strong>{' '}*/}
          {/*    {entry.equipmentDetails.map((item) => item.name).join(', ')}*/}
          {/*  </Typography>*/}
          {/*)}*/}

          {entry.completedJob && (
            <Box display="flex" alignItems="center">
              <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {entry.completedJob}
              </Typography>
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box display="flex" width={'100%'} gap={1}>
            <Button
              size="small"
              startIcon={<PhotoIcon />}
              onClick={() => handleViewPhotos(entry)}
              // disabled={!Object.values(entry.photo).some((photo) => photo)}
            >
              {/*Фото ({Object.values(entry.photo).filter((photo) => photo).length})*/}
              Фото
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(`/work-log/${entry.id}`)}
            >
              Подробнее
            </Button>

            <Select
              sx={{ ml: 'auto' }}
              value="Скачать"
              onChange={(e) => handleDownloadWord(entry, e.target.value as string)}
            >
              <MenuItem value="Скачать">Скачать</MenuItem>
              {/* {console.log()} */}
              {entry.equipmentTypes.some((item) => item === 'Демонтаж') && (
                <MenuItem value="Акт демонтажа">Акт демонтажа</MenuItem>
              )}
              {entry.equipmentTypes.some((item) => item === 'Монтаж') && (
                <MenuItem value="Акт монтажа">Акт монтажа</MenuItem>
              )}
              <MenuItem value="Заявка">Заявка</MenuItem>
              <MenuItem value="Технический акт">Технический акт</MenuItem>
            </Select>
          </Box>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderWorkLogList = (entry: WorkLogEntry) => (
    <Paper
      key={entry.id}
      elevation={2}
      sx={{
        mb: 2,
        p: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateX(4px)',
        },
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 2, md: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip label={`#${entry.id}`} color="primary" size="small" sx={{ fontWeight: 'bold' }} />
            <Chip label={getStatusText(entry)} color={getStatusColor(entry)} size="small" />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 3, md: 3 }} sx={{ ml: { xs: 0, sm: 4 } }}>
          {/* <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {entry.typeWork}
          </Typography> */}
          <Typography variant="body2" color="text.secondary">
            Поезд {entry.trainNumbers[0]}, Вагоны{' '}
            {entry.carriages.map((item) => item.number).join(', ')}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <LocationOnIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            {entry.currentLocation || 'Не указано'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            {formatDate(entry.createdAt)}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          {entry.equipmentDetails && (
            <Typography variant="body2" color="text.secondary" noWrap>
              <BuildIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              {entry.equipmentDetails.map((item) => item.name).join(', ')}
            </Typography>
          )}
          {entry.completedJob && (
            <Typography variant="body2" color="text.secondary" noWrap>
              <PersonIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              {entry.completedJob}
            </Typography>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <LinearProgress
              variant="determinate"
              value={getProgressValue(entry)}
              sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary">
              {getProgressValue(entry)}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {/*Фото: {Object.values(entry.photo).filter((photo) => photo).length}*/}
            Фото
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 1 }}>
          <Box display="flex" gap={0.5} width={'100%'}>
            <IconButton
              size="small"
              onClick={() => handleViewPhotos(entry)}
              // disabled={!Object.values(entry.photo).some((photo) => photo)}
            >
              <PhotoIcon />
            </IconButton>
            <IconButton size="small" onClick={() => navigate(`/work-log/${entry.id}`)}>
              <ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />
            </IconButton>
            <Select
              value="Скачать"
              onChange={(e) => handleDownloadWord(entry, e.target.value as string)}
            >
              <MenuItem value="Скачать">Скачать</MenuItem>
              <MenuItem value="Заявка">Заявка</MenuItem>
              <MenuItem value="Акт демонтажа">Акт демонтажа</MenuItem>
              <MenuItem value="Акт монтажа">Акт монтажа</MenuItem>
              <MenuItem value="Технический акт">Технический акт</MenuItem>
            </Select>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" className="work-log-page">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" className="work-log-page">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const stats = {
    total: workLogEntries.length,
    completed: workLogEntries.filter((entry) => getEntryStatus(entry) === 'completed').length,
    inProgress: workLogEntries.filter((entry) => getEntryStatus(entry) === 'in-progress').length,
    started: workLogEntries.filter((entry) => getEntryStatus(entry) === 'started').length,
  };

  return (
    <Container maxWidth="xl" className="work-log-page">
      <Box sx={{ p: { xs: 1.75, sm: 0 } }}>
        {/* Современный заголовок */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            mb: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              p: {
                xs: 1,
                sm: 4,
              },
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center">
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/')}
                  variant="contained"
                  sx={{
                    mr: {
                      xs: 1,
                      sm: 3,
                    },
                    fontSize: {
                      xs: '0.7rem', // на телефонах
                      sm: '0.7rem', // на маленьких экранах
                      md: '1rem', // на планшетах
                      // lg: '3rem', // на больших
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  Назад
                </Button>
                <Avatar
                  sx={{
                    // width: 64,
                    // height: 64,
                    width: {
                      xs: 45,
                      sm: 64,
                    },
                    height: {
                      xs: 45,
                      sm: 64,
                    },
                    mr: {
                      xs: 1,
                      sm: 3,
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: {
                        xs: '0.9rem', // на телефонах
                        sm: '1.5rem', // на маленьких экранах
                        md: '2rem', // на планшетах
                        // lg: '3rem', // на больших
                      },
                    }}
                  >
                    Журнал работ
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      opacity: 0.9,
                      fontSize: {
                        xs: '0.55rem', // на телефонах
                        sm: '0.9rem', // на маленьких экранах
                        md: '1.15rem', // на планшетах
                        // lg: '3rem', // на больших
                      },
                    }}
                  >
                    Управление техническими заявками и мониторинг выполнения работ
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={2}>
                <Tooltip title="Обновить данные">
                  <IconButton
                    onClick={handleRefresh}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Статистические карточки */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 3, sm: 3 }}>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Всего заявок
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 3, sm: 3 }}>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Завершено
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 3, sm: 3 }}>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {stats.inProgress}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    В работе
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 3, sm: 3 }}>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                    {stats.started}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Начато
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Панель управления */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Поиск по номеру вагона, MAC-адресу или серийному номеру"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Введите номер вагона, MAC-адрес или серийный номер..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Статус</InputLabel>
                <Select
                  value={filterStatus}
                  label="Статус"
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                >
                  <MenuItem value="all">Все</MenuItem>
                  <MenuItem value="completed">Завершено</MenuItem>
                  <MenuItem value="in-progress">В работе</MenuItem>
                  <MenuItem value="started">Начато</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Тип работ</InputLabel>
                <Select
                  value={filterWorkType}
                  label="Тип работ"
                  onChange={(e) => setFilterWorkType(e.target.value)}
                >
                  <MenuItem value="all">Все типы</MenuItem>
                  {getUniqueWorkTypes().map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                >
                  <ToggleButton value="cards">
                    <ViewModuleIcon />
                  </ToggleButton>
                  <ToggleButton value="list">
                    <ViewListIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="body2" color="text.secondary">
                  {filteredEntries.length} из {workLogEntries.length}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Контент */}
        {filteredEntries.length === 0 ? (
          <Paper elevation={2} sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Заявки не найдены
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Попробуйте изменить параметры поиска или создать тестовые данные
            </Typography>
          </Paper>
        ) : viewMode === 'cards' ? (
          <Grid container spacing={3}>
            {filteredEntries.map(renderWorkLogCard)}
          </Grid>
        ) : (
          <Box>{filteredEntries.map(renderWorkLogList)}</Box>
        )}

        {/* Диалог просмотра фотографий */}
        <Dialog open={photoDialogOpen} onClose={handleClosePhotoDialog} maxWidth="md" fullWidth>
          <DialogTitle>Фотографии заявки #{selectedEntry?.id}</DialogTitle>
          <DialogContent>
            {/*{selectedEntry && (*/}
            {/*  <Grid container spacing={2}>*/}
            {/*    {getPhotoEntries(selectedEntry.photo).map((photo, index) => (*/}
            {/*      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`photo-${photo.url}-${index}`}>*/}
            {/*        <Card>*/}
            {/*          <CardContent>*/}
            {/*            <Typography variant="subtitle2" gutterBottom>*/}
            {/*              {photo.label}*/}
            {/*            </Typography>*/}
            {/*            <Box*/}
            {/*              component="img"*/}
            {/*              src={photo.url}*/}
            {/*              alt={photo.label}*/}
            {/*              sx={{*/}
            {/*                width: '100%',*/}
            {/*                height: 200,*/}
            {/*                objectFit: 'cover',*/}
            {/*                borderRadius: 1,*/}
            {/*              }}*/}
            {/*            />*/}
            {/*          </CardContent>*/}
            {/*        </Card>*/}
            {/*      </Grid>*/}
            {/*    ))}*/}
            {/*  </Grid>*/}
            {/*)}*/}
            {selectedEntry && (
              <Grid container spacing={2}>
                {collectPhotos(selectedEntry).map((ph, idx) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {ph.label}
                        </Typography>
                        <Box
                          component="img"
                          src={ph.url}
                          alt={ph.label}
                          sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePhotoDialog}>Закрыть</Button>
          </DialogActions>
        </Dialog>

        {/* Меню действий */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <SettingsIcon sx={{ mr: 1 }} />
            Настройки
          </MenuItem>
        </Menu>
      </Box>
    </Container>
  );
};
