import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { CarriageFormItem, EquipmentFormItem } from '../../../entities/application/model/types';
import { PhotoUpload } from '../../PhotoUpload/PhotoUpload';
import { AutocompleteField } from '../../AutocompleteField/AutocompleteField';
import { referenceApi } from '../../../api/reference';

interface StepCarriagesProps {
  carriages: CarriageFormItem[];
  onCarriagesChange: (carriages: CarriageFormItem[]) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const StepCarriages: React.FC<StepCarriagesProps> = ({ 
  carriages, 
  onCarriagesChange,
  onValidationChange 
}) => {
  const [carriageTypes, setCarriageTypes] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);

  // Загружаем справочные данные
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [carriageTypesData, equipmentTypesData] = await Promise.all([
          referenceApi.getCarriageTypes(),
          referenceApi.getEquipmentTypes(),
        ]);
        setCarriageTypes(carriageTypesData);
        setEquipmentTypes(equipmentTypesData);
      } catch (error) {
        console.error('Ошибка загрузки справочных данных:', error);
      }
    };

    loadReferenceData();
  }, []);

  // Валидация формы
  const validateForm = () => {
    if (carriages.length === 0) return false;

    return carriages.every(carriage => {
      // Проверяем заполненность полей вагона и фото вагона
      const carriageValid = carriage.carriageNumber.trim() !== '' && 
                           carriage.carriageType.trim() !== '' &&
                           carriage.carriagePhoto !== null;
      
      // Проверяем заполненность оборудования
      const equipmentValid = !carriage.equipment || carriage.equipment.length === 0 || 
        carriage.equipment.every((equipment: EquipmentFormItem) =>
          equipment.equipmentType.trim() !== '' &&
          equipment.serialNumber.trim() !== '' &&
          equipment.quantity > 0 &&
          equipment.photos.equipment !== null &&
          equipment.photos.serial !== null &&
          // MAC-адрес и фото MAC обязательны только для определенных типов оборудования
          (isNetworkEquipment(equipment.equipmentType) ? 
            equipment.macAddress.trim() !== '' && 
            isValidMacAddress(equipment.macAddress) &&
            equipment.photos.mac !== null : true)
        );

      return carriageValid && equipmentValid;
    });
  };

  // Проверяем, является ли оборудование сетевым (требует MAC-адрес)
  const isNetworkEquipment = (equipmentType: string): boolean => {
    const networkTypes = ['точка доступа', 'маршрутизатор', 'коммутатор'];
    return networkTypes.some(type => equipmentType.toLowerCase().includes(type));
  };

  // Форматирование MAC-адреса
  const formatMacAddress = (value: string): string => {
    // Удаляем все символы кроме букв и цифр
    const cleaned = value.replace(/[^a-fA-F0-9]/g, '');
    
    // Ограничиваем до 12 символов
    const limited = cleaned.slice(0, 12);
    
    // Добавляем двоеточия каждые 2 символа
    const formatted = limited.replace(/(.{2})/g, '$1:').slice(0, -1);
    
    return formatted.toUpperCase();
  };

  // Валидация MAC-адреса
  const isValidMacAddress = (mac: string): boolean => {
    const macRegex = /^([0-9A-F]{2}[:]){5}([0-9A-F]{2})$/;
    return macRegex.test(mac);
  };

  // Уведомляем о валидации при изменении данных
  useEffect(() => {
    const isValid = validateForm();
    onValidationChange?.(isValid);
  }, [carriages, onValidationChange]);

  // Функции для работы с вагонами
  const handleAddCarriage = () => {
    const newCarriage: CarriageFormItem = {
      id: Date.now().toString(),
      carriageNumber: '',
      carriageType: '',
      carriagePhoto: null,
      equipment: []
    };
    onCarriagesChange([...carriages, newCarriage]);
  };

  const handleRemoveCarriage = (index: number) => {
    const newCarriages = carriages.filter((_, i) => i !== index);
    onCarriagesChange(newCarriages);
  };

  const handleCarriageChange = (index: number, field: keyof CarriageFormItem, value: any) => {
    const newCarriages = [...carriages];
    newCarriages[index] = { ...newCarriages[index], [field]: value };
    onCarriagesChange(newCarriages);
  };

  // Функции для работы с оборудованием
  const handleAddEquipment = (carriageIndex: number) => {
    const newEquipment: EquipmentFormItem = {
      equipmentType: '',
      serialNumber: '',
      macAddress: '',
      quantity: 1,
      carriageId: carriages[carriageIndex].id,
      photos: {
        equipment: null,
        serial: null,
        mac: null,
      }
    };

    const newCarriages = [...carriages];
    if (!newCarriages[carriageIndex].equipment) {
      newCarriages[carriageIndex].equipment = [];
    }
    newCarriages[carriageIndex].equipment!.push(newEquipment);
    onCarriagesChange(newCarriages);
  };

  const handleRemoveEquipment = (carriageIndex: number, equipmentIndex: number) => {
    const newCarriages = [...carriages];
    newCarriages[carriageIndex].equipment = newCarriages[carriageIndex].equipment?.filter((_item: EquipmentFormItem, i: number) => i !== equipmentIndex) || [];
    onCarriagesChange(newCarriages);
  };

  const handleEquipmentChange = (
    carriageIndex: number, 
    equipmentIndex: number, 
    field: keyof EquipmentFormItem, 
    value: any
  ) => {
    const newCarriages = [...carriages];
    if (newCarriages[carriageIndex].equipment) {
      if (field === 'macAddress' && typeof value === 'string') {
        // Форматируем MAC-адрес при вводе
        value = formatMacAddress(value);
      }
      newCarriages[carriageIndex].equipment![equipmentIndex] = {
        ...newCarriages[carriageIndex].equipment![equipmentIndex],
        [field]: value
      };
      onCarriagesChange(newCarriages);
    }
  };

  const handleEquipmentPhotoChange = (
    carriageIndex: number,
    equipmentIndex: number,
    photoType: 'equipment' | 'serial' | 'mac',
    file: File | null
  ) => {
    const newCarriages = [...carriages];
    if (newCarriages[carriageIndex].equipment) {
      newCarriages[carriageIndex].equipment![equipmentIndex].photos[photoType] = file;
      onCarriagesChange(newCarriages);
    }
  };

  // Проверка заполненности вагона
  const isCarriageComplete = (carriage: CarriageFormItem): boolean => {
    const carriageFieldsComplete = carriage.carriageNumber.trim() !== '' && 
                                  carriage.carriageType.trim() !== '' &&
                                  carriage.carriagePhoto !== null;
    
    const equipmentComplete = !carriage.equipment || carriage.equipment.length === 0 || 
      carriage.equipment.every((equipment: EquipmentFormItem) =>
        equipment.equipmentType.trim() !== '' &&
        equipment.serialNumber.trim() !== '' &&
        equipment.quantity > 0 &&
        equipment.photos.equipment !== null &&
        equipment.photos.serial !== null &&
        (isNetworkEquipment(equipment.equipmentType) ? 
          equipment.macAddress.trim() !== '' && 
          isValidMacAddress(equipment.macAddress) &&
          equipment.photos.mac !== null : true)
      );
    return carriageFieldsComplete && equipmentComplete;
  };

  // Получение ошибок для оборудования
  const getEquipmentErrors = (equipment: EquipmentFormItem): string[] => {
    const errors: string[] = [];
    
    if (!equipment.equipmentType.trim()) errors.push('Не указан тип оборудования');
    if (!equipment.serialNumber.trim()) errors.push('Не указан серийный номер');
    if (equipment.quantity <= 0) errors.push('Количество должно быть больше 0');
    
    if (isNetworkEquipment(equipment.equipmentType)) {
      if (!equipment.macAddress.trim()) {
        errors.push('MAC-адрес обязателен для сетевого оборудования');
      } else if (!isValidMacAddress(equipment.macAddress)) {
        errors.push('Неверный формат MAC-адреса');
      }
    }
    
    return errors;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Вагоны и оборудование
      </Typography>

      {carriages.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Добавьте хотя бы один вагон для продолжения
        </Alert>
      )}

      {carriages.map((carriage, carriageIndex) => (
        <Card key={carriage.id || carriageIndex} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6">
                  Вагон {carriageIndex + 1}
                </Typography>
                {isCarriageComplete(carriage) ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <ErrorIcon color="error" />
                )}
              </Box>
              <IconButton 
                onClick={() => handleRemoveCarriage(carriageIndex)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Номер вагона"
                  value={carriage.carriageNumber}
                  onChange={(e) => handleCarriageChange(carriageIndex, 'carriageNumber', e.target.value)}
                  error={!carriage.carriageNumber.trim()}
                  helperText={!carriage.carriageNumber.trim() ? 'Обязательное поле' : ''}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <AutocompleteField
                  label="Тип вагона"
                  value={carriage.carriageType}
                  onChange={(value) => handleCarriageChange(carriageIndex, 'carriageType', value)}
                  options={carriageTypes}
                  error={!carriage.carriageType.trim()}
                  helperText={!carriage.carriageType.trim() ? 'Обязательное поле' : ''}
                  required
                />
              </Grid>
            </Grid>

            {/* Фотография вагона */}
            {carriage.carriageNumber && carriage.carriageType && (
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  📷 Фотография вагона
                </Typography>
                <PhotoUpload
                  label="Фото вагона"
                  photo={carriage.carriagePhoto || null}
                  onPhotoChange={(file) => handleCarriageChange(carriageIndex, 'carriagePhoto', file)}
                  required
                />
              </Box>
            )}

            {/* Секция оборудования */}
            {carriage.carriageNumber && carriage.carriageType && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">
                    Оборудование
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => handleAddEquipment(carriageIndex)}
                    variant="outlined"
                    size="small"
                  >
                    Добавить оборудование
                  </Button>
                </Box>

                {carriage.equipment?.map((equipment: EquipmentFormItem, equipmentIndex: number) => {
                  const equipmentErrors = getEquipmentErrors(equipment);
                  const hasErrors = equipmentErrors.length > 0;

                  return (
                    <Accordion key={equipmentIndex} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" gap={1} width="100%">
                          <Typography>
                            Оборудование {equipmentIndex + 1}
                          </Typography>
                          {hasErrors ? (
                            <ErrorIcon color="error" fontSize="small" />
                          ) : (
                            <CheckCircleIcon color="success" fontSize="small" />
                          )}
                          {equipment.equipmentType && (
                            <Chip 
                              label={equipment.equipmentType} 
                              size="small" 
                              variant="outlined" 
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {hasErrors && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                              {equipmentErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </Alert>
                        )}

                        <Grid container spacing={2} mb={2}>
                          <Grid item xs={12} md={6}>
                            <AutocompleteField
                              label="Тип оборудования"
                              value={equipment.equipmentType}
                              onChange={(value) => handleEquipmentChange(carriageIndex, equipmentIndex, 'equipmentType', value)}
                              options={equipmentTypes}
                              error={!equipment.equipmentType.trim()}
                              helperText={!equipment.equipmentType.trim() ? 'Обязательное поле' : ''}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Серийный номер"
                              value={equipment.serialNumber}
                              onChange={(e) => handleEquipmentChange(carriageIndex, equipmentIndex, 'serialNumber', e.target.value)}
                              error={!equipment.serialNumber.trim()}
                              helperText={!equipment.serialNumber.trim() ? 'Обязательное поле' : ''}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Количество"
                              value={equipment.quantity}
                              onChange={(e) => handleEquipmentChange(carriageIndex, equipmentIndex, 'quantity', parseInt(e.target.value) || 1)}
                              inputProps={{ min: 1 }}
                              error={equipment.quantity <= 0}
                              helperText={equipment.quantity <= 0 ? 'Количество должно быть больше 0' : ''}
                              required
                            />
                          </Grid>
                          {isNetworkEquipment(equipment.equipmentType) && (
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="MAC-адрес"
                                value={equipment.macAddress}
                                onChange={(e) => handleEquipmentChange(carriageIndex, equipmentIndex, 'macAddress', e.target.value)}
                                placeholder="XX:XX:XX:XX:XX:XX"
                                error={equipment.macAddress.trim() !== '' && !isValidMacAddress(equipment.macAddress)}
                                helperText={
                                  equipment.macAddress.trim() === '' 
                                    ? 'Обязательное поле для сетевого оборудования'
                                    : !isValidMacAddress(equipment.macAddress) 
                                      ? 'Неверный формат MAC-адреса (XX:XX:XX:XX:XX:XX)'
                                      : 'Формат: XX:XX:XX:XX:XX:XX'
                                }
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      {equipment.macAddress && isValidMacAddress(equipment.macAddress) && (
                                        <CheckCircleIcon color="success" fontSize="small" />
                                      )}
                                    </InputAdornment>
                                  ),
                                }}
                                required
                              />
                            </Grid>
                          )}
                        </Grid>

                        {/* Фотографии оборудования */}
                        {equipment.equipmentType && (
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              📷 Фотографии оборудования
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6} md={4}>
                                <PhotoUpload
                                  label="Фото оборудования"
                                  photo={equipment.photos.equipment}
                                  onPhotoChange={(file) => handleEquipmentPhotoChange(carriageIndex, equipmentIndex, 'equipment', file)}
                                  required
                                />
                              </Grid>
                              <Grid item xs={6} md={4}>
                                <PhotoUpload
                                  label="Фото серийного номера"
                                  photo={equipment.photos.serial}
                                  onPhotoChange={(file) => handleEquipmentPhotoChange(carriageIndex, equipmentIndex, 'serial', file)}
                                  required
                                />
                              </Grid>
                              {isNetworkEquipment(equipment.equipmentType) && (
                                <Grid item xs={6} md={4}>
                                  <PhotoUpload
                                    label="Фото MAC-адреса"
                                    photo={equipment.photos.mac}
                                    onPhotoChange={(file) => handleEquipmentPhotoChange(carriageIndex, equipmentIndex, 'mac', file)}
                                    required
                                  />
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        )}

                        <Box display="flex" justifyContent="flex-end" mt={2}>
                          <Button
                            startIcon={<DeleteIcon />}
                            onClick={() => handleRemoveEquipment(carriageIndex, equipmentIndex)}
                            color="error"
                            size="small"
                          >
                            Удалить оборудование
                          </Button>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={handleAddCarriage}
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
      >
        Добавить вагон
      </Button>
    </Box>
  );
};