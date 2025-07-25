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
import axios from "axios";
import { 
  StepWorkType, 
  StepEquipment, 
  StepEngineerName, 
  StepFinalPhoto,
  StepTrainNumber,
  StepCarriageNumber
} from "../shared/ui";
import { StepCarriageType } from "../shared/ui/Steps/StepCarriageType";
import { StepSerialNumber } from "../shared/ui/Steps/StepSerialNumber";
import { StepMacAddress } from "../shared/ui/Steps/StepMacAddress";
import { StepCount } from "../shared/ui/Steps/StepCount";
import { StepLocation } from "../shared/ui/Steps/StepLocation";

const fetchOptions = async (endpoint: string) => {
  const res = await axios.get(`http://localhost:3000/api/v1/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
};

const fakeData = {
  workTypes: ["монтаж", "замена", "диагностика", "ремонт"],
  trainNumbers: ["001", "002", "003"],
  carriageTypes: ["купе", "плацкарт", "СВ"],
  equipmentTypes: ["пром. комп.", "маршрутизатор", "коммутатор", "коннектор"],
  locations: ["Депо Москва", "Станция Тверь", "Станция Сочи"],
};

const steps = [
  { key: "workType", label: "Тип работ", type: "select" },
  { key: "trainNumber", label: "Номер поезда", type: "select" },
  { key: "carriageType", label: "Тип вагона", type: "select" },
  { key: "carriageNumber", label: "Номер вагона", type: "input", photoField: "carriagePhoto" },
  { key: "equipment", label: "Наименование оборудования", type: "select", photoField: "equipmentPhoto" },
  { key: "serialNumber", label: "Серийный номер", type: "input", photoField: "serialPhoto" },
  { key: "macAddress", label: "MAC-адрес (если есть)", type: "input", photoField: "macPhoto" },
  { key: "count", label: "Количество", type: "input" },
  { key: "engineerName", label: "ФИО инженера", type: "input" },
  { key: "location", label: "Текущее место (депо/станция)", type: "select" },
  { key: "finalPhoto", label: "Общая фотография", type: "photo" },
];

export const CreateApplicationForm = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<any>({
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

    // Получаем списки из БД, если не пришли — используем фейковые
    fetchOptions("typeWork")
      .then((data) => setWorkTypes(data.map((d: any) => d.typeWork)))
      .catch(() => setWorkTypes(fakeData.workTypes));
    fetchOptions("trainNumber")
      .then((data) => setTrainNumbers(data.map((d: any) => d.trainNumber)))
      .catch(() => setTrainNumbers(fakeData.trainNumbers));
    fetchOptions("typeCarriage")
      .then((data) => setCarriageTypes(data.map((d: any) => d.typeCarriage)))
      .catch(() => setCarriageTypes(fakeData.carriageTypes));
    fetchOptions("equipment")
      .then((data) => setEquipmentTypes(data.map((d: any) => d.equipment)))
      .catch(() => setEquipmentTypes(fakeData.equipmentTypes));
    fetchOptions("currentLocation")
      .then((data) => setLocations(data.map((d: any) => d.currentLocation)))
      .catch(() => setLocations(fakeData.locations));
  }, [open]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev: any) => ({
        ...prev,
        [field]: e.target.files![0],
      }));
    }
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
      // Для примера отправляем только текстовые данные, фото не отправляются
      const data = {
        workType: form.workType,
        trainNumber: form.trainNumber,
        carriageType: form.carriageType,
        carriageNumber: form.carriageNumber,
        equipment: form.equipment,
        serialNumber: form.serialNumber,
        macAddress: form.macAddress,
        count: form.count,
        engineerName: form.engineerName,
        location: form.location,
        // carriagePhoto: form.carriagePhoto,
        // equipmentPhoto: form.equipmentPhoto,
        // serialPhoto: form.serialPhoto,
        // macPhoto: form.macPhoto,
        // finalPhoto: form.finalPhoto,
      };
      await axios.post("http://localhost:3000/api/v1/devices", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setSuccess("Заявка успешно создана!");
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
      onClose();
    } catch (e) {
      setError("Ошибка при создании заявки");
    } finally {
      setLoading(false);
    }
  };

  // Универсальная валидация для этапа
  const isNextDisabled = () => {
    const step = steps[activeStep];
    
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
      if (!form[step.key] || !form[step.photoField]) return true;
    }
    
    return false;
  };

  const renderStep = () => {
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
            value={form.carriageNumber}
            photo={form.carriagePhoto}
            onChange={handleChange}
            onPhotoChange={handlePhotoChange}
          />
        );
      case 4:
        return (
          <StepEquipment
            value={form.equipment}
            photo={form.equipmentPhoto}
            onChange={handleChange}
            onPhotoChange={handlePhotoChange}
            options={equipmentTypes}
          />
        );
      case 5:
        return (
          <StepSerialNumber
            value={form.serialNumber}
            photo={form.serialPhoto}
            onChange={handleChange}
            onPhotoChange={handlePhotoChange}
            equipment={form.equipment}
          />
        );
      case 6:
        return (
          <StepMacAddress
            value={form.macAddress}
            photo={form.macPhoto}
            onChange={handleChange}
            onPhotoChange={handlePhotoChange}
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
          <StepEngineerName value={form.engineerName} onChange={handleChange} />
        );
      case 9:
        return (
          <StepLocation value={form.location} onChange={handleChange} options={locations} />
        );
      case 10:
        return (
          <StepFinalPhoto value={form.finalPhoto} onPhotoChange={(e) => handlePhotoChange('finalPhoto')(e)} />
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
              Шаг {activeStep + 1} из {steps.length}
            </Typography>
            <Chip 
              label={`${Math.round(((activeStep + 1) / steps.length) * 100)}%`}
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
            value={((activeStep + 1) / steps.length) * 100}
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
            {steps.map((step, index) => (
              <Step key={step.key}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ bgcolor: 'white', color: 'black', borderRadius: '0 0 12px 12px' }}>
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

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
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
              {steps[activeStep].label}
            </Typography>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={isNextDisabled() || loading}
              endIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : activeStep === steps.length - 1 ? (
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
              {activeStep === steps.length - 1 ? "Создать заявку" : "Далее"}
            </Button>
          </Box>
        </Box>
        
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