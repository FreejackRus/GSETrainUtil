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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const LoginForm = ({ onLogin }: { onLogin: (token: string, role: string) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    password: ""
  });

  const validateForm = () => {
    const errors = {
      username: "",
      password: ""
    };

    if (!username.trim()) {
      errors.username = "Пожалуйста, введите логин";
    }

    if (!password.trim()) {
      errors.password = "Пожалуйста, введите пароль";
    }

    setValidationErrors(errors);
    return !errors.username && !errors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({ username: "", password: "" });
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
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
    } catch {
      setError("Ошибка подключения к серверу");
    }
  };

  return (
    <Box className="login-form-container">
      <Container maxWidth="sm">
        <Fade in timeout={1000}>
          <Paper elevation={24} className="login-form-paper" sx={{m:"0 auto"}}>
            {/* Логотип и заголовок */}
            <Box className="login-form-header" >
              <Box className="login-form-logo">
                <img src="/logo_peremena.png" alt="PEREMENA" width={160} height={48} />
              </Box>
              <Typography 
                variant="h4" 
                component="h1"
                className="login-form-title"
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
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  if (validationErrors.username) {
                    setValidationErrors(prev => ({ ...prev, username: "" }));
                  }
                }}
                error={!!validationErrors.username}
                helperText={validationErrors.username}
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
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (validationErrors.password) {
                    setValidationErrors(prev => ({ ...prev, password: "" }));
                  }
                }}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
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
                        aria-label="переключить видимость пароля"
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
                className="login-form-submit"
              >
                Войти в систему
              </Button>
            </form>

            {/* Подсказка для тестирования */}
            <Box className="login-form-footer">
              <Typography 
                variant="caption" 
                className="login-form-footer-text"
              >
                Для тестирования используйте:
              </Typography>
              <Typography 
                variant="caption" 
                className="login-form-footer-text"
              >
                Администратор: admin / admin
              </Typography>
              <Typography 
                variant="caption" 
                className="login-form-footer-text"
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