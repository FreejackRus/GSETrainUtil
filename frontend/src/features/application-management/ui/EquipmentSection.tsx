import React from 'react';
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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
  };

  const removeEquipment = (index: number) => {
    const newEquipment = equipment.filter((_, i) => i !== index);
    onChange(newEquipment);
  };

  const updateEquipment = (index: number, field: keyof EquipmentFormItem, value: any) => {
    const newEquipment = [...equipment];
    newEquipment[index] = { ...newEquipment[index], [field]: value };
    
    // Если изменился тип оборудования, сбрасываем MAC-адрес если он не нужен
    if (field === 'equipmentType') {
      const config = EQUIPMENT_CONFIG[value as keyof typeof EQUIPMENT_CONFIG];
      if (config && !config.hasMac) {
        newEquipment[index].macAddress = '';
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Оборудование</Typography>
        {getAvailableEquipmentTypes().length > 0 && (
          <Button
            startIcon={<AddIcon />}
            onClick={addEquipment}
            variant="outlined"
            size="small"
          >
            Добавить оборудование
          </Button>
        )}
      </Box>

      {equipment.map((item, index) => {
        const maxCount = getMaxCount(item.equipmentType);
        const hasMac = needsMacAddress(item.equipmentType);
        
        return (
          <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" color="primary">
                  {item.equipmentType || `Оборудование #${index + 1}`}
                </Typography>
                <IconButton
                  onClick={() => removeEquipment(index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
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
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Фотографии оборудования
                  </Typography>
                </Grid>

                {/* Фото оборудования */}
                <Grid item xs={12} md={hasMac ? 4 : 6}>
                  <PhotoUpload
                    label="Фото оборудования"
                    value={item.equipmentPhoto}
                    onChange={(file) => updateEquipment(index, 'equipmentPhoto', file)}
                  />
                </Grid>

                {/* Фото серийного номера */}
                <Grid item xs={12} md={hasMac ? 4 : 6}>
                  <PhotoUpload
                    label="Фото серийного номера"
                    value={item.serialPhoto}
                    onChange={(file) => updateEquipment(index, 'serialPhoto', file)}
                  />
                </Grid>

                {/* Фото MAC-адреса - только для определенных типов */}
                {hasMac && (
                  <Grid item xs={12} md={4}>
                    <PhotoUpload
                      label="Фото MAC-адреса"
                      value={item.macPhoto}
                      onChange={(file) => updateEquipment(index, 'macPhoto', file)}
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        );
      })}

      {equipment.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
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
      )}

      {equipment.length > 0 && getAvailableEquipmentTypes().length === 0 && (
        <Box sx={{ textAlign: 'center', py: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Все доступные типы оборудования добавлены
          </Typography>
        </Box>
      )}
    </Box>
  );
};