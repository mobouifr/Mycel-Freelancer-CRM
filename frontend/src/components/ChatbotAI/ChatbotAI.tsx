import { useEffect, useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

type MessageRole = 'user' | 'assistant';

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
  const username = getUsername();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [crmContext, setCrmContext] = useState<string>('');

  useEffect(() => {
    const loadContext = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [clientsRes, projectsRes, invoicesRes] = await Promise.all([
          fetch('/api/clients', { headers }),
          fetch('/api/projects', { headers }),
          fetch('/api/invoices', { headers }),
        ]);

        const clientsData = await clientsRes.json();
        const projectsData = await projectsRes.json();
        const invoicesData = await invoicesRes.json();

        const clients = Array.isArray(clientsData) ? clientsData : (clientsData.data ?? []);
        const projects = Array.isArray(projectsData) ? projectsData : (projectsData.data ?? []);
        const invoices = Array.isArray(invoicesData) ? invoicesData : (invoicesData.data ?? []);

        const summary = [
          `Clients (${clients.length}): ${clients.map((c: any) => c.name).join(', ') || 'none'}`,
          `Projects (${projects.length}): ${projects.map((p: any) => `${p.title} [${p.status}]`).join(', ') || 'none'}`,
          `Invoices (${invoices.length}): ${invoices.map((i: any) => `${i.invoiceNumber ?? `#${i.id}`} ${i.total} [${i.status}]`).join(', ') || 'none'}`,
        ].join('\n');

        setCrmContext(summary);
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
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const prompt = {
      role: 'system' as const,
      content: `You are a smart assistant for ${username} inside their freelancer CRM. Always address them as ${username}. Be concise and practical.\n\nHere is their current CRM data:\n${crmContext}`,
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
            { role: 'user', content: input }
          ],
          max_tokens: 1024,
          stream: false
        })
      });

      const data = await response.json();
      reply = data.choices?.[0]?.message?.content ?? 'Sorry, no response received.';
    } catch {
      reply = 'Something went wrong. Please try again.';
    }

    setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
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

        .chatbot-ai-close:hover {
          border-color: var(--border-h);
          color: var(--white);
          background: var(--surface-2);
        }

        .chatbot-ai-messages {
          flex: 1;
          overflow-y: auto;
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
          font-size: 11px;
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
          <section className="chatbot-ai-panel" aria-label="AI Assistant chat panel">
            <header className="chatbot-ai-header">
              <h3 className="chatbot-ai-title">AI Assistant</h3>
              <button
                className="chatbot-ai-close"
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </header>

            <div className="chatbot-ai-messages">
              {messages.length === 0 && !loading && (
                <p className="chatbot-ai-empty">
                  Ask anything to get started.
                </p>
              )}

              {messages.map((message, index) => (
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
            </div>

            <form
              className="chatbot-ai-input-wrap"
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
            >
              <input
                className="chatbot-ai-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
              />
              <button
                className="chatbot-ai-send"
                type="submit"
                disabled={loading || !input.trim()}
              >
                Send
              </button>
            </form>
          </section>
        )}

        <button className="chatbot-ai-fab" type="button" onClick={() => setIsOpen((prev) => !prev)} aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}>
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
