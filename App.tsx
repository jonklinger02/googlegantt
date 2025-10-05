
import React, { useState, useMemo, useRef } from 'react';
import ProjectSetupForm from './components/ProjectSetupForm';
import GanttChart from './components/GanttChart';
// FIX: Import ItemType to use enum values for type safety.
import { Phase, GanttRow, ItemType } from './types';
import { calculateSchedule } from './services/schedulingService';
import { generatePdf } from './services/pdfService';
import { DownloadIcon } from './components/icons';

const App: React.FC = () => {
  const [endDate, setEndDate] = useState<string>(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);
    return futureDate.toISOString().split('T')[0];
  });

  const [phases, setPhases] = useState<Phase[]>(() => [
    {
      id: crypto.randomUUID(),
      name: 'Phase 1: Planning & Discovery',
      items: [
        // FIX: Use ItemType enum instead of string literals to match type definitions.
        [{ id: crypto.randomUUID(), name: 'Project Kickoff Meeting', type: ItemType.Milestone }],
        [{ id: crypto.randomUUID(), name: 'Requirement Gathering', duration: 10, type: ItemType.Task }],
        [{ id: crypto.randomUUID(), name: 'Technical Specification', duration: 8, type: ItemType.Task }],
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Phase 2: Design & Prototyping',
      items: [
        [{ id: crypto.randomUUID(), name: 'Wireframing', duration: 5, type: ItemType.Task }],
        [{ id: crypto.randomUUID(), name: 'UI/UX Design', duration: 12, type: ItemType.Task }],
        [{ id: crypto.randomUUID(), name: 'Interactive Prototype', duration: 7, type: ItemType.Task }],
        [{ id: crypto.randomUUID(), name: 'Design Review Complete', type: ItemType.Milestone }],
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Phase 3: Development & Testing',
      items: [
        [{ id: crypto.randomUUID(), name: 'Frontend Development', duration: 20, type: ItemType.Task }],
        [{ id: crypto.randomUUID(), name: 'Backend Development', duration: 25, type: ItemType.Task }],
        [{ id: crypto.randomUUID(), name: 'Integration', duration: 5, type: ItemType.Task }],
        [{ id: crypto.randomUUID(), name: 'QA Testing', duration: 10, type: ItemType.Task }],
        [{ id: crypto.randomUUID(), name: 'Alpha Version Ready', type: ItemType.Milestone }],
      ],
    },
    {
        id: crypto.randomUUID(),
        name: 'Phase 4: Deployment',
        items: [
          [{ id: crypto.randomUUID(), name: 'User Acceptance Testing', duration: 5, type: ItemType.Task }],
          [{ id: crypto.randomUUID(), name: 'Final Release Preparation', duration: 3, type: ItemType.Task }],
          [{ id: crypto.randomUUID(), name: 'Project Launch', type: ItemType.Milestone }],
        ],
      },
  ]);

  const ganttData: GanttRow[] = useMemo(() => {
    const projectEndDate = new Date(endDate);
    // Add a day to include the end date in calculations
    projectEndDate.setDate(projectEndDate.getDate() + 1);
    if (!endDate || isNaN(projectEndDate.getTime())) {
      return [];
    }
    return calculateSchedule(phases, projectEndDate);
  }, [phases, endDate]);

  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!ganttContainerRef.current || ganttData.length === 0) {
      alert("There is no chart data to download.");
      return;
    }
    setIsDownloading(true);
    try {
      await generatePdf(ganttContainerRef.current, ganttData);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while generating the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="M18 18v-9" />
                <path d="M18 7V3" />
                <path d="M3 12h12" />
                <path d="M3 6h18" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Waterfall Gantt Chart Maker</h1>
            </div>
             <button
              onClick={handleDownloadPdf}
              disabled={isDownloading || ganttData.length === 0}
              className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <DownloadIcon className="w-5 h-5" />
              <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
          </div>
          <p className="text-gray-500 mt-1">Plan your project by working backward from your deadline.</p>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <ProjectSetupForm
            phases={phases}
            setPhases={setPhases}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        </div>
        <div ref={ganttContainerRef} className="lg:col-span-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200 min-h-[600px]">
          <GanttChart data={ganttData} />
        </div>
      </main>
    </div>
  );
};

export default App;