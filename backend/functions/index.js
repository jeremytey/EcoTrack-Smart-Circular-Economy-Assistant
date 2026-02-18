// index.js
const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const { analyzeImage, getMockResult } = require('./gemini');
const { enrichResponse } = require('./enrichment');
const config = require('./config');

// Set global options for all functions
setGlobalOptions({
  region: config.demo.region,
  maxInstances: 10
});

exports.scan = onRequest(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
    cors: true
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      return sendError(res, 'Method not allowed', 405);
    }

    const startTime = Date.now();

    try {
      const { imageBase64 } = req.body;

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return sendError(res, 'Missing or invalid imageBase64');
      }

      const sizeBytes = imageBase64.length * 0.75;
      const sizeMB = sizeBytes / 1048576;

      if (sizeBytes < config.validation.minImageSizeBytes) {
        return sendError(res, 'Image too small or corrupted');
      }

      if (sizeMB > config.validation.maxImageSizeMB) {
        return sendError(res, `Image too large (${sizeMB.toFixed(1)}MB max)`);
      }

      let aiOutput;
      if (config.demo.useMockData) {
        aiOutput = getMockResult();
        await sleep(1500);
      } else {
        aiOutput = await analyzeImage(imageBase64);
      }

      let response;
      try {
        response = enrichResponse(aiOutput);
      } catch (enrichError) {
        console.error('❌ Enrichment error:', enrichError.message);
        response = {
          item_name: aiOutput.item_name,
          material: aiOutput.material,
          recyclable: aiOutput.recyclable,
          confidence: aiOutput.confidence,
          material_code: 'UNKNOWN',
          points_earned: 0,
          disposal_action: 'Please consult local recycling guidelines',
          nearest_center: {
            name: 'MBPJ Green Center',
            lat: 3.1197,
            lng: 101.6428
          }
        };
      }

      logSuccess(startTime);
      return res.status(200).json(response);

    } catch (error) {
      console.error('❌ Unexpected error:', error.message);
      return sendError(res, 'Processing failed', 500);
    }
  }
);

exports.health = onRequest(
  { 
    memory: '128MiB',
    cors: true
  },
  (req, res) => {
    res.status(200).json({ 
      status: 'ok',
      region: config.demo.region,
      timestamp: new Date().toISOString() 
    });
  }
);

function sendError(res, message, status = 400) {
  return res.status(status).json({
    error: message,
    fallback_result: {
      item_name: 'Unknown Item',
      material: 'composite',
      recyclable: false,
      confidence: 'low',
      material_code: 'UNKNOWN',
      points_earned: 0,
      disposal_action: 'Please consult local recycling guidelines',
      nearest_center: {
        name: 'MBPJ Green Center',
        lat: 3.1197,
        lng: 101.6428
      }
    }
  });
}

function logSuccess(startTime) {
  const duration = Date.now() - startTime;
  console.log(`✅ Completed in ${duration}ms`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}