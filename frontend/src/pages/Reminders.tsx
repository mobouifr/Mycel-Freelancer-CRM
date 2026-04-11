import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/useIsMobile';
import CalendarView from '../components/reminders/CalendarView';

export default function Reminders() {
  const { t } = useTranslation();
  const isMobile = useIsMobile(1100);

  return (
    <div style={{
      animation: 'fadeUp .3s var(--ease) both',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'flex-end',
        marginBottom: 16, flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 8 : 0, flexShrink: 0,
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-d)', fontWeight: 500, fontSize: 24,
            color: 'var(--text)', letterSpacing: '.04em', lineHeight: 1.3, marginBottom: 2,
          }}>
            {t('reminders.title')}
          </h2>
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '.04em',
          }}>
            {t('reminders.subtitle')}
          </p>
        </div>
      </div>

      {/* Main layout */}
      <div style={{
        flex: 1, display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 12 : 16, overflow: 'hidden',
      }}>
        {/* Full-width Calendar Container */}
        <div style={{
          flex: 1,
          minWidth: 0,
          height: isMobile ? 500 : '100%',
          display: 'flex', flexDirection: 'column',
          border: '1px solid var(--border)', borderRadius: 12,
          background: 'var(--surface)',
          overflow: 'hidden',
        }}>
          <CalendarView />
        </div>
      </div>
    </div>
  );
}
