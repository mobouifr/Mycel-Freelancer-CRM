export default function CalendarWeekLaneView() {
  return (
    <div style={{ display: 'flex', gap: 10, width: '100%', overflowX: 'auto', padding: 16 }}>
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
        <div key={day} style={{
          flex: '1 0 120px', minHeight: 300,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 12,
        }}>
          <h4 style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-mid)', borderBottom: '1px solid var(--border-h)', paddingBottom: 6, marginBottom: 10 }}>
            {day}
          </h4>
          <div style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)' }}>
            No events
          </div>
        </div>
      ))}
    </div>
  );
}
