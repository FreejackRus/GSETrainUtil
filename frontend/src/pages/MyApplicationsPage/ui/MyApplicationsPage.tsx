import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Pagination,
  Tooltip,
  Button,
  Avatar,
  Fade,
  Divider,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assessment as AssessmentIcon,
  Build as BuildIcon,
  Description as DescriptionIcon,
  Refresh as RefreshIcon,
  Train as TrainIcon,
  DirectionsCar as CarIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { applicationApi } from '../../../entities/application/api/applicationApi';
import type { Application } from '../../../entities/application/model/types';
import { ApplicationDetailsModal } from '../../../features/application-management/ui/ApplicationDetailsModal';
import { useUser } from '../../../shared/contexts/UserContext';
import './MyApplicationsPage.css';

export const MyApplicationsPage: React.FC = () => {
  const { user } = useUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(8);
  
  // Состояние для модального окна просмотра заявки
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [user]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const loadApplications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await applicationApi.getUserApplications(user.id);
      // Убеждаемся, что response - это массив
      const applicationsArray = Array.isArray(response) ? response : [];
      setApplications(applicationsArray);
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
      setError('Не удалось загрузить заявки');
      setApplications([]); // Устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    // Убеждаемся, что applications - это массив
    if (!Array.isArray(applications)) {
      setFilteredApplications([]);
      return;
    }

    let filtered = applications;

    // Фильтр по поисковому запросу
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.applicationNumber?.toString().includes(searchTerm) ||
        app.trainNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.carriageNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.workType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
    setPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'draft':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершена';
      case 'draft':
        return 'Черновик';
      case 'cancelled':
        return 'Отменена';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleViewApplication = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (application) {
      setSelectedApplication(application);
      setDetailsModalOpen(true);
    }
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedApplication(null);
  };

  // Пагинация
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  // Статистика (с проверкой на массив)
  const stats = {
    total: Array.isArray(applications) ? applications.length : 0,
    completed: Array.isArray(applications) ? applications.filter(app => app.status === 'completed').length : 0,
    drafts: Array.isArray(applications) ? applications.filter(app => app.status === 'draft').length : 0,
    cancelled: Array.isArray(applications) ? applications.filter(app => app.status === 'cancelled').length : 0
  };

  return (
    <Container maxWidth="xl" className="my-applications-page">
      <Fade in timeout={600}>
        <Box>
          {/* Современный заголовок */}
          <Box className="modern-header">
            <Box className="header-content">
              <Box className="header-text">
                <Typography variant="h3" component="h1" className="modern-title">
                  Мои заявки
                </Typography>
                <Typography variant="h6" className="modern-subtitle">
                  Управление заявками на техническое обслуживание
                </Typography>
              </Box>
              <Box className="header-actions">
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadApplications}
                  disabled={loading}
                >
                  Обновить
                </Button>
              </Box>
            </Box>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }} 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Современные карточки статистики */}
          <Grid container spacing={3} className="modern-stats">
            <Grid item xs={6} md={3}>
              <Card className="stat-card modern-stat-card">
                <CardContent>
                  <Box className="stat-content">
                    <Avatar className="stat-avatar stat-avatar--primary">
                      <AssessmentIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" className="stat-number">
                        {stats.total}
                      </Typography>
                      <Typography variant="body2" className="stat-label">
                        Всего заявок
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card className="stat-card modern-stat-card">
                <CardContent>
                  <Box className="stat-content">
                    <Avatar className="stat-avatar stat-avatar--success">
                      <BuildIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" className="stat-number">
                        {stats.completed}
                      </Typography>
                      <Typography variant="body2" className="stat-label">
                        Завершено
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card className="stat-card modern-stat-card">
                <CardContent>
                  <Box className="stat-content">
                    <Avatar className="stat-avatar stat-avatar--warning">
                      <DescriptionIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" className="stat-number">
                        {stats.drafts}
                      </Typography>
                      <Typography variant="body2" className="stat-label">
                        Черновики
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Современные фильтры */}
          <Paper className="modern-filters" elevation={0}>
            <Box className="filters-header">
              <Typography variant="h6" className="filters-title">
                <FilterIcon sx={{ mr: 1 }} />
                Фильтры и поиск
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Поиск по номеру заявки, поезду, вагону или типу работ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Статус заявки</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Статус заявки"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ 
                      borderRadius: 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    <MenuItem value="all">Все статусы</MenuItem>
                    <MenuItem value="draft">Черновики</MenuItem>
                    <MenuItem value="completed">Завершенные</MenuItem>
                    <MenuItem value="cancelled">Отмененные</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Контент */}
          {loading ? (
            <Box className="loading-container">
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Загрузка заявок...
              </Typography>
            </Box>
          ) : filteredApplications.length === 0 ? (
            <Paper className="empty-state" elevation={0}>
              <DescriptionIcon className="empty-icon" />
              <Typography variant="h5" className="empty-title">
                {searchTerm || statusFilter !== 'all' ? 'Заявки не найдены' : 'У вас пока нет заявок'}
              </Typography>
              <Typography variant="body1" className="empty-subtitle">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Попробуйте изменить параметры поиска или фильтры'
                  : 'Заявки будут отображаться здесь после их создания'
                }
              </Typography>
            </Paper>
          ) : (
            <>
              {/* Современная таблица */}
              <Paper className="modern-table" elevation={0}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>№ заявки</TableCell>
                        <TableCell>
                          <Box className="table-header-cell">
                            <TrainIcon sx={{ mr: 1, fontSize: 18 }} />
                            Поезд
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box className="table-header-cell">
                            <CarIcon sx={{ mr: 1, fontSize: 18 }} />
                            Вагон
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box className="table-header-cell">
                            <BuildIcon sx={{ mr: 1, fontSize: 18 }} />
                            Тип работ
                          </Box>
                        </TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>
                          <Box className="table-header-cell">
                            <CalendarIcon sx={{ mr: 1, fontSize: 18 }} />
                            Дата создания
                          </Box>
                        </TableCell>
                        <TableCell align="center">Просмотр</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedApplications.map((application) => (
                        <TableRow key={application.id} className="table-row">
                          <TableCell>
                            <Typography variant="subtitle2" className="application-number">
                              #{application.applicationNumber || application.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {application.trainNumber || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {application.carriageNumber || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {application.workType || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusText(application.status)}
                              color={getStatusColor(application.status) as any}
                              size="small"
                              className="status-chip"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(application.applicationDate)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Просмотреть">
                              <IconButton
                                size="small"
                                onClick={() => handleViewApplication(application.id)}
                                className="action-button"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Современная пагинация */}
                {totalPages > 1 && (
                  <Box className="pagination-container">
                    <Typography variant="body2" color="text.secondary">
                      Показано {startIndex + 1}-{Math.min(endIndex, filteredApplications.length)} из {filteredApplications.length}
                    </Typography>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, newPage) => setPage(newPage)}
                      color="primary"
                      shape="rounded"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </Paper>
            </>
          )}
        </Box>
      </Fade>

      {/* Модальное окно для просмотра деталей заявки */}
      <ApplicationDetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetailsModal}
        application={selectedApplication}
      />
    </Container>
  );
};