import React, { useState } from "react";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  IconButton, 
  InputAdornment, 
  Paper,
  Container,
  Fade,
  useTheme,
  Divider
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff,
  Login as LoginIcon,
  Person as PersonIcon,
  Lock as LockIcon
} from "@mui/icons-material";
import "./LoginForm.css";

export const LoginForm = ({ onLogin }: { onLogin: (token: string, role: string) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch("http://localhost:3000/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: username,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Декодируем токен для получения роли
        const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
        onLogin(data.token, tokenPayload.role);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Неверный логин или пароль");
      }
    } catch (error) {
      setError("Ошибка подключения к серверу");
    }
  };

  return (
    <Box className="login-form-main-container">
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={24}
            className="login-form-paper"
          >
            {/* Логотип и заголовок */}
            <Box className="login-form-header">
              <Box className="login-form-logo-container">
                <img 
                  src="/logo_peremena.png" 
                  alt="PEREMENA" 
                  className="login-form-logo"
                />
              </Box>
              <Typography 
                variant="h4" 
                component="h1"
                className="login-form-title"
                sx={{ color: theme.palette.primary.dark }}
              >
                ГрандСервисЭкспресс
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                className="login-form-subtitle"
              >
                ТехноАРМ
              </Typography>
              <Divider className="login-form-divider" />
              <Typography 
                variant="body1" 
                color="text.secondary"
                className="login-form-description"
              >
                Войдите в систему для продолжения работы
              </Typography>
            </Box>

            {/* Форма входа */}
            <form onSubmit={handleSubmit}>
              <TextField
                label="Логин"
                placeholder="Введите логин"
                variant="outlined"
                fullWidth
                margin="normal"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                className="login-form-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                label="Пароль"
                placeholder="Введите пароль"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="login-form-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              {error && (
                <Typography 
                  color="error" 
                  variant="body2" 
                  className="login-form-error"
                >
                  {error}
                </Typography>
              )}
              
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                size="large"
                startIcon={<LoginIcon />}
                className="login-form-submit-button"
                sx={{ 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  },
                }}
              >
                Войти в систему
              </Button>
            </form>

            {/* Подсказка для тестирования */}
            <Box 
              className="login-form-test-hint"
              sx={{ 
                border: `1px solid ${theme.palette.primary.light}`,
              }}
            >
              <Typography 
                variant="caption" 
                color="text.secondary"
                className="login-form-test-hint-title"
              >
                Для тестирования используйте:
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                className="login-form-test-hint-text"
              >
                Администратор: admin / admin
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                className="login-form-test-hint-text"
              >
                Инженер: engineer / engineer
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};
