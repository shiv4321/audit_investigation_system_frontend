/**
 * Investigation Panel — Live agent status + results.
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { investigationApi } from '../services/api';
import RiskBadge from './RiskBadge';

const ACCENT = '#86BC25';

const AGENTS = [
  { key: 'supervisor', label: 'Supervisor Agent', desc: 'Planning investigation strategy' },
  { key: 'transaction', label: 'Transaction Agent', desc: 'Retrieving transaction data' },
  { key: 'policy', label: 'Policy Checker Agent', desc: 'Querying policy RAG database' },
  { key: 'anomaly', label: 'Anomaly Detection Agent', desc: 'Running rule + LLM detection' },
  { key: 'evidence', label: 'Evidence Collector Agent', desc: 'Gathering evidence corpus' },
  { key: 'risk', label: 'Risk Scoring Agent', desc: 'Computing weighted risk score' },
  { key: 'report', label: 'Report Generator Agent', desc: 'Compiling PDF + JSON report' },
];

function AgentStep({ agent, status }) {
  const icons = {
    pending: <span className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />,
    running: (
      <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
        <span className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: ACCENT }} />
      </span>
    ),
    done: (
      <span className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </span>
    ),
    error: (
      <span className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">✕</span>
    ),
  };

  return (
    <div className={`flex items-center gap-3 py-2.5 px-3 transition-all ${status === 'running' ? 'bg-yellow-50' : ''}`}>
      {icons[status]}
      <div className="flex-1">
        <p className={`text-xs font-medium ${status === 'done' ? 'text-gray-900' : status === 'running' ? 'text-gray-900' : 'text-gray-400'}`}>
          {agent.label}
        </p>
        <p className="text-xs text-gray-400">{agent.desc}</p>
      </div>
      {status === 'running' && (
        <span className="text-xs text-amber-500 animate-pulse">ACTIVE</span>
      )}
      {status === 'done' && (
        <span className="text-xs font-medium" style={{ color: ACCENT }}>DONE</span>
      )}
    </div>
  );
}

export default function InvestigationPanel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investigation, setInvestigation] = useState(null);
  const [agentStatuses, setAgentStatuses] = useState(() =>
    AGENTS.reduce((acc, a) => ({ ...acc, [a.key]: 'pending' }), {})
  );
  const [showResults, setShowResults] = useState(false);
  const pollingRef   = useRef(null);
  const animatingRef = useRef(false);   // prevents double-trigger
  const lastIdxRef   = useRef(0);       // tracks animation position
  const mountedAtRef = useRef(Date.now()); // time this component mounted

  const animateToEnd = (fromIdx) => {
    const STEP = 480;
    for (let i = fromIdx; i < AGENTS.length; i++) {
      const key = AGENTS[i].key;
      setTimeout(() => {
        setAgentStatuses(prev => ({ ...prev, [key]: 'done' }));
      }, (i - fromIdx) * STEP);
    }
    setTimeout(() => setShowResults(true), (AGENTS.length - fromIdx) * STEP + 150);
  };

  const fetchInvestigation = async () => {
    try {
      const res = await investigationApi.get(id);
      const data = res.data;
      setInvestigation(data);

      if (data.status === 'in_progress') {
        const elapsed = (Date.now() - new Date(data.triggered_at).getTime()) / 1000;
        const idx = Math.min(Math.floor(elapsed / 3), AGENTS.length - 2);
        lastIdxRef.current = idx;
        const newStatuses = {};
        AGENTS.forEach((a, i) => {
          if (i < idx) newStatuses[a.key] = 'done';
          else if (i === idx) newStatuses[a.key] = 'running';
          else newStatuses[a.key] = 'pending';
        });
        setAgentStatuses(newStatuses);

      } else if (data.status === 'completed' && !animatingRef.current) {
        animatingRef.current = true;
        clearInterval(pollingRef.current);

        // If the investigation completed well before this component mounted
        // (i.e. user came back from ReportViewer), skip animation entirely.
        const completedAt = data.completed_at ? new Date(data.completed_at).getTime() : 0;
        if (completedAt > 0 && completedAt < mountedAtRef.current - 2000) {
          setAgentStatuses(AGENTS.reduce((acc, a) => ({ ...acc, [a.key]: 'done' }), {}));
          setShowResults(true);
        } else {
          animateToEnd(lastIdxRef.current);
        }

      } else if (data.status === 'failed' && !animatingRef.current) {
        animatingRef.current = true;
        clearInterval(pollingRef.current);
        const errKey = AGENTS[lastIdxRef.current]?.key;
        if (errKey) setAgentStatuses(prev => ({ ...prev, [errKey]: 'error' }));
        setShowResults(true);
      }
    } catch (e) {
      clearInterval(pollingRef.current);
      setShowResults(true);
    }
  };

  useEffect(() => {
    fetchInvestigation();
    pollingRef.current = setInterval(fetchInvestigation, 2000);
    return () => clearInterval(pollingRef.current);
  }, [id]);

  const inv = investigation;
  const isComplete = inv?.status === 'completed';
  const steps = (() => {
    const trace = inv?.agent_trace;
    if (!trace) return [];
    if (typeof trace === 'string') {
      try { return JSON.parse(trace).steps || []; } catch { return []; }
    }
    return trace.steps || [];
  })();

  return (
    <div className="min-h-screen text-gray-900">
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-700 text-sm transition-colors">← Dashboard</button>
          <div className="w-px h-4 bg-gray-200" />
          <h1 className="text-sm font-bold uppercase tracking-widest text-gray-700">Investigation</h1>
          <span className="text-xs font-mono text-gray-400">{id?.slice(0, 8)}...</span>
          {inv && (
            <div className="ml-auto flex items-center gap-3">
              {!showResults && inv.status === 'in_progress' && (
                <span className="text-xs text-amber-500 animate-pulse">● RUNNING</span>
              )}
              {showResults && isComplete && <RiskBadge level={inv.risk_level} score={inv.risk_score ? parseFloat(inv.risk_score).toFixed(1) : undefined} />}
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Pipeline */}
          <div className="bg-white border border-gray-200 shadow-sm rounded">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Agent Pipeline</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {AGENTS.map((agent) => (
                <AgentStep key={agent.key} agent={agent} status={agentStatuses[agent.key]} />
              ))}
            </div>
            {!showResults && (
              <div className="px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center animate-pulse">Pipeline running...</p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-5">
            {!showResults && (
              <div className="bg-white border border-gray-200 shadow-sm rounded p-8 text-center">
                <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: ACCENT }} />
                <p className="text-gray-700 font-medium">Investigation in progress</p>
                <p className="text-gray-400 text-xs mt-1">Multi-agent pipeline executing...</p>
              </div>
            )}

            {showResults && inv?.status === 'failed' && (
              <div className="bg-red-50 border border-red-200 p-6 rounded">
                <p className="text-red-700 font-medium">Investigation Failed</p>
                <p className="text-red-500 text-sm mt-1">An error occurred during the pipeline. Check backend logs.</p>
              </div>
            )}

            {showResults && isComplete && inv && (
              <>
                {/* Risk Summary */}
                <div className="bg-white border border-gray-200 shadow-sm rounded p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-2">Risk Assessment</h2>
                      <div className="flex items-center gap-3">
                        <RiskBadge level={inv.risk_level} size="lg" />
                        <span className="text-3xl font-black text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
                          {parseFloat(inv.risk_score || 0).toFixed(1)}
                          <span className="text-gray-400 text-lg font-normal">/100</span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/reports/${id}`)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded transition-opacity hover:opacity-90"
                      style={{ backgroundColor: ACCENT }}
                    >
                      VIEW REPORT →
                    </button>
                  </div>
                  {inv.summary && (
                    <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">{inv.summary}</p>
                  )}
                </div>

                {/* Violations */}
                {inv.violations?.length > 0 && (
                  <div className="bg-white border border-gray-200 shadow-sm rounded">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Policy Violations</h2>
                      <span className="text-red-500 text-xs font-bold">{inv.violations.length} found</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {inv.violations.map((v, i) => {
                        const colors = { critical: '#C0392B', high: '#E67E22', medium: '#D4AC0D', low: '#27AE60' };
                        return (
                          <div key={i} className="px-5 py-4 flex gap-3">
                            <div className="w-1 flex-shrink-0 rounded" style={{ backgroundColor: colors[v.severity] || '#ccc' }} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-gray-400">{v.policy_id}</span>
                                <span className="text-xs text-gray-300">·</span>
                                <span className="text-xs text-gray-500">{v.policy_name}</span>
                                <span className="ml-auto text-xs font-bold" style={{ color: colors[v.severity] }}>
                                  {v.severity?.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-700">{v.violation_description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Evidence */}
                {inv.evidence?.length > 0 && (
                  <div className="bg-white border border-gray-200 shadow-sm rounded">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Evidence Items</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {inv.evidence.map((e, i) => (
                        <div key={i} className="px-5 py-4">
                          <p className="text-xs font-medium text-gray-900 mb-1">
                            {e.evidence_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-gray-500">{e.description}</p>
                          <p className="text-xs text-gray-400 mt-1">Source: {e.source}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agent Trace */}
                {steps.length > 0 && (
                  <div className="bg-white border border-gray-200 shadow-sm rounded">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Investigation Trace</h2>
                    </div>
                    <div className="p-5 space-y-1 max-h-64 overflow-y-auto">
                      {steps.map((step, i) => (
                        <p key={i} className="text-xs font-mono text-gray-500 leading-relaxed">
                          <span style={{ color: ACCENT }} className="mr-2">{String(i+1).padStart(2,'0')}</span>
                          {step}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
