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
} from "@mui/icons-material";

import { APPLICATION_STEPS, FALLBACK_DATA } from "../../../shared/config";
import { INITIAL_FORM_DATA } from "../../../shared/config";
import { applicationApi } from "../../../entities/application";
import type { CreateApplicationRequest, ApplicationFormData, EquipmentFormItem } from "../../../entities/application";
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
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = APPLICATION_STEPS[activeStep];
  const currentStepKey = currentStep?.key;
  const [form, setForm] = useState<ApplicationFormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Списки для select
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [trainNumbers, setTrainNumbers] = useState<string[]>([]);
  const [carriageTypes, setCarriageTypes] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
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

    // Получаем списки из БД, если не пришли — используем fallback данные
    referenceApi.getAllReferences()
      .then((data) => {
        console.log('API Response:', data);
        if (data && Object.keys(data).length > 0) {
          console.log('Using API data');
          setWorkTypes(data.typeWork || FALLBACK_DATA.workTypes);
          setTrainNumbers(data.trainNumber || FALLBACK_DATA.trainNumbers);
          setCarriageTypes(data.typeWagon || FALLBACK_DATA.carriageTypes);
          setEquipmentTypes(data.equipment || FALLBACK_DATA.equipmentTypes);
          setLocations(data.currentLocation || FALLBACK_DATA.locations);
        } else {
          console.log('Using fallback data - empty response');
          // Используем fallback данные если ответ пустой
          setWorkTypes(FALLBACK_DATA.workTypes);
          setTrainNumbers(FALLBACK_DATA.trainNumbers);
          setCarriageTypes(FALLBACK_DATA.carriageTypes);
          setEquipmentTypes(FALLBACK_DATA.equipmentTypes);
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
        setEquipmentTypes(FALLBACK_DATA.equipmentTypes);
        setLocations(FALLBACK_DATA.locations);
      });
  }, [open]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({
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

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      // Генерируем номер заявки и дату
      const applicationNumber = Date.now();
      const applicationDate = new Date().toISOString();
      
      // Формируем массив оборудования из формы
      const equipment = (form.equipment || []).map(item => ({
        equipmentType: item.equipmentType,
        serialNumber: item.serialNumber || '',
        macAddress: item.macAddress || '',
        countEquipment: item.count,
        equipmentPhoto: item.equipmentPhoto ? item.equipmentPhoto.name : null,
        serialPhoto: item.serialPhoto ? item.serialPhoto.name : null,
        macPhoto: item.macPhoto ? item.macPhoto.name : null
      }));

      // Подготавливаем данные в формате, ожидаемом бэкендом
      const requestData: CreateApplicationRequest = {
        applicationNumber,
        applicationDate,
        typeWork: form.workType,
        trainNumber: form.trainNumber,
        carriageType: form.carriageType,
        carriageNumber: form.carriageNumber,
        equipment,
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

      await applicationApi.create(requestData);
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
                 // Базовая валидация
                 if (!item.equipmentType || !item.equipmentPhoto || !item.serialPhoto) {
                   return true;
                 }
                 
                 // MAC адрес обязателен только для точек доступа и маршрутизаторов
                 const needsMac = item.equipmentType.toLowerCase().includes('точка доступа') || 
                                  item.equipmentType.toLowerCase().includes('маршрутизатор');
                 if (needsMac && (!item.macAddress || !item.macPhoto)) {
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
        return <StepWorkType formData={form} onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))} options={workTypes} />;
      case "trainNumber":
        return <StepTrainNumber formData={form} onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))} options={trainNumbers}/>;
      case "carriageType":
        return <StepCarriageType formData={form} onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))} options={carriageTypes} />;
      case "carriageNumber":
        return (
          <StepCarriageNumber
            formData={form}
            onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))}
            applicationData={{
              workType: form.workType,
              trainNumber: form.trainNumber,
              carriageType: form.carriageType,
              carriageNumber: form.carriageNumber,
              carriagePhoto: form.carriagePhoto || null,
              workCompleted: form.workCompleted,
              location: form.location,
              finalPhoto: form.finalPhoto || null,
              equipment: (form.equipment || []).map(eq => eq.equipmentType).join(', ')
            }}
          />
        );
      case "equipment":
        return <EquipmentSection formData={form} onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))} />;
      case "workCompleted":
        return <StepWorkCompleted formData={form} onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))} />;
      case "location":
        return <StepLocation formData={form} onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))} options={locations} />;
      case "finalPhoto":
        return (
          <StepFinalPhoto 
            formData={form}
            onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))}
            applicationData={{
              workType: form.workType,
              trainNumber: form.trainNumber,
              carriageType: form.carriageType,
              carriageNumber: form.carriageNumber,
              carriagePhoto: form.carriagePhoto || null,
              workCompleted: form.workCompleted,
              location: form.location,
              finalPhoto: form.finalPhoto || null,
              equipment: (form.equipment || []).map(eq => eq.equipmentType).join(', ')
            }}
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
            {APPLICATION_STEPS.map((step, index) => (
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
          У вас есть несохраненные изменения в заявке. Вы уверены, что хотите выйти? 
          Все введенные данные будут потеряны.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelExit} variant="outlined">
          Отмена
        </Button>
        <Button onClick={handleConfirmExit} variant="contained" color="error">
          Выйти
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};