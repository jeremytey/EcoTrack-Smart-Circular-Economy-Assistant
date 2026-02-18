// Pre-computed material database (loaded at module init)
const ENRICHMENT_MAP = {
  plastic: {
    material_code: 'PET 1',
    points_earned: 10,
    disposal_action: 'Rinse and place in blue recycling bin',
    nearest_center: {
      name: 'Sunway Pyramid Recycling Center',
      lat: 3.0738,
      lng: 101.6075
    }
  },
  paper: {
    material_code: 'PAP 20',
    points_earned: 5,
    disposal_action: 'Flatten and place in paper recycling bin',
    nearest_center: {
      name: 'MBPJ Green Center',
      lat: 3.1197,
      lng: 101.6428
    }
  },
  metal: {
    material_code: 'ALU 41',
    points_earned: 15,
    disposal_action: 'Rinse cans and place in metal recycling bin',
    nearest_center: {
      name: 'MBPJ Green Center',
      lat: 3.1197,
      lng: 101.6428
    }
  },
  glass: {
    material_code: 'GL 70',
    points_earned: 8,
    disposal_action: 'Rinse and place in glass recycling bin',
    nearest_center: {
      name: 'Sunway Pyramid Recycling Center',
      lat: 3.0738,
      lng: 101.6075
    }
  },
  'e-waste': {
    material_code: 'E-WASTE',
    points_earned: 20,
    disposal_action: 'Bring to e-waste collection center',
    nearest_center: {
      name: 'Alam Flora E-Waste Center',
      lat: 3.0588,
      lng: 101.5494
    }
  },
  composite: {
    material_code: 'C/PAP 84',
    points_earned: 5,
    disposal_action: 'Check local guidelines for composite materials',
    nearest_center: {
      name: 'One Utama Tetra Pak Drop-off',
      lat: 3.1480,
      lng: 101.6155
    }
  },
  organic: {
    material_code: 'ORG',
    points_earned: 0,
    disposal_action: 'Compost or dispose in organic waste bin',
    nearest_center: {
      name: 'MBPJ Composting Program',
      lat: 3.1197,
      lng: 101.6428
    }
  }
};

// Purely synchronous enrichment (no async, no I/O)
function enrichResponse(aiOutput) {
  const enrichment = ENRICHMENT_MAP[aiOutput.material] || ENRICHMENT_MAP.composite;
  
  return {
    item_name: aiOutput.item_name,
    material: aiOutput.material,
    recyclable: aiOutput.recyclable,
    confidence: aiOutput.confidence,
    material_code: enrichment.material_code,
    points_earned: enrichment.points_earned,
    disposal_action: enrichment.disposal_action,
    nearest_center: enrichment.nearest_center
  };
}

module.exports = { enrichResponse };