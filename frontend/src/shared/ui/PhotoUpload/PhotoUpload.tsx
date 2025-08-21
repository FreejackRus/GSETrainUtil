import { Box, Button, Avatar, Typography, Card, CardContent, Paper, Chip } from '@mui/material';
import { PhotoCamera, CheckCircle, CloudUpload, CameraAlt } from '@mui/icons-material';
import type { UploadPhotoParams } from '../../api/uploadApi';
import './PhotoUpload.css';

// New interface for file selection
interface PhotoUploadNewProps {
  photo: File | null;
  onPhotoChange: (file: File | null) => void;
  label: string;
  description?: string;
  inputId?: string;
  required?: boolean;
  accept?: string;
  compact?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Legacy interface for server upload
interface PhotoUploadLegacyProps {
  onPhotoUploaded: (filePath: string) => void;
  uploadParams: UploadPhotoParams;
  autoUpload: boolean;
  label: string;
  description?: string;
  inputId?: string;
  required?: boolean;
  accept?: string;
  compact?: boolean;
  size?: 'small' | 'medium' | 'large';
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
  const {
    label,
    description,
    required = false,
    accept = 'image/*',
    compact = false,
    size = 'medium',
    inputId,
  } = props;

  console.log('inputId', inputId);

  const handleButtonClick = () => {
    const input = document.getElementById(
      `photo-input-${[label.replace(/\s+/g, '-'), inputId].filter(Boolean).join('-')}`,
    );
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
  const getPhotoUrl = (file: File) => {
    if (file.size > 0) {
      // реальный загруженный файл
      return URL.createObjectURL(file);
    }
    // файл-заглушка, значит file.name = "carriage/xxx.jpeg"
    return `${import.meta.env.VITE_API_STORAGE_PHOTOS_URL}/${file.name}`;
  };

  const getShortFileName = (file: File) => {
    return file.name.split('/').pop() || file.name;
  };
  // Get the current photo for display
  const currentPhoto = isNewInterface(props) ? props.photo : null;

  return (
    <Paper
      elevation={2}
      className={`photo-upload-container ${compact ? 'compact' : ''}`}
      sx={{ p: { xs: 2, sm: 3 } }}
    >
      <Box className="photo-upload-content">
        <Avatar className={`photo-upload-avatar ${size}`}>
          <PhotoCamera />
        </Avatar>

        <Typography
          variant={compact ? 'body2' : 'subtitle1'}
          className="photo-upload-title"
          // fontSize={{xs:"0.68rem",sm:"0.88rem"}}
        >
          {label}
          {required && <span className="photo-upload-required"> *</span>}
        </Typography>

        {description && !compact && (
          <Typography variant="body2" color="text.secondary" className="photo-upload-description">
            {description}
          </Typography>
        )}

        <input
          id={`photo-input-${[label.replace(/\s+/g, '-'), inputId].filter(Boolean).join('-')}`}
          type="file"
          accept={accept}
          className="photo-upload-input-hidden"
          onChange={handleFileChange}
        />

        <Button
          variant="contained"
          onClick={handleButtonClick}
          startIcon={<CloudUpload />}
          className="photo-upload-button"
          size={size === 'large' ? 'large' : size === 'small' ? 'small' : 'medium'}
          sx={{
            width: { xs: 90, sm: 'auto' },
            fontSize: { xs: '0.55rem', sm: '0.88rem' },
          }}
        >
          {currentPhoto ? 'Изменить фото' : 'Загрузить фото'}
        </Button>
      </Box>

      {/* Превью загруженного фото */}
      {currentPhoto && currentPhoto instanceof File && (
        <Card className={`photo-upload-preview ${compact ? 'compact' : ''}`}>
          <CardContent className="photo-upload-preview-content">
            <Box className="photo-upload-success" display={'flex'} flexWrap={'wrap'}>
              <CheckCircle className="photo-upload-success-icon" />
              <Typography
                variant={compact ? 'caption' : 'subtitle2'}
                className="photo-upload-success-text"
              >
                Фото выбрано
              </Typography>
            </Box>

            <Box className="photo-upload-image-container">
              <Avatar
                variant="rounded"
                src={getPhotoUrl(currentPhoto)}
                alt={label}
                className={`photo-upload-image ${size}`}
              />
            </Box>

            <Box className="photo-upload-chips">
              <Chip
                icon={<CameraAlt />}
                label={getShortFileName(currentPhoto)}
                size="small"
                className="photo-upload-chip-name"
              />
              {currentPhoto.size > 0 && (
                <Chip
                  label={`${Math.round(currentPhoto.size / 1024)} KB`}
                  size="small"
                  className="photo-upload-chip-size"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Paper>
  );
};
