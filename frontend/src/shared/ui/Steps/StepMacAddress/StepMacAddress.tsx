import React from 'react';
import { TextField, Box, Typography, Alert } from "@mui/material";
import { PhotoUpload } from "../../PhotoUpload";
interface ApplicationFormData {
  macAddress: string;
}
import "./StepMacAddress.css";

export const StepMacAddress = ({
  formData,
  onFormDataChange,
}: {
  formData: ApplicationFormData;
  onFormDataChange: (data: Partial<ApplicationFormData>) => void;
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
    onFormDataChange({ macAddress: formatted });
  };

  const handlePhotoChange = (file: File | null) => {
    onFormDataChange({ macPhoto: file });
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
        value={formData.macAddress || ''}
        onChange={handleChange}
        placeholder="00:00:00:00:00:00"
        className="step-mac-address__input"
        sx={{ mb: 3 }}
        helperText="Введите MAC-адрес в формате XX:XX:XX:XX:XX:XX"
      />
      
      <PhotoUpload
        photo={formData.macPhoto || null}
        onPhotoChange={handlePhotoChange}
        label="Фотография MAC-адреса"
        description="Сделайте фото MAC-адреса оборудования"
        required={!!formData.macAddress}
      />
    </Box>
  );
};