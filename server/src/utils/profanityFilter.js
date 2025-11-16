/**
 * Profanity Filter Utility
 * Provides content moderation for community messages
 */

// Basic profanity word list (expandable)
// Note: This is a minimal list for demonstration. In production, use a comprehensive library
// like 'bad-words' npm package or a cloud-based moderation API
const profanityList = [
  // Common profanity (censored for code)
  'damn', 'hell', 'crap', 'shit', 'fuck', 'bitch', 'ass', 'bastard',
  'dick', 'cock', 'pussy', 'whore', 'slut', 'fag', 'nigger', 'retard',
  // Add more as needed
];

// Variations and leetspeak patterns
const variations = {
  'a': ['@', '4'],
  'e': ['3'],
  'i': ['1', '!'],
  'o': ['0'],
  's': ['$', '5'],
  't': ['7'],
  'l': ['1'],
};

/**
 * Generate regex pattern for a word including common variations
 */
function generatePattern(word) {
  let pattern = '';
  for (const char of word.toLowerCase()) {
    if (variations[char]) {
      pattern += `[${char}${variations[char].join('')}]`;
    } else {
      pattern += char;
    }
  }
  // Allow for spaces, dots, or asterisks between characters (obfuscation attempts)
  return pattern.split('').join('[\\s\\.\\*]*');
}

/**
 * Check if text contains profanity
 * @param {string} text - Text to check
 * @returns {boolean} - True if profanity detected
 */
export function containsProfanity(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const lowerText = text.toLowerCase();
  
  // Check each profanity word
  for (const word of profanityList) {
    const pattern = generatePattern(word);
    const regex = new RegExp(`\\b${pattern}\\b`, 'i');
    
    if (regex.test(lowerText)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Filter profanity from text by replacing with asterisks
 * @param {string} text - Text to filter
 * @returns {string} - Filtered text
 */
export function filterProfanity(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let filteredText = text;
  
  for (const word of profanityList) {
    const pattern = generatePattern(word);
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    filteredText = filteredText.replace(regex, (match) => '*'.repeat(match.length));
  }
  
  return filteredText;
}

/**
 * Get severity level of profanity in text
 * @param {string} text - Text to analyze
 * @returns {object} - { hasProfanity: boolean, count: number, severity: string }
 */
export function analyzeProfanity(text) {
  if (!text || typeof text !== 'string') {
    return { hasProfanity: false, count: 0, severity: 'none' };
  }

  const lowerText = text.toLowerCase();
  let count = 0;
  
  for (const word of profanityList) {
    const pattern = generatePattern(word);
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      count += matches.length;
    }
  }
  
  let severity = 'none';
  if (count > 0) {
    if (count === 1) severity = 'low';
    else if (count <= 3) severity = 'medium';
    else severity = 'high';
  }
  
  return {
    hasProfanity: count > 0,
    count,
    severity
  };
}

export default {
  containsProfanity,
  filterProfanity,
  analyzeProfanity
};
