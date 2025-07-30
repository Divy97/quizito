// Frontend Configuration
// Update these values to match your deployed backend

export const config = {
  // Backend API URL (from your deployed backend)
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://lle9jayhn6.execute-api.us-east-1.amazonaws.com',
  
  // Frontend URL for CORS (optional)
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  
  // App configuration
  APP_NAME: 'Quizito',
  APP_DESCRIPTION: 'AI-Powered Quiz Generator',
  
  // Feature flags
  FEATURES: {
    PDF_UPLOAD: true,
    YOUTUBE_QUIZ: true,
    ARTICLE_QUIZ: true,
    PUBLIC_QUIZZES: true,
    LEADERBOARDS: true,
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${config.API_URL}${endpoint}`;
}; 