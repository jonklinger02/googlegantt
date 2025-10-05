import React, { useState } from 'react';
// FIX: Import `ItemTypeEnum` as a value to use its enum members, and `Phase` as a type.
import { type Phase, ItemType as ItemTypeEnum } from '../types';
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, LinkIcon, UnlinkIcon } from './icons';

interface ProjectSetupFormProps {
  phases: Phase[];
  setPhases: React.Dispatch<React.SetStateAction<Phase[]>>;
  endDate: string;
  setEndDate: (date: string) => void;
}

const ProjectSetupForm: React.FC<ProjectSetupFormProps> = ({ phases, setPhases, endDate, setEndDate }) => {
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newItem, setNewItem] = useState<{ [phaseId: string]: { name: string; duration: string } }>({});

  const handleAddPhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPhaseName.trim()) {
      setPhases([...phases, { id: crypto.randomUUID(), name: newPhaseName, items: [] }]);
      setNewPhaseName('');
    }
  };

  const handleDeletePhase = (phaseId: string) => {
    setPhases(phases.filter(p => p.id !== phaseId));
  };
  
  const handleAddItem = (phaseId: string, type: ItemTypeEnum) => {
    const itemData = newItem[phaseId];
    if (!itemData || !itemData.name.trim()) return;

    const newItemObject = type === ItemTypeEnum.Task
      ? { id: crypto.randomUUID(), name: itemData.name, duration: parseInt(itemData.duration, 10) || 1, type }
      : { id: crypto.randomUUID(), name: itemData.name, type };

    setPhases(phases.map(phase => 
      phase.id === phaseId 
        ? { ...phase, items: [...phase.items, [newItemObject]] } 
        : phase
    ));
    setNewItem({ ...newItem, [phaseId]: { name: '', duration: '5' } });
  };

  const handleDeleteItem = (phaseId: string, itemId: string) => {
    setPhases(currentPhases => {
        const newPhases = JSON.parse(JSON.stringify(currentPhases));
        const phase = newPhases.find((p: Phase) => p.id === phaseId);
        if (!phase) return currentPhases;
        
        for (let i = 0; i < phase.items.length; i++) {
            const group = phase.items[i];
            const itemIndex = group.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
                group.splice(itemIndex, 1);
                if (group.length === 0) {
                    phase.items.splice(i, 1);
                }
                break;
            }
        }
        return newPhases;
    });
  };

  const handleNewItemChange = (phaseId: string, field: 'name' | 'duration', value: string) => {
    setNewItem(prev => ({
      ...prev,
      [phaseId]: { ...prev[phaseId], [field]: value }
    }));
  };

  const handleMoveGroup = (phaseId: string, groupIndex: number, direction: 'up' | 'down') => {
    setPhases(currentPhases => {
        const newPhases = JSON.parse(JSON.stringify(currentPhases));
        const phase = newPhases.find((p: Phase) => p.id === phaseId);
        if (!phase) return currentPhases;

        const newIndex = direction === 'up' ? groupIndex - 1 : groupIndex + 1;
        if (newIndex < 0 || newIndex >= phase.items.length) return currentPhases;

        const temp = phase.items[groupIndex];
        phase.items[groupIndex] = phase.items[newIndex];
        phase.items[newIndex] = temp;

        return newPhases;
    });
  };

  const handleGroupWithPrevious = (phaseId: string, groupIndex: number) => {
      if (groupIndex === 0) return;
      setPhases(currentPhases => {
          const newPhases = JSON.parse(JSON.stringify(currentPhases));
          const phase = newPhases.find((p: Phase) => p.id === phaseId);
          if (!phase) return currentPhases;
          
          const groupToMerge = phase.items[groupIndex];
          phase.items[groupIndex - 1].push(...groupToMerge);
          phase.items.splice(groupIndex, 1);
          
          return newPhases;
      });
  };

  const handleUngroupItem = (phaseId: string, groupIndex: number, itemIndex: number) => {
      setPhases(currentPhases => {
          const newPhases = JSON.parse(JSON.stringify(currentPhases));
          const phase = newPhases.find((p: Phase) => p.id === phaseId);
          if (!phase) return currentPhases;

          const group = phase.items[groupIndex];
          if (group.length <= 1) return currentPhases;

          const itemToMove = group.splice(itemIndex, 1)[0];
          phase.items.splice(groupIndex + 1, 0, [itemToMove]);

          return newPhases;
      });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">1. Set Project Deadline</h2>
        <div className="relative">
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full px-4 py-2 bg-white text-dark-text border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">2. Define Project Phases</h2>
        <div className="space-y-6">
          {phases.map(phase => (
            <div key={phase.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">{phase.name}</h3>
                <button onClick={() => handleDeletePhase(phase.id)} className="text-gray-400 hover:text-red-500 transition">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2 mb-4">
                {phase.items.map((group, groupIndex) => (
                  <div
                    key={groupIndex}
                    className={`border border-dashed border-gray-300 rounded-lg p-2 relative group/container transition-colors ${
                      group.length > 1 ? 'bg-blue-50 pl-5' : ''
                    }`}
                    title={group.length > 1 ? 'Concurrent Tasks' : 'Sequential Step'}
                  >
                    {group.length > 1 && (
                      <div className="absolute left-2 top-2 bottom-2 w-1 bg-brand-secondary rounded-full" />
                    )}
                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-1 opacity-0 group-hover/container:opacity-100 transition-opacity duration-200">
                      <button onClick={() => handleMoveGroup(phase.id, groupIndex, 'up')} disabled={groupIndex === 0} className="disabled:opacity-20 disabled:cursor-not-allowed text-gray-400 hover:text-gray-800">
                          <ArrowUpIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleMoveGroup(phase.id, groupIndex, 'down')} disabled={groupIndex === phase.items.length - 1} className="disabled:opacity-20 disabled:cursor-not-allowed text-gray-400 hover:text-gray-800">
                          <ArrowDownIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {group.map((item, itemIndex) => (
                        <div key={item.id} className="flex justify-between items-center text-sm bg-white p-2 rounded-md border group/item">
                          <div>
                            <span className={`font-medium ${item.type === 'Milestone' ? 'text-purple-600' : 'text-blue-600'}`}>
                              {item.type}: 
                            </span> {item.name}
                            {item.type === 'Task' && <span className="text-gray-500"> ({item.duration} days)</span>}
                          </div>
                          <div className="flex items-center space-x-2 text-gray-400 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                            {group.length > 1 && (
                                <button title="Ungroup from concurrent tasks" onClick={() => handleUngroupItem(phase.id, groupIndex, itemIndex)} className="hover:text-gray-800">
                                    <UnlinkIcon className="w-4 h-4" />
                                </button>
                            )}
                            {groupIndex > 0 && group.length === 1 && (
                                <button title="Group with previous (run concurrently)" onClick={() => handleGroupWithPrevious(phase.id, groupIndex)} className="hover:text-gray-800">
                                    <LinkIcon className="w-4 h-4" />
                                </button>
                            )}
                            <button title="Delete item" onClick={() => handleDeleteItem(phase.id, item.id)} className="hover:text-red-500">
                               <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-100 p-3 rounded-md space-y-2">
                  <input
                    type="text"
                    placeholder="New Task or Milestone Name"
                    value={newItem[phase.id]?.name || ''}
                    onChange={(e) => handleNewItemChange(phase.id, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white text-dark-text border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-brand-primary placeholder-medium-text"
                  />
                  <div className="grid grid-cols-2 gap-2">
                     <input
                      type="number"
                      placeholder="Duration (days)"
                      value={newItem[phase.id]?.duration || '5'}
                      onChange={(e) => handleNewItemChange(phase.id, 'duration', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white text-dark-text border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-brand-primary"
                    />
                    <div className="flex gap-2">
                      {/* FIX: Use ItemType enum instead of string literals for type safety. */}
                      <button onClick={() => handleAddItem(phase.id, ItemTypeEnum.Task)} className="flex-1 text-xs bg-blue-500 text-white px-2 py-1.5 rounded-md hover:bg-blue-600 transition">Add Task</button>
                      {/* FIX: Use ItemType enum instead of string literals for type safety. */}
                      <button onClick={() => handleAddItem(phase.id, ItemTypeEnum.Milestone)} className="flex-1 text-xs bg-purple-500 text-white px-2 py-1.5 rounded-md hover:bg-purple-600 transition">Add M.</button>
                    </div>
                  </div>
              </div>

            </div>
          ))}
        </div>
        
        <form onSubmit={handleAddPhase} className="mt-6 flex gap-2">
          <input
            type="text"
            value={newPhaseName}
            onChange={e => setNewPhaseName(e.target.value)}
            placeholder="New phase name"
            className="flex-grow px-4 py-2 bg-white text-dark-text border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition placeholder-medium-text"
          />
          <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            <span>Add Phase</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectSetupForm;