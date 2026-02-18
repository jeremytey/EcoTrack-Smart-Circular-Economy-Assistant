const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');

// Initialize at module load
let genAI = null;
let model = null;

if (config.gemini.apiKey) {
  genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  model = genAI.getGenerativeModel({ 
    model: config.gemini.model,
    generationConfig: {
      temperature: config.gemini.temperature,
      maxOutputTokens: config.gemini.maxTokens,
      responseMimeType: "application/json"
    }
  });
}

const PROMPT = `Return JSON only:
{
"item_name":"short name",
"material":"plastic|paper|metal|glass|e-waste|composite|organic",
"recyclable":true|false,
"confidence":"high|medium|low"
}
Identify recyclable item. No text outside JSON.`;

const VALID_MATERIALS = ['plastic', 'paper', 'metal', 'glass', 'e-waste', 'composite', 'organic'];
const VALID_CONFIDENCE = ['high', 'medium', 'low'];

async function analyzeImage(base64Image) {
  if (!model) {
    return createFallback('no_api_key');
  }

  try {
    const result = await model.generateContent([
      PROMPT,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    // Correct async handling
    const response = await result.response;
    const rawText = response.text();
    
    const cleaned = extractJSON(rawText);
    const parsed = JSON.parse(cleaned);

    return validateAndCorrect(parsed);

  } catch (error) {
    console.error('Gemini error:', error.message);
    return createFallback('ai_error');
  }
}

// Hardened JSON extraction with brace matching
function extractJSON(text) {
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  
  const start = cleaned.indexOf('{');
  if (start === -1) {
    throw new Error('No JSON object found');
  }
  
  let braceCount = 0;
  let end = -1;
  
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === '{') braceCount++;
    if (cleaned[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        end = i;
        break;
      }
    }
  }
  
  if (end === -1) {
    throw new Error('Unbalanced JSON braces');
  }
  
  return cleaned.substring(start, end + 1);
}

// Strict boolean type checking
function validateAndCorrect(data) {
  let recyclableBool;
  if (typeof data.recyclable === 'boolean') {
    recyclableBool = data.recyclable;
  } else if (typeof data.recyclable === 'string') {
    recyclableBool = data.recyclable.toLowerCase() === 'true';
  } else {
    recyclableBool = false;
  }

  const corrected = {
    item_name: String(data.item_name || 'Unknown Item').slice(0, 40),
    material: VALID_MATERIALS.includes(data.material) ? data.material : 'composite',
    recyclable: recyclableBool,
    confidence: VALID_CONFIDENCE.includes(data.confidence) ? data.confidence : 'low'
  };

  if (JSON.stringify(data) !== JSON.stringify(corrected)) {
    console.warn('Auto-corrected AI output:', { 
      original: data, 
      corrected,
      recyclable_type: typeof data.recyclable 
    });
  }

  return corrected;
}

function createFallback(reason) {
  console.error('Using fallback response:', reason);
  return {
    item_name: 'Unknown Item',
    material: 'composite',
    recyclable: false,
    confidence: 'low'
  };
}

function getMockResult() {
  return {
    item_name: 'Plastic Water Bottle',
    material: 'plastic',
    recyclable: true,
    confidence: 'high'
  };
}

module.exports = { analyzeImage, getMockResult };