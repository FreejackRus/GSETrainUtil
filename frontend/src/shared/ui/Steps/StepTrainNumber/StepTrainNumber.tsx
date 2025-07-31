import { TextField, MenuItem, Box, Typography, Avatar, Card, CardContent } from "@mui/material";
import { Train, CheckCircle } from "@mui/icons-material";
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
  <Box>
    <Typography variant="h6" gutterBottom className="step-train-number-title">
      🚂 Номер поезда
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Выберите номер поезда из списка
    </Typography>
    
    <Box display="flex" alignItems="center" gap={2} mb={2}>
      <Avatar className="step-train-number-avatar">
        <Train className="step-train-number-avatar-icon" />
      </Avatar>
      <Box flex={1}>
        <TextField
          select
          label="Номер поезда"
          value={value || ''}
          onChange={(e) => onChange("trainNumber", e.target.value)}
          fullWidth
          variant="outlined"
          className="step-train-number-select"
        >
          {options.map((number, index) => (
            <MenuItem key={`${number}-${index}`} value={number} className="step-train-number-menu-item">
              {number}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Box>

    {value && (
      <Card className="step-train-number-result-card" sx={{ mt: 3, borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar className="step-train-number-result-avatar">
              <CheckCircle />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" className="step-train-number-result-title">
                Поезд №{value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Выбранный состав для работ
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )}
  </Box>
);