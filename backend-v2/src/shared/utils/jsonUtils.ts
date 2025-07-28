// Cleans a string to make it a valid JSON object.

export const cleanJson = (text: string): string => {
  let cleaned = text;

  // Remove markdown code block fences
  cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');

  // Remove trailing commas from objects and arrays
  cleaned = cleaned.replace(/,(?=\s*[}\]])/g, '');

  // Trim whitespace from the start and end
  cleaned = cleaned.trim();

  return cleaned;
};
