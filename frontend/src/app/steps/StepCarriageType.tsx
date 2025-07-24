import { TextField, MenuItem } from "@mui/material";

export const StepCarriageType = ({
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
    label="Тип вагона"
    value={value}
    onChange={(e) => onChange("carriageType", e.target.value)}
    fullWidth
  >
    {options.map((type) => (
      <MenuItem key={type} value={type}>
        {type}
      </MenuItem>
    ))}
  </TextField>
);
