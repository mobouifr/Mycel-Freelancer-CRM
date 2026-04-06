import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../hooks/useIsMobile';

type MessageRole = 'user' | 'assistant';
type PendingFormType = 'CLIENT' | 'PROJECT' | 'INVOICE';

interface ActionResponse {
  action?: string;
  type?: PendingFormType;
  data?: Record<string, unknown>;
}

interface ChatMessage {
  role: MessageRole;
  content: string;
}

const getUsername = (): string => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return 'User';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username ?? payload.name ?? payload.email ?? 'User';
  } catch {
    return 'User';
  }
};

export default function ChatbotAI() {
  const { t } = useTranslation();
  const username = getUsername();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [crmContext, setCrmContext] = useState<string>('');
  const [pendingForm, setPendingForm] = useState<PendingFormType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
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

  const parseActionResponse = (rawReply: string): ActionResponse | null => {
    try {
      const fencedJson = rawReply.match(/```json\s*([\s\S]*?)```/i)?.[1]?.trim();
      const candidate = fencedJson || rawReply;
      const jsonMatch = candidate.match(/\{[\s\S]*"action"[\s\S]*\}/);
      if (!jsonMatch) return null;
      return JSON.parse(jsonMatch[0]) as ActionResponse;
    } catch {
      return null;
    }
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

  const getProjects = async (): Promise<any[]> => {
    try {
      const response = await fetch('/api/projects', { headers: getAuthHeaders() });
      if (!response.ok) return [];
      const payload = await response.json();
      return Array.isArray(payload) ? payload : (payload.data ?? []);
    } catch {
      return [];
    }
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
    const [clients, projects, invoices] = await Promise.all([
      fetchEntityList('/api/clients'),
      fetchEntityList('/api/projects'),
      fetchEntityList('/api/invoices'),
    ]);

    const summary = [
      `Clients (${clients.length}): ${clients.map((c: any) => c.name).join(', ') || 'none'}`,
      `Projects (${projects.length}): ${projects.map((p: any) => `${p.title} [${p.status}]`).join(', ') || 'none'}`,
      `Invoices (${invoices.length}): ${invoices.map((i: any) => `${i.invoiceNumber ?? `#${i.id}`} ${i.total ?? i.amount} [${i.status}]`).join(', ') || 'none'}`,
    ].join('\n');

    setCrmContext(summary);
    return summary;
  };

  const submitForm = async () => {
    if (!pendingForm || formSubmitting) return;

    setFormSubmitting(true);

    try {
      if (pendingForm === 'CLIENT') {
        const name = (formData.name ?? '').trim();
        if (!name) {
          setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant', content: 'Please provide a client name.' }]);
          return;
        }

        const payload = {
          name,
          email: (formData.email ?? '').trim(),
          phone: (formData.phone ?? '').trim(),
          company: (formData.company ?? '').trim(),
        };

        await postWithFallback(['/api/clients', '/api/customers'], payload);
        setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant', content: `✅ Client "${name}" has been added successfully.` }]);
      }

      if (pendingForm === 'PROJECT') {
        const title = (formData.title ?? '').trim();
        const clientName = (formData.clientName ?? '').trim();
        if (!title || !clientName) {
          setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant', content: 'Please provide both project title and client name.' }]);
          return;
        }

        const matchedClient = await findClientByName(clientName);
        const budgetValue = Number(formData.budget ?? '0');
        const payload: Record<string, unknown> = {
          title,
          status: 'ACTIVE',
          budget: Number.isFinite(budgetValue) ? budgetValue : 0,
        };

        if (matchedClient?.id) {
          payload.clientId = matchedClient.id;
        }

        await postWithFallback(['/api/projects'], payload);
        setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant', content: `✅ Project "${title}" has been created.` }]);
      }

      if (pendingForm === 'INVOICE') {
        const clientName = (formData.clientName ?? '').trim();
        const total = Number(formData.total ?? '0');
        const dueDate = (formData.dueDate ?? '').trim();

        if (!clientName || !Number.isFinite(total) || total <= 0) {
          setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant', content: 'Please provide client name and a valid total amount.' }]);
          return;
        }

        const matchedClient = await findClientByName(clientName);
        const projects = await getProjects();
        const candidateProject = projects.find((project: any) => {
          const projectClientName = (project?.client?.name ?? '').toLowerCase();
          const clientId = project?.clientId;
          return (
            projectClientName === clientName.toLowerCase() ||
            (matchedClient?.id && clientId === matchedClient.id)
          );
        });

        if (!candidateProject?.id) {
          setMessages((prev: ChatMessage[]) => [
            ...prev,
            {
              role: 'assistant',
              content: `I could not find a project for \"${clientName}\". Please create/select a project first, then try invoice creation again.`,
            },
          ]);
          return;
        }

        const payload: Record<string, unknown> = {
          amount: total,
          status: 'PENDING',
          projectId: candidateProject.id,
        };

        if (dueDate) {
          payload.dueDate = dueDate;
        }

        await postWithFallback(['/api/invoices'], payload);
        setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant', content: `✅ Invoice of ${total} for "${clientName}" added.` }]);
      }

      setPendingForm(null);
      setFormData({});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit the form right now.';
      setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant', content: `Could not complete this action: ${message}` }]);
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
      content: `You are a smart assistant for ${username} inside their freelancer CRM. Always address them as ${username}. Be concise and practical.\n\nUse the live CRM snapshot below as the source of truth for questions about clients, projects, invoices, and plans. This snapshot is fetched from the database for each user message.\n\nYou are a smart CRM assistant. When answering questions about projects, clients, invoices, or plans, prefer structured visual answers over plain text when it helps clarity. Use:\n\n- Markdown tables for comparisons, status summaries, or lists of data\n- ASCII flowcharts (→ ↓ ├ └) for processes or decision flows\n- Numbered steps with clear hierarchy for action plans\n- Tree diagrams for relationships between clients, projects, and invoices\n\nExample: if asked \"what are my active projects?\" reply with a table. If asked \"how should I follow up with a client?\" reply with a step-by-step flow.\n\nOnly add diagrams when they genuinely improve the answer. Short factual answers stay as plain text.\n\nYou can also perform CRM actions. When the user wants to create something, respond ONLY with a JSON block in this exact format - no extra text:\n\n{\"action\":\"CREATE_CLIENT\",\"data\":{\"name\":\"...\",\"email\":\"...\",\"phone\":\"...\",\"company\":\"...\"}}\n{\"action\":\"CREATE_PROJECT\",\"data\":{\"title\":\"...\",\"clientName\":\"...\",\"status\":\"ACTIVE\",\"budget\":0}}\n{\"action\":\"CREATE_INVOICE\",\"data\":{\"clientName\":\"...\",\"total\":0,\"status\":\"UNPAID\",\"dueDate\":\"YYYY-MM-DD\"}}\n\nRules:\n- Use \"action\" key always in UPPERCASE with underscore\n- Fill only the fields the user mentioned - leave others as empty string or 0\n- If critical fields are missing (name for client, title for project, clientName+total for invoice), set \"action\":\"NEEDS_FORM\" and include \"type\":\"CLIENT\"|\"PROJECT\"|\"INVOICE\"\n- For normal questions, answer as usual with no JSON\n\nHere is their current CRM data:\n${latestCrmContext}`,
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

      const parsed = parseActionResponse(reply);
      const action = parsed?.action?.toUpperCase();
      const dataPayload = parsed?.data ?? {};

      if (action === 'CREATE_CLIENT') {
        const name = String(dataPayload.name ?? '').trim();
        const email = String(dataPayload.email ?? '').trim();
        const phone = String(dataPayload.phone ?? '').trim();
        const company = String(dataPayload.company ?? '').trim();

        if (!name) {
          setPendingForm('CLIENT');
          setFormData({ email, phone, company });
          reply = 'I need a few more details. Please fill in the form below.';
        } else {
          await postWithFallback(['/api/clients', '/api/customers'], { name, email, phone, company });
          setPendingForm(null);
          setFormData({});
          reply = `✅ Client "${name}" has been added successfully.`;
        }
      } else if (action === 'CREATE_PROJECT') {
        const title = String(dataPayload.title ?? '').trim();
        const clientName = String(dataPayload.clientName ?? '').trim();
        const statusRaw = String(dataPayload.status ?? 'ACTIVE').toUpperCase();
        const normalizedStatus = ['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'].includes(statusRaw) ? statusRaw : 'ACTIVE';
        const budgetNum = Number(dataPayload.budget ?? 0);
        const budget = Number.isFinite(budgetNum) ? budgetNum : 0;

        if (!title) {
          setPendingForm('PROJECT');
          setFormData({
            title,
            clientName,
            budget: String(budget),
          });
          reply = 'I need a few more details. Please fill in the form below.';
        } else {
          const payload: Record<string, unknown> = {
            title,
            status: normalizedStatus,
            budget,
          };

          if (clientName) {
            const matchedClient = await findClientByName(clientName);
            if (matchedClient?.id) {
              payload.clientId = matchedClient.id;
            }
          }

          await postWithFallback(['/api/projects'], payload);
          setPendingForm(null);
          setFormData({});
          reply = `✅ Project "${title}" has been created.`;
        }
      } else if (action === 'CREATE_INVOICE') {
        const clientName = String(dataPayload.clientName ?? '').trim();
        const totalNum = Number(dataPayload.total ?? 0);
        const total = Number.isFinite(totalNum) ? totalNum : 0;
        const dueDate = String(dataPayload.dueDate ?? '').trim();

        if (!clientName || total <= 0) {
          setPendingForm('INVOICE');
          setFormData({
            clientName,
            total: total > 0 ? String(total) : '',
            dueDate,
          });
          reply = 'I need a few more details. Please fill in the form below.';
        } else {
          const matchedClient = await findClientByName(clientName);
          const projects = await getProjects();
          const candidateProject = projects.find((project: any) => {
            const projectClientName = (project?.client?.name ?? '').toLowerCase();
            const clientId = project?.clientId;
            return (
              projectClientName === clientName.toLowerCase() ||
              (matchedClient?.id && clientId === matchedClient.id)
            );
          });

          if (!candidateProject?.id) {
            setPendingForm('INVOICE');
            setFormData({ clientName, total: String(total), dueDate });
            reply = `I could not find a project for \"${clientName}\". Please complete the form below.`;
          } else {
            const payload: Record<string, unknown> = {
              amount: total,
              status: 'PENDING',
              projectId: candidateProject.id,
            };

            if (dueDate) {
              payload.dueDate = dueDate;
            }

            await postWithFallback(['/api/invoices'], payload);
            setPendingForm(null);
            setFormData({});
            reply = `✅ Invoice of ${total} for "${clientName}" added.`;
          }
        }
      } else if (action === 'NEEDS_FORM') {
        const type = parsed?.type;
        if (type === 'CLIENT' || type === 'PROJECT' || type === 'INVOICE') {
          setPendingForm(type);
          const prefillEntries = Object.entries(dataPayload).reduce<Record<string, string>>((acc, [key, value]) => {
            acc[key] = String(value ?? '');
            return acc;
          }, {});
          setFormData(prefillEntries);
        }
        reply = 'I need a few more details. Please fill in the form below.';
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
          right: max(35px, env(safe-area-inset-right, 0px));
          bottom: max(170px, env(safe-area-inset-bottom, 0px));
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

        .cb-inline-form {
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 4px 0;
        }

        .cb-inline-form input {
          border-radius: 7px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          padding: 8px 10px;
          font-size: 12px;
          outline: none;
        }

        .cb-inline-form input:focus {
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
            bottom: max(168px, env(safe-area-inset-bottom, 0px));
          }

          .chatbot-ai-panel {
            width: min(360px, calc(100vw - 20px));
            height: min(520px, calc(100vh - 130px));
          }
        }

        @media (max-width: 767px) {
          .chatbot-ai-root {
            right: max(20px, env(safe-area-inset-right, 0px));
            bottom: max(138px, env(safe-area-inset-bottom, 0px));
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
                  {t('chatbot.empty_state')}
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

              {pendingForm && (
                <div className="cb-inline-form" role="group" aria-label="Pending CRM form">
                  <p className="cb-form-label">
                    {pendingForm === 'CLIENT' && t('chatbot.new_client')}
                    {pendingForm === 'PROJECT' && t('chatbot.new_project')}
                    {pendingForm === 'INVOICE' && t('chatbot.new_invoice')}
                  </p>

                  {pendingForm === 'CLIENT' && (
                    <>
                      <input
                        placeholder={t('chatbot.placeholder_name')}
                        value={formData.name ?? ''}
                        onChange={(e: any) => setFormData((prev: Record<string, string>) => ({ ...prev, name: e.target.value }))}
                      />
                      <input
                        placeholder={t('chatbot.placeholder_email')}
                        value={formData.email ?? ''}
                        onChange={(e: any) => setFormData((prev: Record<string, string>) => ({ ...prev, email: e.target.value }))}
                      />
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
                    </>
                  )}

                  {pendingForm === 'PROJECT' && (
                    <>
                      <input
                        placeholder={t('chatbot.placeholder_title')}
                        value={formData.title ?? ''}
                        onChange={(e: any) => setFormData((prev: Record<string, string>) => ({ ...prev, title: e.target.value }))}
                      />
                      <input
                        placeholder={t('chatbot.placeholder_client_name')}
                        value={formData.clientName ?? ''}
                        onChange={(e: any) => setFormData((prev: Record<string, string>) => ({ ...prev, clientName: e.target.value }))}
                      />
                      <input
                        placeholder={t('chatbot.placeholder_budget')}
                        type="number"
                        value={formData.budget ?? ''}
                        onChange={(e: any) => setFormData((prev: Record<string, string>) => ({ ...prev, budget: e.target.value }))}
                      />
                    </>
                  )}

                  {pendingForm === 'INVOICE' && (
                    <>
                      <input
                        placeholder={t('chatbot.placeholder_client_name')}
                        value={formData.clientName ?? ''}
                        onChange={(e: any) => setFormData((prev: Record<string, string>) => ({ ...prev, clientName: e.target.value }))}
                      />
                      <input
                        placeholder={t('chatbot.placeholder_total')}
                        type="number"
                        value={formData.total ?? ''}
                        onChange={(e: any) => setFormData((prev: Record<string, string>) => ({ ...prev, total: e.target.value }))}
                      />
                      <input
                        placeholder={t('chatbot.placeholder_due_date')}
                        value={formData.dueDate ?? ''}
                        onChange={(e: any) => setFormData((prev: Record<string, string>) => ({ ...prev, dueDate: e.target.value }))}
                      />
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
              )}

              <div ref={messagesEndRef} aria-hidden="true" />
            </div>

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
