import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Fade,
  Slide,
} from "@mui/material";
import {
  CheckCircle,
  RadioButtonUnchecked,
  ArrowBack,
  ArrowForward,
  Save,
  Close,
} from "@mui/icons-material";

import { 
  type ApplicationFormData,
  applicationApi,
  type Application,
  type CreateApplicationRequest
} from "../../../entities/application";
import { INITIAL_FORM_DATA } from "../../../shared/config";
import { 
  referenceApi,
  APPLICATION_STEPS,
  FALLBACK_DATA
} from "../../../shared";
import { 
  StepWorkType, 
  StepEquipmentWithPhoto,
  StepWorkCompleted, 
  StepFinalPhoto,
  StepTrainNumber,
  StepCarriageNumber,
  StepCarriageType,
  StepSerialNumber,
  StepMacAddress,
  StepCount,
  StepLocation
} from "../../../shared/ui";

export const CreateApplicationForm = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [activeStep, setActiveStep] = useState(0);
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
      workType: "",
      trainNumber: "",
      carriageType: "",
      carriageNumber: "",
      equipment: "",
      serialNumber: "",
      macAddress: "",
      count: 1,
      engineerName: "",
      location: "",
      carriagePhoto: null,
      equipmentPhoto: null,
      serialPhoto: null,
      macPhoto: null,
      finalPhoto: null,
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
    return activeStep > 0 || Object.values(form).some(value => 
      value !== "" && value !== 1 && value !== null
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
      
      // Формируем массив оборудования
      const equipment = [{
        equipmentType: form.equipment,
        serialNumber: form.serialNumber || '',
        macAddress: form.macAddress || '',
        countEquipment: form.count,
        equipmentPhoto: form.equipmentPhoto ? form.equipmentPhoto.name : null,
        serialPhoto: form.serialPhoto ? form.serialPhoto.name : null,
        macPhoto: form.macPhoto ? form.macPhoto.name : null
      }];

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
        generalPhoto: form.equipmentPhoto ? form.equipmentPhoto.name : null,
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
    
    // Skip validation if step has skipIf property and it evaluates to true
    if ('skipIf' in step && (step as any).skipIf(form)) return false;
    if ('showIf' in step && !(step as any).showIf(form)) return false;
    
    // Проверяем основное поле шага
    if (step.type === "select" || step.type === "input") {
      if (!form[step.key]) return true;
    }
    
    // Для шагов типа "photo" проверяем только фото
    if (step.type === "photo") {
      return !form[step.key];
    }
    
    // Для шагов с фотографиями проверяем и основное поле, и фото
    if (step.photoField) {
      if (!form[step.key as keyof ApplicationFormData] || !form[step.photoField as keyof ApplicationFormData]) return true;
    }
    
    return false;
  };

  const renderStep = () => {
    const applicationData = {
      requestNumber: `REQ${Date.now()}`,
      applicationDate: form.applicationDate,
      trainNumber: form.trainNumber,
      equipment: form.equipment
    };

    switch (activeStep) {
      case 0:
        return <StepWorkType value={form.workType} onChange={handleChange} options={workTypes} />;
      case 1:
        return <StepTrainNumber value={form.trainNumber} onChange={handleChange} options={trainNumbers} />;
      case 2:
        return <StepCarriageType value={form.carriageType} onChange={handleChange} options={carriageTypes} />;
      case 3:
        return (
          <StepCarriageNumber
            formData={form}
            onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))}
            applicationData={applicationData}
          />
        );
      case 4:
        return (
          <StepEquipmentWithPhoto
            formData={form}
            onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))}
            applicationData={applicationData}
            equipmentOptions={equipmentTypes}
          />
        );
      case 5:
        return (
          <StepSerialNumber
            formData={form}
            onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))}
            applicationData={applicationData}
          />
        );
      case 6:
        return (
          <StepMacAddress
            formData={form}
            onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))}
            applicationData={applicationData}
          />
        );
      case 7:
        return (
          <StepCount
            value={form.count}
            onChange={handleChange}
            equipment={form.equipment}
          />
        );
      case 8:
          return (
            <StepWorkCompleted value={form.workCompleted} onChange={handleChange} />
          );
      case 9:
        return (
          <StepLocation value={form.location} onChange={handleChange} options={locations} />
        );
      case 10:
        return (
          <StepFinalPhoto 
            formData={form}
            onFormDataChange={(data) => setForm(prev => ({ ...prev, ...data }))}
            applicationData={applicationData}
          />
        );
      default:
        return null;
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