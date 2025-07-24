import React, { useState } from "react";
import { Box, Button, TextField, Typography, IconButton, InputAdornment, Paper } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export const LoginForm = ({ onLogin }: { onLogin: (token: string, role: string) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Пример: для теста admin/admin — роль admin, иначе инженер
    if (username === "admin" && password === "admin") {
      const fakeToken = "token123";
      onLogin(fakeToken, "admin");
    } else if (username === "engineer" && password === "engineer") {
      const fakeToken = "token456";
      onLogin(fakeToken, "engineer");
    } else {
      setError("Неверный логин или пароль");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper elevation={3} sx={{ p: 4, minWidth: 320 }}>
        <Box display="flex" justifyContent="center" mb={2}>
          <img src="/logo_peremena.png" alt="PEREMENA" style={{ maxWidth: 180, height: "auto" }} />
        </Box>
        <form onSubmit={handleSubmit}>
          <Typography variant="h5" mb={2}>Вход</Typography>
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
          />
          <TextField
            label="Пароль"
            placeholder="Введите пароль"
            variant="outlined"
            fullWidth
            margin="normal"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    onClick={() => setShowPassword(v => !v)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Войти
          </Button>
        </form>
      </Paper>
    </Box>
  );
};
