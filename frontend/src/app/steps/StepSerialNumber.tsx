import { 
  Box, 
  TextField, 
  Avatar, 
  Typography, 
  Card, 
  CardContent, 
  Chip
} from "@mui/material";
import { 
  QrCode, 
  CheckCircle, 
  Numbers
} from "@mui/icons-material";
import { PhotoUpload } from "../../shared/ui";

export const StepSerialNumber = ({
  value,
  photo,
  onChange,
  onPhotoChange,
  equipment,
}: {
  value: string;
  photo: File | null;
  onChange: (field: string, value: any) => void;
  onPhotoChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  equipment: string;
}) => (
  <Box>
    {equipment && (
      <Card sx={{ mb: 3, borderRadius: 3, bgcolor: '#f0f7ff' }}>
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#1976d2' }}>
              <QrCode />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Серийный номер для: {equipment}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Найдите серийный номер на корпусе или наклейке
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )}

    <Box display="flex" alignItems="center" gap={2} mb={2}>
      <Avatar sx={{ bgcolor: '#667eea' }}>
        <Numbers />
      </Avatar>
      <Box flex={1}>
        <TextField
          label="Серийный номер"
          value={value}
          onChange={(e) => onChange("serialNumber", e.target.value)}
          fullWidth
          placeholder="Введите серийный номер оборудования"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              '&:hover fieldset': {
                borderColor: '#667eea',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#667eea',
              }
            }
          }}
        />
      </Box>
    </Box>

    <PhotoUpload
      photo={photo}
      onPhotoChange={onPhotoChange("serialPhoto")}
      label="Фотография серийного номера"
      description="Сфотографируйте четко видимый серийный номер на корпусе или наклейке оборудования"
      required={true}
    />

    {/* Подтверждение */}
    {value && (
      <Card sx={{ mt: 3, borderRadius: 3, bgcolor: '#e8f5e8' }}>
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <CheckCircle sx={{ color: '#4caf50', fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" color="#2e7d32">
                Серийный номер записан
              </Typography>
              <Typography variant="body2" color="#388e3c">
                {value}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )}
  </Box>
);
