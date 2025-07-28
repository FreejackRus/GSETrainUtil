import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Check as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { EquipmentFormItem } from '../../../entities/application';
import { PhotoUpload } from '../../../shared/ui';

interface EquipmentSectionProps {
  equipment: EquipmentFormItem[];
  equipmentTypes: string[];
  onChange: (equipment: EquipmentFormItem[]) => void;
}

// Определяем фиксированные типы оборудования с их ограничениями
const EQUIPMENT_CONFIG = {
  'Промышленный компьютер БТ-37-НМК (5550.i5 OSUb2204)': { maxCount: 1, hasMac: false },
  'Маршрутизатор Mikrotik Hex RB750Gr3': { maxCount: 1, hasMac: true },
  'Коммутатор, черт. ТСФВ.467000.008': { maxCount: 1, hasMac: false },
  'Источник питания (24V, 150W)': { maxCount: 1, hasMac: false },
  'Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)': { maxCount: 2, hasMac: false },
  'Выключатель автоматический двухполюсный MD63 2P 16А C 6kA': { maxCount: 1, hasMac: false },
  'Точка доступа ТСФВ.465000.006-005': { maxCount: 1, hasMac: true }
};

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
  equipment,
  equipmentTypes,
  onChange,
}) => {
  const [activeEquipmentStep, setActiveEquipmentStep] = useState(0);

  // Получаем доступные типы оборудования (те, которые еще не добавлены или могут быть добавлены повторно)
  const getAvailableEquipmentTypes = () => {
    return Object.keys(EQUIPMENT_CONFIG).filter(type => {
      const existingCount = equipment.filter(item => item.equipmentType === type).length;
      const maxCount = EQUIPMENT_CONFIG[type as keyof typeof EQUIPMENT_CONFIG]?.maxCount || 1;
      return existingCount < maxCount;
    });
  };

  const addEquipment = () => {
    const availableTypes = getAvailableEquipmentTypes();
    if (availableTypes.length === 0) return;

    const newEquipment: EquipmentFormItem = {
      equipmentType: '',
      serialNumber: '',
      macAddress: '',
      count: 1,
      equipmentPhoto: null,
      serialPhoto: null,
      macPhoto: null,
    };
    onChange([...equipment, newEquipment]);
    setActiveEquipmentStep(equipment.length); // Переходим к новому элементу
  };

  const removeEquipment = (index: number) => {
    const newEquipment = equipment.filter((_, i) => i !== index);
    onChange(newEquipment);
    // Корректируем активный шаг
    if (activeEquipmentStep >= newEquipment.length && newEquipment.length > 0) {
      setActiveEquipmentStep(newEquipment.length - 1);
    } else if (newEquipment.length === 0) {
      setActiveEquipmentStep(0);
    }
  };

  const updateEquipment = (index: number, field: keyof EquipmentFormItem, value: any) => {
    const newEquipment = [...equipment];
    newEquipment[index] = { ...newEquipment[index], [field]: value };
    
    // Если изменился тип оборудования, сбрасываем MAC-адрес если он не нужен
    if (field === 'equipmentType') {
      const config = EQUIPMENT_CONFIG[value as keyof typeof EQUIPMENT_CONFIG];
      if (config && !config.hasMac) {
        newEquipment[index].macAddress = '';
        newEquipment[index].macPhoto = null;
      }
      // Устанавливаем количество по умолчанию
      newEquipment[index].count = 1;
    }
    
    onChange(newEquipment);
  };

  // Проверяем, нужен ли MAC-адрес для данного типа оборудования
  const needsMacAddress = (equipmentType: string) => {
    const config = EQUIPMENT_CONFIG[equipmentType as keyof typeof EQUIPMENT_CONFIG];
    return config?.hasMac || false;
  };

  // Получаем максимальное количество для типа оборудования
  const getMaxCount = (equipmentType: string) => {
    const config = EQUIPMENT_CONFIG[equipmentType as keyof typeof EQUIPMENT_CONFIG];
    return config?.maxCount || 1;
  };

  // Проверяем, заполнено ли оборудование
  const isEquipmentComplete = (item: EquipmentFormItem) => {
    if (!item.equipmentType || !item.equipmentPhoto || !item.serialPhoto) {
      return false;
    }
    
    const hasMac = needsMacAddress(item.equipmentType);
    if (hasMac && (!item.macAddress || !item.macPhoto)) {
      return false;
    }
    
    return true;
  };

  // Получаем прогресс заполнения
  const getCompletionProgress = () => {
    if (equipment.length === 0) return 0;
    const completedCount = equipment.filter(isEquipmentComplete).length;
    return (completedCount / equipment.length) * 100;
  };

  // Автоматически добавляем все типы оборудования при первом рендере
  React.useEffect(() => {
    if (equipment.length === 0) {
      const initialEquipment = Object.keys(EQUIPMENT_CONFIG).map(type => ({
        equipmentType: type,
        serialNumber: '',
        macAddress: '',
        count: 1,
        equipmentPhoto: null,
        serialPhoto: null,
        macPhoto: null,
      }));
      onChange(initialEquipment);
    }
  }, [equipment.length, onChange]);

  const handleNextEquipment = () => {
    if (activeEquipmentStep < equipment.length - 1) {
      setActiveEquipmentStep(activeEquipmentStep + 1);
    }
  };

  const handlePrevEquipment = () => {
    if (activeEquipmentStep > 0) {
      setActiveEquipmentStep(activeEquipmentStep - 1);
    }
  };

  const renderEquipmentForm = (item: EquipmentFormItem, index: number) => {
    const maxCount = getMaxCount(item.equipmentType);
    const hasMac = needsMacAddress(item.equipmentType);
    const isComplete = isEquipmentComplete(item);
    
    return (
      <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" color="primary">
                {item.equipmentType || `Оборудование #${index + 1}`}
              </Typography>
              {isComplete && (
                <Chip 
                  icon={<CheckIcon />} 
                  label="Заполнено" 
                  color="success" 
                  size="small" 
                />
              )}
              {!isComplete && item.equipmentType && (
                <Chip 
                  icon={<WarningIcon />} 
                  label="Требует заполнения" 
                  color="warning" 
                  size="small" 
                />
              )}
            </Box>
            <IconButton
              onClick={() => removeEquipment(index)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>

          <Grid container spacing={3}>
            {/* Тип оборудования */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Тип оборудования</InputLabel>
                <Select
                  value={item.equipmentType}
                  onChange={(e) => updateEquipment(index, 'equipmentType', e.target.value)}
                  label="Тип оборудования"
                >
                  {/* Показываем текущий выбранный тип */}
                  {item.equipmentType && (
                    <MenuItem value={item.equipmentType}>
                      {item.equipmentType}
                    </MenuItem>
                  )}
                  {/* Показываем доступные типы */}
                  {getAvailableEquipmentTypes()
                    .filter(type => type !== item.equipmentType)
                    .map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Серийный номер */}
            <Grid item xs={12} md={hasMac ? 6 : 12}>
              <TextField
                fullWidth
                label="Серийный номер"
                value={item.serialNumber}
                onChange={(e) => updateEquipment(index, 'serialNumber', e.target.value)}
                placeholder="Введите серийный номер"
                required
              />
            </Grid>

            {/* MAC-адрес - только для определенных типов */}
            {hasMac && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="MAC-адрес"
                  value={item.macAddress}
                  onChange={(e) => updateEquipment(index, 'macAddress', e.target.value)}
                  placeholder="Введите MAC-адрес"
                  helperText="Обязательно для данного типа оборудования"
                  required
                />
              </Grid>
            )}

            {/* Количество - только для коннекторов */}
            {maxCount > 1 && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Количество"
                  type="number"
                  value={item.count}
                  onChange={(e) => updateEquipment(index, 'count', Math.min(parseInt(e.target.value) || 1, maxCount))}
                  inputProps={{ min: 1, max: maxCount }}
                  helperText={`Максимум ${maxCount} шт.`}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Фотографии оборудования
              </Typography>
            </Grid>

            {/* Фото оборудования */}
            <Grid item xs={12} md={hasMac ? 4 : 6}>
              <PhotoUpload
                label="Фото оборудования"
                value={item.equipmentPhoto}
                onChange={(file) => updateEquipment(index, 'equipmentPhoto', file)}
                required
              />
            </Grid>

            {/* Фото серийного номера */}
            <Grid item xs={12} md={hasMac ? 4 : 6}>
              <PhotoUpload
                label="Фото серийного номера"
                value={item.serialPhoto}
                onChange={(file) => updateEquipment(index, 'serialPhoto', file)}
                required
              />
            </Grid>

            {/* Фото MAC-адреса - только для определенных типов */}
            {hasMac && (
              <Grid item xs={12} md={4}>
                <PhotoUpload
                  label="Фото MAC-адреса"
                  value={item.macPhoto}
                  onChange={(file) => updateEquipment(index, 'macPhoto', file)}
                  required
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (equipment.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Оборудование
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Нет добавленного оборудования
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={addEquipment}
          variant="contained"
        >
          Добавить оборудование
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Заголовок с прогрессом */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Оборудование</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={`${Math.round(getCompletionProgress())}% заполнено`}
              color={getCompletionProgress() === 100 ? 'success' : 'primary'}
              size="small"
            />
            {getAvailableEquipmentTypes().length > 0 && (
              <Button
                startIcon={<AddIcon />}
                onClick={addEquipment}
                variant="outlined"
                size="small"
              >
                Добавить
              </Button>
            )}
          </Box>
        </Box>
        
        {/* Прогресс-бар */}
        <LinearProgress 
          variant="determinate" 
          value={getCompletionProgress()}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      {/* Навигация по оборудованию */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Заполнение оборудования ({activeEquipmentStep + 1} из {equipment.length})
        </Typography>
        
        {/* Мини-степпер */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {equipment.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                label={index + 1}
                onClick={() => setActiveEquipmentStep(index)}
                color={index === activeEquipmentStep ? 'primary' : 'default'}
                variant={isEquipmentComplete(item) ? 'filled' : 'outlined'}
                size="small"
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: isEquipmentComplete(item) ? 'success.main' : undefined,
                  color: isEquipmentComplete(item) ? 'white' : undefined,
                  '&:hover': {
                    bgcolor: isEquipmentComplete(item) ? 'success.dark' : undefined,
                  }
                }}
              />
              {index < equipment.length - 1 && (
                <Box sx={{ width: 20, height: 2, bgcolor: 'grey.300', mx: 0.5 }} />
              )}
            </Box>
          ))}
        </Box>

        {/* Кнопки навигации */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<PrevIcon />}
            onClick={handlePrevEquipment}
            disabled={activeEquipmentStep === 0}
            variant="outlined"
            size="small"
          >
            Предыдущее
          </Button>
          <Button
            endIcon={<NextIcon />}
            onClick={handleNextEquipment}
            disabled={activeEquipmentStep === equipment.length - 1}
            variant="outlined"
            size="small"
          >
            Следующее
          </Button>
        </Box>
      </Box>

      {/* Текущее оборудование */}
      {equipment[activeEquipmentStep] && renderEquipmentForm(equipment[activeEquipmentStep], activeEquipmentStep)}

      {/* Информационные сообщения */}
      <Box sx={{ mt: 3 }}>
        {getCompletionProgress() === 100 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Все оборудование заполнено! Можете переходить к следующему шагу.
          </Alert>
        )}
        
        {getAvailableEquipmentTypes().length === 0 && getCompletionProgress() < 100 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Все доступные типы оборудования добавлены. Завершите заполнение данных.
          </Alert>
        )}
      </Box>
    </Box>
  );
};