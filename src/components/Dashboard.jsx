/**
 * Main Dashboard — Audit Intelligence.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, integrationApi } from '../services/api';
import RiskBadge from './RiskBadge';
import IntegrationBadge from './IntegrationBadge';

const ACCENT = '#86BC25';

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white border border-gray-200 p-5 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: accent || ACCENT }} />
      <p className="text-gray-500 text-xs uppercase tracking-widest font-medium mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>{value}</p>
      {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [integrations, setIntegrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      dashboardApi.stats(),
      integrationApi.status(),
    ]).then(([statsRes, intRes]) => {
      setStats(statsRes.data);
      setIntegrations(intRes.data);
    }).catch(() => {
      setError('Unable to connect to audit backend. Ensure the API server is running.');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: ACCENT }} />
        <p className="text-gray-500 text-sm tracking-widest">LOADING</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-gray-900">
      {/* Top nav */}
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center rounded" style={{ backgroundColor: ACCENT }}>
              <span className="text-white font-black text-xs">AI</span>
            </div>
            <span className="font-bold text-sm tracking-wide text-gray-900">Audit Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {Object.entries(integrations).map(([name, active]) => (
                <IntegrationBadge key={name} name={name} active={active} />
              ))}
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <span className="text-gray-400 text-xs">v1.0.0</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Agentic Audit Intelligence
            </h1>
            <p className="text-gray-500 text-sm mt-1">AI-powered financial transaction investigation system</p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 rounded"
            style={{ backgroundColor: ACCENT }}
          >
            VIEW ALL TRANSACTIONS →
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-600 text-sm rounded">
            ⚠ {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard label="Flagged Transactions" value={stats?.total_flagged ?? '—'} sub="Pending investigation" accent={ACCENT} />
          <StatCard label="High / Critical" value={stats?.high_critical_count ?? '—'} sub="Require immediate action" accent="#C0392B" />
          <StatCard label="Investigations Today" value={stats?.investigations_today ?? '—'} sub="Pipeline executions" accent="#E67E22" />
          <StatCard label="Avg Risk Score" value={stats?.avg_risk_score ? `${stats.avg_risk_score}` : '—'} sub="Out of 100" accent={ACCENT} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Investigations */}
          <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700">Recent Investigations</h2>
              <span className="text-xs text-gray-400">Auto-refreshing</span>
            </div>
            <div className="divide-y divide-gray-100">
              {stats?.recent_investigations?.length === 0 && (
                <p className="px-5 py-8 text-gray-400 text-sm text-center">No investigations yet. Trigger one from the transactions view.</p>
              )}
              {stats?.recent_investigations?.map((inv) => (
                <div
                  key={inv.id}
                  className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/investigate/${inv.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <RiskBadge level={inv.risk_level} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{inv.txn_ref}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {inv.vendor_name} · ${parseFloat(inv.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-500">{inv.risk_score ? `${parseFloat(inv.risk_score).toFixed(1)}/100` : '—'}</p>
                    <p className="text-xs mt-0.5" style={{ color: inv.status === 'completed' ? ACCENT : inv.status === 'failed' ? '#e74c3c' : '#f39c12' }}>
                      {inv.status?.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Violations + Platform Integrations */}
          <div className="bg-white border border-gray-200 shadow-sm rounded">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700">Top Policy Violations</h2>
            </div>
            <div className="p-5 space-y-3">
              {stats?.top_violation_types?.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No violations recorded yet.</p>
              )}
              {stats?.top_violation_types?.map((v, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 truncate">{v.policy_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-gray-100 rounded">
                        <div
                          className="h-full rounded"
                          style={{
                            width: `${Math.min((v.count / (stats.top_violation_types[0]?.count || 1)) * 100, 100)}%`,
                            backgroundColor: { critical: '#C0392B', high: '#E67E22', medium: '#F1C40F', low: '#27AE60' }[v.severity] || ACCENT
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-6">{v.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Integration status panel — keep Deloitte Omnia / Salesforce / ServiceNow here */}
            <div className="px-5 pt-2 pb-5 border-t border-gray-100 mt-2">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Platform Integrations</p>
              <div className="space-y-2">
                {Object.entries(integrations).map(([name, active]) => (
                  <div key={name} className="flex items-center justify-between">
                    <IntegrationBadge name={name} active={active} />
                    <span className={`text-xs ${active ? 'text-green-500' : 'text-gray-400'}`}>
                      {active ? 'CONNECTED' : 'INACTIVE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 mt-16 py-4 text-center">
        <p className="text-gray-400 text-xs tracking-wide">
          Audit Investigation System v1.0 · Powered by Agentic AI
        </p>
      </footer>
    </div>
  );
}
