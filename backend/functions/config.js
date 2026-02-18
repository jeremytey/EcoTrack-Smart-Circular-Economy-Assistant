const functions = require('firebase-functions');

// Load .env for local development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = {
  gemini: {
    // NEW: Prioritize environment variable, fallback to legacy config
    apiKey: process.env.GEMINI_API_KEY || functions.config().gemini?.api_key,
    model: 'gemini-1.5-flash',
    temperature: 0.05,
    maxTokens: 200
  },
  validation: {
    maxImageSizeMB: 4,
    minImageSizeBytes: 100
  },
  demo: {
    useMockData: false,  // Set to true for predictable demo recording
    region: 'asia-southeast1'
  }
};

module.exports = config;