/* ─────────────────────────────────────────────
   TABLE — Minimal data table with hover rows
   Copied from my-app for consistent layout
───────────────────────────────────────────── */

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data yet',
}: TableProps<T>) {
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: columns.map((c) => c.width || '1fr').join(' '),
          padding: '12px 24px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {columns.map((col) => (
          <span
            key={col.key}
            style={{
              fontFamily: 'var(--font-m)',
              fontSize: 9,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}
          >
            {col.header}
          </span>
        ))}
      </div>

      {/* Rows */}
      {data.length === 0 ? (
        <div
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            color: 'var(--text-dim)',
          }}
        >
          {emptyMessage}
        </div>
      ) : (
        data.map((row, i) => (
          <div
            key={i}
            onClick={() => onRowClick?.(row)}
            style={{
              display: 'grid',
              gridTemplateColumns: columns.map((c) => c.width || '1fr').join(' '),
              padding: '13px 24px',
              borderBottom:
                i < data.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              alignItems: 'center',
              transition: 'background .15s',
              cursor: onRowClick ? 'pointer' : 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            {columns.map((col) => (
              <span key={col.key}>
                {col.render ? (
                  col.render(row, i)
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--font-m)',
                      fontSize: 12,
                      color: 'var(--text)',
                    }}
                  >
                    {String(row[col.key] ?? '')}
                  </span>
                )}
              </span>
            ))}
          </div>
        ))
      )}
    </div>
  );
}


