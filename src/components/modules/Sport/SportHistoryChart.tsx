'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { WorkoutSession } from '@/types/database';

// Custom tooltip for Recharts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-warm-black/90 border border-white/10 p-md rounded-md backdrop-blur-md shadow-2xl">
        <p className="font-bold text-white mb-1">{data.displayDate}</p>
        {data.hasWorkout ? (
          <>
            <p className="text-sm text-primary">
              {data.minutes} minutes
            </p>
            <p className="text-xs text-gray-light">
              {data.sessionsCount} session{data.sessionsCount > 1 ? 's' : ''}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-light">Rest Day</p>
        )}
      </div>
    );
  }
  return null;
};

interface Props {
  sessions: WorkoutSession[];
  days?: number;
}

export const SportHistoryChart: React.FC<Props> = ({ sessions, days = 14 }) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();

    // Create an array of the last `days` days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      
      const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

      // Find sessions for this date
      const daySessions = sessions.filter(
        (s) => s.session_date === dateStr
      );

      const totalMinutes = daySessions.reduce(
        (sum, s) => sum + (s.duration_minutes || 0),
        0
      );

      data.push({
        date: dateStr,
        displayDate,
        minutes: totalMinutes,
        sessionsCount: daySessions.length,
        hasWorkout: daySessions.length > 0,
      });
    }
    return data;
  }, [sessions, days]);

  if (!isMounted) {
    return (
      <Card className="p-xl bg-white/[0.02] border-white/[0.05]">
        <div className="mb-lg">
          <h3 className="text-lg font-serif font-bold text-white">Activity History</h3>
          <p className="text-sm text-gray-light">Last {days} days of training</p>
        </div>
        <div className="h-[250px] w-full bg-white/[0.01] rounded-lg animate-pulse" />
      </Card>
    );
  }

  return (
    <Card className="p-xl bg-white/[0.02] border-white/[0.05]">
      <div className="mb-lg">
        <h3 className="text-lg font-serif font-bold text-white">Activity History</h3>
        <p className="text-sm text-gray-light">Last {days} days of training</p>
      </div>
      <div className="h-[250px] w-full" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value, index) => (index % 3 === 0 ? value : '')} // Show every 3rd label
            />
            <YAxis 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} 
              axisLine={false} 
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="minutes" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.hasWorkout ? '#4e4feb' : 'rgba(255,255,255,0.05)'} 
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
