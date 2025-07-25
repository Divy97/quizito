/**
 * Cleans a string to make it a valid JSON object.
 * It removes markdown code block fences, trailing commas, and other common issues.
 * @param text The raw string output from the LLM.
 * @returns A cleaned string that is more likely to be valid JSON.
 */
export const cleanJson = (text: string): string => {
  let cleaned = text;

  // 1. Remove markdown code block fences (e.g., ```json ... ```)
  cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');

  // 2. Remove trailing commas from objects and arrays
  // This regex finds commas that are followed by only whitespace and then a '}' or ']'
  cleaned = cleaned.replace(/,(?=\s*[}\]])/g, '');

  // 3. Attempt to fix unescaped quotes within string values (a common LLM error)
  // This is a bit risky and might not cover all cases, but can fix simple ones.
  // For example, converts "some "value" here" to "some \"value\" here"
  // This regex is complex and may need refinement.
  // A simpler approach is often better, so we will stick to cleaning and not fixing complex issues for now.

  // 4. Trim whitespace from the start and end
  cleaned = cleaned.trim();

  return cleaned;
};
