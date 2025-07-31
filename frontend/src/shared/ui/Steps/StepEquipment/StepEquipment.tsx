import { TextField, MenuItem, Box, Typography, Avatar, Card, CardContent } from "@mui/material";
import { Memory, CheckCircle } from "@mui/icons-material";
import "./StepEquipment.css";

export const StepEquipment = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (field: string, value: string) => void;
  options: string[];
}) => (
  <Box>
    <Typography variant="h6" gutterBottom className="step-equipment-title">
      💻 Оборудование
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Выберите тип оборудования для работы
    </Typography>
    
    <Box display="flex" alignItems="center" gap={2} mb={2}>
      <Avatar className="step-equipment-avatar">
        <Memory />
      </Avatar>
      <Box flex={1}>
        <TextField
          select
          label="Тип оборудования"
          value={value}
          onChange={(e) => onChange("equipment", e.target.value)}
          fullWidth
          className="step-equipment-select"
        >
          {options.map((equipment) => (
            <MenuItem key={equipment} value={equipment} className="step-equipment-menu-item">
              {equipment}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Box>

    {value && (
      <Card className="step-equipment-result-card" sx={{ mt: 3, borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar className="step-equipment-result-avatar">
              <CheckCircle />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" className="step-equipment-result-title">
                Выбрано: {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Оборудование для выполнения работ
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )}
  </Box>
);