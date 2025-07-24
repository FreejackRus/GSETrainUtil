import { Box, TextField, Button, Avatar } from "@mui/material";

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
      sx={{ mb: 2 }}
    />
    <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }}>
      Загрузить фото MAC-адреса
      <input type="file" accept="image/*" hidden onChange={onPhotoChange("macPhoto")} />
    </Button>
    {photo && (
      <Box display="flex" justifyContent="center" mt={1}>
        <Avatar
          variant="rounded"
          src={URL.createObjectURL(photo)}
          alt="Фото MAC-адреса"
          sx={{ width: 120, height: 90 }}
        />
      </Box>
    )}
  </Box>
);
