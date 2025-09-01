
"use client";

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
  let isFirstFile = true;
  
  for (const fileName of scheduleFileNames) {
    try {
      const res = await fetch(`/${fileName.replace(/\\/g, '')}`);
      const text = await res.text();
      const rows = text.trim().split('\n');
      const header = rows[0];
      const dataRows = rows.slice(1).map(row => `${fileName},${row}`);

      if (isFirstFile) {
        combinedCsvData += `Team,${header}\n${dataRows.join('\n')}`;
        isFirstFile = false;
      } else {
        combinedCsvData += `\n${dataRows.join('\n')}`;
      }
    } catch (error) {
      console.warn(`Could not fetch or process file ${fileName}. Skipping.`);
    }
  }

  return combinedCsvData;
}
