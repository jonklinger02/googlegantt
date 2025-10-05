// FIX: Use a default import for jsPDF to resolve module augmentation issues.
// The 'jspdf' library's main export is a default class, and module augmentation
// for plugins like 'jspdf-autotable' works correctly with this import style.
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import type { GanttRow } from '../types';

// Extend the jsPDF interface to include autoTable for TypeScript
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePdf = async (chartElement: HTMLElement, data: GanttRow[]): Promise<void> => {
  if (!chartElement) {
    console.error("Chart element not found for PDF generation.");
    return;
  }

  // Use html2canvas to capture the chart
  const canvas = await html2canvas(chartElement, {
    scale: 2, // Increase resolution for better quality
    logging: false,
    useCORS: true,
  });
  const imgData = canvas.toDataURL('image/png');

  // Initialize PDF in landscape mode
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  // Calculate image dimensions to fit the page while maintaining aspect ratio
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pdfWidth - margin * 2;
  const contentHeight = pdfHeight - margin * 2;

  const imgProps = pdf.getImageProperties(imgData);
  const aspectRatio = imgProps.width / imgProps.height;
  
  let imgWidth = contentWidth;
  let imgHeight = imgWidth / aspectRatio;

  if (imgHeight > contentHeight) {
    imgHeight = contentHeight;
    imgWidth = imgHeight * aspectRatio;
  }

  const x = (pdfWidth - imgWidth) / 2;
  const y = (pdfHeight - imgHeight) / 2;
  
  // Add title for the chart page
  pdf.setFontSize(18);
  pdf.text('Project Gantt Chart', pdfWidth / 2, margin - 10, { align: 'center' });

  // Add the captured image to the PDF
  pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

  // Add a new page for the table
  pdf.addPage();
  
  // Add title for the table page
  pdf.setFontSize(18);
  pdf.text('Project Schedule Details', pdfWidth / 2, margin, { align: 'center' });

  // Prepare table data
  const head = [['Name', 'Type', 'Start Date', 'End Date', 'Duration (days)']];
  const body = data.map(row => [
    row.name,
    row.type,
    row.startDate.toLocaleDateString(),
    row.endDate.toLocaleDateString(),
    row.type !== 'Milestone' ? row.duration : '-',
  ]);

  // Create the table using jspdf-autotable
  pdf.autoTable({
    head,
    body,
    startY: margin + 20,
    theme: 'grid',
    headStyles: {
      fillColor: '#3B82F6', // brand-primary
      textColor: 255,
      fontStyle: 'bold',
    },
    willDrawCell: (hookData) => {
        // Find the original GanttRow to check its type and apply custom styles
        const ganttRow = data[hookData.row.index];
        if (ganttRow && ganttRow.type === 'Phase') {
            pdf.setFont(undefined, 'bold');
            pdf.setFillColor('#F3F4F6'); // A light gray
        }
    },
  });

  // Save the PDF
  pdf.save('project-schedule.pdf');
};
