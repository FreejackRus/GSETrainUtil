import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { PhotoUpload } from '../../PhotoUpload/PhotoUpload';
import { ApplicationFormData } from '../../../entities/application/model/types';

interface StepEquipmentPhotoProps {
  formData: ApplicationFormData;
  onFormDataChange: (data: Partial<ApplicationFormData>) => void;
  applicationData: {
    requestNumber: string;
    applicationDate: string;
    trainNumber: string;
    equipment: string;
  };
}

export const StepEquipmentPhoto: React.FC<StepEquipmentPhotoProps> = ({
  formData,
  onFormDataChange,
  applicationData,
}) => {
  const handlePhotoChange = (file: File | null) => {
    onFormDataChange({ equipmentPhoto: file });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" gutterBottom>
        📷 Фотография оборудования
      </Typography>
      
      {applicationData.equipment && (
        <Card sx={{ bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Оборудование: <strong>{applicationData.equipment}</strong>
            </Typography>
          </CardContent>
        </Card>
      )}

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Фотография установленного оборудования
        </Typography>
        <PhotoUpload
          photo={formData.equipmentPhoto || null}
          onPhotoChange={handlePhotoChange}
          label="Фотография оборудования"
          description="Сделайте фото установленного оборудования"
          required={true}
        />
      </Box>
    </Box>
  );
};