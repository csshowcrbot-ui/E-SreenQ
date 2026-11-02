import { useState } from 'react';
import { GastricSurveyView } from './views/GastricSurveyView';
import { OralSurveyView } from './views/OralSurveyView';
import { FecalSurveyView } from './views/FecalSurveyView';
import { CervicalSurveyView } from './views/CervicalSurveyView';
import { LungSurveyView } from './views/LungSurveyView';
import { BreastSurveyView } from './views/BreastSurveyView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { A4PrintModal } from './components/A4PrintModal';
import type { Questionnaire } from './types';
import {
  FileText,
  Stethoscope,
  ClipboardList,
  Hospital,
  TestTube2,
  Heart,
  Wind,
  Maximize,
  Minimize
} from 'lucide-react';


export function App() {
  const [currentPortal, setCurrentPortal] = useState<'GASTRIC' | 'ORAL' | 'FECAL' | 'CERVICAL' | 'LUNG' | 'BREAST' | 'ADMIN'>('GASTRIC');
  const [printableItem, setPrintableItem] = useState<Questionnaire | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {});
      }
    }
  };

  const handleOpenPrint = (q: any) => {
    setPrintableItem(q);
    setIsPrintModalOpen(true);
  };

  return (
    <div>
      {/* Top Navigation Header */}
      <header className="app-header">
        <div className="header-container">
          {/* Hospital & System Branding */}
          <div className="brand-section">
            <div className="brand-logo-badge">
              <Hospital size={26} />
            </div>
            <div>
              <div className="brand-title">
                E-ScreenQ 癌症篩檢問卷個管系統
              </div>
              <div className="brand-subtitle">
                竹山秀傳醫院 ‧ 衛生福利部國民健康署公版紀錄表
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="nav-tabs">
            <button
              type="button"
              className={`nav-tab-btn ${currentPortal === 'GASTRIC' ? 'active' : ''}`}
              onClick={() => setCurrentPortal('GASTRIC')}
            >
              <FileText size={17} />
              胃幽門桿菌篩檢問卷 (平板端)
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${currentPortal === 'ORAL' ? 'active' : ''}`}
              onClick={() => setCurrentPortal('ORAL')}
            >
              <Stethoscope size={17} />
              口腔黏膜檢查表 (受檢者自填)
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${currentPortal === 'FECAL' ? 'active' : ''}`}
              onClick={() => setCurrentPortal('FECAL')}
            >
              <TestTube2 size={17} />
              糞便潛血檢查問卷 (平板端)
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${currentPortal === 'CERVICAL' ? 'active' : ''}`}
              onClick={() => setCurrentPortal('CERVICAL')}
            >
              <Heart size={17} />
              子宮頸抹片問卷 (平板端)
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${currentPortal === 'LUNG' ? 'active' : ''}`}
              onClick={() => setCurrentPortal('LUNG')}
            >
              <Wind size={17} />
              肺癌低劑量CT問卷 (平板端)
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${currentPortal === 'BREAST' ? 'active' : ''}`}
              onClick={() => setCurrentPortal('BREAST')}
            >
              <Heart size={17} />
              乳房X光攝影問卷 (平板端)
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${currentPortal === 'ADMIN' ? 'active' : ''}`}
              onClick={() => setCurrentPortal('ADMIN')}
            >
              <ClipboardList size={17} />
              個管師與醫師後台 (Desktop)
            </button>
          </nav>

          {/* Right actions: System Status badge & Fullscreen toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="header-status-badge">
              <span className="status-dot" />
              <span>API TLS 1.3 正常連線</span>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={toggleFullscreen}
              title={isFullscreen ? '退出全螢幕' : '全版/全螢幕顯示 (Kiosk Mode)'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.825rem',
                borderColor: '#CBD5E1',
                background: isFullscreen ? '#F1F5F9' : '#FFFFFF',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
              <span>{isFullscreen ? '視窗模式' : '全螢幕模式'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="main-content">
        {currentPortal === 'GASTRIC' && (
          <GastricSurveyView onOpenPrintModal={handleOpenPrint} />
        )}

        {currentPortal === 'ORAL' && (
          <OralSurveyView
            onOpenPrintModal={handleOpenPrint}
            onNavigateToAdmin={() => setCurrentPortal('ADMIN')}
          />
        )}

        {currentPortal === 'FECAL' && (
          <FecalSurveyView
            onOpenPrintModal={handleOpenPrint}
            onNavigateToAdmin={() => setCurrentPortal('ADMIN')}
          />
        )}

        {currentPortal === 'CERVICAL' && (
          <CervicalSurveyView
            onOpenPrintModal={handleOpenPrint}
            onNavigateToAdmin={() => setCurrentPortal('ADMIN')}
          />
        )}

        {currentPortal === 'LUNG' && (
          <LungSurveyView
            onOpenPrintModal={handleOpenPrint}
            onNavigateToAdmin={() => setCurrentPortal('ADMIN')}
          />
        )}

        {currentPortal === 'BREAST' && (
          <BreastSurveyView
            onOpenPrintModal={handleOpenPrint}
            onNavigateToAdmin={() => setCurrentPortal('ADMIN')}
          />
        )}

        {currentPortal === 'ADMIN' && (
          <AdminDashboardView onOpenPrintModal={handleOpenPrint} />
        )}
      </main>

      {/* Global 1:1 A4 Print Modal */}
      <A4PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        questionnaire={printableItem}
      />
    </div>
  );
}

export default App;
