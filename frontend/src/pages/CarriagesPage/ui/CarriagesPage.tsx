import React, { useState, useEffect, useCallback } from 'react';

// Add DevicesIcon import at the top of the file
import { Devices as DevicesIcon } from '@mui/icons-material';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Train as TrainIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { carriageApi } from '../../../entities/carriage/api/carriageApi';
import './CarriagesPage.css';

// Локальные типы для компонента
interface CarriageEquipment {
  id: number;
  type: string;
  status: string;
  snNumber?: string;
  mac?: string;
  lastService: string;
  photo?: string;
}

interface Carriage {
  carriageNumber: string;
  carriageType: string;
  equipment: CarriageEquipment[];
}

export const CarriagesPage = () => {
  const navigate = useNavigate();
  const [carriages, setCarriages] = useState<Carriage[]>([]);
  const [filteredCarriages, setFilteredCarriages] = useState<Carriage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'installed' | 'not_installed' | 'partial'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const fetchCarriages = async () => {
      try {
        setLoading(true);
        const response = await carriageApi.getCarriages();
        console.log('Carriages API response:', response); // Для отладки
        if (response.success && response.data) {
          setCarriages(response.data);
          setFilteredCarriages(response.data);
        } else {
          setError('Ошибка при загрузке данных о вагонах');
        }
      } catch (err) {
        console.error('Error fetching carriages:', err);
        setError('Ошибка при загрузке данных о вагонах');
      } finally {
        setLoading(false);
      }
    };

    fetchCarriages();
  }, []);

  // Вспомогательные функции (объявляем до useEffect)
  const isEquipmentInstalled = useCallback((status: string): boolean => {
    if (!status) return false;
    const installedStatuses = ['installed', 'установлено', 'active', 'активен', 'ok'];
    return installedStatuses.includes(status.toLowerCase());
  }, []);

  // Получаем статус вагона на основе статуса оборудования
  const getCarriageStatus = useCallback(
    (carriage: Carriage): 'installed' | 'not_installed' | 'partial' => {
      if (!carriage.equipment || carriage.equipment.length === 0) {
        return 'not_installed';
      }

      const installedEquipment = carriage.equipment.filter((eq) => isEquipmentInstalled(eq.status));

      if (installedEquipment.length === 0) {
        return 'not_installed';
      } else if (installedEquipment.length === carriage.equipment.length) {
        return 'installed';
      } else {
        return 'partial';
      }
    },
    [isEquipmentInstalled],
  );

  // Фильтрация и поиск
  useEffect(() => {
    let filtered = carriages;

    // Фильтрация по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter((carriage) => {
        const status = getCarriageStatus(carriage);
        return status === statusFilter;
      });
    }

    // Поиск по номеру вагона, MAC-адресу и серийному номеру
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((carriage) => {
        // Поиск по номеру вагона
        if (
          carriage.carriageNumber &&
          carriage.carriageNumber.toLowerCase().includes(searchLower)
        ) {
          return true;
        }

        // Поиск по оборудованию
        return (
          carriage.equipment &&
          carriage.equipment.some((equipment) => {
            // Поиск по серийному номеру
            if (equipment.snNumber && equipment.snNumber.toLowerCase().includes(searchLower)) {
              return true;
            }

            // Поиск по MAC-адресу только для точек доступа и маршрутизаторов
            if (
              equipment.mac &&
              equipment.type &&
              (equipment.type.toLowerCase().includes('точка доступа') ||
                equipment.type.toLowerCase().includes('маршрутизатор') ||
                equipment.type.toLowerCase().includes('router') ||
                equipment.type.toLowerCase().includes('access point')) &&
              equipment.mac.toLowerCase().includes(searchLower)
            ) {
              return true;
            }

            return false;
          })
        );
      });
    }

    setFilteredCarriages(filtered);
  }, [carriages, statusFilter, searchTerm, getCarriageStatus]);

  const getEquipmentStatusColor = (status: string) => {
    if (isEquipmentInstalled(status)) {
      return 'success'; // Зеленый для установленного
    } else {
      return 'error'; // Красный для не установленного
    }
  };

  const getEquipmentStatusLabel = (status: string) => {
    if (isEquipmentInstalled(status)) {
      return 'Установлено';
    } else {
      return 'Не установлено';
    }
  };

  // Проверяем, есть ли в вагоне неустановленное оборудование
  const hasNotInstalledEquipment = (carriage: Carriage): boolean => {
    return carriage.equipment.some((eq) => !isEquipmentInstalled(eq.status));
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as 'all' | 'installed' | 'not_installed' | 'partial');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" className="carriages-page">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" className="carriages-page">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const installedCount = carriages.reduce(
    (total, carriage) =>
      total + carriage.equipment.filter((eq) => isEquipmentInstalled(eq.status)).length,
    0,
  );

  const notInstalledCount = carriages.reduce(
    (total, carriage) =>
      total + carriage.equipment.filter((eq) => !isEquipmentInstalled(eq.status)).length,
    0,
  );

  return (
    <Container maxWidth="xl" className="carriages-page">
      <Box>
        {/* Заголовок страницы */}
        <Paper elevation={6} className="carriages-page__header">
          <Box className="carriages-page__header-content">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              variant="contained"
              sx={{
                mr: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
              }}
            >
              Назад
            </Button>
            <Avatar className="carriages-page__header-avatar">
              <TrainIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box className="carriages-page__header-text">
              <Typography variant="h3" component="h1" className="carriages-page__title">
                Вагоны
              </Typography>
              <Typography variant="h6" className="carriages-page__subtitle">
                Просмотр списка вагонов и установленного в них оборудования
              </Typography>
              <Chip
                label={`Всего вагонов: ${carriages.length}`}
                color="primary"
                size="small"
                className="carriages-page__status-chip"
              />
            </Box>
          </Box>
        </Paper>

        {/* Статистика */}
        <Grid container spacing={3} className="carriages-page__stats">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={4}>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Всего вагонов
                </Typography>
                <Typography variant="h4">{carriages.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={4}>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Всего оборудования
                </Typography>
                <Typography variant="h4">
                  {carriages.reduce((total, carriage) => total + carriage.equipment.length, 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={4}>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  Установлено
                </Typography>
                <Typography variant="h4">{installedCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={4}>
              <CardContent>
                <Typography variant="h6" color="error.main">
                  Не установлено
                </Typography>
                <Typography variant="h4">{notInstalledCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Панель управления */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Поиск по номеру вагона, MAC-адресу или серийному номеру"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Введите номер вагона, MAC-адрес или серийный номер..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Фильтр по статусу</InputLabel>
                <Select
                  value={statusFilter}
                  label="Фильтр по статусу"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="all">Все вагоны</MenuItem>
                  <MenuItem value="installed">Полностью установлено</MenuItem>
                  <MenuItem value="partial">Частично установлено</MenuItem>
                  <MenuItem value="not_installed">Не установлено</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" justifyContent="flex-end">
                <Typography variant="body2" color="text.secondary">
                  {filteredCarriages.length} из {carriages.length}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Список вагонов */}
        <Paper elevation={4} className="carriages-page__content">
          <Box className="carriages-page__content-header">
            <Typography variant="h5" className="carriages-page__content-title">
              Список вагонов ({filteredCarriages.length})
            </Typography>
          </Box>

          {filteredCarriages.map((carriage) => (
            <Accordion
              key={carriage.carriageNumber}
              className="carriages-page__accordion"
              sx={{
                backgroundColor: hasNotInstalledEquipment(carriage) ? '#ffebee' : 'inherit',
                '&:before': {
                  backgroundColor: hasNotInstalledEquipment(carriage)
                    ? '#ffcdd2'
                    : 'rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className="carriages-page__accordion-summary"
              >
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <Avatar
                    sx={{
                      backgroundColor: hasNotInstalledEquipment(carriage)
                        ? '#f44336'
                        : 'primary.main',
                    }}
                  >
                    <TrainIcon />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6">Вагон № {carriage.carriageNumber}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Тип: {carriage.carriageType} • Оборудования: {carriage.equipment.length}
                    </Typography>
                  </Box>
                  <Box display="flex" flexWrap={'wrap'} gap={1}>
                    <Chip label={`${carriage.equipment.length} ед.`} color="primary" size="small" />
                    {hasNotInstalledEquipment(carriage) && (
                      <Chip label="Требует внимания" color="error" size="small" />
                    )}
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Тип оборудования</TableCell>
                        <TableCell>Серийный номер</TableCell>
                        <TableCell>MAC адрес</TableCell>
                        <TableCell>Статус установки</TableCell>
                        <TableCell>Последнее обслуживание</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {carriage.equipment.map((equipment) => (
                        <TableRow key={equipment.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <DevicesIcon color="primary" />
                              {equipment.type}
                            </Box>
                          </TableCell>
                          <TableCell>{equipment.snNumber || 'Не указан'}</TableCell>
                          <TableCell>{equipment.mac || 'Не указан'}</TableCell>
                          <TableCell>
                            <Chip
                              label={getEquipmentStatusLabel(equipment.status)}
                              color={getEquipmentStatusColor(equipment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDate(equipment.lastService)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      </Box>
    </Container>
  );
};
