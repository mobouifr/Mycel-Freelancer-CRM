import api from './api';

/* ─────────────────────────────────────────────
   GAMIFICATION SERVICE — Fetch XP, level,
   achievements & badges from the backend.
   Single endpoint: GET /gamification/stats
───────────────────────────────────────────── */

export interface Achievement {
  id: string;
  type: string;
  name: string;
  earnedAt: string;
}

export interface Badge {
  id: string;
  type: string;
  name: string;
  earnedAt: string;
}

export interface GamificationStats {
  xp: number;
  level: number;
  xpToNextLevel: number;
  achievements: Achievement[];
  badges: Badge[];
}

export const gamificationService = {
  async fetchStats(): Promise<GamificationStats> {
    const { data } = await api.get<GamificationStats>('/gamification/stats');
    return data;
  },
};
