import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useAuth } from '../../hooks/useAuth';

type MessageRole = 'user' | 'assistant';
type PendingFormType = 'CLIENT' | 'PROJECT' | 'DELETE_CLIENT' | 'DELETE_PROJECT';

interface ParsedActionResult {
  text: string;
  action?: Record<string, unknown>;
}

interface ChatMessage {
  role: MessageRole;
  content: string;
}

export default function ChatbotAI() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const username = user?.name || user?.username || user?.email || 'User';
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [crmContext, setCrmContext] = useState<string>('');
  const [pendingForm, setPendingForm] = useState<PendingFormType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fullscreenActive = isOpen && (isMobile || isFullscreen);

  const getAuthHeaders = (json = false): Record<string, string> => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (json) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  };

  const parseActionBlock = (response: string): ParsedActionResult => {
    const match = response.match(/```action\n([\s\S]*?)```/);
    if (!match) {
      return { text: response };
    }

    try {
      const action = JSON.parse(match[1]) as Record<string, unknown>;
      const text = response.replace(/```action[\s\S]*?```/, '').trim();
      return { text, action };
    } catch {
      return { text: response };
    }
  };

  const normalizeActionPayload = (payload: unknown): Record<string, string> => {
    if (!payload || typeof payload !== 'object') {
      return {};
    }

    return Object.entries(payload as Record<string, unknown>).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = value == null ? '' : String(value);
      return acc;
    }, {});
  };

  const postWithFallback = async (paths: string[], payload: unknown) => {
    let lastError: string | null = null;

    for (const path of paths) {
      try {
        const response = await fetch(path, {
          method: 'POST',
          headers: getAuthHeaders(true),
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          return;
        }

        const message = await response.text();
        lastError = message || `Request failed with status ${response.status}`;
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Network error';
      }
    }

    throw new Error(lastError || 'Request failed');
  };

  const deleteWithFallback = async (paths: string[]) => {
    let lastError: string | null = null;

    for (const path of paths) {
      try {
        const response = await fetch(path, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          return;
        }

        const message = await response.text();
        lastError = message || `Request failed with status ${response.status}`;
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Network error';
      }
    }

    throw new Error(lastError || 'Request failed');
  };

  const openActionModal = (actionObj: Record<string, unknown>): boolean => {
    const actionType = String(actionObj.action ?? '').toUpperCase();
    const rawPayload = actionObj.payload ?? actionObj.data;
    const payload = normalizeActionPayload(rawPayload);

    if (actionType === 'CREATE_CLIENT') {
      setPendingForm('CLIENT');
      setFormData(payload);
      return true;
    }

    if (actionType === 'CREATE_PROJECT') {
      setPendingForm('PROJECT');
      setFormData(payload);
      return true;
    }

    if (actionType === 'DELETE_CLIENT') {
      setPendingForm('DELETE_CLIENT');
      setFormData(payload);
      return true;
    }

    if (actionType === 'DELETE_PROJECT') {
      setPendingForm('DELETE_PROJECT');
      setFormData(payload);
      return true;
    }

    return false;
  };

  const findClientByName = async (clientName: string): Promise<{ id: string; name?: string } | null> => {
    const headers = getAuthHeaders();
    const paths = ['/api/clients', '/api/customers'];

    for (const path of paths) {
      try {
        const response = await fetch(path, { headers });
        if (!response.ok) continue;
        const payload = await response.json();
        const clients = Array.isArray(payload) ? payload : (payload.data ?? []);
        const normalized = clientName.trim().toLowerCase();

        const exact = clients.find((item: any) => (item?.name ?? '').toLowerCase() === normalized);
        if (exact?.id) return { id: exact.id, name: exact.name };

        const contains = clients.find((item: any) => (item?.name ?? '').toLowerCase().includes(normalized));
        if (contains?.id) return { id: contains.id, name: contains.name };
      } catch {
        continue;
      }
    }

    return null;
  };

  const fetchEntityList = async (path: string): Promise<any[]> => {
    try {
      const response = await fetch(path, { headers: getAuthHeaders() });
      if (!response.ok) return [];
      const payload = await response.json();
      return Array.isArray(payload) ? payload : (payload.data ?? []);
    } catch {
      return [];
    }
  };

  const refreshCrmContext = async (): Promise<string> => {
    const [clients, projects] = await Promise.all([
      fetchEntityList('/api/clients'),
      fetchEntityList('/api/projects'),
    ]);

    const clientLines = clients.length
      ? clients.map((c: any) =>
          `- ${c.name} | email: ${c.email ?? 'N/A'} | phone: ${c.phone ?? 'N/A'} | company: ${c.company ?? 'N/A'} | notes: ${c.notes ?? 'none'} | id: ${c.id}`
        ).join('\n')
      : '  (no clients yet)';

    const projectLines = projects.length
      ? projects.map((p: any) =>
          `- ${p.title} | client: ${p.client?.name ?? p.clientId ?? 'N/A'} | status: ${p.status} | priority: ${p.priority ?? 'N/A'} | budget: $${p.budget ?? 0} | deadline: ${p.deadline ?? 'N/A'} | description: ${p.description ?? 'none'} | id: ${p.id}`
        ).join('\n')
      : '  (no projects yet)';

    const summary = [
      `Clients (${clients.length}):`,
      clientLines,
      '',
      `Projects (${projects.length}):`,
      projectLines,
    ].join('\n');

    setCrmContext(summary);
    return summary;
  };

  const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValidDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (pendingForm === 'CLIENT') {
      const name = (formData.name ?? '').trim();
      if (!name) errors.name = t('chatbot.validation_name_required');
      else if (name.length > 200) errors.name = t('validation.name_max');

      const email = (formData.email ?? '').trim();
      if (email && !isValidEmail(email)) errors.email = t('chatbot.validation_email_invalid');
    }

    if (pendingForm === 'PROJECT') {
      const title = (formData.title ?? '').trim();
      if (!title) errors.title = t('chatbot.validation_title_required');
      else if (title.length > 255) errors.title = t('validation.title_max');

      const clientId = (formData.clientId ?? '').trim();
      const clientName = (formData.clientName ?? '').trim();
      if (!clientId && !clientName) errors.clientName = t('chatbot.validation_client_required');

      const budgetValue = Number(formData.budget ?? '0');
      if (formData.budget && (!Number.isFinite(budgetValue) || budgetValue < 0)) {
        errors.budget = t('chatbot.validation_budget_invalid');
      }

      const deadline = (formData.deadline ?? '').trim();
      if (deadline && !isValidDate(deadline)) errors.deadline = t('chatbot.validation_deadline_invalid');
    }

    if (pendingForm === 'DELETE_CLIENT') {
      if (!(formData.clientId ?? '').trim()) errors.clientId = t('chatbot.validation_id_required');
    }

    if (pendingForm === 'DELETE_PROJECT') {
      if (!(formData.projectId ?? '').trim()) errors.projectId = t('chatbot.validation_id_required');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitForm = async () => {
    if (!pendingForm || formSubmitting) return;
    if (!validateForm()) return;

    setFormSubmitting(true);

    try {
      if (pendingForm === 'CLIENT') {
        const name = (formData.name ?? '').trim();

        const payload = {
          name,
          email: (formData.email ?? '').trim(),
          phone: (formData.phone ?? '').trim(),
          company: (formData.company ?? '').trim(),
          notes: (formData.notes ?? '').trim(),
        };

        await postWithFallback(['/api/clients', '/api/customers'], payload);
        setMessages((prev: ChatMessage[]) => [
          ...prev,
          { role: 'assistant', content: `Great news, ${username}! I've added "${name}" to your clients. 🎉 Would you like me to set up a project for them?` },
        ]);
      }

      if (pendingForm === 'PROJECT') {
        const title = (formData.title ?? '').trim();
        const clientName = (formData.clientName ?? '').trim();
        const clientId = (formData.clientId ?? '').trim();

        const budgetValue = Number(formData.budget ?? '0');
        const payload: Record<string, unknown> = {
          title,
          status: (formData.status ?? 'ACTIVE').toUpperCase(),
          budget: Number.isFinite(budgetValue) ? budgetValue : 0,
          description: (formData.description ?? '').trim() || undefined,
          deadline: (formData.deadline ?? '').trim() || undefined,
        };

        if (clientId) {
          payload.clientId = clientId;
        } else if (clientName) {
          const matchedClient = await findClientByName(clientName);
          if (matchedClient?.id) {
            payload.clientId = matchedClient.id;
          }
        }

        await postWithFallback(['/api/projects'], payload);
        setMessages((prev: ChatMessage[]) => [
          ...prev,
          { role: 'assistant', content: `All set, ${username}! "${title}" is now live and ready to go. 🚀 Want me to draft an invoice for it?` },
        ]);
      }

      if (pendingForm === 'DELETE_CLIENT') {
        const clientId = (formData.clientId ?? '').trim();

        await deleteWithFallback([`/api/clients/${clientId}`]);
        setMessages((prev: ChatMessage[]) => [
          ...prev,
          { role: 'assistant', content: `Done, ${username} — that client has been removed. Let me know if you need anything else! 👍` },
        ]);
      }

      if (pendingForm === 'DELETE_PROJECT') {
        const projectId = (formData.projectId ?? '').trim();

        await deleteWithFallback([`/api/projects/${projectId}`]);
        setMessages((prev: ChatMessage[]) => [
          ...prev,
          { role: 'assistant', content: `Done, ${username} — project removed. Want me to summarize your remaining active projects?` },
        ]);
      }

      setPendingForm(null);
      setFormData({});
      setFormErrors({});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit the form right now.';
      setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant', content: `Oops, something went wrong: ${message}. Want me to try again, ${username}?` }]);
    } finally {
      setFormSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (fullscreenActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previousOverflow;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreenActive]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isOpen, pendingForm]);

  useEffect(() => {
    const loadContext = async () => {
      try {
        await refreshCrmContext();
      } catch {
        setCrmContext('CRM data could not be loaded.');
      }
    };

    void loadContext();
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    let latestCrmContext = crmContext;
    try {
      latestCrmContext = await refreshCrmContext();
    } catch {
      latestCrmContext = crmContext || 'CRM data could not be loaded.';
    }

    const prompt = {
      role: 'system' as const,
      content: `You are a friendly, warm CRM assistant helping ${username} manage their freelance business. Think of yourself as a helpful colleague who genuinely cares about ${username}'s success.

Personality guidelines:
- Always address the user as "${username}" naturally in your responses
- Be conversational, supportive, and encouraging — like a kind human colleague
- Use light emoji where it feels natural (✅ 📋 💡 🎉) but don't overdo it
- Celebrate small wins ("Nice, your client list is growing!")
- Offer helpful follow-ups ("Want me to dig deeper?" or "I can help with that next!")
- Keep answers concise but warm — no robotic or overly formal language

When answering questions about projects, clients, or plans:
- Use markdown tables for comparisons and data summaries
- Use numbered steps for action plans
- Use plain text for short factual answers
- Always pull details from the CRM snapshot below — it's your source of truth

The CRM snapshot includes full details: names, emails, phones, companies, budgets, deadlines, priorities, descriptions, and IDs. Use these details to give ${username} precise, helpful answers.

CRM Actions — when ${username} wants to create or delete something, respond ONLY with a JSON block:
\`\`\`action
{"action":"CREATE_CLIENT","data":{"name":"...","email":"...","phone":"...","company":""}}
\`\`\`
\`\`\`action
{"action":"CREATE_PROJECT","data":{"title":"...","clientName":"...","status":"ACTIVE","budget":0}}
\`\`\`

Action rules:
- Use "action" key always in UPPERCASE with underscore
- Fill only the fields the user mentioned — leave others as empty string or 0
- If critical fields are missing (name for client, title for project), ask ${username} nicely for the missing info instead of using NEEDS_FORM
- For normal questions, answer as usual with no JSON

Here is ${username}'s current CRM data:
${latestCrmContext}`,
    };

    let reply = '';

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            prompt,
            ...messages,
            { role: 'user', content: trimmed }
          ],
          max_tokens: 1024,
          stream: false
        })
      });

      const data = await response.json();
      reply = data.choices?.[0]?.message?.content ?? 'Sorry, no response received.';

      const parsed = parseActionBlock(reply);
      reply = parsed.text || reply;

      if (parsed.action) {
        const opened = openActionModal(parsed.action);
        if (opened && !reply) {
          reply = 'Action prepared. Review the details and submit the form.';
        }
      }
    } catch {
      reply = 'Something went wrong. Please try again.';
    }

    setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant', content: reply }]);
    setLoading(false);
  };

  return (
    <>
      <style>{`
        .chatbot-ai-root {
          position: fixed;
          right: max(32px, env(safe-area-inset-right, 0px));
          bottom: max(104px, env(safe-area-inset-bottom, 0px));
          z-index: var(--z-fab);
          font-family: var(--font-m);
        }

        .chatbot-ai-fab {
          width: 56px;
          height: 56px;
          border-radius: 999px;
          border: 1px solid var(--fab-border);
          background: var(--fab-bg);
          backdrop-filter: blur(8px) saturate(120%);
          -webkit-backdrop-filter: blur(8px) saturate(120%);
          color: var(--accent);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease), border-color 0.2s var(--ease);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        }

        .chatbot-ai-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(0, 0, 0, 0.3), 0 0 0 4px var(--accent-bg);
          border-color: var(--accent-hover);
        }

        .chatbot-ai-panel {
          position: absolute;
          right: 0;
          bottom: 72px;
          width: min(400px, calc(100vw - 24px));
          height: min(560px, calc(100vh - 140px));
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--surface);
          color: var(--text);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.42);
          animation: chatbot-ai-pop 0.2s var(--ease);
        }

        .chatbot-ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(180deg, var(--surface-2), var(--surface));
        }

        .chatbot-ai-title {
          color: var(--white);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .chatbot-ai-close {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--glass);
          color: var(--text-mid);
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          transition: border-color 0.2s var(--ease), color 0.2s var(--ease), background 0.2s var(--ease);
        }

        .chatbot-ai-header-actions {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .chatbot-ai-fullscreen {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--glass);
          color: var(--text-mid);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s var(--ease), color 0.2s var(--ease), background 0.2s var(--ease);
        }

        .chatbot-ai-fullscreen:hover {
          border-color: var(--border-h);
          color: var(--white);
          background: var(--surface-2);
        }

        .chatbot-ai-close:hover {
          border-color: var(--border-h);
          color: var(--white);
          background: var(--surface-2);
        }

        .chatbot-ai-messages {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background:
            radial-gradient(circle at top right, var(--accent-bg), transparent 38%),
            var(--surface);
        }

        .chatbot-ai-row {
          display: flex;
          width: 100%;
        }

        .chatbot-ai-row.user {
          justify-content: flex-end;
        }

        .chatbot-ai-row.assistant {
          justify-content: flex-start;
        }

        .chatbot-ai-bubble {
          max-width: 82%;
          border-radius: 8px;
          font-size: 11px;
          line-height: 1.6;
          padding: 9px 11px;
          border: 1px solid transparent;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .chatbot-ai-bubble.user {
          background: var(--accent-bg);
          border-color: var(--accent-hover);
          color: var(--white);
        }

        .chatbot-ai-bubble.assistant {
          background: var(--surface-2);
          border-color: var(--border);
          color: var(--text);
        }

        .chatbot-ai-empty {
          margin: auto;
          text-align: center;
          font-size: 11px;
          color: var(--text-dim);
          max-width: 220px;
          line-height: 1.65;
        }

        .chatbot-ai-typing {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          min-height: 17px;
        }

        .chatbot-ai-typing span {
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: var(--text-mid);
          animation: chatbot-ai-dot 1s ease-in-out infinite;
          display: inline-block;
        }

        .chatbot-ai-typing span:nth-child(2) {
          animation-delay: 0.12s;
        }

        .chatbot-ai-typing span:nth-child(3) {
          animation-delay: 0.24s;
        }

        .chatbot-ai-input-wrap {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid var(--border);
          background: var(--surface);
        }

        .chatbot-ai-input {
          width: 100%;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          color: var(--text);
          padding: 9px 10px;
          font-size: max(16px, 13px);
          outline: none;
          transition: border-color 0.2s var(--ease), box-shadow 0.2s var(--ease);
        }

        .chatbot-ai-input::placeholder {
          color: var(--text-dim);
        }

        .chatbot-ai-input:focus {
          border-color: var(--border-h);
          box-shadow: 0 0 0 2px var(--accent-bg);
        }

        .chatbot-ai-send {
          border: 1px solid var(--border);
          background: var(--accent);
          color: var(--bg);
          border-radius: 8px;
          padding: 0 14px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: filter 0.2s var(--ease), transform 0.2s var(--ease);
        }

        .chatbot-ai-send:hover:not(:disabled) {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }

        .chatbot-ai-send:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .chatbot-ai-fab,
        .chatbot-ai-fullscreen,
        .chatbot-ai-close,
        .chatbot-ai-send {
          touch-action: manipulation;
        }

        .chatbot-ai-panel.fullscreen {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          max-width: 100vw;
          max-height: 100dvh;
          right: auto;
          bottom: auto;
          border-radius: 0;
          z-index: calc(var(--z-fab) + 1);
          animation: none;
        }

        .chatbot-ai-panel.fullscreen .chatbot-ai-bubble {
          max-width: min(72%, 640px);
          font-size: 13.5px;
        }

        .cb-action-modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 3;
        }

        .cb-action-modal {
          width: min(420px, calc(100vw - 36px));
          max-height: calc(100dvh - 180px);
          overflow-y: auto;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 16px 44px rgba(0, 0, 0, 0.42);
        }

        .cb-action-modal input {
          border-radius: 7px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          padding: 8px 10px;
          font-size: 12px;
          outline: none;
        }

        .cb-action-modal input:focus {
          border-color: var(--accent);
        }

        .cb-form-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--accent);
          margin: 0;
        }

        .cb-field-error {
          font-size: 10px;
          color: #f87171;
          margin: -4px 0 0 2px;
          line-height: 1.3;
        }

        .cb-action-modal input.has-error {
          border-color: #f87171;
        }

        .cb-form-actions {
          display: flex;
          gap: 8px;
          margin-top: 2px;
        }

        .cb-form-btn {
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }

        .cb-form-btn.primary {
          background: var(--accent);
          color: var(--bg);
        }

        .cb-form-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 1024px) {
          .chatbot-ai-root {
            right: max(32px, env(safe-area-inset-right, 0px));
            bottom: max(104px, env(safe-area-inset-bottom, 0px));
          }

          .chatbot-ai-panel {
            width: min(360px, calc(100vw - 20px));
            height: min(520px, calc(100vh - 130px));
          }
        }

        @media (max-width: 767px) {
          .chatbot-ai-root {
            right: max(20px, env(safe-area-inset-right, 0px));
            bottom: max(84px, env(safe-area-inset-bottom, 0px));
          }

          .chatbot-ai-fab {
            width: 48px;
            height: 48px;
          }

          .chatbot-ai-panel {
            right: -56px;
            bottom: 60px;
            width: calc(100vw - 16px);
            height: min(72vh, calc(100vh - 98px));
            border-radius: 12px;
          }

          .chatbot-ai-input-wrap {
            gap: 6px;
            padding: 10px;
          }

          .chatbot-ai-send {
            padding: 0 12px;
          }
        }

        @keyframes chatbot-ai-pop {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes chatbot-ai-dot {
          0%,
          80%,
          100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-1px);
          }
        }
      `}</style>

      <div className="chatbot-ai-root">
        {isOpen && (
          <section className={`chatbot-ai-panel ${fullscreenActive ? 'fullscreen' : ''}`} aria-label="AI Assistant chat panel">
            <header className="chatbot-ai-header">
              <h3 className="chatbot-ai-title">{t('chatbot.title')}</h3>
              <div className="chatbot-ai-header-actions">
                {!isMobile && (
                  <button
                    className="chatbot-ai-fullscreen"
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    aria-label={isFullscreen ? t('chatbot.exit_fullscreen') : t('chatbot.enter_fullscreen')}
                  >
                    {isFullscreen ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 15H4v5" />
                        <path d="M15 9h5V4" />
                        <path d="M4 20l6-6" />
                        <path d="M20 4l-6 6" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M15 3h6v6" />
                        <path d="M9 21H3v-6" />
                        <path d="M21 3l-7 7" />
                        <path d="M3 21l7-7" />
                      </svg>
                    )}
                  </button>
                )}

                <button
                  className="chatbot-ai-close"
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label={t('chatbot.close')}
                >
                  ×
                </button>
              </div>
            </header>

            <div className="chatbot-ai-messages">
              {messages.length === 0 && !loading && (
                <p className="chatbot-ai-empty">
                  {t('chatbot.empty_state_greeting', { name: username })}
                </p>
              )}

              {messages.map((message: ChatMessage, index: number) => (
                <div key={`${message.role}-${index}`} className={`chatbot-ai-row ${message.role}`}>
                  <div className={`chatbot-ai-bubble ${message.role}`}>{message.content}</div>
                </div>
              ))}

              {loading && (
                <div className="chatbot-ai-row assistant">
                  <div className="chatbot-ai-bubble assistant" aria-label="Assistant is typing">
                    <span className="chatbot-ai-typing" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} aria-hidden="true" />
            </div>

            {pendingForm && (
              <div
                className="cb-action-modal-backdrop"
                onClick={() => {
                  if (!formSubmitting) {
                    setPendingForm(null);
                    setFormData({});
                  }
                }}
              >
                <div className="cb-action-modal" role="dialog" aria-modal="true" onClick={(e: any) => e.stopPropagation()}>
                  <p className="cb-form-label">
                    {pendingForm === 'CLIENT' && 'Create client'}
                    {pendingForm === 'PROJECT' && 'Create project'}
                    {pendingForm === 'DELETE_CLIENT' && 'Delete client'}
                    {pendingForm === 'DELETE_PROJECT' && 'Delete project'}
                  </p>

                  {pendingForm === 'CLIENT' && (
                    <>
                      <input
                        className={formErrors.name ? 'has-error' : ''}
                        placeholder={t('chatbot.placeholder_name')}
                        value={formData.name ?? ''}
                        onChange={(e: any) => { setFormData((prev: Record<string, string>) => ({ ...prev, name: e.target.value })); setFormErrors((prev: Record<string, string>) => { const { name: _, ...rest } = prev; return rest; }); }}
                      />
                      {formErrors.name && <p className="cb-field-error">{formErrors.name}</p>}
                      <input
                        className={formErrors.email ? 'has-error' : ''}
                        placeholder={t('chatbot.placeholder_email')}
                        value={formData.email ?? ''}
                        onChange={(e: any) => { setFormData((prev: Record<string, string>) => ({ ...prev, email: e.target.value })); setFormErrors((prev: Record<string, string>) => { const { email: _, ...rest } = prev; return rest; }); }}
                      />
                      {formErrors.email && <p className="cb-field-error">{formErrors.email}</p>}
                      <input
                        placeholder={t('chatbot.placeholder_phone')}
                        value={formData.phone ?? ''}
                        onChange={(e: any) => setFormData((prev: Record<string, string>) => ({ ...prev, phone: e.target.value }))}
                      />
                      <input
                        placeholder={t('chatbot.placeholder_company')}
                        value={formData.company ?? ''}
                        onChange={(e: any) => setFormData((prev: Record<string, string>) => ({ ...prev, company: e.target.value }))}
                      />
                      <input
                        placeholder="Notes"
                        value={formData.notes ?? ''}
                        onChange={(e: any) => setFormData((prev: Record<string, string>) => ({ ...prev, notes: e.target.value }))}
                      />
                    </>
                  )}

                  {pendingForm === 'PROJECT' && (
                    <>
                      <input
                        className={formErrors.title ? 'has-error' : ''}
                        placeholder={t('chatbot.placeholder_title')}
                        value={formData.title ?? ''}
                        onChange={(e: any) => { setFormData((prev: Record<string, string>) => ({ ...prev, title: e.target.value })); setFormErrors((prev: Record<string, string>) => { const { title: _, ...rest } = prev; return rest; }); }}
                      />
                      {formErrors.title && <p className="cb-field-error">{formErrors.title}</p>}
                      <input
                        className={formErrors.clientId ? 'has-error' : ''}
                        placeholder="Client ID"
                        value={formData.clientId ?? ''}
                        onChange={(e: any) => { setFormData((prev: Record<string, string>) => ({ ...prev, clientId: e.target.value })); setFormErrors((prev: Record<string, string>) => { const { clientName: _, ...rest } = prev; return rest; }); }}
                      />
                      <input
                        className={formErrors.clientName ? 'has-error' : ''}
                        placeholder={t('chatbot.placeholder_client_name')}
                        value={formData.clientName ?? ''}
                        onChange={(e: any) => { setFormData((prev: Record<string, string>) => ({ ...prev, clientName: e.target.value })); setFormErrors((prev: Record<string, string>) => { const { clientName: _, ...rest } = prev; return rest; }); }}
                      />
                      {formErrors.clientName && <p className="cb-field-error">{formErrors.clientName}</p>}
                      <input
                        className={formErrors.budget ? 'has-error' : ''}
                        placeholder={t('chatbot.placeholder_budget')}
                        type="number"
                        value={formData.budget ?? ''}
                        onChange={(e: any) => { setFormData((prev: Record<string, string>) => ({ ...prev, budget: e.target.value })); setFormErrors((prev: Record<string, string>) => { const { budget: _, ...rest } = prev; return rest; }); }}
                      />
                      {formErrors.budget && <p className="cb-field-error">{formErrors.budget}</p>}
                      <input
                        placeholder="Status"
                        value={formData.status ?? 'ACTIVE'}
                        onChange={(e: any) => setFormData((prev: Record<string, string>) => ({ ...prev, status: e.target.value }))}
                      />
                      <input
                        className={formErrors.deadline ? 'has-error' : ''}
                        placeholder="Deadline (YYYY-MM-DD)"
                        value={formData.deadline ?? ''}
                        onChange={(e: any) => { setFormData((prev: Record<string, string>) => ({ ...prev, deadline: e.target.value })); setFormErrors((prev: Record<string, string>) => { const { deadline: _, ...rest } = prev; return rest; }); }}
                      />
                      {formErrors.deadline && <p className="cb-field-error">{formErrors.deadline}</p>}
                      <input
                        placeholder="Description"
                        value={formData.description ?? ''}
                        onChange={(e: any) => setFormData((prev: Record<string, string>) => ({ ...prev, description: e.target.value }))}
                      />
                    </>
                  )}

                  {pendingForm === 'DELETE_CLIENT' && (
                    <>
                      <input
                        className={formErrors.clientId ? 'has-error' : ''}
                        placeholder="Client ID"
                        value={formData.clientId ?? ''}
                        onChange={(e: any) => { setFormData((prev: Record<string, string>) => ({ ...prev, clientId: e.target.value })); setFormErrors((prev: Record<string, string>) => { const { clientId: _, ...rest } = prev; return rest; }); }}
                      />
                      {formErrors.clientId && <p className="cb-field-error">{formErrors.clientId}</p>}
                    </>
                  )}

                  {pendingForm === 'DELETE_PROJECT' && (
                    <>
                      <input
                        className={formErrors.projectId ? 'has-error' : ''}
                        placeholder="Project ID"
                        value={formData.projectId ?? ''}
                        onChange={(e: any) => { setFormData((prev: Record<string, string>) => ({ ...prev, projectId: e.target.value })); setFormErrors((prev: Record<string, string>) => { const { projectId: _, ...rest } = prev; return rest; }); }}
                      />
                      {formErrors.projectId && <p className="cb-field-error">{formErrors.projectId}</p>}
                    </>
                  )}

                  <div className="cb-form-actions">
                    <button className="cb-form-btn primary" type="button" disabled={formSubmitting} onClick={() => { void submitForm(); }}>
                      {formSubmitting ? t('chatbot.submitting') : t('chatbot.submit')}
                    </button>
                    <button
                      className="cb-form-btn"
                      type="button"
                      disabled={formSubmitting}
                      onClick={() => {
                        setPendingForm(null);
                        setFormData({});
                      }}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form
              className="chatbot-ai-input-wrap"
              onSubmit={(e: any) => {
                e.preventDefault();
                void sendMessage();
              }}
            >
              <input
                className="chatbot-ai-input"
                value={input}
                onChange={(e: any) => setInput(e.target.value)}
                placeholder={t('chatbot.input_placeholder')}
                disabled={loading}
                enterKeyHint="send"
                autoComplete="off"
                autoCorrect="off"
              />
              <button
                className="chatbot-ai-send"
                type="submit"
                disabled={loading || !input.trim()}
              >
                {t('chatbot.send')}
              </button>
            </form>
          </section>
        )}

        <button className="chatbot-ai-fab" type="button" onClick={() => setIsOpen((prev: boolean) => !prev)} aria-label={isOpen ? t('chatbot.close_assistant') : t('chatbot.open_assistant')}>
          <svg width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            <path d="M8.5 10.5h.01" />
            <path d="M12 10.5h.01" />
            <path d="M15.5 10.5h.01" />
          </svg>
        </button>
      </div>
    </>
  );
}
