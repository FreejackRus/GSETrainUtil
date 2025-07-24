import { TextField, MenuItem } from "@mui/material";

export const StepWorkType = ({
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
    label="Тип работ"
    value={value}
    onChange={(e) => onChange("workType", e.target.value)}
    fullWidth
  >
    {options.map((type) => (
      <MenuItem key={type} value={type}>
        {type}
      </MenuItem>
    ))}
  </TextField>
);
