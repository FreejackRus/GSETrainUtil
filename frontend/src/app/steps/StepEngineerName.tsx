import { TextField } from "@mui/material";

export const StepEngineerName = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (field: string, value: any) => void;
}) => (
  <TextField
    label="ФИО инженера"
    value={value}
    onChange={(e) => onChange("engineerName", e.target.value)}
    fullWidth
  />
);
