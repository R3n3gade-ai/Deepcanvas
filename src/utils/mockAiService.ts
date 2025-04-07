import { ChatMessage } from './unifiedAiService';

// Mock AI responses for local development
export async function generateMockResponse(messages: ChatMessage[]): Promise<string> {
  // Get the last user message
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  
  if (!lastUserMessage) {
    return "I don't see a question. How can I help you?";
  }
  
  const userMessage = lastUserMessage.content.toLowerCase();
  
  // Simple pattern matching for demo purposes
  if (userMessage.includes('hello') || userMessage.includes('hi ')) {
    return "Hello! I'm your AI assistant. How can I help you today?";
  }
  
  if (userMessage.includes('help')) {
    return "I'm here to help! You can ask me questions, request information, or have me perform tasks using the tools I have access to.";
  }
  
  if (userMessage.includes('weather')) {
    return "I don't have real-time access to weather data, but I can help you find weather information if you connect a weather API to me.";
  }
  
  if (userMessage.includes('name')) {
    return "I'm your DeepCanvas AI assistant. I'm designed to help you with various tasks and answer your questions.";
  }
  
  if (userMessage.includes('thank')) {
    return "You're welcome! Is there anything else I can help you with?";
  }
  
  if (userMessage.includes('capabilities') || userMessage.includes('can you do')) {
    return "I can help with a variety of tasks depending on the tools you've given me access to. I can answer questions, generate content, analyze data, and more. What would you like help with?";
  }
  
  if (userMessage.includes('joke')) {
    return "Why don't scientists trust atoms? Because they make up everything!";
  }
  
  if (userMessage.includes('time') || userMessage.includes('date')) {
    return `I don't have access to the current time, but I can tell you that this is a simulated response for local development.`;
  }
  
  // Default response
  return "I'm a simulated AI response for local development. In production, this would connect to a real AI model like Vertex AI/Gemini. How can I help you today?";
}
