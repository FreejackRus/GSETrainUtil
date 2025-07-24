import { Box, TextField, Button, MenuItem, Avatar } from "@mui/material";

export const StepEquipment = ({
  value,
  photo,
  onChange,
  onPhotoChange,
  options,
}: {
  value: string;
  photo: File | null;
  onChange: (field: string, value: any) => void;
  onPhotoChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: string[];
}) => (
  <Box>
    <TextField
      select
      label="Наименование оборудования"
      value={value}
      onChange={(e) => onChange("equipment", e.target.value)}
      fullWidth
      sx={{ mb: 2 }}
    >
      {options.map((type) => (
        <MenuItem key={type} value={type}>
          {type}
        </MenuItem>
      ))}
    </TextField>
    <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }}>
      Загрузить фото оборудования
      <input type="file" accept="image/*" hidden onChange={onPhotoChange("equipmentPhoto")} />
    </Button>
    {photo && (
      <Box display="flex" justifyContent="center" mt={1}>
        <Avatar
          variant="rounded"
          src={URL.createObjectURL(photo)}
          alt="Фото оборудования"
          sx={{ width: 120, height: 90 }}
        />
      </Box>
    )}
  </Box>
);
