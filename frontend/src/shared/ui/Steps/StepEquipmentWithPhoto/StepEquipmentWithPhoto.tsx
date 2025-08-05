import React from 'react';
import { TextField, MenuItem, Box, Typography, Avatar, Card, CardContent, Divider } from "@mui/material";
import { Memory, CheckCircle, CameraAlt } from "@mui/icons-material";
import { PhotoUpload } from "../../PhotoUpload/PhotoUpload";
interface ApplicationFormData {
  equipment?: string;
  equipmentPhoto?: File | null;
}
import "./StepEquipmentWithPhoto.css";

interface StepEquipmentWithPhotoProps {
  formData: ApplicationFormData;
  onFormDataChange: (data: Partial<ApplicationFormData>) => void;
  equipmentOptions: string[];
}

export const StepEquipmentWithPhoto: React.FC<StepEquipmentWithPhotoProps> = ({
  formData,
  onFormDataChange,
  equipmentOptions,
}) => {
  const handleEquipmentChange = (value: string) => {
    onFormDataChange({ equipment: value });
  };

  const handlePhotoChange = (file: File | null) => {
    onFormDataChange({ equipmentPhoto: file });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom className="step-equipment-title">
        💻 Наименование и фото оборудования
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Выберите тип оборудования и сделайте его фотографию
      </Typography>
      
      {/* Выбор оборудования */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar className="step-equipment-avatar">
          <Memory />
        </Avatar>
        <Box flex={1}>
          <TextField
            select
            label="Тип оборудования"
            value={formData.equipment || ''}
            onChange={(e) => handleEquipmentChange(e.target.value)}
            fullWidth
            className="step-equipment-select"
          >
            {(equipmentOptions || []).map((equipment, index) => (
              <MenuItem key={index} value={equipment} className="step-equipment-menu-item">
                {equipment}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {formData.equipment && (
        <Card className="step-equipment-result-card" sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar className="step-equipment-result-avatar">
                <CheckCircle />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" className="step-equipment-result-title">
                  Выбрано: {formData.equipment}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Оборудование для выполнения работ
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Разделитель */}
      {formData.equipment && (
        <Divider sx={{ my: 3 }}>
          <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>
            <CameraAlt fontSize="small" />
          </Avatar>
        </Divider>
      )}

      {/* Фотография оборудования */}
      {formData.equipment && (
        <Box>
          <Typography variant="h6" gutterBottom>
            📷 Фотография оборудования
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Сделайте фото установленного оборудования: {formData.equipment}
          </Typography>
          
          <PhotoUpload
            photo={formData.equipmentPhoto || null}
            onPhotoChange={handlePhotoChange}
            label="Фотография оборудования"
            description="Сделайте фото установленного оборудования"
            required
          />
        </Box>
      )}
    </Box>
  );
};