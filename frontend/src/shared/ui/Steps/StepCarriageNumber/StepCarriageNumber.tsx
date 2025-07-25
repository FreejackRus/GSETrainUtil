import { Box, TextField } from "@mui/material";
import { PhotoUpload } from "../../PhotoUpload";
import "./StepCarriageNumber.css";

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
      className="step-carriage-number-input"
      sx={{ mb: 3 }}
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