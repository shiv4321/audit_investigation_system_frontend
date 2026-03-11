/**
 * Report Viewer — PDF preview + metadata panel.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { investigationApi } from '../services/api';
import RiskBadge from './RiskBadge';
import IntegrationBadge from './IntegrationBadge';

const ACCENT = '#86BC25';

export default function ReportViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investigation, setInvestigation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    investigationApi.get(id).then(res => {
      setInvestigation(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const downloadUrl = investigationApi.downloadReport(id);
  const inv = investigation;

  return (
    <div className="min-h-screen text-gray-900">
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <button onClick={() => navigate(`/investigate/${id}`)} className="text-gray-400 hover:text-gray-700 text-sm transition-colors">← Investigation</button>
          <div className="w-px h-4 bg-gray-200" />
          <h1 className="text-sm font-bold uppercase tracking-widest text-gray-700">Audit Report</h1>
          <span className="text-xs font-mono text-gray-400">{id?.slice(0, 8)}...</span>
          {inv && (
            <div className="ml-auto">
              <RiskBadge level={inv.risk_level} score={inv.risk_score ? parseFloat(inv.risk_score).toFixed(1) : undefined} />
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: ACCENT }} />
          </div>
        )}

        {!loading && inv && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* PDF Viewer */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-200 shadow-sm rounded overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">PDF Report</h2>
                  <a
                    href={downloadUrl}
                    download
                    className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white rounded transition-opacity hover:opacity-90"
                    style={{ backgroundColor: ACCENT }}
                  >
                    ↓ DOWNLOAD PDF
                  </a>
                </div>
                {inv.report_path ? (
                  <iframe
                    src={downloadUrl}
                    className="w-full"
                    style={{ height: '80vh' }}
                    title="Audit Report PDF"
                  />
                ) : (
                  <div className="flex items-center justify-center py-20 text-gray-400">
                    <div className="text-center">
                      <p className="text-4xl mb-4">📋</p>
                      <p className="text-sm">PDF report not yet generated</p>
                      <p className="text-xs text-gray-400 mt-1">Complete the investigation first</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Panel */}
            <div className="space-y-4">
              {/* Risk Card */}
              <div className="bg-white border border-gray-200 shadow-sm rounded p-5">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Risk Assessment</p>
                <div className="flex items-center gap-3 mb-3">
                  <RiskBadge level={inv.risk_level} size="lg" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Score</span>
                    <span className="text-gray-900 font-mono">{parseFloat(inv.risk_score || 0).toFixed(1)}/100</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded">
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${Math.min(parseFloat(inv.risk_score || 0), 100)}%`,
                        backgroundColor: { critical: '#C0392B', high: '#E67E22', medium: '#F1C40F', low: '#27AE60' }[inv.risk_level] || ACCENT,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white border border-gray-200 shadow-sm rounded p-5 space-y-3">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Findings</p>
                {[
                  ['Policy Violations', inv.violations?.length || 0],
                  ['Evidence Items', inv.evidence?.length || 0],
                  ['Status', inv.status?.toUpperCase()],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-400">{k}</span>
                    <span className="text-gray-900 font-medium">{v}</span>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div className="bg-white border border-gray-200 shadow-sm rounded p-5 space-y-3">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Timeline</p>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-400">Triggered</span>
                    <p className="text-gray-700 mt-0.5">{new Date(inv.triggered_at).toLocaleString()}</p>
                  </div>
                  {inv.completed_at && (
                    <div>
                      <span className="text-gray-400">Completed</span>
                      <p className="text-gray-700 mt-0.5">{new Date(inv.completed_at).toLocaleString()}</p>
                    </div>
                  )}
                  {inv.triggered_at && inv.completed_at && (
                    <div>
                      <span className="text-gray-400">Duration</span>
                      <p className="text-gray-700 mt-0.5">
                        {Math.round((new Date(inv.completed_at) - new Date(inv.triggered_at)) / 1000)}s
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Integration badges — Deloitte Omnia / Salesforce / ServiceNow kept here */}
              <div className="bg-white border border-gray-200 shadow-sm rounded p-5">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Platforms</p>
                <div className="space-y-2">
                  {['deloitte_omnia', 'salesforce', 'servicenow'].map(name => (
                    <IntegrationBadge key={name} name={name} active={false} />
                  ))}
                </div>
              </div>

              {/* Download */}
              <a
                href={downloadUrl}
                download
                className="block w-full text-center py-3 text-sm font-bold text-white rounded transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                ↓ DOWNLOAD FULL REPORT
              </a>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 mt-12 py-4 text-center">
        <p className="text-gray-400 text-xs">Audit Investigation System v1.0 · Powered by Agentic AI</p>
      </footer>
    </div>
  );
}
