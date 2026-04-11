import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(private readonly prisma: PrismaService) {}

  private truncateText(value: string | null | undefined, max = 80): string {
    if (!value) {
      return '';
    }
    return value.length > max ? `${value.slice(0, max)}...` : value;
  }

  async chat(
    userId: string,
    userMessage: string,
    history: ChatMessage[],
  ): Promise<string> {
    const safeHistory = Array.isArray(history) ? history : [];

    // === CONTEXT WINDOW TRIMMING ===
    const MAX_HISTORY = 20;
    const trimmedHistory = safeHistory
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-MAX_HISTORY);

    let systemPrompt =
      'You are a CRM assistant. The database is currently unavailable.\n' +
      'Answer only from conversation history. Tell the user data may be outdated.';

    try {
      // === LIVE DB FETCH ===
      const [user, clients, projects, proposals, invoices, achievements, badges] =
        await Promise.all([
          this.prisma.user.findUnique({
            where: { id: userId },
            select: {
              username: true,
              name: true,
              email: true,
              businessName: true,
              defaultCurrency: true,
              taxRate: true,
              xp: true,
              level: true,
            },
          }),
          this.prisma.client.findMany({
            where: { userId },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              company: true,
              notes: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.project.findMany({
            where: { userId },
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              budget: true,
              deadline: true,
              createdAt: true,
              client: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.proposal.findMany({
            where: { userId },
            select: {
              id: true,
              title: true,
              amount: true,
              status: true,
              notes: true,
              validUntil: true,
              createdAt: true,
              project: { select: { title: true } },
            },
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.invoice.findMany({
            where: { userId },
            select: {
              id: true,
              amount: true,
              status: true,
              dueDate: true,
              notes: true,
              createdAt: true,
              project: { select: { title: true } },
              payments: {
                select: {
                  amount: true,
                  method: true,
                  paidAt: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.userAchievement.findMany({
            where: { userId },
            select: {
              type: true,
              name: true,
              earnedAt: true,
            },
            orderBy: { earnedAt: 'desc' },
          }),
          this.prisma.userBadge.findMany({
            where: { userId },
            select: {
              type: true,
              name: true,
              earnedAt: true,
            },
            orderBy: { earnedAt: 'desc' },
          }),
        ]);

      const MAX_ITEMS = 30;
      const limitedClients = clients.slice(0, MAX_ITEMS);
      const limitedProjects = projects.slice(0, MAX_ITEMS);
      const limitedProposals = proposals.slice(0, MAX_ITEMS);
      const limitedInvoices = invoices.slice(0, MAX_ITEMS);
      const limitedAchievements = achievements.slice(0, MAX_ITEMS);
      const limitedBadges = badges.slice(0, MAX_ITEMS);

      // === STATS ===
      const totalRevenue = invoices
        .filter((i) => i.status === 'PAID')
        .reduce((sum, i) => sum + Number(i.amount), 0);

      const pendingRevenue = invoices
        .filter((i) => i.status === 'PENDING')
        .reduce((sum, i) => sum + Number(i.amount), 0);

      const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE');

      const activeProjects = projects.filter((p) => p.status === 'ACTIVE');
      const completedProjects = projects.filter((p) => p.status === 'COMPLETED');

      const acceptedProposals = proposals.filter((p) => p.status === 'ACCEPTED');
      const pendingProposals = proposals.filter((p) => p.status === 'SENT');

      const currency = user?.defaultCurrency ?? 'USD';
      const today = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const userDisplayName = user?.name ?? user?.username ?? 'Freelancer';
      const businessName = user?.businessName ?? 'N/A';
      const userLevel = user?.level ?? 1;
      const userXp = user?.xp ?? 0;
      const taxRate = user?.taxRate ? Number(user.taxRate).toFixed(2) : '0.00';

      const clientsText =
        limitedClients
          .map(
            (c) =>
              `- ${c.name}${c.company ? ` @ ${c.company}` : ''} | ${c.email ?? 'no email'} | ${c.phone ?? 'no phone'}${c.notes ? ` | note: ${this.truncateText(c.notes, 80)}` : ''}`,
          )
          .join('\n') || 'No clients yet.';

      const projectsText =
        limitedProjects
          .map(
            (p) =>
              `- [${p.status}] ${p.title} | client: ${p.client.name} | budget: ${currency} ${Number(p.budget).toFixed(2)}${p.deadline ? ` | deadline: ${new Date(p.deadline).toLocaleDateString()}` : ''}${p.description ? ` | desc: ${this.truncateText(p.description, 80)}` : ''}`,
          )
          .join('\n') || 'No projects yet.';

      const proposalsText =
        limitedProposals
          .map(
            (p) =>
              `- [${p.status}] ${p.title} | project: ${p.project.title} | ${currency} ${Number(p.amount).toFixed(2)}${p.validUntil ? ` | valid until: ${new Date(p.validUntil).toLocaleDateString()}` : ''}${p.notes ? ` | note: ${this.truncateText(p.notes, 80)}` : ''}`,
          )
          .join('\n') || 'No proposals yet.';

      const invoicesText =
        limitedInvoices
          .map(
            (i) =>
              `- [${i.status}] ${i.project.title} | ${currency} ${Number(i.amount).toFixed(2)}${i.dueDate ? ` | due: ${new Date(i.dueDate).toLocaleDateString()}` : ''}${i.payments.length ? ` | paid via: ${i.payments.map((p) => p.method).join(', ')}` : ''}${i.notes ? ` | note: ${this.truncateText(i.notes, 80)}` : ''}`,
          )
          .join('\n') || 'No invoices yet.';

      const achievementsText =
        limitedAchievements
          .map(
            (a) =>
              `- ${a.name} (${a.type}) | earned: ${new Date(a.earnedAt).toLocaleDateString()}`,
          )
          .join('\n') || 'No achievements yet.';

      const badgesText =
        limitedBadges
          .map(
            (b) =>
              `- ${b.name} (${b.type}) | earned: ${new Date(b.earnedAt).toLocaleDateString()}`,
          )
          .join('\n') || 'No badges yet.';

      // === SYSTEM PROMPT ===
      systemPrompt = `You are ARIA — an advanced, Claude-like AI business intelligence assistant for freelancer ${userDisplayName}.
You have LIVE access to their complete business data. Today is ${today}. Currency: ${currency}.

## YOUR PERSONALITY & TONE
- Highly analytical, deeply insightful, and exceptionally capable.
- Professional, empathetic, and conversational, providing solid and robust responses.
- Structure your responses beautifully using rich Markdown (headers, lists, bold text, blockquotes).
- Do not just output raw data; synthesize it, analyze it, and provide actionable insights.
- Provide comprehensive answers that feel powerful, well-architected, and easy to read.

## FORMATTING & DESIGN RULES (CRITICAL)
## DIAGRAM INSTRUCTIONS (CRITICAL)
- When asked for ANY diagram, flow, architecture, process, or visualization,
  ALWAYS produce a proper Mermaid code block using the correct diagram type:
\`\`\`mermaid
flowchart TD / sequenceDiagram / erDiagram / gantt / stateDiagram-v2 / pie / xychart-beta
\`\`\`
- NEVER use ASCII art for diagrams - always use Mermaid syntax.
- Mermaid diagrams render as interactive SVG in the UI.
- For simple inline comparisons only, use markdown tables instead.
- **Use Markdown extensively**: Bold key metrics, names, variables, and dates to make them stand out.
- **Strategic Sectioning**: Use clear headers (e.g., ### 📊 Financial Overview, ### ⚠️ Action Required, ### 💡 Strategic Insights) to break down information into digestible sections.
- **Data Tables**: Whenever comparing multiple items, listing invoices, or presenting financial summaries, use clean, well-aligned markdown tables.
- **Visual hierarchy**: Use bullet points and numbered lists for multiple items or step-by-step reasoning.
- **Alerts**: Flag overdue items or urgent deadlines with appropriate emojis (🚨, ⚠️) prominently.
- **Success Indicators**: Acknowledge positive milestones (✅, 🎉) like paid invoices or completed projects.

## YOUR CAPABILITIES
You can deeply analyze data, answer complex questions, and TRIGGER ACTIONS.

### TRIGGERING ACTIONS
When the user asks to add, create, edit, or delete anything, respond with a JSON action block:

\`\`\`action
{"action": "CREATE_CLIENT", "payload": {"name": "", "email": "", "phone": "", "company": "", "notes": ""}}
\`\`\`

Available actions:
- CREATE_CLIENT — fields: name*, email, phone, company, notes
- CREATE_PROJECT — fields: title*, clientId*, budget*, status, deadline, description
- CREATE_PROPOSAL — fields: title*, projectId*, amount*, validUntil, notes
- CREATE_INVOICE — fields: projectId*, amount*, dueDate, notes
- DELETE_CLIENT — fields: clientId*
- DELETE_PROJECT — fields: projectId*
- DELETE_INVOICE — fields: invoiceId*
- GENERATE_REPORT — fields: type* (revenue|pipeline|summary)
- GENERATE_CONTRACT — fields: projectId*, clientId*

For CREATE actions, if the user hasn't provided all required (*) fields, ask for them politely and conversationally one at a time. Once ALL required fields are collected, emit the action block.

## DATA RULES
1. Ground your answers 100% in the live snapshot data below. If you don't know, state clearly that it's not on record.
2. Never hallucinate names, amounts, or dates.
3. Proactively provide strategic recommendations based on their financial or project health.
4. Give a definitive, confident closing or next-step recommendation.

---
## LIVE SNAPSHOT

### PROFILE
${userDisplayName} | ${businessName} | Level ${userLevel} | ${userXp} XP | Tax: ${taxRate}%

### FINANCIAL SUMMARY
| Metric | Value |
|--------|-------|
| Total Earned | ${currency} ${totalRevenue.toFixed(2)} |
| Pending | ${currency} ${pendingRevenue.toFixed(2)} |
| Overdue Invoices | ${overdueInvoices.length} |
| Accepted Proposals | ${acceptedProposals.length} |
| Pending Proposals | ${pendingProposals.length} |

### CLIENTS (${limitedClients.length})
${clientsText}

### PROJECTS (${limitedProjects.length}) — Active: ${activeProjects.length} | Completed: ${completedProjects.length}
${projectsText}

### PROPOSALS (${limitedProposals.length})
${proposalsText}

### INVOICES (${limitedInvoices.length})
${invoicesText}

### ACHIEVEMENTS & BADGES
${achievementsText}
${badgesText}`;
    } catch (error) {
      this.logger.error('Failed to fetch live CRM snapshot', error);
      systemPrompt =
        'You are a CRM assistant. The database is currently unavailable.\n' +
        'Answer only from conversation history. Tell the user data may be outdated.';
    }

    try {
      // === DEEPSEEK CALL ===
      const apiKey = process.env.DEEPSEEK_API_KEY;
      const baseUrl = process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com';
      const model = process.env.DEEPSEEK_MODEL ?? 'deepseek-chat';

      if (!apiKey) {
        this.logger.error('DEEPSEEK_API_KEY is missing');
        return "I'm having trouble reaching the AI service. Please try again in a moment.";
      }

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          messages: [
            { role: 'system', content: systemPrompt },
            ...trimmedHistory,
            { role: 'user', content: userMessage },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `DeepSeek request failed: ${response.status} ${response.statusText} ${errorText}`,
        );
        return "I'm having trouble reaching the AI service. Please try again in a moment.";
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        this.logger.error('DeepSeek response missing assistant content');
        return "I'm having trouble reaching the AI service. Please try again in a moment.";
      }

      return content;
    } catch (error) {
      this.logger.error('DeepSeek API call failed', error);
      return "I'm having trouble reaching the AI service. Please try again in a moment.";
    }
  }
}
