import { Box, TextField } from "@mui/material";
import { PhotoUpload } from "../../shared/ui";

export const StepCarriageNumber = ({
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
      label="Номер вагона"
      value={value}
      onChange={(e) => onChange("carriageNumber", e.target.value)}
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
      onPhotoChange={onPhotoChange("carriagePhoto")}
      label="Фотография номера вагона"
      description="Сфотографируйте четко видимый номер вагона для идентификации"
      required={true}
    />
  </Box>
);
