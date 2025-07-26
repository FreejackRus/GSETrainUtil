import React from 'react';
import { Box, TextField, Typography, Card, CardContent } from '@mui/material';
import { PhotoUpload } from '../../PhotoUpload';
import { ApplicationFormData } from '../../../entities/application/model/types';
import './StepSerialNumber.css';

interface StepSerialNumberProps {
  formData: ApplicationFormData;
  onFormDataChange: (data: Partial<ApplicationFormData>) => void;
  applicationData: {
    requestNumber: string;
    applicationDate: string;
    trainNumber: string;
    equipment: string;
  };
}

export const StepSerialNumber: React.FC<StepSerialNumberProps> = ({
  formData,
  onFormDataChange,
  applicationData,
}) => {
  const handlePhotoChange = (file: File | null) => {
    onFormDataChange({ serialPhoto: file });
  };

  return (
    <Box className="step-serial-number">
      <Typography variant="h6" className="step-serial-number__title">
        🔢 Серийный номер оборудования
      </Typography>
      
      {applicationData.equipment && (
        <Card sx={{ mt: 2, mb: 3, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Оборудование: <strong>{applicationData.equipment}</strong>
            </Typography>
          </CardContent>
        </Card>
      )}
      
      <TextField
        fullWidth
        label="Серийный номер"
        value={formData.serialNumber || ''}
        onChange={(e) => onFormDataChange({ serialNumber: e.target.value })}
        placeholder="Введите серийный номер"
        className="step-serial-number__input"
        sx={{ mb: 3 }}
      />
      
      <PhotoUpload
        photo={formData.serialPhoto || null}
        onPhotoChange={handlePhotoChange}
        label="Фотография серийного номера"
        description="Сделайте фото серийного номера оборудования"
        required={true}
      />
    </Box>
  );
};