'use client';

import React from 'react';
import { Input } from '@/components/Input';

interface SportFormFieldsProps {
  type: string;
  setType: (type: string) => void;
  reps: number;
  setReps: (reps: number) => void;
  sets: number;
  setSets: (sets: number) => void;
  weight: number;
  setWeight: (weight: number) => void;
  distance: number;
  setDistance: (distance: number) => void;
  durationSeconds: number;
  setDurationSeconds: (duration: number) => void;
}

export const SportFormFields: React.FC<SportFormFieldsProps> = ({
  type,
  setType,
  reps,
  setReps,
  sets,
  setSets,
  weight,
  setWeight,
  distance,
  setDistance,
  durationSeconds,
  setDurationSeconds,
}) => {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-light/20 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Sport Details</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-secondary/30 to-transparent ml-4"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-very-light tracking-wide mb-1">
            Sport Type
          </label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="w-full h-12 px-lg bg-gray-strong/70 border border-gray-light/25 rounded-md focus:ring-2 focus:ring-secondary/40 text-soft-cream outline-none transition-all appearance-none cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23a0aec0\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
          >
            <option value="run" className="bg-gray-strong">🏃 Running</option>
            <option value="lift" className="bg-gray-strong">🏋️ Weight Lifting</option>
            <option value="cycle" className="bg-gray-strong">🚴 Cycling</option>
            <option value="swim" className="bg-gray-strong">🏊 Swimming</option>
            <option value="yoga" className="bg-gray-strong">🧘 Yoga</option>
            <option value="other" className="bg-gray-strong">✨ Other</option>
          </select>
        </div>
        
        {type === 'lift' ? (
          <>
            <Input 
              label="Sets" 
              type="number" 
              value={sets || ''} 
              onChange={(e) => setSets(Number(e.target.value))} 
              placeholder="0"
            />
            <Input 
              label="Reps" 
              type="number" 
              value={reps || ''} 
              onChange={(e) => setReps(Number(e.target.value))} 
              placeholder="0"
            />
            <div className="col-span-2">
              <Input 
                label="Weight (kg)" 
                type="number" 
                step="0.5" 
                value={weight || ''} 
                onChange={(e) => setWeight(Number(e.target.value))} 
                placeholder="0.0"
              />
            </div>
          </>
        ) : (
          <>
            <Input 
              label="Distance (m)" 
              type="number" 
              value={distance || ''} 
              onChange={(e) => setDistance(Number(e.target.value))} 
              placeholder="0"
            />
            <Input 
              label="Duration (sec)" 
              type="number" 
              value={durationSeconds || ''} 
              onChange={(e) => setDurationSeconds(Number(e.target.value))} 
              placeholder="0"
            />
          </>
        )}
      </div>
    </div>
  );
};
