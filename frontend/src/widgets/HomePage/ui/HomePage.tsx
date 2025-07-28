import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Fade,
  useMediaQuery,
  Card,
  CardContent,
  Avatar,
  Chip
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  DevicesOther as DevicesIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Train as TrainIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Button as CustomButton } from "../../../shared/ui";
import { Button } from "@mui/material";
import { deviceApi } from '../../../entities/device';
import './HomePage.css';

export const HomePage = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const [deviceCount, setDeviceCount] = useState(0);

  useEffect(() => {
    const fetchDeviceCount = async () => {
      try {
        const response = await deviceApi.getDevices();
        // Безопасная проверка структуры данных
        if (response && response.data && response.data.devices && Array.isArray(response.data.devices)) {
          setDeviceCount(response.data.devices.length);
        } else if (response && response.devices && Array.isArray(response.devices)) {
          setDeviceCount(response.devices.length);
        } else {
          console.warn('Неожиданная структура данных:', response);
          setDeviceCount(0);
        }
      } catch (error) {
        console.error('Error fetching device count:', error);
        setDeviceCount(0);
      }
    };

    fetchDeviceCount();
  }, []);

  const handleUserManagement = () => {
    navigate('/admin');
  };

  const handleCarriages = () => {
    navigate('/carriages');
  };

  const handleWorkLog = () => {
    navigate('/work-log');
  };

  const handleRefresh = async () => {
    try {
      const response = await deviceApi.getDevices();
      // Безопасная проверка структуры данных
      if (response && response.data && response.data.devices && Array.isArray(response.data.devices)) {
        setDeviceCount(response.data.devices.length);
      } else if (response && response.devices && Array.isArray(response.devices)) {
        setDeviceCount(response.devices.length);
      } else {
        console.warn('Неожиданная структура данных:', response);
        setDeviceCount(0);
      }
      console.log('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      setDeviceCount(0);
    }
  };

  return (
    <Container maxWidth="xl" className="home-page">
      <Fade in timeout={800}>
        <Box>
          {/* Заголовок страницы */}
          <Paper elevation={6} className="home-page__header">
            <Box className="home-page__header-content">
              <Avatar className="home-page__header-avatar">
                <DashboardIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box className="home-page__header-text">
                <Typography 
                  variant={isMobile ? "h4" : "h3"} 
                  component="h1" 
                  className="home-page__title"
                >
                  Панель администратора
                </Typography>
                <Typography 
                  variant={isMobile ? "body1" : "h6"} 
                  className="home-page__subtitle"
                >
                  Управление системой технического обслуживания
                </Typography>
                <Chip 
                  label="Активна" 
                  color="success" 
                  size="small" 
                  className="home-page__status-chip"
                />
              </Box>
            </Box>
          </Paper>

          {/* Статистические карточки */}
          <Grid container spacing={{ xs: 2, md: 3 }} className="home-page__stats">
            <Grid item xs={12} sm={6} md={4}>
              <Card
                elevation={4}
                className="home-page__stat-card home-page__stat-card--analytics"
              >
                <CardContent className="home-page__stat-content">
                  <Avatar className="home-page__stat-avatar home-page__stat-avatar--analytics">
                    <TrendingUpIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box className="home-page__stat-info">
                    <Typography 
                      variant="h6" 
                      className="home-page__stat-title"
                    >
                      Аналитика
                    </Typography>
                    <Typography 
                      variant="body2" 
                      className="home-page__stat-description"
                    >
                      Статистика и отчеты
                    </Typography>
                    <Typography 
                      variant="h4" 
                      className="home-page__stat-number"
                    >
                      24
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card
                elevation={4}
                className="home-page__stat-card home-page__stat-card--settings"
              >
                <CardContent className="home-page__stat-content">
                  <Avatar className="home-page__stat-avatar home-page__stat-avatar--settings">
                    <SecurityIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box className="home-page__stat-info">
                    <Typography 
                      variant="h6" 
                      className="home-page__stat-title"
                    >
                      Безопасность
                    </Typography>
                    <Typography 
                      variant="body2" 
                      className="home-page__stat-description"
                    >
                      Конфигурация системы
                    </Typography>
                    <Typography 
                      variant="h4" 
                      className="home-page__stat-number"
                    >
                      98%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={12} md={4}>
              <Card
                elevation={4}
                className="home-page__stat-card home-page__stat-card--monitoring"
              >
                <CardContent className="home-page__stat-content">
                  <Avatar className="home-page__stat-avatar home-page__stat-avatar--monitoring">
                    <DevicesIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box className="home-page__stat-info">
                    <Typography 
                      variant="h6" 
                      className="home-page__stat-title"
                    >
                      Устройства
                    </Typography>
                    <Typography 
                      variant="body2" 
                      className="home-page__stat-description"
                    >
                      Активные подключения
                    </Typography>
                    <Typography 
                      variant="h4" 
                      className="home-page__stat-number"
                    >
                      {deviceCount}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Основной контент */}
          <Paper elevation={4} className="home-page__content">
            <Box className="home-page__content-header">
              <Box className="home-page__content-title-section">
                <Avatar className="home-page__content-avatar">
                  <TrainIcon />
                </Avatar>
                <Typography 
                  variant="h5" 
                  className="home-page__content-title"
                >
                  Управление системой
                </Typography>
              </Box>
              <Box className="home-page__button-container">
                <Button 
                  startIcon={<PeopleIcon />}
                  variant="contained"
                  color="secondary"
                  className="home-page__user-management-button"
                  onClick={handleUserManagement}
                  sx={{ mr: 2 }}
                >
                  Управление пользователями
                </Button>
                <Button 
                  startIcon={<RefreshIcon />}
                  variant="contained"
                  className="home-page__refresh-button"
                  onClick={handleRefresh}
                >
                  Обновить данные
                </Button>
              </Box>
            </Box>
            
            {/* Новые кнопки для вагонов и журнала работ */}
            <Box className="home-page__main-actions">
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card
                    elevation={4}
                    className="home-page__action-card home-page__action-card--carriages"
                    onClick={handleCarriages}
                    sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}
                  >
                    <CardContent className="home-page__action-content">
                      <Avatar className="home-page__action-avatar home-page__action-avatar--carriages">
                        <TrainIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box className="home-page__action-info">
                        <Typography 
                          variant="h5" 
                          className="home-page__action-title"
                        >
                          Просмотр вагонов
                        </Typography>
                        <Typography 
                          variant="body1" 
                          className="home-page__action-description"
                        >
                          Просмотр списка вагонов и установленного в них оборудования
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card
                    elevation={4}
                    className="home-page__action-card home-page__action-card--worklog"
                    onClick={handleWorkLog}
                    sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}
                  >
                    <CardContent className="home-page__action-content">
                      <Avatar className="home-page__action-avatar home-page__action-avatar--worklog">
                        <AssignmentIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box className="home-page__action-info">
                        <Typography 
                          variant="h5" 
                          className="home-page__action-title"
                        >
                          Журнал работ
                        </Typography>
                        <Typography 
                          variant="body1" 
                          className="home-page__action-description"
                        >
                          История выполненных технических работ и обслуживания
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
};
