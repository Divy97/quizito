import { z } from 'zod';
import { questionSchema } from '../types/quizSchemas';

// Re-exporting the inferred type for use in other services
export type Question = z.infer<typeof questionSchema>;

const SIMILARITY_THRESHOLD = 0.95;

/**
 * Calculates the cosine similarity between two vectors.
 * @param vecA - The first vector.
 * @param vecB - The second vector.
 * @returns The cosine similarity score.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }
    return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Filters a list of questions to ensure semantic uniqueness based on their embeddings.
 * @param questions - The array of question objects.
 * @param embeddings - The array of corresponding vector embeddings.
 * @returns A new array of question objects that are semantically unique.
 */
export function filterSemanticallyUnique(
    questions: Question[],
    embeddings: number[][]
): Question[] {
    const uniqueQuestions: Question[] = [];
    const uniqueEmbeddings: number[][] = [];

    if (questions.length === 0) {
        return [];
    }
    
    // Always add the first question to the unique list
    uniqueQuestions.push(questions[0]);
    uniqueEmbeddings.push(embeddings[0]);

    for (let i = 1; i < questions.length; i++) {
        let isUnique = true;
        const currentEmbedding = embeddings[i];
        
        for (const uniqueEmbedding of uniqueEmbeddings) {
            const similarity = cosineSimilarity(currentEmbedding, uniqueEmbedding);
            if (similarity > SIMILARITY_THRESHOLD) {
                isUnique = false;
                break;
            }
        }
        
        if (isUnique) {
            uniqueQuestions.push(questions[i]);
            uniqueEmbeddings.push(currentEmbedding);
        }
    }

    return uniqueQuestions;
} 