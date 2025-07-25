import { Box, Avatar, Typography, Card, CardContent } from "@mui/material";
import { CameraAlt } from "@mui/icons-material";
import { PhotoUpload } from "../../PhotoUpload";
import "./StepFinalPhoto.css";

export const StepFinalPhoto = ({
  photo,
  onPhotoChange,
}: {
  photo: File | null;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <Box>
    <Card className="step-final-photo-header-card" sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Box className="step-final-photo-avatar-container">
            <Avatar className="step-final-photo-avatar">
              <CameraAlt className="step-final-photo-avatar-icon" />
            </Avatar>
          </Box>
          <Box className="step-final-photo-text-container">
            <Typography variant="h6" className="step-final-photo-title">
              📸 Финальная фотография
            </Typography>
            <Typography variant="body2" color="text.secondary" className="step-final-photo-subtitle">
              Завершающий этап работ
            </Typography>
            <Typography variant="body2" color="text.secondary" className="step-final-photo-description">
              Сделайте финальное фото результата выполненных работ
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
    
    <PhotoUpload
      photo={photo}
      onPhotoChange={onPhotoChange}
      label="Финальная фотография работ"
      description="Загрузите фотографию завершенных работ для отчета"
      required={true}
    />
  </Box>
);