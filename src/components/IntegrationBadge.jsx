/**
 * Shows connected platform badges.
 */
export default function IntegrationBadge({ name, active }) {
  const badges = {
    deloitte_omnia: { label: 'Deloitte Omnia', icon: '◆', color: active ? '#86BC25' : '#6b7280' },
    salesforce: { label: 'Salesforce', icon: '☁', color: active ? '#00A1E0' : '#6b7280' },
    servicenow: { label: 'ServiceNow', icon: '⚙', color: active ? '#62D84E' : '#6b7280' },
  };

  const cfg = badges[name] || { label: name, icon: '•', color: active ? '#86BC25' : '#6b7280' };

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-sm border font-medium"
      style={{
        borderColor: active ? cfg.color : '#d1d5db',
        color: active ? cfg.color : '#fff',
        backgroundColor: active ? `${cfg.color}15` : '#6b7280',
      }}
    >
      <span style={{ fontSize: '10px' }}>{cfg.icon}</span>
      {cfg.label}
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: active ? cfg.color : '#d1d5db' }}
      />
    </span>
  );
}
