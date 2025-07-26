import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Fade,
  Card,
  CardContent,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  Engineering as EngineeringIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import './AdminPanelPage.css';

interface User {
  id: number;
  login: string;
  role: string;
}

interface NewUser {
  login: string;
  password: string;
  role: string;
}

export const AdminPanelPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    login: '',
    password: '',
    role: 'engineer'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleGoBack = () => {
    navigate('/');
  };

  // Загрузка пользователей
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        throw new Error('Ошибка загрузки пользователей');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка загрузки пользователей',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Добавление нового пользователя
  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Пользователь успешно добавлен',
          severity: 'success'
        });
        setOpenDialog(false);
        setNewUser({ login: '', password: '', role: 'engineer' });
        fetchUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка добавления пользователя');
      }
    } catch (error: any) {
      console.error('Ошибка:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Ошибка добавления пользователя',
        severity: 'error'
      });
    }
  };

  // Удаление пользователя
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Пользователь успешно удален',
          severity: 'success'
        });
        fetchUsers();
      } else {
        throw new Error('Ошибка удаления пользователя');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка удаления пользователя',
        severity: 'error'
      });
    }
  };

  // Получение иконки роли
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'engineer':
        return <EngineeringIcon />;
      default:
        return <PersonIcon />;
    }
  };

  // Получение цвета роли
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'engineer':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Получение названия роли
  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'engineer':
        return 'Инженер';
      default:
        return 'Пользователь';
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Container maxWidth="xl" className="admin-panel">
      <Fade in timeout={800}>
        <Box>
          {/* Заголовок страницы */}
          <Paper elevation={6} className="admin-panel__header">
            <Box className="admin-panel__header-content">
              <Button
                startIcon={<ArrowBackIcon />}
                variant="outlined"
                onClick={handleGoBack}
                sx={{ mr: 2 }}
              >
                Назад
              </Button>
              <Avatar className="admin-panel__header-avatar">
                <AdminIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box className="admin-panel__header-text">
                <Typography variant="h3" component="h1" className="admin-panel__title">
                  Управление пользователями
                </Typography>
                <Typography variant="h6" className="admin-panel__subtitle">
                  Добавление и управление инженерами системы
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Статистика */}
          <Grid container spacing={3} className="admin-panel__stats">
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={4} className="admin-panel__stat-card">
                <CardContent className="admin-panel__stat-content">
                  <Avatar className="admin-panel__stat-avatar admin-panel__stat-avatar--total">
                    <PersonIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box className="admin-panel__stat-info">
                    <Typography variant="h6" className="admin-panel__stat-title">
                      Всего пользователей
                    </Typography>
                    <Typography variant="h4" className="admin-panel__stat-number">
                      {users.length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={4} className="admin-panel__stat-card">
                <CardContent className="admin-panel__stat-content">
                  <Avatar className="admin-panel__stat-avatar admin-panel__stat-avatar--engineers">
                    <EngineeringIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box className="admin-panel__stat-info">
                    <Typography variant="h6" className="admin-panel__stat-title">
                      Инженеры
                    </Typography>
                    <Typography variant="h4" className="admin-panel__stat-number">
                      {users.filter(user => user.role === 'engineer').length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={12} md={4}>
              <Card elevation={4} className="admin-panel__stat-card">
                <CardContent className="admin-panel__stat-content">
                  <Avatar className="admin-panel__stat-avatar admin-panel__stat-avatar--admins">
                    <AdminIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box className="admin-panel__stat-info">
                    <Typography variant="h6" className="admin-panel__stat-title">
                      Администраторы
                    </Typography>
                    <Typography variant="h4" className="admin-panel__stat-number">
                      {users.filter(user => user.role === 'admin').length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Основной контент */}
          <Paper elevation={4} className="admin-panel__content">
            <Box className="admin-panel__content-header">
              <Typography variant="h5" className="admin-panel__content-title">
                Список пользователей
              </Typography>
              <Box className="admin-panel__actions">
                <Button
                  startIcon={<RefreshIcon />}
                  variant="outlined"
                  onClick={fetchUsers}
                  className="admin-panel__refresh-button"
                >
                  Обновить
                </Button>
                <Button
                  startIcon={<PersonAddIcon />}
                  variant="contained"
                  onClick={() => setOpenDialog(true)}
                  className="admin-panel__add-button"
                >
                  Добавить пользователя
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Логин</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        <Box className="admin-panel__user-info">
                          <Avatar className="admin-panel__user-avatar">
                            {getRoleIcon(user.role)}
                          </Avatar>
                          <Typography variant="body1">{user.login}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleName(user.role)}
                          color={getRoleColor(user.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Fade>

      {/* Диалог добавления пользователя */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить нового пользователя</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Логин"
              value={newUser.login}
              onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Пароль"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Роль</InputLabel>
              <Select
                value={newUser.role}
                label="Роль"
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <MenuItem value="engineer">Инженер</MenuItem>
                <MenuItem value="admin">Администратор</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            disabled={!newUser.login || !newUser.password}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};