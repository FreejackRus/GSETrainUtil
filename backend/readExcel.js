const XLSX = require('xlsx');
const path = require('path');

// Читаем Excel файл
const filePath = path.join(__dirname, '..', 'Перечень работ по составам.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  
  console.log('Листы в файле:', workbook.SheetNames);
  
  // Читаем лист "Вагоны"
  const wagonSheet = 'Вагоны';
  
  if (workbook.SheetNames.includes(wagonSheet)) {
    console.log(`\n=== Анализ листа "${wagonSheet}" ===`);
    
    const worksheet = workbook.Sheets[wagonSheet];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`\nВсего строк: ${data.length}`);
    
    // Показываем первые 15 строк для понимания структуры
    console.log('\nПервые 15 строк:');
    data.slice(0, 15).forEach((row, index) => {
      if (row && row.length > 0) {
        console.log(`Строка ${index + 1}:`, row);
      }
    });
    
    // Ищем строку с заголовками (обычно содержит "номер", "тип" и названия оборудования)
    console.log('\n=== Поиск заголовков ===');
    for (let i = 0; i < Math.min(20, data.length); i++) {
      const row = data[i];
      if (row && row.length > 5) { // Строка с достаточным количеством колонок
        const hasWagonInfo = row.some(cell => 
          cell && typeof cell === 'string' && 
          (cell.toLowerCase().includes('номер') || 
           cell.toLowerCase().includes('тип') ||
           cell.toLowerCase().includes('вагон'))
        );
        
        if (hasWagonInfo) {
          console.log(`Возможные заголовки в строке ${i + 1}:`, row);
        }
      }
    }
    
    // Анализируем данные после заголовков
    console.log('\n=== Анализ данных ===');
    let headerRowIndex = -1;
    
    // Ищем строку с заголовками
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row && row.length > 3) {
        const hasEquipmentNames = row.some(cell => 
          cell && typeof cell === 'string' && 
          (cell.includes('Mikrotik') || 
           cell.includes('Коммутатор') ||
           cell.includes('Источник питания'))
        );
        
        if (hasEquipmentNames) {
          headerRowIndex = i;
          console.log(`Найдены заголовки оборудования в строке ${i + 1}:`, row);
          break;
        }
      }
    }
    
    // Показываем несколько строк данных после заголовков
    if (headerRowIndex >= 0) {
      console.log('\nДанные после заголовков:');
      for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + 10, data.length); i++) {
        if (data[i] && data[i].length > 0) {
          console.log(`Строка ${i + 1}:`, data[i]);
        }
      }
    }
  }
  
  // Также посмотрим на "Вагоны (2)"
  const wagonSheet2 = 'Вагоны (2)';
  if (workbook.SheetNames.includes(wagonSheet2)) {
    console.log(`\n\n=== Анализ листа "${wagonSheet2}" ===`);
    
    const worksheet2 = workbook.Sheets[wagonSheet2];
    const data2 = XLSX.utils.sheet_to_json(worksheet2, { header: 1 });
    
    console.log(`\nВсего строк: ${data2.length}`);
    
    console.log('\nПервые 10 строк:');
    data2.slice(0, 10).forEach((row, index) => {
      if (row && row.length > 0) {
        console.log(`Строка ${index + 1}:`, row);
      }
    });
  }
  
} catch (error) {
  console.error('Ошибка при чтении файла:', error.message);
}