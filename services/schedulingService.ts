import { Phase, GanttRow, ItemType, Task } from '../types';

const subtractDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const daysBetween = (startDate: Date, endDate: Date): number => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const utc2 = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return Math.floor((utc2 - utc1) / msPerDay);
};

export const calculateSchedule = (phases: Phase[], projectEndDate: Date): GanttRow[] => {
  if (!phases.length || !projectEndDate) {
    return [];
  }

  const reversedGroups = phases.flatMap(p => p.items).reverse();

  const calculatedItemsMap = new Map<string, GanttRow>();
  let currentDate = new Date(projectEndDate);

  for (const group of reversedGroups) {
    if (group.length === 0) continue;

    const groupDurations = group.map(item => (item.type === ItemType.Task ? item.duration : 1));
    const maxDuration = Math.max(0, ...groupDurations);
    
    const groupEndDate = new Date(currentDate);
    const groupStartDate = subtractDays(groupEndDate, maxDuration);

    for (const item of group) {
      const itemDuration = item.type === ItemType.Task ? item.duration : 1;
      const itemStartDate = subtractDays(groupEndDate, itemDuration);
      
      calculatedItemsMap.set(item.id, {
        id: item.id,
        name: item.name,
        type: item.type,
        startDate: itemStartDate,
        endDate: groupEndDate,
        duration: itemDuration,
        level: 1,
        daysFromStart: 0, // will be calculated later
      });
    }

    currentDate = groupStartDate;
  }
  
  const calculatedPhases: GanttRow[] = [];
  for (const phase of phases) {
    const phaseItems = phase.items.flat().map(item => calculatedItemsMap.get(item.id)).filter(Boolean) as GanttRow[];
    if (phaseItems.length > 0) {
      const phaseStartDate = new Date(Math.min(...phaseItems.map(item => item.startDate.getTime())));
      const phaseEndDate = new Date(Math.max(...phaseItems.map(item => item.endDate.getTime())));
      
      calculatedPhases.push({
        id: phase.id,
        name: phase.name,
        type: 'Phase',
        startDate: phaseStartDate,
        endDate: phaseEndDate,
        duration: daysBetween(phaseStartDate, phaseEndDate),
        level: 0,
        daysFromStart: 0, // will be calculated later
      });
    }
  }

  const finalGanttData: GanttRow[] = [];
  phases.forEach(phase => {
    const calculatedPhase = calculatedPhases.find(p => p.id === phase.id);
    if(calculatedPhase) {
        finalGanttData.push(calculatedPhase);
    }
    phase.items.flat().forEach(item => {
        const calculatedItem = calculatedItemsMap.get(item.id);
        if(calculatedItem) {
            finalGanttData.push(calculatedItem);
        }
    });
  });

  if (finalGanttData.length === 0) {
    return [];
  }

  const projectStartDate = new Date(Math.min(...finalGanttData.map(item => item.startDate.getTime())));

  return finalGanttData.map(item => ({
    ...item,
    daysFromStart: daysBetween(projectStartDate, item.startDate),
  }));
};