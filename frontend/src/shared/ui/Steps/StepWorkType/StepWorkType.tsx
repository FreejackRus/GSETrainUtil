import { Build } from "@mui/icons-material";
import { AutocompleteField } from "../../AutocompleteField";
import "./StepWorkType.css";

export const StepWorkType = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (field: string, value: string) => void;
  options: string[];
}) => (
  <AutocompleteField
    label="🔧 Тип работ"
    value={value}
    onChange={(newValue) => onChange("workType", newValue)}
    options={options}
    placeholder="Выберите или введите тип работ"
    fullWidth
    required
  />
);