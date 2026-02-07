import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getLeaderboard,
  submitScore,
  isApiConfigured,
} from '../services/leaderboardApi';
import type { ScoreSubmission, LeaderboardState } from '../types';

interface LeaderboardActions {
  fetchLeaderboard: (limit?: number, difficulty?: number) => Promise<void>;
  submitPlayerScore: (data: Omit<ScoreSubmission, 'username'>) => Promise<boolean>;
  setUsername: (username: string) => void;
  clearError: () => void;
  clearLastRank: () => void;
}

export const useLeaderboardStore = create<LeaderboardState & LeaderboardActions>()(
  persist(
    (set, get) => ({
      scores: [],
      isLoading: false,
      error: null,
      lastSubmittedRank: null,
      username: '',

      fetchLeaderboard: async (limit = 10, difficulty?: number) => {
        if (!isApiConfigured()) {
          set({ error: 'Leaderboard API not configured', isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await getLeaderboard(limit, difficulty);
          set({ scores: response.scores, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch leaderboard',
            isLoading: false,
          });
        }
      },

      submitPlayerScore: async (data) => {
        const { username } = get();

        if (!username.trim()) {
          set({ error: 'Please enter a username' });
          return false;
        }

        if (!isApiConfigured()) {
          set({ error: 'Leaderboard API not configured' });
          return false;
        }

        set({ isLoading: true, error: null });
        try {
          const submission: ScoreSubmission = {
            ...data,
            username: username.trim(),
          };

          await submitScore(submission);

          // Fetch updated leaderboard to determine rank
          const response = await getLeaderboard(50);
          const rank =
            response.scores.findIndex(
              (s) => s.username === submission.username && s.score === submission.score
            ) + 1;

          set({
            scores: response.scores,
            lastSubmittedRank: rank > 0 ? rank : null,
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to submit score',
            isLoading: false,
          });
          return false;
        }
      },

      setUsername: (username: string) => {
        // Sanitize: only allow alphanumeric, underscore, hyphen
        const sanitized = username.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 20);
        set({ username: sanitized });
      },

      clearError: () => set({ error: null }),

      clearLastRank: () => set({ lastSubmittedRank: null }),
    }),
    {
      name: 'qw3-leaderboard',
      partialize: (state) => ({ username: state.username }), // Only persist username
    }
  )
);
