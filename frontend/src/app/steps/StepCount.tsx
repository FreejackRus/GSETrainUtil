import { TextField, MenuItem } from "@mui/material";

export const StepCount = ({
  value,
  onChange,
  equipment,
}: {
  value: number | string;
  onChange: (field: string, value: any) => void;
  equipment: string;
}) => {
  const selectedValue = value === undefined || value === null ? "1" : String(value);
  
  return (
    <TextField
      select
      label="Количество"
      value={selectedValue}
      onChange={(e) => onChange("count", e.target.value)}
      fullWidth
    >
      <MenuItem value="1">1</MenuItem>
      <MenuItem value="2">2</MenuItem>
    </TextField>
  );
};