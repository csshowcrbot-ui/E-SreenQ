import React, { useRef, useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import { X, Eraser, Check, AlertCircle, ShieldCheck } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (base64Png: string, signedAt: string) => void;
  patientName: string;
  idCardNo: string;
  title?: string;
  consentType?: 'GASTRIC' | 'ORAL' | 'FECAL' | 'CERVICAL' | 'LUNG' | 'BREAST';
  role?: 'PATIENT' | 'DOCTOR';
  doctorName?: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  idCardNo,
  title = '個案同意書簽署與確認',
  consentType = 'GASTRIC',
  role = 'PATIENT',
  doctorName = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      const now = new Date();
      setCurrentTime(now.toLocaleString('zh-TW', { hour12: false }));

      // Setup canvas
      setTimeout(() => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.scale(ratio, ratio);

          if (signaturePadRef.current) {
            signaturePadRef.current.off();
          }

          signaturePadRef.current = new SignaturePad(canvas, {
            minWidth: 1.5,
            maxWidth: 3.5,
            penColor: role === 'DOCTOR' ? '#1E3A8A' : '#0F172A',
            backgroundColor: 'rgba(255, 255, 255, 0)'
          });
        }
      }, 100);
    }
  }, [isOpen, role]);

  if (!isOpen) return null;

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setErrorMsg('');
    }
  };

  const handleConfirm = () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      setErrorMsg('請在下方白色方框內完整簽署全名');
      return;
    }

    // Stroke validation (>10 points)
    const strokes = signaturePadRef.current.toData();
    let totalPoints = 0;
    strokes.forEach(s => (totalPoints += s.points.length));

    if (totalPoints < 10) {
      setErrorMsg('簽名筆劃不完整或過短，請完整正楷書寫全名');
      return;
    }

    const base64 = signaturePadRef.current.toDataURL('image/png');
    const signedAt = new Date().toISOString();
    onConfirm(base64, signedAt);
  };

  const maskedId = idCardNo
    ? idCardNo.length >= 8
      ? idCardNo.substring(0, 4) + '***' + idCardNo.substring(idCardNo.length - 3)
      : idCardNo
    : 'A123***789';

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title">
            <ShieldCheck className="text-primary" size={24} color="#1976D2" />
            <span>{title}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="關閉">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Legal Consent Disclosure Box */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              【法定告知事項與受檢者同意書】
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.6' }}>
              {consentType === 'GASTRIC' ? (
                <>
                  本人同意接受以<strong>「糞便抗原檢測胃幽門螺旋桿菌檢查」</strong>服務，相關檢查紀錄與個人健康資料將作為衛生主管機關政策評估或院所個案追蹤健康管理使用，並確認以上所填之個人基本資料、病史與生活型態皆正確無誤。
                </>
              ) : consentType === 'ORAL' ? (
                <>
                  本人同意接受<strong>「國民健康署口腔黏膜檢查服務」</strong>，相關檢查結果及菸檳習慣資料將作為衛生單位政策評估與個案追蹤管理使用，並確認以上資料與自覺症狀正確無誤。
                </>
              ) : consentType === 'FECAL' ? (
                <>
                  本人同意接受<strong>「國民健康署定量免疫法糞便潛血檢查服務」</strong>，本表資料將作為衛生及學術單位進行個案追蹤關懷及健康管理、資格檢核、比對連結、統計分析、政策評估及其他相關目的使用，確認以上資料正確無誤。
                </>
              ) : consentType === 'CERVICAL' ? (
                <>
                  本人同意接受<strong>「國民健康署女性子宮頸抹片檢查服務」</strong>，本表資料將會作為衛生及學術單位進行個案追蹤關懷及健康管理、資格檢核、比對連結、統計分析、政策評估及其他相關目的使用，確認以上資料正確無誤。
                </>
              ) : consentType === 'LUNG' ? (
                <>
                  本人同意接受<strong>「國民健康署胸部低劑量電腦斷層檢查(LDCT)服務」</strong>【附件一之三、四】，已瞭解檢查優缺點與限制，同意將相關資料與歷次胸部電腦斷層影像上傳供跨院查詢比對、追蹤管理與政策評估使用。
                </>
              ) : (
                <>
                  本人同意接受<strong>「健康署婦女乳房 X 光攝影檢查服務」</strong>【附表四之四】，已充分瞭解乳房X光攝影檢查可早期發現乳癌，但仍約有15%無法有效偵測，並同意將相關資料及歷次篩檢報告影像供醫事人員查詢比對、追蹤關懷與政策評估使用。
                </>
              )}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #CBD5E1', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748B' }}>受檢者：</span>
                <strong style={{ color: '#0F172A' }}>{patientName || '王大明'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>身分證號：</span>
                <strong style={{ color: '#0F172A' }}>{maskedId}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>簽署時間：</span>
                <span style={{ color: '#0F172A' }}>{currentTime}</span>
              </div>
            </div>

            {role === 'DOCTOR' && (
              <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#1E3A8A', fontWeight: '600' }}>
                檢查醫師：{doctorName || '診間主治醫師'} (電子診斷簽章認證)
              </div>
            )}
          </div>

          {/* Canvas area */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '0.925rem', fontWeight: '600', color: '#1E293B', display: 'block', marginBottom: '6px' }}>
              請於下方白色方框內正楷簽名（支援觸控筆與手指書寫）：
            </label>
            <div className="signature-canvas-container" style={{ height: '180px' }}>
              <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>
          </div>

          {/* Toolbar */}
          <div className="signature-toolbar">
            <span style={{ color: '#64748B', fontSize: '0.825rem' }}>
              * 系統已啟用 Bezier 曲線防毛邊平滑處理
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                <Eraser size={15} />
                清除重簽
              </button>
            </div>
          </div>

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D32F2F', marginTop: '8px', fontSize: '0.875rem' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            放棄返回
          </button>
          <button type="button" className="btn btn-primary" onClick={handleConfirm}>
            <Check size={18} />
            確認並加密送出問卷
          </button>
        </div>
      </div>
    </div>
  );
};
