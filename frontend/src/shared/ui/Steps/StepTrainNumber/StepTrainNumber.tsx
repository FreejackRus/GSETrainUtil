import { AutocompleteField } from "../../AutocompleteField";
import "./StepTrainNumber.css";

export const StepTrainNumber = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (field: string, value: string) => void;
  options: string[];
}) => (
  <AutocompleteField
    label="🚂 Номер поезда"
    value={value}
    onChange={(newValue) => onChange("trainNumber", newValue)}
    options={options}
    placeholder="Выберите или введите номер поезда"
    fullWidth
    required
  />
);