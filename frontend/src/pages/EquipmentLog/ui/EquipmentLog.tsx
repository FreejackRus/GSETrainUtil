import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  TableBody,
  TableContainer,
  TableCell,
  TableRow,
  Table,
  TableHead,
  Grid,
  TextField,
  InputAdornment,
  TableSortLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { deviceApi, type Device } from '../../../entities';
import {useEffect, useMemo, useState} from 'react';

type ColumnKey =
    | 'status'
    | 'name'
    | 'snNumber'
    | 'mac'
    | 'lastService'
    | 'carriageType'
    | 'carriageNumber'
    | 'trainNumber';

export const EquipmentLog = () => {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState<Device[]>([]);
  const [filteredList, setFilteredList] = useState<Device[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState<ColumnKey>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const collator = useMemo(
      () => new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }),
      []
  );

  const getCellValue = (item: Device, key: ColumnKey) => {
    switch (key) {
      case 'status':
        return item.carriageNumber ? 'Установлено' : 'Не установлено';
      case 'lastService':
        return item.lastService ? new Date(item.lastService).getTime() : 0;
      default:
        return (item as any)[key] ?? '';
    }
  };

  const handleRequestSort = (property: ColumnKey) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedList = useMemo(() => {
    const arr = [...filteredList];
    arr.sort((a, b) => {
      const va = getCellValue(a, orderBy);
      const vb = getCellValue(b, orderBy);

      if (typeof va === 'number' && typeof vb === 'number') {
        return order === 'asc' ? va - vb : vb - va;
      }

      const res = collator.compare(String(va), String(vb));
      return order === 'asc' ? res : -res;
    });
    return arr;
  }, [filteredList, order, orderBy, collator]);

  useEffect(() => {
    const fetchDeviceCount = async () => {
      try {
        const response = await deviceApi.getDevices();
        if (response?.data && Array.isArray(response.data)) {
          setEquipmentList(response.data);
          setFilteredList(response.data); // сразу показываем все
        } else {
          console.warn('Неожиданная структура данных:', response);
          setEquipmentList([]);
          setFilteredList([]);
        }
      } catch (error) {
        console.error('Error fetching device count:', error);
        setEquipmentList([]);
        setFilteredList([]);
      }
    };
    fetchDeviceCount();
  }, []);

  const handleRefresh = async () => {
    try {
      const response = await deviceApi.getDevices();
      if (response?.data && Array.isArray(response.data)) {
        setEquipmentList(response.data);
        setFilteredList(response.data);
      } else {
        console.warn('Неожиданная структура данных:', response);
        setEquipmentList([]);
        setFilteredList([]);
      }
    } catch (error) {
      console.error('Error fetching device count:', error);
      setEquipmentList([]);
      setFilteredList([]);
    }
  };

  // Фильтрация по любому полю
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredList(equipmentList);
      return;
    }

    const lowerTerm = searchTerm.toLowerCase();
    const filtered = equipmentList.filter((item) =>
      Object.values(item).some((val) => val?.toString().toLowerCase().includes(lowerTerm)),
    );

    setFilteredList(filtered);
  }, [searchTerm, equipmentList]);

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
                    Журнал всего оборудования
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

            {/* Таблица оборудования */}
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Поиск по оборудованию"
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
                placeholder="Введите название, серийный номер, MAC..."
              />
            </Grid>
          </Grid>
        </Paper>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={orderBy === 'status' ? order : false}>
                  <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => handleRequestSort('status')}
                  >
                    Статус
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 'name' ? order : false}>
                  <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleRequestSort('name')}
                  >
                    Название
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 'snNumber' ? order : false}>
                  <TableSortLabel
                      active={orderBy === 'snNumber'}
                      direction={orderBy === 'snNumber' ? order : 'asc'}
                      onClick={() => handleRequestSort('snNumber')}
                  >
                    Серийный номер
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 'mac' ? order : false}>
                  <TableSortLabel
                      active={orderBy === 'mac'}
                      direction={orderBy === 'mac' ? order : 'asc'}
                      onClick={() => handleRequestSort('mac')}
                  >
                    MAC
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 'lastService' ? order : false}>
                  <TableSortLabel
                      active={orderBy === 'lastService'}
                      direction={orderBy === 'lastService' ? order : 'asc'}
                      onClick={() => handleRequestSort('lastService')}
                  >
                    Последнее обслуживание
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 'carriageType' ? order : false}>
                  <TableSortLabel
                      active={orderBy === 'carriageType'}
                      direction={orderBy === 'carriageType' ? order : 'asc'}
                      onClick={() => handleRequestSort('carriageType')}
                  >
                    Тип вагона
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 'carriageNumber' ? order : false}>
                  <TableSortLabel
                      active={orderBy === 'carriageNumber'}
                      direction={orderBy === 'carriageNumber' ? order : 'asc'}
                      onClick={() => handleRequestSort('carriageNumber')}
                  >
                    Номер вагона
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 'trainNumber' ? order : false}>
                  <TableSortLabel
                      active={orderBy === 'trainNumber'}
                      direction={orderBy === 'trainNumber' ? order : 'asc'}
                      onClick={() => handleRequestSort('trainNumber')}
                  >
                    Номер поезда
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedList?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.carriageNumber ? 'Установлено' : 'Не установлено'}</TableCell>
                  <TableCell>{item.name || '-'}</TableCell>
                  <TableCell>{item.snNumber || '-'}</TableCell>
                  <TableCell>{item.mac || '-'}</TableCell>
                  <TableCell>{new Date(item.lastService).toLocaleString() || '-'}</TableCell>
                  <TableCell>{item.carriageType || '-'}</TableCell>
                  <TableCell>{item.carriageNumber || '-'}</TableCell>
                  <TableCell>{item.trainNumber || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};
