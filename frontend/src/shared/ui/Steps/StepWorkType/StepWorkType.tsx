import { TextField, MenuItem, Box, Typography, Avatar, Card, CardContent } from "@mui/material";
import { Build, CheckCircle } from "@mui/icons-material";
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
  <Box>
    <Typography variant="h6" gutterBottom className="step-work-type-title">
      🔧 Тип работ
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Выберите тип работ, которые будут выполняться
    </Typography>
    
    <Box display="flex" alignItems="center" gap={2} mb={2}>
      <Avatar className="step-work-type-avatar">
        <Build />
      </Avatar>
      <Box flex={1}>
        <TextField
          select
          label="Тип работ"
          value={value || ''}
          onChange={(e) => onChange("workType", e.target.value)}
          fullWidth
          className="step-work-type-select"
        >
          {options.map((type, index) => (
            <MenuItem key={`${type}-${index}`} value={type} className="step-work-type-menu-item">
              {type}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Box>

    {value && (
      <Card className="step-work-type-result-card" sx={{ mt: 3, borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar className="step-work-type-result-avatar">
              <CheckCircle />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" className="step-work-type-result-title">
                Выбранный тип: {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Работы будут выполнены согласно выбранному типу
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )}
  </Box>
);