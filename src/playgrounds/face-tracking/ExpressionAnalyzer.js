// Expression analysis using MediaPipe BlendShapes
// More accurate than manual landmark calculations

/**
 * Analyze facial expressions using BlendShapes
 * @param {Array} blendShapes - MediaPipe BlendShapes array
 * @returns {Object} Expression analysis results
 */
export function analyzeBlendShapes(blendShapes) {
  if (!blendShapes || !blendShapes[0] || !blendShapes[0].categories) {
    return {
      expression: 'neutral',
      confidence: 0,
      allScores: {},
      rawBlendShapes: []
    };
  }

  const shapes = blendShapes[0].categories;
  
  // Helper function to get BlendShape score by name
  const getScore = (name) => {
    const shape = shapes.find(s => s.categoryName === name);
    return shape ? shape.score : 0;
  };

  // Calculate expression scores using key BlendShapes
  const expressions = {
    // Happy: Smile + cheek raise (Duchenne smile)
    happy: Math.max(
      getScore('mouthSmileLeft'),
      getScore('mouthSmileRight')
    ) + (Math.max(
      getScore('cheekSquintLeft'),
      getScore('cheekSquintRight')
    ) * 0.5),

    // Sad: Frown + mouth down
    sad: Math.max(
      getScore('mouthFrownLeft'),
      getScore('mouthFrownRight')
    ) + Math.max(
      getScore('mouthLowerDownLeft'),
      getScore('mouthLowerDownRight')
    ),

    // Surprised: Wide eyes + raised brows + open mouth
    surprised: (
      Math.max(getScore('eyeWideLeft'), getScore('eyeWideRight')) +
      Math.max(getScore('browOuterUpLeft'), getScore('browOuterUpRight')) +
      (getScore('jawOpen') * 0.7)
    ) / 2,

    // Angry: Furrowed brows + squinting + pressed lips
    angry: (
      Math.max(getScore('browDownLeft'), getScore('browDownRight')) +
      Math.max(getScore('eyeSquintLeft'), getScore('eyeSquintRight')) +
      Math.max(getScore('mouthPressLeft'), getScore('mouthPressRight'))
    ) / 2,

    // Focused/Concentrated: Slight squint + inner brow up
    focused: (
      Math.max(getScore('eyeSquintLeft'), getScore('eyeSquintRight')) * 0.7 +
      getScore('browInnerUp') * 0.5
    ) - Math.max(getScore('mouthSmileLeft'), getScore('mouthSmileRight')) * 0.3,

    // Disgusted: Nose wrinkle + upper lip raise
    disgusted: (
      getScore('noseSneerLeft') + getScore('noseSneerRight') +
      getScore('mouthUpperUpLeft') + getScore('mouthUpperUpRight')
    ) / 2,

    // Fearful: Wide eyes + raised brows + mouth stretch
    fearful: (
      Math.max(getScore('eyeWideLeft'), getScore('eyeWideRight')) +
      Math.max(getScore('browOuterUpLeft'), getScore('browOuterUpRight')) +
      Math.max(getScore('mouthStretchLeft'), getScore('mouthStretchRight'))
    ) / 2
  };

  // Find dominant expression
  const sortedExpressions = Object.entries(expressions)
    .sort(([,a], [,b]) => b - a);
  
  const [dominantExpression, dominantScore] = sortedExpressions[0];
  
  // Only consider it a valid expression if confidence is above threshold
  const minConfidence = 0.15;
  const finalExpression = dominantScore > minConfidence ? dominantExpression : 'neutral';
  const finalConfidence = dominantScore > minConfidence ? dominantScore : 0;

  return {
    expression: finalExpression,
    confidence: Math.min(1, finalConfidence),
    allScores: expressions,
    rawBlendShapes: shapes,
    topShapes: shapes
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(shape => ({
        name: shape.displayName || shape.categoryName,
        score: shape.score
      }))
  };
}

/**
 * Get emoji representation of expression
 */
export function getExpressionEmoji(expression) {
  const emojiMap = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprised: '😲',
    focused: '🤔',
    disgusted: '🤢',
    fearful: '😨',
    neutral: '😐'
  };
  
  return emojiMap[expression] || '😐';
}

/**
 * Get color for expression visualization
 */
export function getExpressionColor(expression) {
  const colorMap = {
    happy: '#10B981',      // Green
    sad: '#3B82F6',        // Blue
    angry: '#EF4444',      // Red
    surprised: '#F59E0B',  // Orange
    focused: '#8B5CF6',    // Purple
    disgusted: '#84CC16',  // Lime
    fearful: '#F97316',    // Orange-red
    neutral: '#6B7280'     // Gray
  };
  
  return colorMap[expression] || '#6B7280';
}

/**
 * Get detailed expression description
 */
export function getExpressionDescription(expression, confidence) {
  const descriptions = {
    happy: `Smiling with ${(confidence * 100).toFixed(0)}% confidence`,
    sad: `Showing sadness with ${(confidence * 100).toFixed(0)}% confidence`,
    angry: `Displaying anger with ${(confidence * 100).toFixed(0)}% confidence`,
    surprised: `Looking surprised with ${(confidence * 100).toFixed(0)}% confidence`,
    focused: `Appearing focused with ${(confidence * 100).toFixed(0)}% confidence`,
    disgusted: `Showing disgust with ${(confidence * 100).toFixed(0)}% confidence`,
    fearful: `Displaying fear with ${(confidence * 100).toFixed(0)}% confidence`,
    neutral: 'Neutral expression'
  };
  
  return descriptions[expression] || 'Unknown expression';
}

/**
 * Analyze specific facial features from BlendShapes
 */
export function analyzeFacialFeatures(blendShapes) {
  if (!blendShapes || !blendShapes[0] || !blendShapes[0].categories) {
    return {};
  }

  const shapes = blendShapes[0].categories;
  const getScore = (name) => {
    const shape = shapes.find(s => s.categoryName === name);
    return shape ? shape.score : 0;
  };

  return {
    // Eye analysis
    eyes: {
      leftOpen: 1 - getScore('eyeBlinkLeft'),
      rightOpen: 1 - getScore('eyeBlinkRight'),
      leftWide: getScore('eyeWideLeft'),
      rightWide: getScore('eyeWideRight'),
      leftSquint: getScore('eyeSquintLeft'),
      rightSquint: getScore('eyeSquintRight')
    },
    
    // Eyebrow analysis
    eyebrows: {
      leftInnerUp: getScore('browInnerUp'),
      leftOuterUp: getScore('browOuterUpLeft'),
      rightOuterUp: getScore('browOuterUpRight'),
      leftDown: getScore('browDownLeft'),
      rightDown: getScore('browDownRight')
    },
    
    // Mouth analysis
    mouth: {
      smileLeft: getScore('mouthSmileLeft'),
      smileRight: getScore('mouthSmileRight'),
      frownLeft: getScore('mouthFrownLeft'),
      frownRight: getScore('mouthFrownRight'),
      jawOpen: getScore('jawOpen'),
      mouthOpen: getScore('mouthOpen'),
      kissing: getScore('mouthPucker')
    },
    
    // Cheek analysis
    cheeks: {
      leftPuff: getScore('cheekPuff'),
      leftSquint: getScore('cheekSquintLeft'),
      rightSquint: getScore('cheekSquintRight')
    }
  };
}
