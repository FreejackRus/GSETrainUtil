import React from 'react';
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
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Button as CustomButton } from "../../../shared/ui";
import { Button } from "@mui/material";
import { DeviceList } from '../../../features';
import './HomePage.css';

export const HomePage = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

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
                      12
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
                  <DevicesIcon />
                </Avatar>
                <Typography 
                  variant="h5" 
                  className="home-page__content-title"
                >
                  Управление устройствами
                </Typography>
              </Box>
              <Box className="home-page__button-container">
                <Button 
                  startIcon={<RefreshIcon />}
                  variant="contained"
                  className="home-page__refresh-button"
                  onClick={() => {
                    // TODO: Implement refresh functionality
                    console.log('Refresh clicked');
                  }}
                >
                  Обновить данные
                </Button>
              </Box>
            </Box>
            <DeviceList />
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
};
