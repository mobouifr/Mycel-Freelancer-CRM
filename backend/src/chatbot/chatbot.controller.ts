import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatbotService } from './chatbot.service';

interface ChatRequestBody {
  message: string;
}

interface ChatResponse {
  reply: string;
  action?: Record<string, unknown>;
}

@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  private extractAction(content: string): ChatResponse {
    const match = content.match(/```action\n([\s\S]*?)```/);
    if (!match) {
      return { reply: content };
    }

    const reply = content.replace(/```action[\s\S]*?```/, '').trim();

    try {
      const action = JSON.parse(match[1]) as Record<string, unknown>;
      return { reply, action };
    } catch {
      return { reply: content };
    }
  }

  @Post('chat')
  async chat(
    @Body() body: ChatRequestBody,
    @Request() req: { user: { id: string } },
  ): Promise<ChatResponse> {
    const message = (body?.message ?? '').trim();
    if (!message) {
      return { reply: 'Please provide a message.' };
    }

    const content = await this.chatbotService.chat(req.user.id, message, []);
    return this.extractAction(content);
  }
}