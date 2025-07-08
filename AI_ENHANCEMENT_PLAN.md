# Quizito AI Enhancement Plan: Building a Pedagogical AI Engine

## 1. Vision & Strategy: Forging a Defensible Moat

Our goal is to evolve Quizito from a simple "AI content generator" into an indispensable "Pedagogical AI Engine." This will create a significant competitive advantage (a "moat") by focusing on three core pillars of excellence in educational technology.

1.  **Pedagogical Depth (Bloom's Taxonomy)**: Go beyond simple recall to test higher-order thinking.
2.  **Intelligent Distractor Generation**: Create challenging and meaningful multiple-choice questions.
3.  **Verifiable, Source-Linked Questions**: Build trust and streamline the content creation process.

This document outlines a phased implementation plan to achieve this vision.

---

## 2. Phase 1: Bloom's Taxonomy Integration

This phase introduces educational science into our core, allowing creators to specify the cognitive level of the questions they want to generate.

### Objective
To empower creators to generate questions that target specific learning objectives, from basic recall to critical analysis.

### Key Features
- **Frontend**: A UI element (e.g., a Select dropdown) on the quiz creation page for choosing a Bloom's Taxonomy level.
- **Backend**: Enhanced AI prompting logic that generates questions corresponding to the selected cognitive level.

### Technical Implementation Plan

#### Frontend (`frontend/src/app/create/page.tsx`)
1.  **Add UI Component**: Introduce a `Select` or `RadioGroup` component to allow users to choose from the following levels:
    - **Remembering**: "What is the definition of X?" (Basic recall)
    - **Understanding**: "Explain Y in your own words." (Concept comprehension)
    - **Applying**: "Given this scenario, which principle would you use?" (Problem-solving)
    - **Analyzing**: "What are the key differences between A and B?" (Critical thinking)
2.  **State Management**: Use a state variable (e.g., `useState`) to manage the selected taxonomy level.
3.  **API Call Modification**: Pass the selected level as a parameter in the API request to the backend.

#### Backend (e.g., `backend/src/services/ai.service.ts`)
1.  **API Endpoint Update**: Modify the question generation endpoint (e.g., `POST /api/generate-questions`) to accept a new `taxonomyLevel` field in the request body.
2.  **Dynamic Prompt Engineering**: Create a mapping between the `taxonomyLevel` and specific instructions for the AI model.

    **Example Prompts:**
    - **Remembering**: `"Generate a question that requires recalling a specific fact, definition, or list from the text."`
    - **Understanding**: `"Generate a question that requires explaining a concept or summarizing a key idea from the text in one's own words."`
    - **Applying**: `"Generate a scenario-based question where the user must apply a concept or rule from the text to a new situation."`
    - **Analyzing**: `"Generate a question that requires breaking down information, comparing/contrasting two or more elements from the text, or identifying underlying assumptions."`

---

## 3. Phase 2: Master the Art of the "Distractor"

This phase focuses on dramatically increasing the quality of multiple-choice questions by generating plausible, intelligent, and challenging incorrect answers (distractors).

### Objective
To produce multiple-choice questions where the distractors are as thoughtfully crafted as the correct answer, making quizzes more effective evaluation tools.

### Technical Implementation Plan

#### Backend-Centric
This is almost purely a backend and prompt engineering challenge.

1.  **Advanced Prompt Engineering**: The core of this phase is crafting a sophisticated prompt that guides the AI to think like an educator. The prompt must explicitly request not just wrong answers, but *plausible* wrong answers.

    **Example Prompt Snippet:**
    ```
    For the provided text, generate a multiple-choice question. For this question, you must provide:
    1. The question text.
    2. The single correct answer.
    3. Three (3) plausible but incorrect "distractors". These distractors should be challenging. Good distractors often include:
        - Common misconceptions about the topic.
        - Concepts that are closely related but not the correct answer.
        - Options that are correct in a different context.
        - Logical fallacies.
    
    Return the output in a JSON format with keys: "question", "correctAnswer", and "distractors".
    ```
2.  **Response Parsing**: Update the backend logic to parse this new, richer JSON structure from the AI model and store the distractors alongside the question and correct answer.

---

## 4. Phase 3: Source-Linked Questions

This phase builds immense trust and utility by transparently linking every generated question back to the exact part of the source material it came from.

### Objective
To make the quiz creation process faster and more trustworthy by allowing creators to instantly verify the source of each question.

### Technical Implementation Plan

#### Backend
1.  **Content Pre-processing**: Before sending the source material to the AI, the backend must split it into uniquely identifiable chunks (e.g., paragraphs or groups of sentences).
    - Example Structure: `[{ "id": "p1", "text": "The first paragraph..." }, { "id": "p2", "text": "The second paragraph..." }]`
2.  **Prompt Modification**: The AI prompt must be updated to require the AI to cite the `id` of the source chunk for each question it generates.

    **Example Prompt Snippet:**
    ```
    ...For each generated question, you MUST include the "sourceId" corresponding to the paragraph ID from which the information was extracted.
    
    Return a JSON array where each object has keys: "question", "correctAnswer", "distractors", and "sourceId".
    ```
3.  **Data Association**: The backend will receive the `sourceId` and associate it with the generated question in the database.

#### Frontend
1.  **UI for Verification**: In the quiz editor where generated questions are displayed, add a UI element (e.g., a "Show Source" link, an info icon, or a footnote number).
2.  **Display Source Snippet**: On user interaction (click or hover), use the `sourceId` to retrieve the corresponding text chunk and display it in a tooltip, popover, or modal. This allows the creator to see the context instantly without hunting through the original document.

---

## 5. Roadmap & Success Metrics

### Suggested Rollout
We recommend implementing these phases sequentially, as they build upon each other:
1.  **Phase 1 (Bloom's Taxonomy)**: Establishes the foundational control over question *type*.
2.  **Phase 2 (Distractors)**: Improves the *quality* of the most common question format.
3.  **Phase 3 (Source-Linking)**: Adds a layer of *trust and usability* to the entire system.

### Measuring Success
- **User Engagement**: Track the adoption rate of the new Bloom's Taxonomy feature.
- **Qualitative Feedback**: Conduct user surveys and interviews focused on question quality and trustworthiness.
- **Behavioral Analytics**: Measure the reduction in time users spend editing or deleting AI-generated questions. A lower edit/delete rate signifies higher quality and trust.
- **User Reviews**: Monitor for positive mentions of "smart questions," "high-quality quizzes," and "reliable AI." 