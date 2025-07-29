const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../../Перечень работ по составам.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  
  console.log('Листы в файле:', workbook.SheetNames);
  
  // Анализ листа Journal
  if (workbook.Sheets['Journal']) {
    const journalData = XLSX.utils.sheet_to_json(workbook.Sheets['Journal']);
    console.log('\n=== АНАЛИЗ ЛИСТА JOURNAL ===');
    console.log('Количество записей:', journalData.length);
    console.log('Колонки:', Object.keys(journalData[0] || {}));
    console.log('\nПервые 3 записи:');
    console.log(JSON.stringify(journalData.slice(0, 3), null, 2));
  }
  
  // Анализ листа Вагоны
  const wagonSheet = workbook.Sheets['Вагоны'] || workbook.Sheets['Вагоны (2)'];
  if (wagonSheet) {
    const wagonData = XLSX.utils.sheet_to_json(wagonSheet);
    console.log('\n=== АНАЛИЗ ЛИСТА ВАГОНЫ ===');
    console.log('Количество записей:', wagonData.length);
    console.log('Колонки:', Object.keys(wagonData[0] || {}));
    console.log('\nПервые 2 записи:');
    console.log(JSON.stringify(wagonData.slice(0, 2), null, 2));
  }
  
} catch (error) {
  console.error('Ошибка:', error.message);
}