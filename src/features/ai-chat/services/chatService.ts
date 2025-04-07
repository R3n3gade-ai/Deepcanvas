import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatSession, ChatSettings } from '../types';
import { UserActivityContext } from '../../activity-tracking';

export class AIChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string, modelName: string = 'gemini-pro') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async streamChat(
    prompt: string,
    session: ChatSession,
    userContext: UserActivityContext,
    onTokenReceived: (token: string) => void
  ) {
    const chat = this.model.startChat({
      history: session.history,
      generationConfig: {
        temperature: session.settings.temperature,
        maxTokens: session.settings.maxTokens,
      }
    });

    const enrichedPrompt = await this.enrichPromptWithContext(prompt, userContext);
    const result = await chat.sendMessageStream(enrichedPrompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      onTokenReceived(text);
    }
  }

  private async enrichPromptWithContext(
    prompt: string, 
    context: UserActivityContext
  ): Promise<string> {
    // Enrich the prompt with user context, recent activities, etc.
    return `
      Context: ${JSON.stringify(context)}
      User Query: ${prompt}
    `;
  }
}