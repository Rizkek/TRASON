'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { WorkoutSession } from '@/types/database';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
);

interface Props {
  sessions: WorkoutSession[];
  days?: number;
}

export const SportHistoryChart: React.FC<Props> = ({ sessions, days = 14 }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      
      const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

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

  const barChartData = {
    labels: chartData.map(d => d.displayDate),
    datasets: [
      {
        data: chartData.map(d => d.minutes),
        backgroundColor: chartData.map(d => d.hasWorkout ? '#4e4feb' : 'rgba(255,255,255,0.05)'),
        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
        borderSkipped: false,
        maxBarThickness: 40
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(11, 15, 20, 0.9)',
        titleColor: '#FFFFFF',
        titleFont: { size: 14, weight: 'bold' as const },
        bodyColor: '#4e4feb',
        bodyFont: { size: 14 },
        padding: 12,
        cornerRadius: 6,
        boxPadding: 4,
        displayColors: false,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          title: (context: any) => {
            return context[0].label;
          },
          label: (context: any) => {
            const index = context.dataIndex;
            const dataItem = chartData[index];
            if (dataItem.hasWorkout) {
              const sessionsStr = `${dataItem.sessionsCount} session${dataItem.sessionsCount > 1 ? 's' : ''}`;
              return [`${dataItem.minutes} minutes`, sessionsStr];
            }
            return 'Rest Day';
          },
          labelTextColor: (context: any) => {
            const index = context.dataIndex;
            const dataItem = chartData[index];
            if (!dataItem.hasWorkout) return '#94A3B8'; // gray-light for rest day
            return '#4e4feb'; // primary
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: 'rgba(255,255,255,0.4)',
          font: { size: 11 },
          callback: function(this: any, val: any, index: number) {
            // Only show every 3rd label
            return index % 3 === 0 ? this.getLabelForValue(val) : '';
          }
        }
      },
      y: {
        display: false,
        grid: {
          display: false
        }
      }
    }
  };

  if (!isMounted) {
    return (
      <Card className="p-xl bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05]">
        <div className="mb-lg">
          <h3 className="text-lg font-serif font-bold text-white">Activity History</h3>
          <p className="text-sm text-gray-light">Last {days} days of training</p>
        </div>
        <div className="h-[250px] w-full bg-black/[0.01] dark:bg-white/[0.01] rounded-lg animate-pulse" />
      </Card>
    );
  }

  return (
    <Card className="p-xl bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05]">
      <div className="mb-lg">
        <h3 className="text-lg font-serif font-bold text-white">Activity History</h3>
        <p className="text-sm text-gray-light">Last {days} days of training</p>
      </div>
      <div className="h-[250px] w-full" style={{ minWidth: 0 }}>
        <Bar data={barChartData} options={options} />
      </div>
    </Card>
  );
};
