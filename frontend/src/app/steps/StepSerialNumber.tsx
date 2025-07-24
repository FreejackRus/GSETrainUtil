import { Box, TextField, Button, Avatar } from "@mui/material";

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
}) => {
  if (equipment === "коннектор") return null;
  return (
    <Box>
      <TextField
        label="Серийный номер"
        value={value}
        onChange={(e) => onChange("serialNumber", e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }}>
        Загрузить фото серийного номера
        <input type="file" accept="image/*" hidden onChange={onPhotoChange("serialPhoto")} />
      </Button>
      {photo && (
        <Box display="flex" justifyContent="center" mt={1}>
          <Avatar
            variant="rounded"
            src={URL.createObjectURL(photo)}
            alt="Фото серийного номера"
            sx={{ width: 120, height: 90 }}
          />
        </Box>
      )}
    </Box>
  );
};
