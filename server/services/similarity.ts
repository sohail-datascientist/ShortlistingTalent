// Basic similarity scoring implementation
// In production, you would integrate with actual BERT embeddings
export function calculateCosineSimilarity(text1: string, text2: string): number {
  // Normalize texts
  const normalize = (text: string) => 
    text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);

  const words1 = normalize(text1);
  const words2 = normalize(text2);

  // Create vocabulary
  const vocab = new Set([...words1, ...words2]);
  const vocabArray = Array.from(vocab);

  // Create frequency vectors
  const getVector = (words: string[]) => {
    const vector = new Array(vocabArray.length).fill(0);
    words.forEach(word => {
      const index = vocabArray.indexOf(word);
      if (index !== -1) vector[index]++;
    });
    return vector;
  };

  const vector1 = getVector(words1);
  const vector2 = getVector(words2);

  // Calculate cosine similarity
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  const similarity = dotProduct / (magnitude1 * magnitude2);
  return Math.round(similarity * 100) / 100; // Round to 2 decimal places
}

// Enhanced similarity that considers technical skills matching
export function calculateEnhancedSimilarity(
  resumeText: string, 
  jdText: string, 
  technicalSkills: string[]
): number {
  const baseSimilarity = calculateCosineSimilarity(resumeText, jdText);
  
  // Boost score based on technical skills match
  const jdLower = jdText.toLowerCase();
  const matchingSkills = technicalSkills.filter(skill => 
    jdLower.includes(skill.toLowerCase())
  );
  
  const skillBoost = matchingSkills.length * 0.05; // 5% boost per matching skill
  const finalScore = Math.min(baseSimilarity + skillBoost, 1.0);
  
  return Math.round(finalScore * 100) / 100;
}
