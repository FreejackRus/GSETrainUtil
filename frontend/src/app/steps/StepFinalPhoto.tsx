import { 
  Box, 
  Avatar, 
  Typography, 
  Card, 
  CardContent
} from "@mui/material";
import { 
  CheckCircle, 
  CameraAlt
} from "@mui/icons-material";
import { PhotoUpload } from "../../shared/ui";

export const StepFinalPhoto = ({
  value,
  onPhotoChange,
}: {
  value: File | null;
  onPhotoChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <Box>
    <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold" textAlign="center">
          🎯 Финальный результат
        </Typography>
        <Box display="flex" justifyContent="center" mb={2}>
          <Avatar
            variant="rounded"
            sx={{ 
              width: 80, 
              height: 80,
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
            }}
          >
            <CameraAlt sx={{ fontSize: 40 }} />
          </Avatar>
        </Box>
        <Box textAlign="center">
          <Typography variant="subtitle1" fontWeight="bold" color="#2e7d32">
            Завершение работ
          </Typography>
          <Typography variant="body2" color="#388e3c">
            Это последний шаг создания заявки. После загрузки фото можно отправить отчет.
          </Typography>
        </Box>
      </CardContent>
    </Card>

    <PhotoUpload
      photo={value}
      onPhotoChange={onPhotoChange("finalPhoto")}
      label="Общая фотография работ"
      description="Сфотографируйте общий вид выполненных работ. Это фото будет использовано в итоговом отчете."
      required={true}
    />
  </Box>
);
