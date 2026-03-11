import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TransactionTable from './components/TransactionTable';
import InvestigationPanel from './components/InvestigationPanel';
import ReportViewer from './components/ReportViewer';
import BackgroundGlow from './components/BackgroundGlow';

export default function App() {
  return (
    <BrowserRouter>
      <BackgroundGlow />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionTable />} />
          <Route path="/transactions/:id" element={<TransactionTable />} />
          <Route path="/investigate/:id" element={<InvestigationPanel />} />
          <Route path="/reports/:id" element={<ReportViewer />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
