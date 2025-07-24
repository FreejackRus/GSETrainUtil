import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Alert,
} from "@mui/material";
import axios from "axios";
import { StepWorkType } from "./steps/StepWorkType";
import { StepTrainNumber } from "./steps/StepTrainNumber";
import { StepCarriageType } from "./steps/StepCarriageType";
import { StepCarriageNumber } from "./steps/StepCarriageNumber";
import { StepEquipment } from "./steps/StepEquipment";
import { StepSerialNumber } from "./steps/StepSerialNumber";
import { StepMacAddress } from "./steps/StepMacAddress";
import { StepCount } from "./steps/StepCount";
import { StepEngineerName } from "./steps/StepEngineerName";
import { StepLocation } from "./steps/StepLocation";
import { StepFinalPhoto } from "./steps/StepFinalPhoto";

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
  { key: "workType", label: "Тип работ" },
  { key: "trainNumber", label: "Номер поезда" },
  { key: "carriageType", label: "Тип вагона" },
  { key: "carriageNumber", label: "Номер вагона" },
  { key: "equipment", label: "Наименование оборудования" },
  { key: "serialNumber", label: "Серийный номер" },
  { key: "macAddress", label: "MAC-адрес (если есть)" },
  { key: "count", label: "Количество" },
  { key: "engineerName", label: "ФИО инженера" },
  { key: "location", label: "Текущее место (депо/станция)" },
  { key: "finalPhoto", label: "Общая фотография" },
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
    if (step.skipIf && step.skipIf(form)) return false;
    if (step.showIf && !step.showIf(form)) return false;
    if (step.type === "select" || step.type === "input") {
      return !form[step.key];
    }
    if (step.type === "photo") {
      return !form[step.key];
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
          <StepFinalPhoto value={form.finalPhoto} onPhotoChange={handlePhotoChange} />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {/* Отображаем все этапы в одну строку, выделяя активный */}
        <Box display="flex" flexWrap="wrap" gap={1}>
          {steps.map((step, idx) => (
            <Box
              key={step.key}
              px={2}
              py={1}
              borderRadius={2}
              bgcolor={activeStep === idx ? "primary.main" : "grey.200"}
              color={activeStep === idx ? "primary.contrastText" : "text.primary"}
              fontWeight={activeStep === idx ? 700 : 400}
              fontSize={15}
              sx={{
                cursor: "pointer",
                transition: "background 0.2s",
                border: activeStep === idx ? "2px solid #1976d2" : "1px solid #e0e0e0",
              }}
              onClick={() => setActiveStep(idx)}
            >
              {step.label}
            </Box>
          ))}
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Убираем вертикальный Stepper */}
        <Box mt={2}>
          {renderStep()}
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Назад
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={isNextDisabled() || loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : activeStep === steps.length - 1 ? (
                "Создать"
              ) : (
                "Далее"
              )}
            </Button>
          </Box>
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};