import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Fade,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { CreateApplicationForm } from '../../../features/application-management';
import { applicationApi } from '../../../entities/application/api/applicationApi';
import { useUser } from '../../../shared/contexts/UserContext';
import './CreateApplicationPage.css';

interface Draft {
  id: string;
  trainNumber: string;
  routeNumber: string;
  createdAt: string;
  updatedAt: string;
}

export const CreateApplicationPage: React.FC = () => {
  const { user } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [showDraftsDialog, setShowDraftsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDrafts();
  }, [user]);

  const loadDrafts = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await applicationApi.getDrafts(user.id, user.role);
      setDrafts(response.map(app => ({
        id: app.id,
        trainNumber: app.trainNumber || '',
        routeNumber: '', // В Application нет поля route, используем пустую строку
        createdAt: app.applicationDate,
        updatedAt: app.applicationDate
      })));
    } catch (error) {
      console.error('Ошибка загрузки черновиков:', error);
      setError('Не удалось загрузить черновики');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedDraftId(null);
    setShowForm(true);
  };

  const handleContinueDraft = (draftId: string) => {
    setSelectedDraftId(draftId);
    setShowDraftsDialog(false);
    setShowForm(true);
  };

  const handleDeleteDraft = async (draftId: string) => {
    try {
      await applicationApi.deleteDraft(draftId);
      await loadDrafts();
    } catch (error) {
      console.error('Ошибка удаления черновика:', error);
      setError('Не удалось удалить черновик');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedDraftId(null);
    loadDrafts(); // Обновляем список черновиков после закрытия формы
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showForm) {
    return (
      <CreateApplicationForm
        open={showForm}
        draftId={selectedDraftId ? Number(selectedDraftId) : undefined}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <Container maxWidth="lg" className="create-application-page">
      <Fade in timeout={600}>
        <Box>
          {/* Заголовок */}
          <Box className="page-header">
            <Typography variant="h4" component="h1" className="page-title">
              Создание заявки
            </Typography>
            <Typography variant="body1" className="page-subtitle">
              Создайте новую заявку или продолжите работу с черновиком
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Основные действия */}
          <Grid container spacing={3}>
            {/* Создать новую заявку */}
            <Grid item xs={12} md={6}>
              <Card className="action-card">
                <CardContent className="action-card-content">
                  <Box className="action-icon">
                    <AddIcon fontSize="large" />
                  </Box>
                  <Typography variant="h6" className="action-title">
                    Новая заявка
                  </Typography>
                  <Typography variant="body2" className="action-description">
                    Создать новую заявку с нуля
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleCreateNew}
                    className="action-button"
                    startIcon={<AddIcon />}
                  >
                    Создать
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Продолжить черновик */}
            <Grid item xs={12} md={6}>
              <Card className="action-card">
                <CardContent className="action-card-content">
                  <Box className="action-icon">
                    <EditIcon fontSize="large" />
                  </Box>
                  <Typography variant="h6" className="action-title">
                    Продолжить черновик
                  </Typography>
                  <Typography variant="body2" className="action-description">
                    Продолжить работу с сохраненным черновиком
                  </Typography>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => setShowDraftsDialog(true)}
                    className="action-button"
                    startIcon={<EditIcon />}
                    disabled={drafts.length === 0}
                  >
                    {drafts.length > 0 ? `Черновики (${drafts.length})` : 'Нет черновиков'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Быстрый доступ к последним черновикам */}
          {drafts.length > 0 && (
            <Paper className="recent-drafts" elevation={2}>
              <Typography variant="h6" className="section-title">
                Последние черновики
              </Typography>
              <List>
                {drafts.slice(0, 3).map((draft) => (
                  <ListItem key={draft.id} className="draft-item">
                    <DescriptionIcon className="draft-icon" />
                    <ListItemText
                      primary={`Поезд ${draft.trainNumber}, маршрут ${draft.routeNumber}`}
                      secondary={`Изменен: ${formatDate(draft.updatedAt)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleContinueDraft(draft.id)}
                        className="draft-action-button"
                      >
                        <EditIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </Fade>

      {/* Диалог выбора черновика */}
      <Dialog
        open={showDraftsDialog}
        onClose={() => setShowDraftsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Выберите черновик</DialogTitle>
        <DialogContent>
          {loading ? (
            <Typography>Загрузка...</Typography>
          ) : drafts.length === 0 ? (
            <Typography>Нет сохраненных черновиков</Typography>
          ) : (
            <List>
              {drafts.map((draft) => (
                <ListItem key={draft.id} className="draft-dialog-item">
                  <DescriptionIcon className="draft-icon" />
                  <ListItemText
                    primary={`Поезд ${draft.trainNumber}, маршрут ${draft.routeNumber}`}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          Создан: {formatDate(draft.createdAt)}
                        </Typography>
                        <Typography variant="body2">
                          Изменен: {formatDate(draft.updatedAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => handleContinueDraft(draft.id)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteDraft(draft.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDraftsDialog(false)}>
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};