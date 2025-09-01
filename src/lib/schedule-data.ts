
'use server';

import * as fs from 'fs/promises';
import * as path from 'path';

export async function getAllScheduleData() {
  const scheduleFileNames = [
    'Schedule - D-MSOC.csv',
    'Schedule - MBB.csv',
    'Schedule - R-MSOC.csv',
    'Schedule - R-WSOC.csv',
    'Schedule - WBB.csv',
    'Schedule - XC-T&F.csv',
    'Schedule - JV-MBB.csv',
    'Schedule - MSOC.csv',
    'Schedule - R-WBB.csv',
    'Schedule - VB.csv',
    'Schedule - WSOC.csv',
  ];

  let combinedCsvData = '';
  
  for (const fileName of scheduleFileNames) {
    const csvPath = path.join(process.cwd(), 'public', fileName);
    try {
      const csvData = await fs.readFile(csvPath, 'utf-8');
      const rows = csvData.trim().split('\n');
      const header = rows[0];
      const dataRows = rows.slice(1).map(row => `${fileName},${row}`);
      
      if (combinedCsvData === '') {
        combinedCsvData = `Team,${header}\n${dataRows.join('\n')}`;
      } else {
        combinedCsvData += `\n${dataRows.join('\n')}`;
      }
    } catch (error) {
      console.warn(`Could not read or process file ${fileName}. Skipping. Error: ${error}`);
    }
  }
  
  // A fallback to the original file if no new files are found
  if (combinedCsvData.trim() === '') {
      const csvPath = path.join(process.cwd(), 'public', 'schedule.csv');
       try {
        const csvData = await fs.readFile(csvPath, 'utf-8');
        return csvData;
      } catch (error) {
        console.error("Failed to read schedule.csv fallback data:", error);
        return '';
      }
  }

  return combinedCsvData;
}
