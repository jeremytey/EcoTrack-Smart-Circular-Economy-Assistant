const functions = require('firebase-functions');
const { analyzeImage, getMockResult } = require('./gemini');
const { enrichResponse } = require('./enrichment');
const config = require('./config');

// NEW: Import secrets
const { defineSecret } = require('firebase-functions/params');
const geminiApiKey = defineSecret('GEMINI_API_KEY');

exports.scan = functions
  .region(config.demo.region)
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB'
  })
  .https.onRequest(async (req, res) => {
    
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

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
  });

exports.health = functions
  .region(config.demo.region)
  .runWith({ memory: '128MB' })
  .https.onRequest((req, res) => {
    res.status(200).json({ 
      status: 'ok',
      region: config.demo.region,
      timestamp: new Date().toISOString() 
    });
  });

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