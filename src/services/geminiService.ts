// this code is ai generated

import { GoogleGenAI, Content } from "@google/genai";
import { aiPersona } from "@/config/personaConfig";

// --- API Key Handling ---
const apiKey = import.meta.env.CHATBOT_GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    "Gemini API key not found. Please set CHATBOT_GEMINI_API_KEY in your .env file."
  );
}

// --- SDK Initialization ---
let genAIInstance: GoogleGenAI | null = null;
const getGenAIInstance = () => {
  if (!genAIInstance && apiKey) {
    genAIInstance = new GoogleGenAI({ apiKey });
  }
  return genAIInstance;
};

// --- Type Definitions ---
export type GeminiMessage = Content; // Use the Content type directly { role: string, parts: Part[] }

type StreamChunk = {
  text: string;
};
type GeminiStream = AsyncGenerator<StreamChunk>;

/**
 * Fix missing spaces in text
 */
const fixMissingSpaces = (text: string): string => {
  // Remove prefixes
  let fixed = text.replace(/^(Zara:|AI:|Assistant:)\s*/i, "");
  fixed = fixed.replace(/\n(Zara:|AI:|Assistant:)\s*/gi, "\n");

  // Add spaces between lowercase and uppercase letters (camelCase pattern)
  fixed = fixed.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Add space after punctuation if followed by a letter
  fixed = fixed.replace(/([.!?,:;])([A-Za-z])/g, "$1 $2");

  // Fix "Anda" -> "And a" and other common issues
  fixed = fixed.replace(/\b(And|Or|But|So|For|Nor|Yet)a\b/g, "$1 a");
  fixed = fixed.replace(/\b(And|Or|But|So|For|Nor|Yet)the\b/g, "$1 the");

  return fixed;
};

// --- Service Function ---
export const generateContentStream = async (
  history: GeminiMessage[]
): Promise<GeminiStream | null> => {
  const genAI = getGenAIInstance();
  if (!genAI) {
    console.error(
      "Gemini AI client not initialized. API key missing or invalid?"
    );
    return null;
  }

  try {
    // Prepare history to work with Gemini API
    const validHistory = history.filter(
      (msg) => msg.role === "user" || msg.role === "model"
    );

    // Modify the persona instruction
    const personalityWithFormatting = `${aiPersona.personality}\n\nImportant: Do not prefix your responses with your name. Reply directly without adding "Zara:" or any other prefix before your answer.`;

    // Prepend persona instructions to first user message
    if (
      validHistory.length > 0 &&
      validHistory[0].role === "user" &&
      validHistory[0].parts
    ) {
      const firstUserMsg = validHistory[0];
      if (Array.isArray(firstUserMsg.parts) && firstUserMsg.parts.length > 0) {
        const originalText = firstUserMsg.parts[0].text || "";
        firstUserMsg.parts[0] = {
          text: `${personalityWithFormatting}\n\nUser: ${originalText}`,
        };
      }
    }

    console.log("Sending to Gemini:", JSON.stringify(validHistory, null, 2));

    // Generate content stream
    const responseStream = await genAI.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: validHistory,
    });

    // Process stream with batching approach for space fixing
    return (async function* () {
      const batchSize = 10; // Characters to batch before processing
      let buffer = "";
      let outputBuffer = "";
      let charCount = 0;

      for await (const chunk of responseStream) {
        const chunkText = chunk.text ?? "";
        buffer += chunkText;
        charCount += chunkText.length;

        // Process when we have enough characters or it's the final chunk
        if (charCount >= batchSize) {
          const fixedText = fixMissingSpaces(buffer);
          yield { text: fixedText.substring(outputBuffer.length) };
          outputBuffer = fixedText;
          charCount = 0;
        }
      }

      // Final processing if anything remains in buffer
      if (buffer.length > outputBuffer.length) {
        const fixedText = fixMissingSpaces(buffer);
        yield { text: fixedText.substring(outputBuffer.length) };
      }
    })();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

export default generateContentStream;
