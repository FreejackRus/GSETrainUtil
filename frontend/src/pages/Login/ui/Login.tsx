import React from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button,
  useMediaQuery,
  Fade
} from '@mui/material';
import { 
  Login as LoginIcon,
  PersonAdd as RegisterIcon 
} from '@mui/icons-material';
import './Login.css';

export const Login = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Box className="login-page">
      {/* Декоративные элементы */}
      <Box className="login-page__decorative-element login-page__decorative-element--top" />
      <Box className="login-page__decorative-element login-page__decorative-element--bottom" />

      <Container className="login-page__container">
        <Fade in timeout={1000}>
          <Paper elevation={24} className="login-page__paper">
            {/* Логотип */}
            <Box className="login-page__logo">
              <img 
                src="/logo_peremena.svg" 
                alt="PEREMENA" 
              />
            </Box>

            {/* Заголовок */}
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              component="h1" 
              className="login-page__title"
            >
              Добро пожаловать
            </Typography>

            <Typography 
              variant="body1" 
              className="login-page__subtitle"
            >
              Система технического обслуживания ГрандСервисЭкспресс
            </Typography>

            {/* Кнопки */}
            <Box className="login-page__buttons">
              <Button
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                className="login-page__button login-page__button--primary"
              >
                Войти
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<RegisterIcon />}
                className="login-page__button login-page__button--secondary"
              >
                Регистрация
              </Button>
            </Box>

            {/* Дополнительная информация */}
            <Box className="login-page__footer">
              <Typography 
                variant="caption" 
                className="login-page__copyright"
              >
                © 2024 ГрандСервисЭкспресс ТехноАРМ
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};