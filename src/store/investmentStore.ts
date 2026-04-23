import { create } from 'zustand';
import { InvestmentPosition } from '@/services/supabaseClient';
import {
  CalculatedInvestmentPosition,
  InvestmentInsightResponse,
  InvestmentPortfolioSummary,
} from '@/services/investmentService';

interface InvestmentState {
  positions: InvestmentPosition[];
  calculatedPositions: CalculatedInvestmentPosition[];
  summary: InvestmentPortfolioSummary | null;
  insights: InvestmentInsightResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  setPositions: (positions: InvestmentPosition[]) => void;
  setCalculatedPositions: (positions: CalculatedInvestmentPosition[]) => void;
  setSummary: (summary: InvestmentPortfolioSummary | null) => void;
  setInsights: (insights: InvestmentInsightResponse | null) => void;
  addPosition: (position: InvestmentPosition) => void;
  updatePosition: (id: string, updates: Partial<InvestmentPosition>) => void;
  deletePosition: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;
}

export const useInvestmentStore = create<InvestmentState>((set) => ({
  positions: [],
  calculatedPositions: [],
  summary: null,
  insights: null,
  isLoading: false,
  isRefreshing: false,
  error: null,

  setPositions: (positions) => set({ positions }),
  setCalculatedPositions: (calculatedPositions) => set({ calculatedPositions }),
  setSummary: (summary) => set({ summary }),
  setInsights: (insights) => set({ insights }),
  addPosition: (position) =>
    set((state) => ({
      positions: [position, ...state.positions],
    })),
  updatePosition: (id, updates) =>
    set((state) => ({
      positions: state.positions.map((position) =>
        position.id === id ? { ...position, ...updates } : position
      ),
    })),
  deletePosition: (id) =>
    set((state) => ({
      positions: state.positions.filter((position) => position.id !== id),
      calculatedPositions: state.calculatedPositions.filter((position) => position.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  setError: (error) => set({ error }),
}));
