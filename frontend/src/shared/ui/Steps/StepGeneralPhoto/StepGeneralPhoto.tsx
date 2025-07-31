import { Box, Typography } from "@mui/material";
import { PhotoUpload } from "../../PhotoUpload/PhotoUpload";
interface ApplicationFormData {
  generalPhoto: File | null;
  // Add other form fields as needed
}

export const StepGeneralPhoto = ({
  formData,
  onFormDataChange,
}: {
  formData: ApplicationFormData;
  onFormDataChange: (data: Partial<ApplicationFormData>) => void;
}) => {
  const handlePhotoChange = (file: File | null) => {
    onFormDataChange({ generalPhoto: file });
  };

  return (
    <Box className="step-general-photo">
      <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
        📸 Общее фото оборудования
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Загрузите общую фотографию оборудования для документирования
      </Typography>

      <PhotoUpload
        photo={formData.generalPhoto || null}
        onPhotoChange={handlePhotoChange}
        label="Общее фото оборудования"
        description="Сделайте общую фотографию установленного оборудования"
      />
    </Box>
  );
};