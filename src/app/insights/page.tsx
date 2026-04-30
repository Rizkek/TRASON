'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Layout, Card, Badge, Loading } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { insightQueries } from '@/services/queries';
import { useInvestment } from '@/hooks/useInvestment';
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  BarChart3,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatDate } from '@/libs/format';

export default function InsightsPage() {
  // Read auth state from store directly — no new Supabase subscription
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading: boolean = useAuthStore((s) => s.isLoading);
  const authLoading = isLoading;

  const [dbInsights, setDbInsights] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const { calculatedPositions, insights: investmentInsight } = useInvestment();

  const fetchStarted = useRef(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    // SWR automatically handles fetching
    fetchStarted.current = true;

    const fetchInsights = async () => {
      setIsFetching(true);
      try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const data = await insightQueries.getInsights(start, end);
        setDbInsights(data || []);
      } catch (err) {
        console.error('Failed to fetch insights:', err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchInsights();
  }, [authLoading, isAuthenticated]);

  const insights = [
    ...(investmentInsight && calculatedPositions.length > 0
      ? [
          {
            id: 'live-investment-insight',
            type: 'investment',
            title: 'Investment Analyst',
            description: investmentInsight.headline,
            content: investmentInsight.observations.join(' '),
            date: new Date().toISOString(),
          },
        ]
      : []),
    ...dbInsights,
  ];

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loading text="Checking your session..." />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="space-y-xl animate-fade-in">
        <div className="space-y-sm">
          <h1 className="text-display font-serif text-gradient">Strategic Insights</h1>
          <p className="text-subtext flex items-center gap-sm">
            <Sparkles size={14} className="text-primary" />
            Deciphering patterns from your operational history
          </p>
        </div>

        {isFetching ? (
          <div className="flex justify-center py-2xl"><Loading /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {insights.length > 0 ? (
              insights.map((insight) => (
                <Card 
                  key={insight.id} 
                  className="p-xl relative overflow-hidden group hover:scale-[1.01] transition-transform"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                  
                  <div className="flex items-start gap-xl relative z-10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      insight.type === 'finance' || insight.type === 'investment' ? 'bg-success/10 text-success' : 
                      insight.type === 'productivity' ? 'bg-secondary/10 text-secondary' : 
                      'bg-primary/10 text-primary'
                    }`}>
                      {insight.type === 'finance' || insight.type === 'investment' ? <BarChart3 size={24} /> : 
                       insight.type === 'productivity' ? <Zap size={24} /> : 
                       <Lightbulb size={24} />}
                    </div>
                    
                    <div className="space-y-md">
                      <div className="flex items-center gap-md">
                        <Badge variant={insight.type === 'finance' || insight.type === 'investment' ? 'success' : insight.type === 'productivity' ? 'insight' : 'activity'} size="sm">
                          {insight.type.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] font-bold text-gray-light uppercase tracking-widest flex items-center gap-sm">
                          <Calendar size={10} /> {formatDate(insight.date)}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-soft-cream leading-tight">
                        {insight.title}
                      </h3>
                      
                      <p className="text-sm text-gray-light leading-relaxed">
                        {insight.description}
                      </p>
                      
                      {insight.content && (
                         <div className="p-lg bg-white bg-opacity-[0.02] border border-white border-opacity-[0.05] rounded-md mt-md">
                            <p className="text-xs text-soft-cream opacity-90 group-hover:opacity-100 transition-opacity">
                               " {insight.content} "
                            </p>
                         </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              // Empty state with some placeholder premium cards
              <>
                <Card className="p-xl flex flex-col justify-center items-center text-center space-y-md opacity-60">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-light">
                    <Layers size={32} />
                  </div>
                  <h3 className="text-lg font-bold">Awaiting Data Synthesis</h3>
                  <p className="text-xs text-gray-light max-w-xs">
                    Our analysis engine requires at least 7 days of operational data to generate meaningful strategic insights.
                  </p>
                </Card>
                
                <Card className="p-xl border-dashed border-white/10 bg-transparent flex flex-col justify-center items-center text-center space-y-md opacity-40">
                  <div className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center">
                    <Target size={20} />
                  </div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase">SYSTEM IDLE</p>
                </Card>
              </>
            )}
          </div>
        )}

        <div className="pt-xl">
           <Card className="p-xl glass overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
              <div className="flex items-center gap-xl relative z-10">
                 <div className="p-md bg-primary/20 rounded-full animate-pulse">
                    <Lightbulb size={24} className="text-primary" />
                 </div>
                 <div>
                    <h4 className="text-md font-bold text-white uppercase tracking-wider mb-1">Architect's Perspective</h4>
                    <p className="text-sm text-gray-light">
                      The core philosophy of TRASON is to harmonize resource management with physical presence. 
                      Keep logging your daily flows to unlock deep architectural patterns.
                    </p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </Layout>
  );
}
