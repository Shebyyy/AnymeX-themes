/**
 * Get avatar URL for a user
 * Priority:
 * 1. GitHub avatar (if profileUrl is a GitHub URL)
 * 2. DiceBear avatar (fallback based on username)
 */

export function getAvatarUrl(username: string, profileUrl?: string | null): string {
  // Try to extract GitHub username from profile URL
  if (profileUrl && profileUrl.includes('github.com')) {
    const githubMatch = profileUrl.match(/github\.com\/([^\/]+)/);
    if (githubMatch && githubMatch[1]) {
      const githubUsername = githubMatch[1];
      // Use GitHub's avatar API
      return `https://github.com/${githubUsername}.png`;
    }
  }

  // Fallback to DiceBear avatar
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}
