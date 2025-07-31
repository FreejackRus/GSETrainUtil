import { Box, TextField } from "@mui/material";
import { PhotoUpload } from "../../PhotoUpload";
interface ApplicationFormData {
  carriageNumber: string;
  carriagePhoto: File | null;
}
import "./StepCarriageNumber.css";

export const StepCarriageNumber = ({
  formData,
  onFormDataChange,
}: {
  formData: ApplicationFormData;
  onFormDataChange: (data: Partial<ApplicationFormData>) => void;
}) => {
  const handleCarriageNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({ carriageNumber: e.target.value });
  };

  const handlePhotoChange = (file: File | null) => {
    onFormDataChange({ carriagePhoto: file });
  };

  return (
    <Box>
      <TextField
        label="Номер вагона"
        value={formData.carriageNumber}
        onChange={handleCarriageNumberChange}
        fullWidth
        className="step-carriage-number-input"
        sx={{ mb: 3 }}
      />
      
      <PhotoUpload
        photo={formData.carriagePhoto || null}
        onPhotoChange={handlePhotoChange}
        label="Фотография номера вагона"
        description="Сфотографируйте четко видимый номер вагона для идентификации"
        required={true}
      />
    </Box>
  );
};