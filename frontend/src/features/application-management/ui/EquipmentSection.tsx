import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  Fab,
  Zoom,
  useTheme,
  useMediaQuery,
  Collapse,
  IconButton,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckIcon from '@mui/icons-material/Check';
import WarningIcon from '@mui/icons-material/Warning';
import type { EquipmentFormItem } from '../../../entities/application';
import { PhotoUpload } from '../../../shared/ui';
import './EquipmentSection.css';

interface EquipmentSectionProps {
  formData: { equipment: EquipmentFormItem[] };
  onFormDataChange: (data: Partial<{ equipment: EquipmentFormItem[] }>) => void;
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
  equipment = [],
  onChange
}) => {
   const equipment = formData.equipment || [];
  const [activeEquipmentStep, setActiveEquipmentStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down(400));
  const [isPhotosExpanded, setIsPhotosExpanded] = useState(!isMobile);

  // Create a stable reference to onChange
  const onChangeRef = React.useRef(onChange);
  const hasInitialized = React.useRef(false);
  
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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
      quantity: 1,
      photos: {
        equipment: null,
        serial: null,
        mac: null,
      },
    };
    onChangeRef.current([...equipment, newEquipment]);
    setActiveEquipmentStep(equipment.length); // Переходим к новому элементу
  }, [equipment, getAvailableEquipmentTypes]);

  const removeEquipment = useCallback((index: number) => {
    const newEquipment = equipment.filter((_, i) => i !== index);
    onChangeRef.current(newEquipment);
    
    // Корректируем активный шаг
    if (activeEquipmentStep >= newEquipment.length) {
      setActiveEquipmentStep(Math.max(0, newEquipment.length - 1));
    }
  }, [equipment, activeEquipmentStep]);

  const updateEquipment = useCallback((index: number, field: string, value: string | number | File | null) => {
    const newEquipment = [...equipment];
    
    // Обработка фотографий
    if (field.includes('Photo')) {
      newEquipment[index] = { 
        ...newEquipment[index], 
        photos: {
          ...newEquipment[index].photos,
          [field]: value
        }
      };
    } else {
      newEquipment[index] = { ...newEquipment[index], [field]: value };
    }
    
    // Если изменился тип оборудования, сбрасываем MAC-адрес если он не нужен
    if (field === 'equipmentType') {
      const config = EQUIPMENT_CONFIG[value as keyof typeof EQUIPMENT_CONFIG];
      if (config && !config.hasMac) {
        newEquipment[index].macAddress = '';
        newEquipment[index].photos.mac = null;
      }
      // Устанавливаем количество по умолчанию
      newEquipment[index].quantity = 1;
    }
    
    onChangeRef.current(newEquipment);
  }, [equipment]);

  // Проверяем, нужен ли MAC-адрес для данного типа оборудования
  const needsMacAddress = useCallback((equipmentType: string) => {
    const config = EQUIPMENT_CONFIG[equipmentType as keyof typeof EQUIPMENT_CONFIG];
    return config?.hasMac || false;
  }, []);

  // Получаем максимальное количество для типа оборудования
  const getMaxCount = useCallback((equipmentType: string) => {
    const config = EQUIPMENT_CONFIG[equipmentType as keyof typeof EQUIPMENT_CONFIG];
    return config?.maxCount || 1;
  }, []);

  // Проверяем, заполнено ли оборудование
  const isEquipmentComplete = useCallback((item: EquipmentFormItem) => {
    if (!item.equipmentType || !item.serialNumber || !item.photos.equipment || !item.photos.serial) {
      return false;
    }
    
    const hasMac = needsMacAddress(item.equipmentType);
    if (hasMac && (!item.macAddress || !item.photos.mac)) {
      return false;
    }
    
    return true;
  }, [needsMacAddress]);

  // Получаем прогресс заполнения
  const getCompletionProgress = useMemo(() => {
    if (equipment.length === 0) return 0;
    const completedCount = equipment.filter(isEquipmentComplete).length;
    return (completedCount / equipment.length) * 100;
  }, [equipment, isEquipmentComplete]);

  // Автоматически добавляем все типы оборудования при первом рендере
  React.useEffect(() => {
    if (equipment.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      const initialEquipment = Object.keys(EQUIPMENT_CONFIG).map(type => ({
        equipmentType: type,
        serialNumber: '',
        macAddress: '',
        quantity: 1,
        photos: {
          equipmentPhoto: null,
          serialPhoto: null,
          macPhoto: null,
        },
      }));
      onChangeRef.current(initialEquipment.map(item => ({
        ...item,
        photos: {
          equipment: null,
          serial: null,
          mac: null
        }
      })));
    }
  }, [equipment.length]);

  // Мемоизируем функции навигации
  const goToNext = useCallback(() => {
    if (activeEquipmentStep < equipment.length - 1) {
      setActiveEquipmentStep(activeEquipmentStep + 1);
    }
  }, [activeEquipmentStep, equipment.length]);

  const goToPrevious = useCallback(() => {
    if (activeEquipmentStep > 0) {
      setActiveEquipmentStep(activeEquipmentStep - 1);
    }
  }, [activeEquipmentStep]);

  const renderEquipmentForm = useCallback((item: EquipmentFormItem, index: number) => {
    const maxCount = getMaxCount(item.equipmentType);
    const hasMac = needsMacAddress(item.equipmentType);
    const isComplete = isEquipmentComplete(item);
    
    return (
      <Card className={`equipment-card ${isMobile ? 'mobile' : ''}`}>
        <CardContent className={`equipment-card-content ${isMobile ? 'mobile' : ''}`}>
          {/* Заголовок с адаптивным дизайном */}
          <Box className={`equipment-card-header ${isSmallMobile ? 'small-mobile' : ''}`}>
            <Box className="equipment-card-title">
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                color="primary"
                className={`equipment-title ${isSmallMobile ? 'small-mobile' : ''}`}
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
              className={`delete-button ${isSmallMobile ? 'small-mobile' : ''}`}
            >
              <DeleteIcon />
            </IconButton>
          </Box>

          <Grid container spacing={isMobile ? 2 : 3}>
            {/* Форма выбора типа и количества с адаптивной сеткой */}
            <Grid item={true} xs={12}>
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
            <Grid item={true} xs={12} md={hasMac ? 6 : 12}>
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
              <Grid item={true} xs={12} md={6}>
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
              <Grid item={true} xs={12} md={6}>
                <TextField
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  label="Количество"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateEquipment(index, 'quantity', Math.min(parseInt(e.target.value) || 1, maxCount))}
                  inputProps={{ 
                    min: 1, 
                    max: maxCount,
                    style: { textAlign: isMobile ? 'center' : 'left' }
                  }}
                  helperText={`Максимум ${maxCount} шт.`}
                />
              </Grid>
            )}

            <Grid item={true} xs={12}>
              <Divider className={`photo-divider ${isMobile ? 'mobile' : ''}`} />
              <Box 
                className={`photo-section-header ${isMobile ? 'mobile' : ''}`}
                onClick={isMobile ? () => setIsPhotosExpanded(!isPhotosExpanded) : undefined}
              >
                <Typography 
                  variant={isMobile ? "body1" : "subtitle2"} 
                  className={`photo-section-title ${isMobile ? 'mobile' : ''}`}
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
                <Grid item={true} xs={12} sm={6} md={hasMac ? 4 : 6}>
                  <PhotoUpload
                    label="Фото оборудования"
                    photo={item.photos.equipment ?? null}
                    onPhotoChange={(file) => updateEquipment(index, 'equipmentPhoto', file)}
                    required
                    compact={isMobile}
                  />
                </Grid>

                {/* Фото серийного номера */}
                <Grid item={true} xs={12} sm={6} md={hasMac ? 4 : 6}>
                  <PhotoUpload
                    label="Фото серийного номера"
                    photo={item.photos.serial ?? null}
                    onPhotoChange={(file) => updateEquipment(index, 'serialPhoto', file)}
                    required
                    compact={isMobile}
                  />
                </Grid>

                {/* Фото MAC-адреса - только для определенных типов */}
                {hasMac && (
                  <Grid item={true} xs={12} sm={hasMac ? 12 : 6} md={4}>
                    <PhotoUpload
                      label="Фото MAC-адреса"
                      photo={item.photos.mac ?? null}
                      onPhotoChange={(file) => updateEquipment(index, 'macPhoto', file)}
                      required
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                )}
              </Grid>
            </Collapse>
          </Grid>
        </CardContent>
      </Card>
    );
  }, [isMobile, isSmallMobile, getMaxCount, needsMacAddress, isEquipmentComplete, getAvailableEquipmentTypes, updateEquipment, removeEquipment, isPhotosExpanded]);

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
    <Box className="equipment-section">
      {/* Заголовок с прогрессом - адаптивный дизайн */}
      <Box className="equipment-header">
        <Box className={`equipment-header-content ${isSmallMobile ? 'small-mobile' : ''}`}>
          <Typography 
            variant={isMobile ? "h6" : "h5"}
            className={`equipment-title ${isSmallMobile ? 'small-mobile' : ''}`}
          >
            Оборудование
          </Typography>
          <Box className={`equipment-header-actions ${isSmallMobile ? 'small-mobile' : ''}`}>
            <Chip 
              label={`${Math.round(getCompletionProgress)}% заполнено`}
              color={getCompletionProgress === 100 ? 'success' : 'primary'}
              size={isMobile ? "small" : "medium"}
              className={`progress-chip ${isSmallMobile ? 'small-mobile' : ''}`}
            />
            {getAvailableEquipmentTypes.length > 0 && (
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
          className={`progress-bar ${isMobile ? 'mobile' : ''}`}
        />
      </Box>

      {/* Навигация по оборудованию - улучшенная для мобильных */}
      <Box className={`equipment-navigation ${isMobile ? 'mobile' : ''}`}>
        <Typography 
          variant={isMobile ? "body2" : "subtitle2"} 
          className={`navigation-title ${isSmallMobile ? 'small-mobile' : ''}`}
        >
          Заполнение оборудования ({activeEquipmentStep + 1} из {equipment.length})
        </Typography>
        
        {/* Мини-степпер с улучшенной мобильной навигацией */}
        <Box className={`equipment-stepper ${isMobile ? 'mobile' : ''}`}>
          {equipment.map((item, index) => (
            <Box key={index} className="stepper-item">
              <Chip
                label={isSmallMobile ? (index + 1) : `${index + 1}${item.equipmentType ? ` - ${item.equipmentType.substring(0, 8)}${item.equipmentType.length > 8 ? '...' : ''}` : ''}`}
                onClick={() => setActiveEquipmentStep(index)}
                color={index === activeEquipmentStep ? 'primary' : 'default'}
                variant={isEquipmentComplete(item) ? 'filled' : 'outlined'}
                size={isMobile ? "small" : "medium"}
                className={`stepper-chip ${isEquipmentComplete(item) ? 'completed' : ''} ${isSmallMobile ? 'small-mobile' : ''}`}
              />
              {index < equipment.length - 1 && !isMobile && (
                <Box className="stepper-connector" />
              )}
            </Box>
          ))}
        </Box>

        {/* Кнопки навигации - улучшенные для мобильных */}
        <Box className={`navigation-buttons ${isMobile ? 'mobile' : ''}`}>
          <Button
            startIcon={!isSmallMobile ? <NavigateBeforeIcon /> : undefined}
            onClick={goToPrevious}
            disabled={activeEquipmentStep === 0}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            className={`nav-button ${isMobile ? 'mobile' : ''} ${isSmallMobile ? 'small-mobile' : ''}`}
          >
            {isSmallMobile ? "←" : "Предыдущее"}
          </Button>
          <Button
            endIcon={!isSmallMobile ? <NavigateNextIcon /> : undefined}
            onClick={goToNext}
            disabled={activeEquipmentStep === equipment.length - 1}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            className={`nav-button ${isMobile ? 'mobile' : ''} ${isSmallMobile ? 'small-mobile' : ''}`}
          >
            {isSmallMobile ? "→" : "Следующее"}
          </Button>
        </Box>
      </Box>

      {/* Текущее оборудование */}
      {equipment[activeEquipmentStep] && renderEquipmentForm(equipment[activeEquipmentStep], activeEquipmentStep)}

      {/* Информационные сообщения - адаптивные для мобильных */}
      <Box className={`info-messages ${isMobile ? 'mobile' : ''}`}>
        {getCompletionProgress === 100 && (
          <Alert 
            severity="success" 
            className={`info-alert ${isMobile ? 'mobile' : ''}`}
            icon={!isSmallMobile ? undefined : false}
          >
            {isMobile ? "Все оборудование заполнено!" : "Все оборудование заполнено! Можете переходить к следующему шагу."}
          </Alert>
        )}
        
        {getAvailableEquipmentTypes.length === 0 && getCompletionProgress < 100 && (
          <Alert 
            severity="info" 
            className={`info-alert ${isMobile ? 'mobile' : ''}`}
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
            className="floating-add-button"
          >
            <AddIcon />
          </Fab>
        </Zoom>
      )}
    </Box>
  );
};