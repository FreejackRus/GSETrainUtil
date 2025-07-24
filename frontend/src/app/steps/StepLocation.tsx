import { TextField, MenuItem } from "@mui/material";

export const StepLocation = ({
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
    label="Текущее место (депо/станция)"
    value={value}
    onChange={(e) => onChange("location", e.target.value)}
    fullWidth
  >
    {options.map((loc) => (
      <MenuItem key={loc} value={loc}>
        {loc}
      </MenuItem>
    ))}
  </TextField>
);
