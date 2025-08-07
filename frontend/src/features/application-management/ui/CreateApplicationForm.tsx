import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ArrowBack, ArrowForward, Save, Close, SaveAlt } from '@mui/icons-material';

import { APPLICATION_STEPS, FALLBACK_DATA } from '../../../shared/config';
import { INITIAL_FORM_DATA } from '../../../shared/config';
import { applicationApi } from '../../../entities/application';
import type { CreateApplicationRequest, ApplicationFormData } from '../../../entities/application';
import { referenceApi } from '../../../shared/api/reference';

import {
  StepWorkType,
  StepTrainNumber,
  StepCarriageNumber,
  StepCarriageType,
  StepCarriages,
  StepLocation,
  StepWorkCompleted,
  StepFinalPhoto,
} from '../../../shared/ui';

// Определяем типы оборудования
const EQUIPMENT_TYPES = [
  'Промышленный компьютер БТ-37-НМК (5550.i5 OSUb2204)',
  'Маршрутизатор Mikrotik Hex RB750Gr3',
  'Коммутатор, черт. ТСФВ.467000.008',
  'Источник питания (24V, 150W)',
  'Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)',
  'Выключатель автоматический двухполюсный MD63 2P 16А C 6kA',
  'Точка доступа ТСФВ.465000.006-005',
];
import { useUser } from '../../../shared/contexts/UserContext';

export const CreateApplicationForm = ({
  open,
  onClose,
  draftId,
}: {
  open: boolean;
  onClose: () => void;
  draftId?: number;
}) => {
  console.log('draftID', draftId);
  const { user } = useUser();
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = APPLICATION_STEPS[activeStep];
  const currentStepKey = currentStep?.key;
  const [form, setForm] = useState<ApplicationFormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isDraft, setIsDraft] = useState(!!draftId);

  // Списки для select
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [trainNumbers, setTrainNumbers] = useState<string[]>([]);
  const [carriageTypes, setCarriageTypes] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const theme = useTheme();
  const isWidthSmScreen = useMediaQuery(theme.breakpoints.up('sm'));

  useEffect(() => {
    if (!open) return;
    setActiveStep(0);
    setForm({
      ...INITIAL_FORM_DATA, // Ensure equipment is always an array
    });
    setSuccess(null);
    setError(null);

    // Загружаем черновик если передан draftId
    if (draftId) {
      loadDraft(draftId);
    }

    // Получаем списки из БД, если не пришли — используем fallback данные
    referenceApi
      .getAllReferences()
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setWorkTypes(data.typeWork || FALLBACK_DATA.workTypes);
          setTrainNumbers(data.trainNumber || FALLBACK_DATA.trainNumbers);
          setCarriageTypes(data.typeWagon || FALLBACK_DATA.carriageTypes);
          console.log(data);

          setLocations(data.currentLocation || FALLBACK_DATA.locations);
        } else {
          // Используем fallback данные если ответ пустой
          setWorkTypes(FALLBACK_DATA.workTypes);
          setTrainNumbers(FALLBACK_DATA.trainNumbers);
          setCarriageTypes(FALLBACK_DATA.carriageTypes);
          setLocations(FALLBACK_DATA.locations);
        }
      })
      .catch((error) => {
        // Используем fallback данные в случае ошибки
        setWorkTypes(FALLBACK_DATA.workTypes);
        setTrainNumbers(FALLBACK_DATA.trainNumbers);
        setCarriageTypes(FALLBACK_DATA.carriageTypes);
        setLocations(FALLBACK_DATA.locations);
      });
  }, [open, draftId]);

  // Функция загрузки черновика
  const loadDraft = async (id: number) => {
    if (!user?.id) return;

    try {
      const drafts = await applicationApi.getDrafts(user.id, user.role);
      console.log('333', drafts);
      const draft = drafts.find((d) => d.id.toString() === id.toString());

      if (draft) {
        setForm({
          workType: draft.carriages?.[0]?.equipment?.[0]?.typeWork || '',
          trainNumber: draft.trainNumbers?.[0] || '',
          carriages: (draft.carriages || []).map((carriage) => ({
            carriageType: carriage.type || '',
            carriageNumber: carriage.number || '',
            carriagePhoto: null, // TODO: загрузка файлов из черновика
            equipment: [], // Оборудование теперь хранится внутри вагонов
          })),
          workCompleted: draft.status || '',
          location: draft.currentLocation || '',
          photo: null,
        });
        setIsDraft(true);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      setError('Ошибка при загрузке черновика');
    }
  };

  const handleChange = (field: string, value: string | number | File | null) => {
    setForm((prev: ApplicationFormData) => ({
      ...prev,
      [field]: value,
    }));
  };

  // TODO: Как дойдут руки сделать абстрактный метод через Object
  // Проверяем, есть ли прогресс в форме
  const hasFormProgress = () => {
    const hasEquipmentInCarriages = form.carriages?.some(
      (carriage) => carriage.equipment && carriage.equipment.length > 0,
    );

    return (
      activeStep > 0 ||
      form.workType !== '' ||
      form.trainNumber !== '' ||
      (form.carriages && form.carriages.length > 0) ||
      hasEquipmentInCarriages ||
      form.workCompleted !== '' ||
      form.location !== '' ||
      form.photo !== null
    );
  };

  // Обработка закрытия с подтверждением
  const handleClose = () => {
    if (hasFormProgress()) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    onClose();
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  // Функция сохранения черновика
  // TODO: Проверить роль пользователя - черновики должны быть доступны только инженерам
  const saveDraft = async () => {
    setSavingDraft(true);
    setError(null);
    setSuccess(null);

    try {
      // Собираем все оборудование из вагонов в общий массив для черновика
      const allEquipment = (form.carriages || []).flatMap((carriage) =>
        (carriage.equipment || []).map((item) => ({
          equipmentType: item.equipmentType || '',
          serialNumber: item.serialNumber || '',
          macAddress: item.macAddress || '',
          quantity: item.quantity || 1,
          photos: {
            equipmentPhoto: item.photos?.equipment ? item.photos.equipment.name : null,
            serialPhoto: item.photos?.serial ? item.photos.serial.name : null,
            macPhoto: item.photos?.mac ? item.photos.mac.name : null,
          },
        })),
      );

      // const draftData: CreateApplicationRequest = {
      //   status: 'draft' as const,
      //   typeWork: form.workType,
      //   trainNumber: form.trainNumber,
      //   carriages: (form.carriages || []).map((carriage) => ({
      //     carriageType: carriage.carriageType,
      //     carriageNumber: carriage.carriageNumber,
      //     carriagePhoto: carriage.carriagePhoto ? carriage.carriagePhoto.name : null,
      //   })),
      //   equipment: allEquipment,
      //   completedJob: form.workCompleted,
      //   currentLocation: form.location,
      //   finalPhoto: form.finalPhoto ? form.finalPhoto.name : null,
      //   userId: user?.id || 0,
      //   userName: user?.name || '',
      //   userRole: user?.role || '',
      // };
      const draftData: CreateApplicationRequest = {
        id: draftId,
        status: 'draft',
        trainNumbers: [form.trainNumber], // теперь массив поездов
        carriages: (form.carriages || []).map((c) => ({
          carriageNumber: c.carriageNumber,
          carriageType: c.carriageType,
          carriagePhoto: c.carriagePhoto ?? null,
          equipment: (c.equipment || []).map((e) => ({
            equipmentName: e.equipmentType, // поле name у Equipment
            serialNumber: e.serialNumber,
            macAddress: e.macAddress,
            typeWork: form.workType, // тип работ на уровне оборудования
            quantity: e.quantity,
            photos: {
              equipmentPhoto: e.photos?.equipment ?? null,
              serialPhoto: e.photos?.serial ?? null,
              macPhoto: e.photos?.mac ?? null,
            },
          })),
        })),
        completedJob: form.workCompleted,
        currentLocation: form.location,
        photo: form.photo ?? null, // единое фото заявки
        userId: user?.id || 0,
        userName: user?.name || '',
        userRole: user?.role || '',
      };

      if (isDraft && draftId) {
        await applicationApi.updateDraft(draftId, {
          ...draftData,
          userId: Number(draftData.userId), // Convert userId to number
        });
      } else {
        await applicationApi.saveDraft(draftData);
        setIsDraft(true);
        // Можно сохранить ID нового черновика если нужно
      }

      setSuccess('Черновик успешно сохранен!');
    } catch (error) {
      console.error('Error saving draft:', error);
      setError('Ошибка при сохранении черновика. Попробуйте еще раз.');
    } finally {
      setSavingDraft(false);
    }
  };

  // Функция сохранения черновика и выхода
  const handleSaveAndExit = async () => {
    await saveDraft();
    if (!error) {
      setShowExitConfirm(false);
      onClose();
    }
  };

  const handleNext = () =>
    setActiveStep((prev) => {
      return prev + 1;
    });
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      // Собираем все оборудование из вагонов в общий массив
      const allEquipment = (form.carriages || []).flatMap((carriage) =>
        (carriage.equipment || []).map((item) => ({
          equipmentType: item.equipmentType || '',
          serialNumber: item.serialNumber || '',
          macAddress: item.macAddress || '',
          quantity: item.quantity || 1,
          photos: {
            equipmentPhoto: item.photos?.equipment ?? null,
            serialPhoto: item.photos?.serial ?? null,
            macPhoto: item.photos?.mac ?? null,
          },
        })),
      );

      const requestData: CreateApplicationRequest = {
        status: 'completed' as const,
        trainNumbers: [form.trainNumber],
        carriages: (form.carriages || []).map((carriage) => ({
          carriageType: carriage.carriageType,
          carriageNumber: carriage.carriageNumber,
          carriagePhoto: carriage.carriagePhoto ?? null,
          equipment: (carriage.equipment || []).map((item) => ({
            equipmentName: item.equipmentType,
            serialNumber: item.serialNumber,
            macAddress: item.macAddress,
            typeWork: form.workType,
            quantity: item.quantity,
            photos: {
              equipmentPhoto: item.photos.equipment,
              serialPhoto: item.photos.serial,
              macPhoto: item.photos.mac,
            },
          })),
        })),
        completedJob: form.workCompleted,
        currentLocation: form.location,
        photo: form.photo ?? null,
        userId: user?.id || 0,
        userName: user?.name || '',
        userRole: user?.role || '',
      };

      if (isDraft && draftId) {
        // Завершаем черновик
        await applicationApi.completeDraft(draftId, requestData);
      } else {
        // Создаем новую заявку
        console.log(requestData);

        await applicationApi.create(requestData);
      }

      setSuccess('Заявка успешно создана!');
      setError(null);

      // Сброс формы после успешной отправки
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error creating application:', error);

      // Детальное логгирование ошибки
      console.error('=== ДЕТАЛИ ОШИБКИ СОЗДАНИЯ ЗАЯВКИ ===');
      console.error('Тип ошибки:', error?.constructor?.name);
      console.error('Сообщение ошибки:', error?.message);
      console.error('Статус ответа:', error?.response?.status);
      console.error('Данные ответа:', error?.response?.data);
      console.error('Заголовки ответа:', error?.response?.headers);
      console.error('URL запроса:', error?.config?.url);
      console.error('Метод запроса:', error?.config?.method);
      console.error('Данные запроса:', error?.config?.data);
      console.error('Полный стек ошибки:', error?.stack);
      console.error('Данные формы на момент ошибки:', {
        isDraft,
        draftId,
        formData: form,
        requestData: {
          status: 'completed',
          typeWork: form.workType,
          trainNumber: form.trainNumber,
          carriages: form.carriages,
          completedJob: form.workCompleted,
          currentLocation: form.location,
          userId: user?.id,
          userName: user?.name,
          userRole: user?.role,
        },
      });
      console.error('=== КОНЕЦ ДЕТАЛЬНОГО ЛОГГИРОВАНИЯ ===');

      // Определяем более конкретное сообщение об ошибке для пользователя
      let userErrorMessage = 'Ошибка при создании заявки. Попробуйте еще раз.';

      if (error?.response?.status === 400) {
        userErrorMessage = 'Ошибка валидации данных. Проверьте правильность заполнения формы.';
      } else if (error?.response?.status === 401) {
        userErrorMessage = 'Ошибка авторизации. Войдите в систему заново.';
      } else if (error?.response?.status === 403) {
        userErrorMessage = 'Недостаточно прав для создания заявки.';
      } else if (error?.response?.status === 404) {
        userErrorMessage = 'Сервис недоступен. Обратитесь к администратору.';
      } else if (error?.response?.status >= 500) {
        userErrorMessage = 'Ошибка сервера. Попробуйте позже или обратитесь к администратору.';
      } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
        userErrorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
      }

      setError(userErrorMessage);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  // Универсальная валидация для этапа
  const isNextDisabled = () => {
    const step = APPLICATION_STEPS[activeStep];

    switch (step.key) {
      case 'workType':
        return !form.workType;
      case 'trainNumber':
        return !form.trainNumber;
      case 'carriages':
        // Проверяем базовые поля вагонов
        if (!form.carriages || form.carriages.length === 0) {
          return true;
        }

        return form.carriages.some((carriage) => {
          // Проверяем обязательные поля вагона
          if (!carriage.carriageNumber || !carriage.carriageType || !carriage.carriagePhoto) {
            return true;
          }

          // Проверяем оборудование вагона (если есть)
          if (carriage.equipment && carriage.equipment.length > 0) {
            return carriage.equipment.some((item) => {
              // Базовая валидация - тип оборудования и серийный номер обязательны
              if (!item.equipmentType || !item.serialNumber) {
                return true;
              }

              // Фото серийного номера обязательно
              if (!item.photos?.serial) {
                return true;
              }

              // MAC адрес обязателен только для определенных типов оборудования
              const needsMac =
                item.equipmentType.toLowerCase().includes('точка доступа') ||
                item.equipmentType.toLowerCase().includes('маршрутизатор') ||
                item.equipmentType.toLowerCase().includes('коммутатор');

              if (needsMac) {
                // Проверяем наличие MAC адреса
                if (!item.macAddress) {
                  return true;
                }

                // Проверяем валидность MAC адреса
                const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
                if (!macRegex.test(item.macAddress)) {
                  return true;
                }

                // Фото MAC адреса обязательно для оборудования с MAC
                if (!item.photos?.mac) {
                  return true;
                }
              }

              return false;
            });
          }

          return false;
        });
      case 'workCompleted':
        return !form.workCompleted;
      case 'location':
        return !form.location;
      case 'finalPhoto':
        return !form.photo;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStepKey) {
      case 'workType':
        return <StepWorkType value={form.workType} onChange={handleChange} options={workTypes} />;
      case 'trainNumber':
        return (
          <StepTrainNumber
            value={form.trainNumber}
            onChange={handleChange}
            options={trainNumbers}
          />
        );
      case 'carriages':
        return (
          <StepCarriages
            carriages={form.carriages || []}
            onCarriagesChange={(carriages) => setForm((prev) => ({ ...prev, carriages }))}
          />
        );

      case 'workCompleted':
        return <StepWorkCompleted value={form.workCompleted} onChange={handleChange} />;
      case 'location':
        return <StepLocation value={form.location} onChange={handleChange} options={locations} />;
      case 'finalPhoto':
        return (
          <StepFinalPhoto
            formData={form}
            onFormDataChange={(data) => setForm((prev) => ({ ...prev, ...data }))}
          />
        );
      default:
        return <div>Неизвестный шаг</div>;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        disableEscapeKeyDown={hasFormProgress()}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pl: { xs: 2, sm: 3 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              🔧 Создание заявки
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>

          {/* Прогресс-бар */}
          <Box mt={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2">
                Шаг {activeStep + 1} из {APPLICATION_STEPS.length}
              </Typography>
              <Chip
                label={`${Math.round(((activeStep + 1) / APPLICATION_STEPS.length) * 100)}%`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={((activeStep + 1) / APPLICATION_STEPS.length) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: '#4caf50',
                },
              }}
            />
          </Box>

          {/* Навигация по шагам */}
          <Box mt={3}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel={isWidthSmScreen}
              sx={{
                // display:"flex",
                // flexWrap:"wrap",
                // flexDirection:"column",
                '& .MuiStepLabel-label': {
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.75rem',
                },
                '& .MuiStepLabel-label.Mui-active': {
                  color: 'white',
                  fontWeight: 'bold',
                },
                '& .MuiStepLabel-label.Mui-completed': {
                  color: '#4caf50',
                },
                '& .MuiStepIcon-root': {
                  color: 'rgba(255,255,255,0.3)',
                },
                '& .MuiStepIcon-root.Mui-active': {
                  color: '#4caf50',
                },
                '& .MuiStepIcon-root.Mui-completed': {
                  color: '#4caf50',
                },
              }}
            >
              {APPLICATION_STEPS.map((step) => (
                <Step key={step.key}>
                  {isWidthSmScreen ? (
                    <StepLabel>{step.label}</StepLabel>
                  ) : (
                    <StepLabel
                      sx={{ width: { xs: 20, sm: 'auto' }, height: { xs: 45, sm: 'auto' } }}
                    >
                      {}
                    </StepLabel>
                  )}
                </Step>
              ))}
            </Stepper>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ bgcolor: 'white', color: 'black', p: { xs: 1, sm: 3 } }}>
          <Card
            elevation={0}
            sx={{
              mt: 2,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Fade in timeout={500}>
                <Box>{renderStep()}</Box>
              </Fade>
            </CardContent>
          </Card>

          {success && (
            <Slide direction="up" in={!!success} mountOnEnter unmountOnExit>
              <Alert
                severity="success"
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem',
                  },
                }}
              >
                {success}
              </Alert>
            </Slide>
          )}

          {error && (
            <Slide direction="up" in={!!error} mountOnEnter unmountOnExit>
              <Alert
                severity="error"
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem',
                  },
                }}
              >
                {error}
              </Alert>
            </Slide>
          )}
        </DialogContent>

        <DialogActions
          sx={{ bgcolor: 'white', borderRadius: '0 0 12px 12px', p: { xs: 1, sm: 3 } }}
        >
          <Box
            display="flex"
            gap={0.5}
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
              variant="outlined"
              sx={{
                fontSize: {
                  xs: '0.65rem',
                  sm: '0.85rem',
                },
                borderRadius: 3,
                px: 3,
                py: 1.5,
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#764ba2',
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                },
              }}
            >
              Назад
            </Button>

            <Box display="flex" gap={{ xs: 0.2, sm: 2 }} alignItems="center">
              <Typography
                variant="body2"
                color="text.secondary"
                fontSize={{ xs: '0.65rem', sm: '0.75rem' }}
              >
                {APPLICATION_STEPS[activeStep].label}
              </Typography>
              <Button
                variant="contained"
                onClick={activeStep === APPLICATION_STEPS.length - 1 ? handleSubmit : handleNext}
                // disabled={isNextDisabled() || loading}
                endIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : activeStep === APPLICATION_STEPS.length - 1 ? (
                    <Save />
                  ) : (
                    <ArrowForward />
                  )
                }
                sx={{
                  borderRadius: 3,
                  fontSize: { xs: '0.58rem', sm: '0.88rem' },
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                }}
              >
                {activeStep === APPLICATION_STEPS.length - 1 ? 'Создать заявку' : 'Далее'}
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения выхода */}
      <Dialog open={showExitConfirm} onClose={handleCancelExit} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            ⚠️ Подтверждение выхода
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            У вас есть несохраненные изменения в заявке. Что вы хотите сделать?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 0.4, sm: 1 }, pt: 0, pb: { xs: 0.4, sm: 1 } }}>
          <Button
            onClick={handleCancelExit}
            variant="outlined"
            // sx={{
            //   fontSize: { xs: '0.66rem', sm: '0.88rem' },
            // }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSaveAndExit}
            variant="contained"
            color="warning"
            startIcon={<SaveAlt />}
            disabled={savingDraft}
            sx={{
              fontSize: { xs: '0.45rem', sm: '0.88rem' },
              width: { xs: 120, sm: 'auto' },
              height: { xs: 57, sm: 'auto' },
            }}
          >
            {savingDraft ? 'Сохранение...' : 'Сохранить черновик и выйти'}
          </Button>
          <Button
            onClick={handleConfirmExit}
            variant="contained"
            color="error"
            sx={{
              fontSize: { xs: '0.66rem', sm: '0.88rem' },
            }}
          >
            Выйти без сохранения
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
