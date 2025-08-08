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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Train as TrainIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { deviceApi, type Device } from '../../../entities';
import { useEffect, useState } from 'react';
export const EquipmentLog = () => {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState<Device[]>([]);
  const [filteredList, setFilteredList] = useState<Device[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
                <TableCell>Статус</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Серийный номер</TableCell>
                <TableCell>MAC</TableCell>
                <TableCell>Последнее обслуживание</TableCell>
                <TableCell>Тип вагона</TableCell>
                <TableCell>Номер вагона</TableCell>
                <TableCell>Номер поезда</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredList?.map((item) => (
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
