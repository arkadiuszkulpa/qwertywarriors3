/**
 * Leaderboard API Service
 *
 * Handles communication with the AWS Amplify Gen 2 backend for score submission
 * and leaderboard retrieval.
 *
 * After running `npx ampx sandbox` or deploying, Amplify generates:
 * - amplify_outputs.json (configuration)
 * - A typed client via generateClient()
 */

import type {
  ScoreSubmission,
  LeaderboardResponse,
  SubmitScoreResponse,
  LeaderboardScore,
} from '../types';

// Amplify client - initialized lazily
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let amplifyClient: any = null;
let amplifyConfigured = false;

/**
 * Initialize Amplify configuration
 * Call this from main.ts after importing amplify_outputs.json
 */
export async function initializeAmplify(): Promise<boolean> {
  try {
    // Dynamically import Amplify modules
    const amplifyModule = await import('aws-amplify');
    const dataModule = await import('aws-amplify/data');

    // Try to fetch the outputs file
    const response = await fetch('/amplify_outputs.json');
    if (!response.ok) {
      console.warn('amplify_outputs.json not found. Run `npx ampx sandbox` first.');
      return false;
    }

    const outputs = await response.json();

    amplifyModule.Amplify.configure(outputs);
    amplifyClient = dataModule.generateClient();
    amplifyConfigured = true;
    console.log('Amplify configured successfully');
    return true;
  } catch (error) {
    console.warn('Amplify not configured:', error);
    return false;
  }
}

/**
 * Check if the Amplify API is configured and ready
 */
export function isApiConfigured(): boolean {
  return amplifyConfigured && amplifyClient !== null;
}

/**
 * Submit a score to the leaderboard
 */
export async function submitScore(data: ScoreSubmission): Promise<SubmitScoreResponse> {
  if (!amplifyClient) {
    throw new Error('Amplify not configured. Run `npx ampx sandbox` first.');
  }

  try {
    const result = await amplifyClient.models.Score.create({
      username: data.username,
      score: data.score,
      wordsCompleted: data.wordsCompleted,
      accuracy: data.accuracy,
      maxCombo: data.maxCombo,
      difficultyLevel: data.difficultyLevel,
    });

    if (result.errors) {
      throw new Error(result.errors.map((e: { message: string }) => e.message).join(', '));
    }

    return {
      success: true,
      score: {
        id: result.data.id,
        username: result.data.username,
        score: result.data.score,
        wordsCompleted: result.data.wordsCompleted,
        accuracy: result.data.accuracy,
        maxCombo: result.data.maxCombo,
        difficultyLevel: result.data.difficultyLevel,
        createdAt: result.data.createdAt,
        rank: 0, // Will be determined after fetching leaderboard
      },
    };
  } catch (error) {
    console.error('Failed to submit score:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to submit score');
  }
}

/**
 * Get the leaderboard scores
 * @param limit - Number of scores to retrieve (default 10, max 100)
 * @param difficulty - Optional filter by difficulty level
 */
export async function getLeaderboard(
  limit: number = 10,
  difficulty?: number
): Promise<LeaderboardResponse> {
  if (!amplifyClient) {
    throw new Error('Amplify not configured. Run `npx ampx sandbox` first.');
  }

  try {
    // Build filter if difficulty is specified
    const filter = difficulty && difficulty > 0 ? { difficultyLevel: { eq: difficulty } } : undefined;

    // Fetch scores - Amplify Gen 2 uses list() with sorting
    const result = await amplifyClient.models.Score.list({
      filter,
      limit: Math.min(limit, 100),
    });

    if (result.errors) {
      throw new Error(result.errors.map((e: { message: string }) => e.message).join(', '));
    }

    // Sort by score descending (client-side since DynamoDB doesn't have built-in sorting)
    const sortedScores = (result.data || [])
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, limit);

    // Add rank to each score
    const scores: LeaderboardScore[] = sortedScores.map(
      (
        item: {
          id: string;
          username: string;
          score: number;
          wordsCompleted: number;
          accuracy: number;
          maxCombo: number;
          difficultyLevel: number;
          createdAt: string;
        },
        index: number
      ) => ({
        rank: index + 1,
        id: item.id,
        username: item.username,
        score: item.score,
        wordsCompleted: item.wordsCompleted,
        accuracy: item.accuracy,
        maxCombo: item.maxCombo,
        difficultyLevel: item.difficultyLevel,
        createdAt: item.createdAt,
      })
    );

    return {
      scores,
      count: scores.length,
    };
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch leaderboard');
  }
}
