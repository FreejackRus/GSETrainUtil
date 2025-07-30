import React, { useState, useCallback, useMemo } from 'react';
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
  Fab,
  Zoom,
  Collapse,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import type { EquipmentFormItem } from '../../../entities/application';
import { PhotoUpload } from '../../../shared/ui';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down(400));
  const [isPhotosExpanded, setIsPhotosExpanded] = useState(!isMobile);

  // Получаем доступные типы оборудования (те, которые еще не добавлены или могут быть добавлены повторно)
  const getAvailableEquipmentTypes = useMemo(() => {
    return Object.keys(EQUIPMENT_CONFIG).filter(type => {
      const existingCount = equipment.filter(item => item.equipmentType === type).length;
      const maxCount = EQUIPMENT_CONFIG[type as keyof typeof EQUIPMENT_CONFIG]?.maxCount || 1;
      return existingCount < maxCount;
    });
  }, [equipment]);

  const addEquipment = useCallback(() => {
    if (getAvailableEquipmentTypes.length === 0) return;

    const newEquipment: EquipmentFormItem = {
      equipmentType: getAvailableEquipmentTypes[0] || '',
      serialNumber: '',
      macAddress: '',
      count: 1,
      equipmentPhoto: null,
      serialPhoto: null,
      macPhoto: null,
    };
    onChange([...equipment, newEquipment]);
    setActiveEquipmentStep(equipment.length); // Переходим к новому элементу
  }, [equipment, getAvailableEquipmentTypes, onChange]);

  const removeEquipment = useCallback((index: number) => {
    const newEquipment = equipment.filter((_, i) => i !== index);
    onChange(newEquipment);
    // Корректируем активный шаг
    if (activeEquipmentStep >= newEquipment.length && newEquipment.length > 0) {
      setActiveEquipmentStep(newEquipment.length - 1);
    } else if (newEquipment.length === 0) {
      setActiveEquipmentStep(0);
    }
  }, [equipment, activeEquipmentStep, onChange]);

  const updateEquipment = useCallback((index: number, field: keyof EquipmentFormItem, value: any) => {
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
  }, [equipment, onChange]);

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
    if (!item.equipmentType || !item.serialNumber || !item.equipmentPhoto || !item.serialPhoto) {
      return false;
    }
    
    const hasMac = needsMacAddress(item.equipmentType);
    if (hasMac && (!item.macAddress || !item.macPhoto)) {
      return false;
    }
    
    return true;
  };

  // Получаем прогресс заполнения
  const getCompletionProgress = useMemo(() => {
    if (equipment.length === 0) return 0;
    const completedCount = equipment.filter(isEquipmentComplete).length;
    return (completedCount / equipment.length) * 100;
  }, [equipment]);

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

  // Мемоизируем функции навигации
  const handleNextEquipment = useCallback(() => {
    if (activeEquipmentStep < equipment.length - 1) {
      setActiveEquipmentStep(activeEquipmentStep + 1);
    }
  }, [activeEquipmentStep, equipment.length]);

  const handlePrevEquipment = useCallback(() => {
    if (activeEquipmentStep > 0) {
      setActiveEquipmentStep(activeEquipmentStep - 1);
    }
  }, [activeEquipmentStep]);

  const renderEquipmentForm = (item: EquipmentFormItem, index: number) => {
    const maxCount = getMaxCount(item.equipmentType);
    const hasMac = needsMacAddress(item.equipmentType);
    const isComplete = isEquipmentComplete(item);
    
    return (
      <Card sx={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: 2,
        mx: isMobile ? -1 : 0, // Расширяем на мобильных для лучшего использования пространства
      }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          {/* Заголовок с адаптивным дизайном */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'flex-start' : 'center', 
            mb: 2,
            flexDirection: isSmallMobile ? 'column' : 'row',
            gap: isSmallMobile ? 1 : 0
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flexWrap: 'wrap',
              flex: 1
            }}>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                color="primary"
                sx={{ 
                  fontSize: isSmallMobile ? '0.9rem' : undefined,
                  lineHeight: 1.2,
                  wordBreak: 'break-word'
                }}
              >
                {item.equipmentType || `Оборудование #${index + 1}`}
              </Typography>
              {isComplete && (
                <Chip 
                  icon={<CheckIcon />} 
                  label={isMobile ? "✓" : "Заполнено"} 
                  color="success" 
                  size="small" 
                />
              )}
              {!isComplete && item.equipmentType && (
                <Chip 
                  icon={<WarningIcon />} 
                  label={isMobile ? "!" : "Требует заполнения"} 
                  color="warning" 
                  size="small" 
                />
              )}
            </Box>
            <IconButton
              onClick={() => removeEquipment(index)}
              color="error"
              size="small"
              sx={{ 
                alignSelf: isSmallMobile ? 'flex-end' : 'center',
                mt: isSmallMobile ? -4 : 0
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>

          <Grid container spacing={isMobile ? 2 : 3}>
            {/* Форма выбора типа и количества с адаптивной сеткой */}
            <Grid item xs={12}>
              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel>Тип оборудования</InputLabel>
                <Select
                  value={item.equipmentType}
                  onChange={(e) => updateEquipment(index, 'equipmentType', e.target.value)}
                  label="Тип оборудования"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: isMobile ? 200 : 300,
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Выберите тип оборудования</em>
                  </MenuItem>
                  {/* Показываем текущий выбранный тип, даже если он недоступен для новых */}
                  {item.equipmentType && !getAvailableEquipmentTypes.includes(item.equipmentType) && (
                    <MenuItem key={item.equipmentType} value={item.equipmentType}>
                      {item.equipmentType} (выбрано)
                    </MenuItem>
                  )}
                  {getAvailableEquipmentTypes
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
                size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
                  label="Количество"
                  type="number"
                  value={item.count}
                  onChange={(e) => updateEquipment(index, 'count', Math.min(parseInt(e.target.value) || 1, maxCount))}
                  inputProps={{ 
                    min: 1, 
                    max: maxCount,
                    style: { textAlign: isMobile ? 'center' : 'left' }
                  }}
                  helperText={`Максимум ${maxCount} шт.`}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: isMobile ? 1 : 2 }} />
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: isMobile ? 'pointer' : 'default'
                }}
                onClick={isMobile ? () => setIsPhotosExpanded(!isPhotosExpanded) : undefined}
              >
                <Typography 
                  variant={isMobile ? "body1" : "subtitle2"} 
                  sx={{ 
                    mb: isMobile ? 1 : 2,
                    fontWeight: 'medium'
                  }}
                >
                  Фотографии оборудования
                </Typography>
                {isMobile && (
                  <IconButton size="small">
                    {isPhotosExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
              </Box>
            </Grid>

            {/* Сворачиваемая секция фотографий */}
            <Collapse in={isPhotosExpanded} timeout="auto" unmountOnExit>
              <Grid container spacing={isMobile ? 1 : 2}>
                {/* Фото оборудования */}
                <Grid item xs={12} sm={6} md={hasMac ? 4 : 6}>
                  <PhotoUpload
                    label="Фото оборудования"
                    photo={item.equipmentPhoto}
                    onPhotoChange={(file) => updateEquipment(index, 'equipmentPhoto', file)}
                    required
                    compact={isMobile}
                  />
                </Grid>

                {/* Фото серийного номера */}
                <Grid item xs={12} sm={6} md={hasMac ? 4 : 6}>
                  <PhotoUpload
                    label="Фото серийного номера"
                    photo={item.serialPhoto}
                    onPhotoChange={(file) => updateEquipment(index, 'serialPhoto', file)}
                    required
                    compact={isMobile}
                  />
                </Grid>

                {/* Фото MAC-адреса - только для определенных типов */}
                {hasMac && (
                  <Grid item xs={12} sm={hasMac ? 12 : 6} md={4}>
                    <PhotoUpload
                      label="Фото MAC-адреса"
                      photo={item.macPhoto || null}
                      onPhotoChange={(file) => updateEquipment(index, 'macPhoto', file)}
                      required
                      compact={isMobile}
                    />
                  </Grid>
                )}
              </Grid>
            </Collapse>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (equipment.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: isMobile ? 3 : 4,
        px: isMobile ? 2 : 0
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          sx={{ mb: 2 }}
        >
          Оборудование
        </Typography>
        <Typography 
          variant="body2" 
          color="textSecondary" 
          sx={{ mb: 3, fontSize: isMobile ? '0.875rem' : undefined }}
        >
          Нет добавленного оборудования
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={addEquipment}
          variant="contained"
          size={isMobile ? "large" : "medium"}
          fullWidth={isMobile}
          sx={{ maxWidth: isMobile ? undefined : 200 }}
        >
          Добавить оборудование
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ px: isMobile ? 1 : 0 }}>
      {/* Заголовок с прогрессом - адаптивный дизайн */}
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          mb: 2,
          flexDirection: isSmallMobile ? 'column' : 'row',
          gap: isSmallMobile ? 1 : 0
        }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"}
            sx={{ 
              fontSize: isSmallMobile ? '1.1rem' : undefined,
              mb: isSmallMobile ? 1 : 0
            }}
          >
            Оборудование
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? 1 : 2,
            flexDirection: isSmallMobile ? 'column' : 'row',
            width: isSmallMobile ? '100%' : 'auto'
          }}>
            <Chip 
              label={`${Math.round(getCompletionProgress)}% заполнено`}
              color={getCompletionProgress === 100 ? 'success' : 'primary'}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                fontSize: isSmallMobile ? '0.75rem' : undefined,
                width: isSmallMobile ? '100%' : 'auto'
              }}
            />
            {getAvailableEquipmentTypes().length > 0 && (
              <Button
                startIcon={<AddIcon />}
                onClick={addEquipment}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                fullWidth={isSmallMobile}
              >
                {isMobile ? "Добавить" : "Добавить оборудование"}
              </Button>
            )}
          </Box>
        </Box>
        
        {/* Прогресс-бар */}
        <LinearProgress 
          variant="determinate" 
          value={getCompletionProgress}
          sx={{ 
            height: isMobile ? 4 : 6, 
            borderRadius: 3,
            bgcolor: 'grey.200'
          }}
        />
      </Box>

      {/* Навигация по оборудованию - улучшенная для мобильных */}
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <Typography 
          variant={isMobile ? "body2" : "subtitle2"} 
          sx={{ 
            mb: 1,
            fontSize: isSmallMobile ? '0.8rem' : undefined,
            fontWeight: 'medium'
          }}
        >
          Заполнение оборудования ({activeEquipmentStep + 1} из {equipment.length})
        </Typography>
        
        {/* Мини-степпер с улучшенной мобильной навигацией */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? 0.5 : 1, 
          mb: 2, 
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'center' : 'flex-start'
        }}>
          {equipment.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                label={isSmallMobile ? (index + 1) : `${index + 1}${item.equipmentType ? ` - ${item.equipmentType.substring(0, 8)}${item.equipmentType.length > 8 ? '...' : ''}` : ''}`}
                onClick={() => setActiveEquipmentStep(index)}
                color={index === activeEquipmentStep ? 'primary' : 'default'}
                variant={isEquipmentComplete(item) ? 'filled' : 'outlined'}
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: isEquipmentComplete(item) ? 'success.main' : undefined,
                  color: isEquipmentComplete(item) ? 'white' : undefined,
                  fontSize: isSmallMobile ? '0.7rem' : undefined,
                  height: isSmallMobile ? 24 : undefined,
                  minWidth: isSmallMobile ? 24 : undefined,
                  '&:hover': {
                    bgcolor: isEquipmentComplete(item) ? 'success.dark' : undefined,
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              />
              {index < equipment.length - 1 && !isMobile && (
                <Box sx={{ width: 20, height: 2, bgcolor: 'grey.300', mx: 0.5 }} />
              )}
            </Box>
          ))}
        </Box>

        {/* Кнопки навигации - улучшенные для мобильных */}
        <Box sx={{ 
          display: 'flex', 
          gap: isMobile ? 1 : 2, 
          flexDirection: isMobile ? 'row' : 'row',
          justifyContent: isMobile ? 'space-between' : 'flex-start'
        }}>
          <Button
            startIcon={!isSmallMobile ? <PrevIcon /> : undefined}
            onClick={handlePrevEquipment}
            disabled={activeEquipmentStep === 0}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ 
              flex: isMobile ? 1 : 'none',
              minWidth: isSmallMobile ? 'auto' : undefined
            }}
          >
            {isSmallMobile ? "←" : "Предыдущее"}
          </Button>
          <Button
            endIcon={!isSmallMobile ? <NextIcon /> : undefined}
            onClick={handleNextEquipment}
            disabled={activeEquipmentStep === equipment.length - 1}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ 
              flex: isMobile ? 1 : 'none',
              minWidth: isSmallMobile ? 'auto' : undefined
            }}
          >
            {isSmallMobile ? "→" : "Следующее"}
          </Button>
        </Box>
      </Box>

      {/* Текущее оборудование */}
      {equipment[activeEquipmentStep] && renderEquipmentForm(equipment[activeEquipmentStep], activeEquipmentStep)}

      {/* Информационные сообщения - адаптивные для мобильных */}
      <Box sx={{ mt: isMobile ? 2 : 3 }}>
        {getCompletionProgress === 100 && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2,
              fontSize: isMobile ? '0.875rem' : undefined,
              '& .MuiAlert-message': {
                fontSize: isMobile ? '0.875rem' : undefined
              }
            }}
            icon={!isSmallMobile ? undefined : false}
          >
            {isMobile ? "Все оборудование заполнено!" : "Все оборудование заполнено! Можете переходить к следующему шагу."}
          </Alert>
        )}
        
        {getAvailableEquipmentTypes.length === 0 && getCompletionProgress < 100 && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2,
              fontSize: isMobile ? '0.875rem' : undefined,
              '& .MuiAlert-message': {
                fontSize: isMobile ? '0.875rem' : undefined
              }
            }}
            icon={!isSmallMobile ? undefined : false}
          >
            {isMobile ? "Все типы добавлены. Завершите заполнение." : "Все доступные типы оборудования добавлены. Завершите заполнение данных."}
          </Alert>
        )}
      </Box>

      {/* Плавающая кнопка добавления для мобильных */}
      {isMobile && getAvailableEquipmentTypes.length > 0 && (
        <Zoom in={true}>
          <Fab
            color="primary"
            aria-label="добавить оборудование"
            onClick={addEquipment}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <AddIcon />
          </Fab>
        </Zoom>
      )}
    </Box>
  );
};