import { TextField, Box, Typography, Avatar, Card, CardContent } from "@mui/material";
import { Person, Badge } from "@mui/icons-material";
import "./StepEngineerName.css";

export const StepEngineerName = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (field: string, value: string) => void;
}) => (
  <Box>
    <Typography variant="h6" gutterBottom className="step-engineer-name-title">
      👨‍🔧 Данные инженера
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Укажите полное имя инженера, выполняющего работы
    </Typography>
    
    <Box display="flex" alignItems="center" gap={2} mb={2}>
      <Avatar className="step-engineer-name-avatar">
        <Person className="step-engineer-name-avatar-icon" />
      </Avatar>
      <Box flex={1}>
        <TextField
          label="ФИО инженера"
          value={value}
          onChange={(e) => onChange("engineerName", e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="Иванов Иван Иванович"
          className="step-engineer-name-input"
        />
      </Box>
    </Box>

    {value && (
      <Card className="step-engineer-name-result-card" sx={{ mt: 3, borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar className="step-engineer-name-result-avatar">
              <Badge />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" className="step-engineer-name-result-title">
                Инженер: {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ответственный за выполнение работ
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )}

    <Box className="step-engineer-name-hint" mt={3} p={2} borderRadius={2}>
      <Typography variant="body2" className="step-engineer-name-hint-text">
        💡 <strong>Важно:</strong> Убедитесь, что ФИО указано полностью и корректно для отчетности
      </Typography>
    </Box>
  </Box>
);