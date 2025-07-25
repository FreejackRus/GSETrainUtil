import { 
  Box, 
  Button, 
  Avatar, 
  Typography, 
  Card, 
  CardContent, 
  Paper,
  Chip
} from "@mui/material";
import { 
  PhotoCamera, 
  CheckCircle, 
  CloudUpload,
  CameraAlt
} from "@mui/icons-material";
import "./PhotoUpload.css";

interface PhotoUploadProps {
  photo: File | null;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  description?: string;
  required?: boolean;
  accept?: string;
}

export const PhotoUpload = ({
  photo,
  onPhotoChange,
  label,
  description,
  required = false,
  accept = "image/*"
}: PhotoUploadProps) => {
  const handleButtonClick = () => {
    const input = document.getElementById(`photo-input-${label.replace(/\s+/g, '-')}`);
    input?.click();
  };

  return (
    <Paper elevation={2} className="photo-upload-container">
      <Box className="photo-upload-content">
        <Avatar className="photo-upload-avatar">
          <PhotoCamera />
        </Avatar>
        
        <Typography variant="subtitle1" className="photo-upload-title">
          {label}
          {required && <span className="photo-upload-required"> *</span>}
        </Typography>
        
        {description && (
          <Typography variant="body2" color="text.secondary" className="photo-upload-description">
            {description}
          </Typography>
        )}
        
        <input 
          id={`photo-input-${label.replace(/\s+/g, '-')}`}
          type="file" 
          accept={accept}
          style={{ display: 'none' }}
          onChange={onPhotoChange}
        />
        
        <Button 
          variant="contained" 
          onClick={handleButtonClick}
          startIcon={<CloudUpload />}
          className="photo-upload-button"
        >
          {photo ? 'Изменить фото' : 'Загрузить фото'}
        </Button>
      </Box>

      {/* Превью загруженного фото */}
      {photo && (
        <Card className="photo-upload-preview">
          <CardContent className="photo-upload-preview-content">
            <Box className="photo-upload-success">
              <CheckCircle className="photo-upload-success-icon" />
              <Typography variant="subtitle2" className="photo-upload-success-text">
                Фото успешно загружено
              </Typography>
            </Box>
            
            <Box className="photo-upload-image-container">
              <Avatar
                variant="rounded"
                src={URL.createObjectURL(photo)}
                alt={label}
                className="photo-upload-image"
              />
            </Box>
            
            <Box className="photo-upload-chips">
              <Chip 
                icon={<CameraAlt />}
                label={photo.name}
                size="small"
                className="photo-upload-chip-name"
              />
              <Chip 
                label={`${Math.round(photo.size / 1024)} KB`}
                size="small"
                className="photo-upload-chip-size"
              />
            </Box>
          </CardContent>
        </Card>
      )}
    </Paper>
  );
};