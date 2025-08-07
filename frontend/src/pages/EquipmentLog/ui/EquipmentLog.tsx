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
} from '@mui/material';
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
  const [equipmentList, serEquipmentList] = useState<Device[]>();

  useEffect(() => {
    const fetchDeviceCount = async () => {
      try {
        const response = await deviceApi.getDevices();
        console.log(response);

        // Безопасная проверка структуры данных
        if (response && response.data && Array.isArray(response.data)) {
          serEquipmentList(response.data);
        } else {
          console.warn('Неожиданная структура данных:', response);
          serEquipmentList([]);
        }
      } catch (error) {
        console.error('Error fetching device count:', error);
        serEquipmentList([]);
      }
    };

    fetchDeviceCount();
  }, []);
  const handleRefresh = async () => {
    try {
      const response = await deviceApi.getDevices();
      // Безопасная проверка структуры данных
      if (response && response.data && Array.isArray(response.data)) {
        serEquipmentList(response.data);
      } else {
        console.warn('Неожиданная структура данных:', response);
        serEquipmentList([]);
      }
    } catch (error) {
      console.error('Error fetching device count:', error);
      serEquipmentList([]);
    }
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
                  {equipmentList?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.carriageNumber ? 'Установлено' : 'Не установлено'}
                      </TableCell>
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
        </Paper>
      </Box>
    </Container>
  );
};
