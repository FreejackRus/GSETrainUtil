import React from 'react';
import { Box, TextField, Typography, Alert } from '@mui/material';
import { PhotoUpload } from '../../PhotoUpload';
import './StepMacAddress.css';

interface StepMacAddressProps {
  value: string;
  photo: File | null;
  onChange: (field: string, value: string) => void;
  onPhotoChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const StepMacAddress: React.FC<StepMacAddressProps> = ({
  value,
  photo,
  onChange,
  onPhotoChange
}) => {
  const formatMacAddress = (input: string) => {
    // Удаляем все символы кроме букв и цифр
    const cleaned = input.replace(/[^a-fA-F0-9]/g, '');
    // Добавляем двоеточия каждые 2 символа
    const formatted = cleaned.match(/.{1,2}/g)?.join(':') || cleaned;
    return formatted.slice(0, 17); // Ограничиваем длину
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMacAddress(e.target.value);
    onChange('macAddress', formatted);
  };

  return (
    <Box className="step-mac-address">
      <Typography variant="h6" className="step-mac-address__title">
        🌐 MAC-адрес (если есть)
      </Typography>
      
      <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
        MAC-адрес указывается только для сетевого оборудования. 
        Формат: XX:XX:XX:XX:XX:XX
      </Alert>
      
      <TextField
        fullWidth
        label="MAC-адрес"
        value={value}
        onChange={handleChange}
        placeholder="00:00:00:00:00:00"
        className="step-mac-address__input"
        sx={{ mb: 3 }}
        helperText="Введите MAC-адрес в формате XX:XX:XX:XX:XX:XX"
      />
      
      <PhotoUpload
        photo={photo}
        onPhotoChange={onPhotoChange('macPhoto')}
        label="Фотография MAC-адреса"
        description="Сделайте фото MAC-адреса оборудования"
        required={!!value}
      />
    </Box>
  );
};