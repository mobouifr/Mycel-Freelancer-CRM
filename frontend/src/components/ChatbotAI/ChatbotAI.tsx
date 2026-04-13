import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import mermaid from 'mermaid';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import 'highlight.js/styles/github-dark.css';

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

interface ChatbotApiResponse {
  reply: string;
  action?: Record<string, unknown>;
}

interface SuggestionsExtraction {
  cleanContent: string;
  suggestions: string[];
}

const dedupeSuggestions = (items: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const value = item.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result;
};

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#1e293b',
    primaryTextColor: '#e2e8f0',
    primaryBorderColor: '#334155',
    lineColor: '#64748b',
    secondaryColor: '#0f172a',
    tertiaryColor: '#1e293b',
    background: '#0f172a',
    mainBkg: '#1e293b',
    nodeBorder: '#334155',
    clusterBkg: '#1e293b',
    titleColor: '#e2e8f0',
    edgeLabelBackground: '#1e293b',
    fontFamily: 'var(--font-m)',
  },
});

const MermaidDiagram = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!chart) return;
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    mermaid
      .render(id, chart)
      .then(({ svg: rendered }) => {
        setSvg(rendered);
        setError(false);
      })
      .catch(() => {
        setError(true);
      });
  }, [chart]);

  if (error) {
    return (
      <div className="cb-diagram-wrap">
        <p className="cb-diagram-label">Diagram</p>
        <pre className="cb-diagram-block">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      className="cb-mermaid-wrap"
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

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
  const [pendingForm, setPendingForm] = useState<PendingFormType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);

  const [panelSize, setPanelSize] = useState<{ width: number; height: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fullscreenActive = isOpen && (isMobile || isFullscreen);
  const quickActions = [
    { label: '✉️ Write Email', prompt: 'Write a professional email' },
    { label: '📄 Write Report', prompt: 'Write a full structured report' },
    { label: '👥 Active Users', prompt: 'Show a table of active users with name, role, status, and last active date' },
    { label: '✅ Task List', prompt: 'Create a task list table with task name, owner, priority, due date, and status' },
    { label: '📊 Compare Options', prompt: 'Compare two options in a structured table' },
    { label: '📢 Announcement', prompt: 'Draft a professional internal announcement' },
  ];

  const startResize = (clientX: number, clientY: number) => {
    if (fullscreenActive || !panelRef.current) return;

    const rect = panelRef.current.getBoundingClientRect();
    const startWidth = rect.width;
    const startHeight = rect.height;

    setIsResizing(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'nwse-resize';

    const onMove = (moveX: number, moveY: number) => {
      // Top-left resize handle: moving right/down shrinks, left/up expands.
      const width = Math.max(320, Math.min(window.innerWidth * 0.98, startWidth - (moveX - clientX)));
      const height = Math.max(380, Math.min(window.innerHeight * 0.92, startHeight - (moveY - clientY)));
      setPanelSize({ width, height });
    };

    const handleMouseMove = (event: MouseEvent) => onMove(event.clientX, event.clientY);
    const handleTouchMove = (event: TouchEvent) => {
      if (!event.touches[0]) return;
      onMove(event.touches[0].clientX, event.touches[0].clientY);
    };

    const stopResize = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResize);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stopResize);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResize);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', stopResize);
  };

  useEffect(() => {
    if (!panelSize || fullscreenActive) return;

    const clampPanelSize = () => {
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const maxWidth = Math.max(280, Math.floor(viewportW - 16));
      const maxHeight = Math.max(320, Math.floor(viewportH - 90));
      const minWidth = Math.min(320, maxWidth);
      const minHeight = Math.min(380, maxHeight);

      const nextWidth = Math.min(maxWidth, Math.max(minWidth, panelSize.width));
      const nextHeight = Math.min(maxHeight, Math.max(minHeight, panelSize.height));

      if (nextWidth !== panelSize.width || nextHeight !== panelSize.height) {
        setPanelSize({ width: nextWidth, height: nextHeight });
      }
    };

    clampPanelSize();
    window.addEventListener('resize', clampPanelSize);
    return () => window.removeEventListener('resize', clampPanelSize);
  }, [panelSize, fullscreenActive]);


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

      const clientName = (formData.clientName ?? '').trim();
      if (!clientName) errors.clientName = t('chatbot.validation_client_required');

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

        const budgetValue = Number(formData.budget ?? '0');
        const payload: Record<string, unknown> = {
          title,
          status: (formData.status ?? 'ACTIVE').toUpperCase(),
          budget: Number.isFinite(budgetValue) ? budgetValue : 0,
          description: (formData.description ?? '').trim() || undefined,
          deadline: (formData.deadline ?? '').trim() || undefined,
        };

        const matchedClient = await findClientByName(clientName);
        if (matchedClient?.id) {
          payload.clientId = matchedClient.id;
        } else {
            setFormErrors((prev: Record<string, string>) => ({ ...prev, clientName: 'Client is required.' }));
            setFormSubmitting(false);
            return;
        }

        await postWithFallback(['/api/projects'], payload);
        setMessages((prev: ChatMessage[]) => [
          ...prev,
          { role: 'assistant', content: `All set, ${username}! "${title}" is now live and ready to go. 🚀` },
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

  const detectLocalIntent = (text: string): PendingFormType | null => {
    const lower = text.toLowerCase();

    const deleteClientPatterns = [
      /delete\s+(a\s+)?client/,
      /remove\s+(a\s+)?client/,
      /supprimer\s+(un\s+)?client/,
      /eliminar\s+(un\s+)?cliente/,
    ];
    if (deleteClientPatterns.some(p => p.test(lower))) return 'DELETE_CLIENT';

    const deleteProjectPatterns = [
      /delete\s+(a\s+)?project/,
      /remove\s+(a\s+)?project/,
      /supprimer\s+(un\s+)?projet/,
      /eliminar\s+(un\s+)?proyecto/,
    ];
    if (deleteProjectPatterns.some(p => p.test(lower))) return 'DELETE_PROJECT';

    const createClientPatterns = [
      /add\s+(a\s+)?client/,
      /create\s+(a\s+)?client/,
      /new\s+client/,
      /ajouter\s+(un\s+)?client/,
      /créer\s+(un\s+)?client/,
      /añadir\s+(un\s+)?cliente/,
      /crear\s+(un\s+)?cliente/,
    ];
    if (createClientPatterns.some(p => p.test(lower))) return 'CLIENT';

    const createProjectPatterns = [
      /add\s+(a\s+)?project/,
      /create\s+(a\s+)?project/,
      /new\s+project/,
      /ajouter\s+(un\s+)?projet/,
      /créer\s+(un\s+)?projet/,
      /añadir\s+(un\s+)?proyecto/,
      /crear\s+(un\s+)?proyecto/,
    ];
    if (createProjectPatterns.some(p => p.test(lower))) return 'PROJECT';

    const modifyClientPatterns = [
      /modify\s+(a\s+)?client/,
      /edit\s+(a\s+)?client/,
      /update\s+(a\s+)?client/,
      /change\s+(a\s+)?client/,
      /modifier\s+(un\s+)?client/,
      /modificar\s+(un\s+)?cliente/,
    ];
    if (modifyClientPatterns.some(p => p.test(lower))) return 'CLIENT';

    const modifyProjectPatterns = [
      /modify\s+(a\s+)?project/,
      /edit\s+(a\s+)?project/,
      /update\s+(a\s+)?project/,
      /change\s+(a\s+)?project/,
      /modifier\s+(un\s+)?projet/,
      /modificar\s+(un\s+)?proyecto/,
    ];
    if (modifyProjectPatterns.some(p => p.test(lower))) return 'PROJECT';

    return null;
  };

  const extractQuickSuggestions = (text: string): SuggestionsExtraction => {
    const lines = text.split('\n');
    const suggestions: string[] = [];
    const keptLines: string[] = [];

    for (const line of lines) {
      const match = line.match(/^\s*(?:->|→)\s*"?(.+?)"?\s*$/);
      if (match && match[1]) {
        suggestions.push(match[1].trim());
      } else {
        keptLines.push(line);
      }
    }

    return {
      cleanContent: keptLines.join('\n').trim(),
      suggestions,
    };
  };

  const buildContextualSuggestions = (assistantText: string, messageIndex: number): string[] => {
    const previousUserMessage = [...messages.slice(0, messageIndex)]
      .reverse()
      .find((m) => m.role === 'user')
      ?.content
      .toLowerCase() ?? '';

    const context = `${assistantText.toLowerCase()} ${previousUserMessage}`;
    const suggestions: string[] = [];

    if (/client|customer|company/.test(context)) {
      suggestions.push('Show my latest clients in a table');
      suggestions.push('Help me add a new client');
    }

    if (/project|deadline|budget|active|completed/.test(context)) {
      suggestions.push('Show only active projects');
      suggestions.push('What project needs attention first?');
    }

    if (/report|summary|analysis|dashboard|metric/.test(context)) {
      suggestions.push('Give me a 3-bullet summary');
      suggestions.push('What should I do next based on this?');
    }

    if (/delete|remove/.test(context)) {
      suggestions.push('List safe delete options first');
    }

    suggestions.push('Turn this into a task checklist');
    suggestions.push('Explain this in a simpler way');

    return dedupeSuggestions(suggestions).slice(0, 4);
  };

  const buildRateLimitMessage = (retryAfterSeconds?: number): string => {
    const waitSeconds = Math.max(1, Math.floor(retryAfterSeconds ?? 300));
    const minutes = Math.floor(waitSeconds / 60);
    const seconds = waitSeconds % 60;

    if (minutes > 0 && seconds > 0) {
      return `Rate limit reached. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds > 1 ? 's' : ''} before sending another request.`;
    }

    if (minutes > 0) {
      return `Rate limit reached. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before sending another request.`;
    }

    return `Rate limit reached. Please wait ${seconds} second${seconds > 1 ? 's' : ''} before sending another request.`;
  };

  const sendMessage = async (overrideText?: string) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || loading) return;

    setHasSentFirstMessage(true);


    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Detect intent locally first
    const localIntent = detectLocalIntent(trimmed);
    const shouldForceFormInput = localIntent === 'CLIENT' || localIntent === 'PROJECT';

    if (shouldForceFormInput && !pendingForm) {
      setPendingForm(localIntent);
      setFormData({});
      setFormErrors({});
    }

    let reply = '';

    try {
      const token = localStorage.getItem('token');
      const streamResponse = await fetch('/api/chatbot/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ message: trimmed }),
      });

      if (streamResponse.status === 429) {
        const retryAfter = Number(streamResponse.headers.get('retry-after') ?? '0');
        reply = buildRateLimitMessage(Number.isFinite(retryAfter) ? retryAfter : undefined);
        setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant', content: reply }]);
        setLoading(false);
        return;
      }

      if (streamResponse.ok && streamResponse.body) {
        const reader = streamResponse.body.getReader();
        const decoder = new TextDecoder();
        let streamedContent = '';
        let pendingChunk = '';

        // Add a placeholder assistant message that we update in real time.
        setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          pendingChunk += decoder.decode(value, { stream: true });
          const lines = pendingChunk.split('\n');
          pendingChunk = lines.pop() ?? '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith('data:')) continue;

            const data = trimmedLine.slice(5).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data) as { content?: string };
              if (parsed.content) {
                streamedContent += parsed.content;
                setMessages((prev: ChatMessage[]) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: streamedContent,
                  };
                  return updated;
                });
              }
            } catch {
              // Skip malformed SSE chunks.
            }
          }
        }

        const parsed = parseActionBlock(streamedContent);
        const finalReply = parsed.text || streamedContent || 'Sorry, no response received.';

        let actionReply = finalReply;
        if (parsed.action) {
          const opened = openActionModal(parsed.action);
          if (opened && !actionReply) {
            actionReply = 'Action prepared. Review the details and submit the form.';
          }
        }

        setMessages((prev: ChatMessage[]) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: actionReply,
          };
          return updated;
        });

        // Streaming branch handled the assistant message already.
        setLoading(false);
        return;
      }

      // Fallback to non-streaming endpoint when SSE is unavailable.
      const { data } = await api.post<ChatbotApiResponse>('/chatbot/chat', {
        message: trimmed,
      });

      reply = data.reply ?? 'Sorry, no response received.';

      const action = data.action;
      if (action) {
        const opened = openActionModal(action);
        if (opened && !reply) {
          reply = 'Action prepared. Review the details and submit the form.';
        }
      } else {
        const parsed = parseActionBlock(reply);
        reply = parsed.text || reply;

        if (parsed.action) {
          const opened = openActionModal(parsed.action);
          if (opened && !reply) {
            reply = 'Action prepared. Review the details and submit the form.';
          }
        }
      }
    } catch (error) {
      const status =
        error && typeof error === 'object' && 'response' in error
          ? Number((error as { response?: { status?: number } }).response?.status)
          : error && typeof error === 'object' && 'status' in error
            ? Number((error as { status?: number }).status)
            : undefined;

      if (status === 429) {
        const err = error as {
          response?: {
            headers?: Record<string, unknown>;
            data?: { retryAfterSeconds?: number | string };
          };
        };

        const retryAfterHeader = Number(err.response?.headers?.['retry-after'] ?? '0');
        const retryAfterBody = Number(err.response?.data?.retryAfterSeconds ?? '0');
        const retryAfterSeconds = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
          ? retryAfterHeader
          : Number.isFinite(retryAfterBody) && retryAfterBody > 0
            ? retryAfterBody
            : undefined;

        reply = buildRateLimitMessage(retryAfterSeconds);
      } else {
        reply = 'Something went wrong. Please try again.';
      }
    }

    // Fallback: if AI didn't open a form but we detected CRUD intent, open it
    if (localIntent && !pendingForm && !shouldForceFormInput) {
      setPendingForm(localIntent);
      setFormData({});
      setFormErrors({});
      if (!reply || reply === 'Something went wrong. Please try again.') {
        reply = `Sure, ${username}! Please fill in the details below.`;
      }
    }

    setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant', content: reply }]);
    setLoading(false);
  };

  const renderMessageContent = (message: ChatMessage, messageIndex: number) => {
    if (message.role === 'user') {
      return <span>{message.content}</span>;
    }

    const { cleanContent, suggestions } = extractQuickSuggestions(message.content);
    const contextualSuggestions =
      suggestions.length > 0 ? suggestions : buildContextualSuggestions(cleanContent, messageIndex);

    return (
      <div className="cb-rich-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: ({ children }) => <h1 className="cb-h1">{children}</h1>,
            h2: ({ children }) => <h2 className="cb-h2">{children}</h2>,
            h3: ({ children }) => <h3 className="cb-h3">{children}</h3>,
            p: ({ children }) => <p className="cb-paragraph">{children}</p>,
            ul: ({ children }) => <ul className="cb-list cb-list-ul">{children}</ul>,
            ol: ({ children }) => <ol className="cb-list cb-list-ol">{children}</ol>,
            li: ({ children }) => <li className="cb-li">{children}</li>,
            strong: ({ children }) => <strong className="cb-bold">{children}</strong>,
            blockquote: ({ children }) => <blockquote className="cb-blockquote">{children}</blockquote>,
            table: ({ children }) => (
              <div className="cb-table-wrap">
                <table className="cb-table">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead>{children}</thead>,
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => <tr>{children}</tr>,
            th: ({ children }) => <th>{children}</th>,
            td: ({ children }) => <td>{children}</td>,
            code: (props: any) => {
              const { inline, className, children, ...rest } = props;
              const lang = (className ?? '').replace('language-', '');

              if (lang === 'mermaid') {
                return <MermaidDiagram chart={String(children).trim()} />;
              }

              if (lang === 'action') {
                return null;
              }

              if (inline) {
                return (
                  <code className="cb-inline-code" {...rest}>
                    {children}
                  </code>
                );
              }

              return (
                <div className="cb-code-wrap">
                  {lang && <span className="cb-code-lang">{lang}</span>}
                  <pre className="cb-code-block">
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            },
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="cb-link">
                {children}
              </a>
            ),
          }}
        >
          {cleanContent}
        </ReactMarkdown>

        {contextualSuggestions.length > 0 && (
          <div className="cb-suggestions-wrap" aria-label="Suggested follow-up questions">
            {contextualSuggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={`sugg-${index}-${suggestion}`}
                type="button"
                className="cb-suggestion-btn"
                disabled={loading}
                onClick={() => {
                  void sendMessage(suggestion);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        .chatbot-ai-root {
          position: fixed;
          right: max(32px, env(safe-area-inset-right, 0px));
          bottom: var(--fab-bottom, max(32px, env(safe-area-inset-bottom, 0px)));
          z-index: var(--z-fab);
          font-family: var(--font-m);
          transition: bottom 0.2s var(--ease);
        }

        .chatbot-ai-fab {
          width: 56px;
          height: 56px;
          border-radius: 999px;
          border: 1px solid var(--fab-border);
          background: var(--surface-2);
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
          max-width: calc(100vw - 12px);
          max-height: calc(100dvh - 86px);
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

        .chatbot-ai-panel.resizing {
          user-select: none;
        }

        .chatbot-ai-resize-handle {
          position: absolute;
          left: 4px;
          top: 4px;
          width: 16px;
          height: 16px;
          border: 0;
          background: transparent;
          color: var(--text-dim);
          opacity: 0.5;
          cursor: nwse-resize;
          z-index: 4;
          padding: 0;
          transition: opacity 0.2s var(--ease), color 0.2s var(--ease);
        }

        .chatbot-ai-resize-handle:hover {
          opacity: 0.95;
          color: var(--accent);
        }

        .chatbot-ai-resize-handle svg {
          display: block;
          width: 16px;
          height: 16px;
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
          align-items: flex-end;
          gap: 8px;
          animation: chatbot-ai-bubble-in 0.2s var(--ease);
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

        .chatbot-ai-avatar {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          background: var(--surface-2);
          color: var(--text-mid);
          flex-shrink: 0;
        }

        .chatbot-ai-avatar.user {
          background: var(--accent-bg);
          color: var(--white);
          border-color: var(--accent-hover);
        }

        .cb-rich-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cb-paragraph {
          margin: 0;
        }

        .cb-h1 {
          font-size: 15px;
          font-weight: 700;
          color: var(--white);
          margin: 6px 0 4px;
          padding-bottom: 4px;
          border-bottom: 1px solid var(--border);
          letter-spacing: 0.02em;
        }

        .cb-h2 {
          font-size: 13px;
          font-weight: 700;
          color: var(--accent);
          margin: 6px 0 3px;
          letter-spacing: 0.03em;
        }

        .cb-h3 {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--text);
          margin: 4px 0 2px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          opacity: 0.85;
        }

        .cb-bold {
          color: var(--white);
          font-weight: 700;
        }

        .cb-blockquote {
          border-left: 3px solid var(--accent);
          margin: 4px 0;
          padding: 6px 10px;
          background: color-mix(in srgb, var(--accent-bg) 30%, transparent);
          border-radius: 0 6px 6px 0;
          font-style: italic;
          color: var(--text-mid);
          font-size: 10.5px;
        }

        .cb-inline-code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 10px;
          background: color-mix(in srgb, var(--surface-2) 80%, white 20%);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 1px 5px;
          color: var(--accent);
        }

        .cb-code-wrap {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .cb-code-lang {
          display: block;
          padding: 4px 10px;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
          color: var(--text-dim);
          background: color-mix(in srgb, var(--surface-2) 70%, black 30%);
          border-bottom: 1px solid var(--border);
        }

        .cb-code-block {
          margin: 0;
          padding: 10px;
          font-size: 10.5px;
          line-height: 1.55;
          overflow-x: auto;
          background: color-mix(in srgb, var(--surface) 60%, black 40%);
        }

        .cb-link {
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 2px;
          font-size: inherit;
        }

        .cb-link:hover {
          opacity: 0.8;
        }

        .cb-li {
          line-height: 1.6;
        }

        .cb-list {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 4px;
        }


        .cb-diagram-wrap {
          display: grid;
          gap: 4px;
        }

        .cb-diagram-label {
          margin: 0;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-dim);
        }

        .cb-diagram-block {
          margin: 0;
          padding: 8px;
          border-radius: 8px;
          background: color-mix(in srgb, var(--surface-2) 84%, white 16%);
          border: 1px solid var(--border);
          font-size: 10.5px;
          line-height: 1.5;
          overflow-x: auto;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        }

        .cb-mermaid-wrap {
          background: color-mix(in srgb, var(--surface-2) 80%, black 20%);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px;
          overflow-x: auto;
          display: flex;
          justify-content: center;
        }

        .cb-mermaid-wrap svg {
          max-width: 100%;
          height: auto;
        }

        .cb-table-wrap {
          overflow-x: auto;
          border-radius: 8px;
          border: 0.5px solid var(--border);
        }

        .cb-table {
          width: 100%;
          min-width: 420px;
          border-collapse: separate;
          border-spacing: 0;
          table-layout: fixed;
          font-size: 10.5px;
        }

        .cb-table th,
        .cb-table td {
          border-right: 0.5px solid var(--border);
          border-bottom: 0.5px solid var(--border);
          padding: 6px 8px;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        .cb-table th:last-child,
        .cb-table td:last-child {
          border-right: 0;
        }

        .cb-table thead th {
          background: color-mix(in srgb, var(--accent-bg) 40%, var(--surface-2) 60%);
          color: var(--text);
          font-weight: 700;
        }

        .cb-table tbody tr:nth-child(odd) td {
          background: color-mix(in srgb, var(--surface) 90%, black 10%);
        }

        .cb-table tbody tr:nth-child(even) td {
          background: var(--surface-2);
        }


        .chatbot-ai-quick-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          overflow: hidden;
          padding: 10px 14px;
          border-top: 1px solid var(--border);
          background: linear-gradient(180deg, var(--surface), var(--surface-2));
        }

        .chatbot-ai-quick-chip {
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--surface-2);
          color: var(--text);
          padding: 8px 10px;
          font-size: 10px;
          line-height: 1.35;
          text-align: left;
          min-height: 42px;
          cursor: pointer;
          transition: transform 0.16s var(--ease), border-color 0.16s var(--ease), background 0.16s var(--ease);
        }

        .chatbot-ai-quick-chip:hover {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent-bg) 60%, var(--surface) 40%);
          transform: translateY(-1px);
        }

        .cb-suggestions-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 2px;
        }

        .cb-suggestion-btn {
          border: 1px solid var(--border);
          border-radius: 999px;
          background: color-mix(in srgb, var(--accent-bg) 38%, var(--surface) 62%);
          color: var(--white);
          padding: 5px 10px;
          font-size: 10px;
          line-height: 1.3;
          cursor: pointer;
          transition: filter 0.16s var(--ease), transform 0.16s var(--ease), border-color 0.16s var(--ease);
        }

        .cb-suggestion-btn:hover:not(:disabled) {
          filter: brightness(1.07);
          transform: translateY(-1px);
          border-color: var(--accent);
        }

        .cb-suggestion-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
          font-family: inherit;
          resize: none;
          min-height: 40px;
          max-height: 132px;
          outline: none;
          transition: border-color 0.2s var(--ease), box-shadow 0.2s var(--ease);
          overflow-y: auto;
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
          word-break: break-word;
          overflow-wrap: break-word;
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
            bottom: max(32px, env(safe-area-inset-bottom, 0px));
          }

          .chatbot-ai-panel {
            width: min(360px, calc(100vw - 20px));
            height: min(520px, calc(100vh - 130px));
          }
        }

        @media (max-width: 767px) {
          .chatbot-ai-root {
            right: max(20px, env(safe-area-inset-right, 0px));
            bottom: max(24px, env(safe-area-inset-bottom, 0px));
          }

          .chatbot-ai-fab {
            width: 48px;
            height: 48px;
          }

          .chatbot-ai-panel {
            right: 0;
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

          .chatbot-ai-quick-actions {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 479px) {
          .chatbot-ai-root {
            right: max(8px, env(safe-area-inset-right, 0px));
            bottom: max(8px, env(safe-area-inset-bottom, 0px));
          }

          .chatbot-ai-panel {
            position: absolute;
            right: 0;
            bottom: 58px;
            width: min(100vw - 16px, 380px);
            height: min(74vh, calc(100dvh - 84px));
            border-radius: 12px;
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

        @keyframes chatbot-ai-bubble-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="chatbot-ai-root">
        {isOpen && (
          <section
            ref={(el: HTMLElement | null) => {
              panelRef.current = el;
            }}
            className={`chatbot-ai-panel ${fullscreenActive ? 'fullscreen' : ''} ${isResizing ? 'resizing' : ''}`}
            aria-label="AI Assistant chat panel"
            style={panelSize && !fullscreenActive && !isMobile ? { width: `${panelSize.width}px`, height: `${panelSize.height}px` } : undefined}
          >
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
                  {message.role === 'assistant' && <span className="chatbot-ai-avatar assistant" aria-hidden="true">AI</span>}
                  <div className={`chatbot-ai-bubble ${message.role}`}>{renderMessageContent(message, index)}</div>
                  {message.role === 'user' && <span className="chatbot-ai-avatar user" aria-hidden="true">{(username?.[0] ?? 'U').toUpperCase()}</span>}
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

            {!hasSentFirstMessage && (
              <div className="chatbot-ai-quick-actions" aria-label="Quick actions">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="chatbot-ai-quick-chip"
                    disabled={loading}
                    onClick={() => {
                      void sendMessage(action.prompt);
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}



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
              <textarea
                ref={inputRef}
                className="chatbot-ai-input"
                value={input}
                onChange={(e: any) => {
                  setInput(e.target.value);
                  const el = e.target as HTMLTextAreaElement;
                  el.style.height = 'auto';
                  el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
                }}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder={t('chatbot.input_placeholder')}
                disabled={loading}
                enterKeyHint="send"
                autoComplete="off"
                autoCorrect="off"
                rows={1}
              />
              <button
                className="chatbot-ai-send"
                type="submit"
                disabled={loading || !input.trim()}
              >
                {t('chatbot.send')}
              </button>
            </form>

            {!fullscreenActive && (
              <button
                type="button"
                className="chatbot-ai-resize-handle"
                aria-label="Resize chat window"
                onMouseDown={(e: any) => {
                  e.preventDefault();
                  startResize(e.clientX, e.clientY);
                }}
                onTouchStart={(e: any) => {
                  if (!e.touches[0]) return;
                  startResize(e.touches[0].clientX, e.touches[0].clientY);
                }}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                  <path d="M2 10L10 2" />
                  <path d="M2 7L7 2" />
                  <path d="M2 4L4 2" />
                </svg>
              </button>
            )}
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
