import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  Save,
  Close,
  SaveAlt,
} from "@mui/icons-material";

import { APPLICATION_STEPS, FALLBACK_DATA } from "../../../shared/config";
import { INITIAL_FORM_DATA } from "../../../shared/config";
import { applicationApi } from "../../../entities/application";
import type { CreateApplicationRequest, ApplicationFormData } from "../../../entities/application";
import { referenceApi } from "../../../shared/api/reference";
import { EquipmentSection } from "./EquipmentSection";
import {
  StepWorkType,
  StepTrainNumber,
  StepCarriageNumber,
  StepCarriageType,
  StepLocation,
  StepWorkCompleted, 
  StepFinalPhoto
} from "../../../shared/ui";

export const CreateApplicationForm = ({
  open,
  onClose,
  draftId,
}: {
  open: boolean;
  onClose: () => void;
  draftId?: number;
}) => {
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

  useEffect(() => {
    if (!open) return;
    setActiveStep(0);
    setForm({
      ...INITIAL_FORM_DATA,
      equipment: INITIAL_FORM_DATA.equipment || [] // Ensure equipment is always an array
    });
    setSuccess(null);
    setError(null);

    // Загружаем черновик если передан draftId
    if (draftId) {
      loadDraft(draftId);
    }

    // Получаем списки из БД, если не пришли — используем fallback данные
    referenceApi.getAllReferences()
      .then((data) => {
        console.log('API Response:', data);
        if (data && Object.keys(data).length > 0) {
          console.log('Using API data');
          setWorkTypes(data.typeWork || FALLBACK_DATA.workTypes);
          setTrainNumbers(data.trainNumber || FALLBACK_DATA.trainNumbers);
          setCarriageTypes(data.typeWagon || FALLBACK_DATA.carriageTypes);
          setLocations(data.currentLocation || FALLBACK_DATA.locations);
        } else {
          console.log('Using fallback data - empty response');
          // Используем fallback данные если ответ пустой
          setWorkTypes(FALLBACK_DATA.workTypes);
          setTrainNumbers(FALLBACK_DATA.trainNumbers);
          setCarriageTypes(FALLBACK_DATA.carriageTypes);
          setLocations(FALLBACK_DATA.locations);
        }
      })
      .catch((error) => {
        console.log('API Error:', error);
        console.log('Using fallback data - error');
        // Используем fallback данные в случае ошибки
        setWorkTypes(FALLBACK_DATA.workTypes);
        setTrainNumbers(FALLBACK_DATA.trainNumbers);
        setCarriageTypes(FALLBACK_DATA.carriageTypes);
        setLocations(FALLBACK_DATA.locations);
      });
  }, [open, draftId]);

  // Функция загрузки черновика
  const loadDraft = async (id: number) => {
    try {
      const drafts = await applicationApi.getDrafts();
      const draft = drafts.find(d => d.id.toString() === id.toString());
      
      if (draft) {
        setForm({
          workType: draft.workType || '',
          trainNumber: draft.trainNumber || '',
          carriageType: draft.carriageType || '',
          carriageNumber: draft.carriageNumber || '',
          equipment: (draft.equipment || []).map(item => ({
            equipmentType: item.type || '',
            quantity: item.quantity || 1,
            serialNumber: item.serialNumber || '',
            macAddress: item.macAddress || '',
            photos: {
              equipment: null, // Файлы из черновика пока не загружаем
              serial: null,
              mac: null,
              general: null
            }
          })),
          workCompleted: draft.workCompleted || '',
          location: draft.location || '',
          carriagePhoto: null, // TODO: загрузка файлов из черновика
          generalPhoto: null,
          finalPhoto: null
        });
        setIsDraft(true);
      }
    } catch (error) {
      console.error("Error loading draft:", error);
      setError("Ошибка при загрузке черновика");
    }
  };

  const handleChange = (field: string, value: string | number | File | null) => {
    setForm((prev: ApplicationFormData) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Проверяем, есть ли прогресс в форме
  const hasFormProgress = () => {
    return activeStep > 0 || 
           form.workType !== "" || 
           form.trainNumber !== "" || 
           form.carriageType !== "" || 
           form.carriageNumber !== "" || 
           (form.equipment && form.equipment.length > 0) || 
           form.workCompleted !== "" || 
           form.location !== "" ||
           form.carriagePhoto !== null ||
           form.generalPhoto !== null ||
           form.finalPhoto !== null;
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
  const saveDraft = async () => {
    setSavingDraft(true);
    setError(null);
    try {
      const draftData = {
        status: 'draft' as const,
        typeWork: form.workType,
        trainNumber: form.trainNumber,
        carriageType: form.carriageType,
        carriageNumber: form.carriageNumber,
        equipment: (form.equipment || []).map(item => ({
          equipmentType: item.equipmentType || '',
          serialNumber: item.serialNumber || '',
          macAddress: item.macAddress || '',
          quantity: item.quantity || 1,
          photos: {
            equipmentPhoto: item.photos?.equipment ? item.photos.equipment.name : null,
            serialPhoto: item.photos?.serial ? item.photos.serial.name : null,
            macPhoto: item.photos?.mac ? item.photos.mac.name : null,
            generalPhoto: item.photos?.general ? item.photos.general.name : null
          }
        })),
        completedJob: form.workCompleted,
        currentLocation: form.location,
        carriagePhoto: form.carriagePhoto ? form.carriagePhoto.name : null,
        generalPhoto: form.generalPhoto ? form.generalPhoto.name : null,
        finalPhoto: form.finalPhoto ? form.finalPhoto.name : null,
        userId: 1,
        userName: "Инженер",
        userRole: "engineer"
      };

      if (isDraft && draftId) {
        await applicationApi.updateDraft(draftId, draftData);
      } else {
        await applicationApi.saveDraft(draftData);
        setIsDraft(true);
        // Можно сохранить ID нового черновика если нужно
      }
      
      setSuccess("Черновик успешно сохранен!");
    } catch (error) {
      console.error("Error saving draft:", error);
      setError("Ошибка при сохранении черновика. Попробуйте еще раз.");
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

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const requestData: CreateApplicationRequest = {
        status: 'completed' as const,
        typeWork: form.workType,
        trainNumber: form.trainNumber,
        carriageType: form.carriageType,
        carriageNumber: form.carriageNumber,
        equipment: (form.equipment || []).map(item => ({
          equipmentType: item.equipmentType || '',
          serialNumber: item.serialNumber || '',
          macAddress: item.macAddress || '',
          quantity: item.quantity || 1,
          photos: {
            equipmentPhoto: item.photos?.equipment ? item.photos.equipment.name : null,
            serialPhoto: item.photos?.serial ? item.photos.serial.name : null,
            macPhoto: item.photos?.mac ? item.photos.mac.name : null,
          }
        })),
        completedJob: form.workCompleted,
        currentLocation: form.location,
        carriagePhoto: form.carriagePhoto ? form.carriagePhoto.name : null,
        generalPhoto: form.generalPhoto ? form.generalPhoto.name : null,
        finalPhoto: form.finalPhoto ? form.finalPhoto.name : null,
        userId: 1, // TODO: получать из контекста пользователя
        userName: "Инженер", // TODO: получать из контекста пользователя
        userRole: "engineer" // TODO: получать из контекста пользователя
      };

      console.log('Отправляемые данные:', requestData);

      if (isDraft && draftId) {
        // Завершаем черновик
        await applicationApi.completeDraft(draftId, requestData);
      } else {
        // Создаем новую заявку
        await applicationApi.create(requestData);
      }
      
      setSuccess("Заявка успешно создана!");
      setError(null);
      
      // Сброс формы после успешной отправки
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error creating application:", error);
      setError("Ошибка при создании заявки. Попробуйте еще раз.");
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  // Универсальная валидация для этапа
  const isNextDisabled = () => {
    const step = APPLICATION_STEPS[activeStep];
    
    switch (step.key) {
      case "workType":
        return !form.workType;
      case "trainNumber":
        return !form.trainNumber;
      case "carriageType":
        return !form.carriageType;
      case "carriageNumber":
        return !form.carriageNumber || !form.carriagePhoto;
      case "equipment":
        return !form.equipment || form.equipment.length === 0 || 
               form.equipment.some(item => {
                 // Базовая валидация - тип оборудования и фото оборудования обязательны
                 if (!item.equipmentType || !item.photos?.equipment) {
                   return true;
                 }
                 
                 // Серийный номер и его фото обязательны
                 if (!item.serialNumber || !item.photos?.serial) {
                   return true;
                 }
                 
                 // MAC адрес и его фото обязательны только для определенных типов оборудования
                 const needsMac = item.equipmentType.toLowerCase().includes('точка доступа') || 
                                  item.equipmentType.toLowerCase().includes('маршрутизатор') ||
                                  item.equipmentType.toLowerCase().includes('коммутатор');
                 if (needsMac && (!item.macAddress || !item.photos?.mac)) {
                   return true;
                 }
                 
                 return false;
               });
      case "workCompleted":
        return !form.workCompleted;
      case "location":
        return !form.location;
      case "finalPhoto":
        return !form.finalPhoto;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStepKey) {
      case "workType":
        return (
          <StepWorkType 
            value={form.workType}
            onChange={handleChange}
            options={workTypes}
          />
        );
      case "trainNumber":
        return (
          <StepTrainNumber 
            value={form.trainNumber}
            onChange={handleChange}
            options={trainNumbers}
          />
        );
      case "carriageType":
        return (
          <StepCarriageType 
            value={form.carriageType}
            onChange={handleChange}
            options={carriageTypes}
          />
        );
      case "carriageNumber":
        return (
          <StepCarriageNumber
            formData={{
              ...form,
              carriagePhoto: form.carriagePhoto || null
            }}
            onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))}
          />
        );
      case "equipment":
        return (
          <EquipmentSection 
            equipment={form.equipment || []}
            equipmentTypes={[]}
            onChange={(equipment) => setForm(prev => ({ ...prev, equipment }))}
          />
        );
      case "workCompleted":
        return (
          <StepWorkCompleted 
            value={form.workCompleted}
            onChange={handleChange}
          />
        );
      case "location":
        return (
          <StepLocation 
            value={form.location}
            onChange={handleChange}
            options={locations}
          />
        );
      case "finalPhoto":
        return (
          <StepFinalPhoto 
            formData={form}
            onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))}
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
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
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
                fontWeight: 'bold'
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
                bgcolor: '#4caf50'
              }
            }}
          />
        </Box>

        {/* Навигация по шагам */}
        <Box mt={3}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{
              '& .MuiStepLabel-label': { 
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.75rem'
              },
              '& .MuiStepLabel-label.Mui-active': { 
                color: 'white',
                fontWeight: 'bold'
              },
              '& .MuiStepLabel-label.Mui-completed': { 
                color: '#4caf50'
              },
              '& .MuiStepIcon-root': {
                color: 'rgba(255,255,255,0.3)',
              },
              '& .MuiStepIcon-root.Mui-active': {
                color: '#4caf50',
              },
              '& .MuiStepIcon-root.Mui-completed': {
                color: '#4caf50',
              }
            }}
          >
            {APPLICATION_STEPS.map((step) => (
              <Step key={step.key}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ bgcolor: 'white', color: 'black' }}>
        <Card 
          elevation={0}
          sx={{ 
            mt: 2,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 3
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Fade in={true} timeout={500}>
              <Box>
                {renderStep()}
              </Box>
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
                  fontSize: '1.5rem'
                }
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
                  fontSize: '1.5rem'
                }
              }}
            >
              {error}
            </Alert>
          </Slide>
        )}
      </DialogContent>
      
      <DialogActions sx={{ bgcolor: 'white', borderRadius: '0 0 12px 12px', p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Button 
            disabled={activeStep === 0} 
            onClick={handleBack}
            startIcon={<ArrowBack />}
            variant="outlined"
            sx={{ 
              borderRadius: 3,
              px: 3,
              py: 1.5,
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#764ba2',
                bgcolor: 'rgba(102, 126, 234, 0.1)'
              }
            }}
          >
            Назад
          </Button>
          
          <Box display="flex" gap={2} alignItems="center">
            {/* Кнопка сохранения черновика */}
            {hasFormProgress() && (
              <Button
                variant="outlined"
                onClick={saveDraft}
                disabled={savingDraft}
                startIcon={
                  savingDraft ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveAlt />
                  )
                }
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  borderColor: '#ff9800',
                  color: '#ff9800',
                  '&:hover': {
                    borderColor: '#f57c00',
                    bgcolor: 'rgba(255, 152, 0, 0.1)'
                  }
                }}
              >
                {savingDraft ? "Сохранение..." : "Сохранить черновик"}
              </Button>
            )}
            
            <Typography variant="body2" color="text.secondary">
              {APPLICATION_STEPS[activeStep].label}
            </Typography>
            <Button
              variant="contained"
              onClick={activeStep === APPLICATION_STEPS.length - 1 ? handleSubmit : handleNext}
              disabled={isNextDisabled() || loading}
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
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              {activeStep === APPLICATION_STEPS.length - 1 ? "Создать заявку" : "Далее"}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>

    {/* Диалог подтверждения выхода */}
    <Dialog
      open={showExitConfirm}
      onClose={handleCancelExit}
      maxWidth="sm"
      fullWidth
    >
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
      <DialogActions>
        <Button onClick={handleCancelExit} variant="outlined">
          Отмена
        </Button>
        <Button 
          onClick={handleSaveAndExit} 
          variant="contained" 
          color="warning"
          startIcon={<SaveAlt />}
          disabled={savingDraft}
        >
          {savingDraft ? "Сохранение..." : "Сохранить черновик и выйти"}
        </Button>
        <Button onClick={handleConfirmExit} variant="contained" color="error">
          Выйти без сохранения
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};