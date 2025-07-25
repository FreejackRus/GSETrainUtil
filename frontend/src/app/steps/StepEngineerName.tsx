import { TextField, Box, Typography, Avatar, Card, CardContent } from "@mui/material";
import { Person, Badge } from "@mui/icons-material";

export const StepEngineerName = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (field: string, value: any) => void;
}) => (
  <Box>
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
      👨‍🔧 Данные инженера
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Укажите полное имя инженера, выполняющего работы
    </Typography>
    
    <Box display="flex" alignItems="center" gap={2} mb={2}>
      <Avatar sx={{ bgcolor: '#667eea', width: 48, height: 48 }}>
        <Person sx={{ fontSize: 28 }} />
      </Avatar>
      <Box flex={1}>
        <TextField
          label="ФИО инженера"
          value={value}
          onChange={(e) => onChange("engineerName", e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="Иванов Иван Иванович"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              '&:hover fieldset': {
                borderColor: '#667eea',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#667eea',
              }
            }
          }}
        />
      </Box>
    </Box>

    {value && (
      <Card sx={{ mt: 3, borderRadius: 3, bgcolor: '#f8f9ff' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#667eea', color: 'white' }}>
              <Badge />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
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

    <Box mt={3} p={2} borderRadius={2} bgcolor="#fff3e0" border="1px solid #ffcc02">
      <Typography variant="body2" color="#e65100">
        💡 <strong>Важно:</strong> Убедитесь, что ФИО указано полностью и корректно для отчетности
      </Typography>
    </Box>
  </Box>
);
