import React from 'react';
import { Box, TextField, Typography, Card, CardContent } from '@mui/material';
import { PhotoUpload } from '../../PhotoUpload';
import './StepSerialNumber.css';

interface StepSerialNumberProps {
  value: string;
  photo: File | null;
  onChange: (field: string, value: string) => void;
  onPhotoChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  equipment: string;
}

export const StepSerialNumber: React.FC<StepSerialNumberProps> = ({
  value,
  photo,
  onChange,
  onPhotoChange,
  equipment
}) => {
  return (
    <Box className="step-serial-number">
      <Typography variant="h6" className="step-serial-number__title">
        🔢 Серийный номер оборудования
      </Typography>
      
      {equipment && (
        <Card sx={{ mt: 2, mb: 3, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Оборудование: <strong>{equipment}</strong>
            </Typography>
          </CardContent>
        </Card>
      )}
      
      <TextField
        fullWidth
        label="Серийный номер"
        value={value}
        onChange={(e) => onChange('serialNumber', e.target.value)}
        placeholder="Введите серийный номер"
        className="step-serial-number__input"
        sx={{ mb: 3 }}
      />
      
      <PhotoUpload
        photo={photo}
        onPhotoChange={onPhotoChange('serialPhoto')}
        label="Фотография серийного номера"
        description="Сделайте фото серийного номера оборудования"
        required={true}
      />
    </Box>
  );
};