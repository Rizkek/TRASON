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
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useChartTheme } from '@/hooks/useChartTheme';

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
  const { locale } = useUserPreferences();
  const { colors, chrome } = useChartTheme();

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
      
      const displayDate = date.toLocaleDateString(locale, { month: 'short', day: '2-digit' });

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
        backgroundColor: chartData.map(d => d.hasWorkout ? colors.primary : chrome.track),
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
        backgroundColor: chrome.tooltipBg,
        titleColor: colors.foreground,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyColor: colors.primary,
        bodyFont: { size: 14 },
        padding: 12,
        cornerRadius: 6,
        boxPadding: 4,
        displayColors: false,
        borderColor: chrome.tooltipBorder,
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
            if (!dataItem.hasWorkout) return colors.grayLight;
            return colors.primary;
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
          color: chrome.tick,
          font: { size: 12 },
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
      <Card className="p-8 bg-foreground/[0.02] border-foreground/[0.05]">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Activity history</h3>
          <p className="text-sm text-muted-foreground">Last {days} days of training</p>
        </div>
        <div className="h-[250px] w-full bg-foreground/[0.01] rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-foreground/[0.02] border-foreground/[0.05]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Activity history</h3>
        <p className="text-sm text-muted-foreground">Last {days} days of training</p>
      </div>
      <div className="h-[250px] w-full" style={{ minWidth: 0 }}>
        <Bar data={barChartData} options={options} />
      </div>
    </Card>
  );
};
