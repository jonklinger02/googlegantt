import React from 'react';
// FIX: Import `Cell` component from recharts to customize bar colors.
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Scatter, ZAxis, Cell } from 'recharts';
import type { GanttRow } from '../types';

interface GanttChartProps {
  data: GanttRow[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data: GanttRow = payload[0].payload;
    const { name, type, startDate, endDate, duration } = data;
    
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg text-sm">
        <p className="font-bold mb-1">{name}</p>
        <p className="text-gray-600"><span className="font-semibold">Type:</span> {type}</p>
        <p className="text-gray-600"><span className="font-semibold">Start:</span> {startDate.toLocaleDateString()}</p>
        <p className="text-gray-600"><span className="font-semibold">End:</span> {endDate.toLocaleDateString()}</p>
        <p className="text-gray-600"><span className="font-semibold">Duration:</span> {duration} day{duration > 1 ? 's' : ''}</p>
      </div>
    );
  }

  return null;
};

const GanttChart: React.FC<GanttChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-semibold">No Data to Display</h3>
        <p className="mt-2 text-center">Add some phases and tasks, and set a deadline to generate the Gantt chart.</p>
      </div>
    );
  }

  const projectStartDate = data.length > 0 ? data.reduce((min, p) => p.startDate < min ? p.startDate : min, data[0].startDate) : new Date();
  
  const tickFormatter = (tick: number) => {
    const date = new Date(projectStartDate);
    date.setDate(date.getDate() + tick);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const domainMax = Math.max(...data.map(d => d.daysFromStart + d.duration));

  const chartData = data.map(d => ({
    name: d.name,
    range: [d.daysFromStart, d.daysFromStart + d.duration],
    ganttBar: d.type !== 'Milestone' ? d.duration : 0,
    ...d,
  }));

  const milestoneData = data
    .filter(d => d.type === 'Milestone')
    .map(d => ({ x: d.daysFromStart, y: d.name, ...d }));

  const yAxisWidth = Math.max(200, ...chartData.map(d => d.name.length * 7));

  return (
    <div className="w-full h-[calc(100vh-200px)] min-h-[550px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barCategoryGap="35%"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, domainMax]} tickFormatter={tickFormatter} />
          <YAxis dataKey="name" type="category" width={yAxisWidth} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(230, 230, 230, 0.5)'}} />
          <Legend />

          <Bar dataKey="daysFromStart" stackId="a" fill="transparent" name="Offset"/>
          <Bar dataKey="ganttBar" stackId="a" name="Duration" radius={[4, 4, 4, 4]} >
            {
              chartData.map((entry) => {
                let color = '#60A5FA'; // Task color
                if (entry.type === 'Phase') color = '#3B82F6'; // Phase color
                // FIX: Use recharts <Cell> component to set color for individual bars, instead of a <div> with an invalid `fill` prop.
                return <Cell key={`cell-${entry.id}`} fill={color} />;
              })
            }
          </Bar>
          <ZAxis dataKey="x" range={[0, 500]}/>
          <Scatter name="Milestones" data={milestoneData} fill="#9333EA" shape="diamond" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GanttChart;