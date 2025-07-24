import { Box, TextField, Button, Avatar } from "@mui/material";

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
      sx={{ mb: 2 }}
    />
    <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }}>
      Загрузить фото номера вагона
      <input type="file" accept="image/*" hidden onChange={onPhotoChange("carriagePhoto")} />
    </Button>
    {photo && (
      <Box display="flex" justifyContent="center" mt={1}>
        <Avatar
          variant="rounded"
          src={URL.createObjectURL(photo)}
          alt="Фото номера вагона"
          sx={{ width: 120, height: 90 }}
        />
      </Box>
    )}
  </Box>
);
