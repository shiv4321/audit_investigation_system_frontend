/**
 * Flagged transactions table with filters.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionApi } from '../services/api';
import RiskBadge from './RiskBadge';

const ACCENT = '#86BC25';

const STATUS_COLORS = {
  flagged: '#E67E22',
  under_review: '#3498DB',
  resolved: '#27AE60',
  pending: '#95A5A6',
  approved: '#27AE60',
};

export default function TransactionTable() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [triggeringId, setTriggeringId] = useState(null);
  const navigate = useNavigate();
  const LIMIT = 15;

  const fetchTxns = async () => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, offset };
      if (filter) params.status = filter;
      const res = await transactionApi.list(params);
      setTransactions(res.data.transactions || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTxns(); }, [filter, offset]);

  const handleInvestigate = async (txnId, e) => {
    e.stopPropagation();
    setTriggeringId(txnId);
    try {
      const { investigationApi } = await import('../services/api');
      const res = await investigationApi.trigger(txnId);
      navigate(`/investigate/${res.data.investigation_id}`);
    } catch (err) {
      alert(`Failed to trigger investigation: ${err.response?.data?.detail || err.message}`);
    } finally {
      setTriggeringId(null);
    }
  };

  return (
    <div className="min-h-screen text-gray-900">
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-700 text-sm transition-colors">← Dashboard</button>
          <div className="w-px h-4 bg-gray-200" />
          <h1 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Flagged Transactions</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {['', 'flagged', 'under_review', 'resolved'].map((s) => (
              <button
                key={s}
                onClick={() => { setFilter(s); setOffset(0); }}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-all ${
                  filter === s
                    ? 'text-white'
                    : 'text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-700 bg-white'
                }`}
                style={filter === s ? { backgroundColor: ACCENT } : {}}
              >
                {s || 'ALL ACTIVE'}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">{total} transactions</span>
        </div>

        {/* Table */}
        <div className="border border-gray-200 overflow-hidden rounded shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Transaction ID', 'Vendor', 'Amount', 'Department', 'Status', 'Flag Reason', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-widest font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Loading transactions...</td></tr>
              )}
              {!loading && transactions.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No flagged transactions found.</td></tr>
              )}
              {transactions.map((txn) => (
                <tr
                  key={txn.transaction_id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/transactions/${txn.transaction_id}`)}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-600">{txn.transaction_id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 text-xs font-medium">{txn.vendor_name}</p>
                    <p className="text-gray-400 text-xs">{txn.country}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-gray-900 text-sm">
                      ${parseFloat(txn.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{txn.department || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-sm"
                      style={{
                        color: STATUS_COLORS[txn.status] || '#999',
                        backgroundColor: `${STATUS_COLORS[txn.status]}18` || '#f5f5f5',
                        border: `1px solid ${STATUS_COLORS[txn.status]}40` || 'transparent',
                      }}
                    >
                      {txn.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-400 text-xs max-w-xs truncate" title={txn.flag_reason}>
                      {txn.flag_reason || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => handleInvestigate(txn.transaction_id, e)}
                      disabled={triggeringId === txn.transaction_id}
                      className="text-xs font-bold px-3 py-1.5 rounded transition-all disabled:opacity-50 text-white"
                      style={{ backgroundColor: ACCENT }}
                    >
                      {triggeringId === txn.transaction_id ? '...' : 'INVESTIGATE'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              disabled={offset === 0}
              className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-gray-400">
              {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}
            </span>
            <button
              onClick={() => setOffset(offset + LIMIT)}
              disabled={offset + LIMIT >= total}
              className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
