import { TextField, MenuItem } from "@mui/material";

export const StepTrainNumber = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (field: string, value: any) => void;
  options: string[];
}) => (
  <TextField
    select
    label="Номер поезда"
    value={value}
    onChange={(e) => onChange("trainNumber", e.target.value)}
    fullWidth
  >
    {options.map((num) => (
      <MenuItem key={num} value={num}>
        {num}
      </MenuItem>
    ))}
  </TextField>
);
