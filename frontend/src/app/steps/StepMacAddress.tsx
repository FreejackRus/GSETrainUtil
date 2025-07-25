import { Box, TextField } from "@mui/material";
import { PhotoUpload } from "../../shared/ui";

export const StepMacAddress = ({
  value,
  photo,
  onChange,
  onPhotoChange,
}: {
  value: string;
  photo: File | null;
  onChange: (field: string, value: any) => void;
  onPhotoChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <Box>
    <TextField
      label="MAC-адрес (если есть)"
      value={value}
      onChange={(e) => onChange("macAddress", e.target.value)}
      fullWidth
      sx={{ 
        mb: 2,
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
    
    <PhotoUpload
      photo={photo}
      onPhotoChange={onPhotoChange("macPhoto")}
      label="Фотография MAC-адреса"
      description="Сфотографируйте MAC-адрес на наклейке оборудования (если доступен)"
      required={false}
    />
  </Box>
);
