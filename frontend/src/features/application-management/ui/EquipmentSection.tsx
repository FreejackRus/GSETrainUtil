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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { EquipmentFormItem } from '../../../entities/application';
import { PhotoUpload } from '../../../shared/ui';

interface EquipmentSectionProps {
  equipment: EquipmentFormItem[];
  equipmentTypes: string[];
  onChange: (equipment: EquipmentFormItem[]) => void;
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
  equipment,
  equipmentTypes,
  onChange,
}) => {
  const addEquipment = () => {
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
    onChange(newEquipment);
  };

  // Автоматически добавляем все типы оборудования при первом рендере
  React.useEffect(() => {
    if (equipment.length === 0 && equipmentTypes.length > 0) {
      const initialEquipment = equipmentTypes.map(type => ({
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
  }, [equipmentTypes, equipment.length, onChange]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Оборудование</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={addEquipment}
          variant="outlined"
          size="small"
        >
          Добавить оборудование
        </Button>
      </Box>

      {equipment.map((item, index) => (
        <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" color="primary">
                Оборудование #{index + 1}
              </Typography>
              {equipment.length > 1 && (
                <IconButton
                  onClick={() => removeEquipment(index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              )}
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
                    {equipmentTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Серийный номер */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Серийный номер"
                  value={item.serialNumber}
                  onChange={(e) => updateEquipment(index, 'serialNumber', e.target.value)}
                  placeholder="Введите серийный номер"
                />
              </Grid>

              {/* MAC-адрес */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="MAC-адрес"
                  value={item.macAddress}
                  onChange={(e) => updateEquipment(index, 'macAddress', e.target.value)}
                  placeholder="Введите MAC-адрес"
                />
              </Grid>

              {/* Количество */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Количество"
                  type="number"
                  value={item.count}
                  onChange={(e) => updateEquipment(index, 'count', parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Фотографии оборудования
                </Typography>
              </Grid>

              {/* Фото оборудования */}
              <Grid item xs={12} md={4}>
                <PhotoUpload
                  label="Фото оборудования"
                  value={item.equipmentPhoto}
                  onChange={(file) => updateEquipment(index, 'equipmentPhoto', file)}
                />
              </Grid>

              {/* Фото серийного номера */}
              <Grid item xs={12} md={4}>
                <PhotoUpload
                  label="Фото серийного номера"
                  value={item.serialPhoto}
                  onChange={(file) => updateEquipment(index, 'serialPhoto', file)}
                />
              </Grid>

              {/* Фото MAC-адреса */}
              <Grid item xs={12} md={4}>
                <PhotoUpload
                  label="Фото MAC-адреса"
                  value={item.macPhoto}
                  onChange={(file) => updateEquipment(index, 'macPhoto', file)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

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
            Добавить первое оборудование
          </Button>
        </Box>
      )}
    </Box>
  );
};