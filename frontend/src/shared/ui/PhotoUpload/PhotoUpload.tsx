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
import { UploadPhotoParams } from "../../api/uploadApi";
import "./PhotoUpload.css";

// New interface for file selection
interface PhotoUploadNewProps {
  photo: File | null;
  onPhotoChange: (file: File | null) => void;
  label: string;
  description?: string;
  required?: boolean;
  accept?: string;
}

// Legacy interface for server upload
interface PhotoUploadLegacyProps {
  onPhotoUploaded: (filePath: string) => void;
  uploadParams: UploadPhotoParams;
  autoUpload: boolean;
  label: string;
  description?: string;
  required?: boolean;
  accept?: string;
}

type PhotoUploadProps = PhotoUploadNewProps | PhotoUploadLegacyProps;

// Type guards to distinguish between interfaces
const isNewInterface = (props: PhotoUploadProps): props is PhotoUploadNewProps => {
  return 'onPhotoChange' in props && 'photo' in props;
};

const isLegacyInterface = (props: PhotoUploadProps): props is PhotoUploadLegacyProps => {
  return 'onPhotoUploaded' in props && 'uploadParams' in props;
};

export const PhotoUpload = (props: PhotoUploadProps) => {
  const { label, description, required = false, accept = "image/*" } = props;
  
  const handleButtonClick = () => {
    const input = document.getElementById(`photo-input-${label.replace(/\s+/g, '-')}`);
    input?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target || !e.target.files) {
      console.warn('File input event target or files is undefined');
      return;
    }
    const file = e.target.files[0] || null;
    
    if (isNewInterface(props)) {
      // New interface: just pass the file
      props.onPhotoChange(file);
    } else if (isLegacyInterface(props)) {
      // Legacy interface: simulate upload and return file path
      if (file) {
        // For now, we'll just use the file name as the path
        // In a real implementation, this would upload to server
        const filePath = `/uploads/${file.name}`;
        props.onPhotoUploaded(filePath);
      }
    }
  };

  // Get the current photo for display
  const currentPhoto = isNewInterface(props) ? props.photo : null;

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
          onChange={handleFileChange}
        />
        
        <Button 
          variant="contained" 
          onClick={handleButtonClick}
          startIcon={<CloudUpload />}
          className="photo-upload-button"
        >
          {currentPhoto ? 'Изменить фото' : 'Загрузить фото'}
        </Button>
      </Box>

      {/* Превью загруженного фото */}
      {currentPhoto && currentPhoto instanceof File && (
        <Card className="photo-upload-preview">
          <CardContent className="photo-upload-preview-content">
            <Box className="photo-upload-success">
              <CheckCircle className="photo-upload-success-icon" />
              <Typography variant="subtitle2" className="photo-upload-success-text">
                Фото выбрано
              </Typography>
            </Box>
            
            <Box className="photo-upload-image-container">
              <Avatar
                variant="rounded"
                src={URL.createObjectURL(currentPhoto)}
                alt={label}
                className="photo-upload-image"
              />
            </Box>
            
            <Box className="photo-upload-chips">
              <Chip 
                icon={<CameraAlt />}
                label={currentPhoto.name}
                size="small"
                className="photo-upload-chip-name"
              />
              <Chip 
                label={`${Math.round(currentPhoto.size / 1024)} KB`}
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