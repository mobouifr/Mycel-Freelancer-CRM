import { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface HealthResponse {
    status: string;
    timestamp?: string;
    services: {
        backend: string;
        database: string;
    };
}

interface Client {
    id: string;
    name: string;
    email: string | null;
    company: string | null;
}

interface ClientsResponse {
    data: Client[];
    count: number;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
    // Health state
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [healthLoading, setHealthLoading] = useState(true);
    const [healthError, setHealthError] = useState<string | null>(null);

    // Clients state
    const [clients, setClients] = useState<Client[]>([]);
    const [clientCount, setClientCount] = useState(0);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [clientsError, setClientsError] = useState<string | null>(null);

    // -------------------------------------------------------------------------
    // Fetch health
    // -------------------------------------------------------------------------
    useEffect(() => {
        fetch('/api/health')
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data: HealthResponse) => {
                setHealth(data);
                setHealthLoading(false);
            })
            .catch((err) => {
                setHealthError(err.message);
                setHealthLoading(false);
            });
    }, []);

    // -------------------------------------------------------------------------
    // Fetch clients
    // -------------------------------------------------------------------------
    useEffect(() => {
        fetch('/api/clients')
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data: ClientsResponse) => {
                setClients(data.data);
                setClientCount(data.count);
                setClientsLoading(false);
            })
            .catch((err) => {
                setClientsError(err.message);
                setClientsLoading(false);
            });
    }, []);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div className="container">
            <header>
                <h1>Freelancer CRM</h1>
                <p className="subtitle">System Verification Dashboard</p>
            </header>

            {/* ─── System Status ─────────────────────────────────── */}
            <section className="card">
                <h2>System Status</h2>

                {healthLoading && <p className="loading">Checking services…</p>}

                {healthError && (
                    <div className="error">
                        <span className="indicator offline">✘</span>
                        Unable to reach backend: {healthError}
                    </div>
                )}

                {health && (
                    <div className="status-grid">
                        <StatusRow
                            label="Backend"
                            status={health.services.backend}
                        />
                        <StatusRow
                            label="Database"
                            status={health.services.database}
                        />
                        {health.timestamp && (
                            <p className="timestamp">
                                Checked at: {new Date(health.timestamp).toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                )}
            </section>

            {/* ─── Clients ───────────────────────────────────────── */}
            <section className="card">
                <h2>Clients</h2>

                {/* SECURITY FIX: Show which user's data is being displayed */}
                <div className="user-badge">
                    Viewing as: <strong>demo@crm.com</strong>
                </div>

                {clientsLoading && <p className="loading">Loading clients…</p>}

                {clientsError && (
                    <div className="error">
                        <span className="indicator offline">✘</span>
                        Failed to load clients: {clientsError}
                    </div>
                )}

                {!clientsLoading && !clientsError && (
                    <>
                        <p className="count">{clientCount} client{clientCount !== 1 ? 's' : ''} found</p>

                        {clients.length === 0 ? (
                            <p className="empty">No clients yet. Run <code>make db-seed</code> to add test data.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Company</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((c) => (
                                        <tr key={c.id}>
                                            <td>{c.name}</td>
                                            <td>{c.email ?? '—'}</td>
                                            <td>{c.company ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}

// ---------------------------------------------------------------------------
// StatusRow component
// ---------------------------------------------------------------------------
function StatusRow({ label, status }: { label: string; status: string }) {
    const online = status === 'online';
    return (
        <div className="status-row">
            <span className={`indicator ${online ? 'online' : 'offline'}`}>
                {online ? '✔' : '✘'}
            </span>
            <span className="label">{label}:</span>
            <span className={online ? 'online' : 'offline'}>{status}</span>
        </div>
    );
}
