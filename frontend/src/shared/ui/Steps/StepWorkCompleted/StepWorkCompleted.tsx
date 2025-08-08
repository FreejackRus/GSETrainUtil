import  { useState, useEffect } from 'react';
import { Box, Typography, FormControl, Select, MenuItem, Avatar, Card, CardContent } from "@mui/material";
import { CheckCircle, Business, Person } from "@mui/icons-material";
import { apiClient } from '../../../api';
import "./StepWorkCompleted.css";

interface CompletedJobOption {
  id: number;
  name: string;
}

export const StepWorkCompleted = ({
  value,
  onChange
}: {
  value: string;
  onChange: (field: string, value: string) => void;
}) => {
  const [options, setOptions] = useState<CompletedJobOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedJobs = async () => {
      try {
        const response = await apiClient.get('/completedJob');
        setOptions(response.data);
      } catch (error) {
        console.error('Error fetching completed jobs:', error);
        // Fallback данные в случае ошибки
        setOptions([
          { id: 1, name: 'Перемена' },
          { id: 2, name: 'Подрядчик' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedJobs();
  }, []);

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Загрузка...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom className="step-work-completed-title">
        ✅ Работы выполнены
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Выберите, кем были выполнены работы
      </Typography>
      
      <Box display="flex" alignItems="center" gap={{xs:0.5,sm:2}} mb={2}>
        <Avatar className="step-work-completed-avatar" >
          <CheckCircle className="step-work-completed-avatar-icon"/>
        </Avatar>
        <Box flex={1}>
          <FormControl fullWidth variant="outlined">
            <Select
              value={value || ''}
              onChange={(e) => onChange("workCompleted", e.target.value)}
              displayEmpty
              className="step-work-completed-select"
              sx={{fontSize:{xs:"0.6rem",sm:"0.8rem"}}}
            >
              <MenuItem value="" disabled>
                Выберите исполнителя
              </MenuItem>
              {options.map((option) => (
                <MenuItem key={option.id} value={option.name}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {value && (
        <Card className="step-work-completed-result-card" sx={{ mt: 3, borderRadius: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar className="step-work-completed-result-avatar">
                {value === "Перемена" ? <Business /> : <Person />}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" className="step-work-completed-result-title" sx={{fontSize:{xs:"0.8rem",sm:"1rem"}}}>
                  Исполнитель: {value}
                </Typography>
                <Typography variant="body2" color="text.secondary"  sx={{fontSize:{xs:"0.6rem",sm:"0.8rem"}}}>
                  {value === "Перемена" ? "Работы выполнены силами компании" : "Работы выполнены подрядчиком"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box className="step-work-completed-hint" mt={3} p={2} borderRadius={2}>
        <Typography variant="body2" className="step-work-completed-hint-text">
          💡 <strong>Важно:</strong> Выбор исполнителя влияет на отчетность и учет выполненных работ
        </Typography>
      </Box>
    </Box>
  );
};