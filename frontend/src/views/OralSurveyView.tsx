import React, { useState } from 'react';
import type { Patient, OralScreening } from '../types';
import { SignatureModal } from '../components/SignatureModal';
import { submitOralForm } from '../services/api';
import {
  User,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Printer,
  ClipboardList,
  Clock,
  ArrowRight
} from 'lucide-react';

interface OralSurveyViewProps {
  onOpenPrintModal?: (q: any) => void;
  onNavigateToAdmin?: () => void;
}

export const OralSurveyView: React.FC<OralSurveyViewProps> = ({
  onOpenPrintModal,
  onNavigateToAdmin
}) => {
  const [isPatientSignModalOpen, setIsPatientSignModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<any | null>(null);

  // Patient Signature
  const [patientSignature, setPatientSignature] = useState<{ base64Png: string; signedAt: string } | null>(null);

  // Patient State
  const [patient, setPatient] = useState<Patient>({
    chart_no: '',
    id_card_no: '',
    name: '',
    gender: 'M',
    birth_date: '1976-03-20',
    is_indigenous: false,
    indigenous_tribe: '',
    phone: '',
    mobile: '',
    zip_code: '557',
    city: '南投縣',
    district: '竹山鎮',
    village: '',
    road: '',
    section_lane: '',
    education_level: '高中(職)',
    occupation_status: '有',
    marriage_status: '已婚'
  });

  // Oral Screening State (Patient / Screening station inputs only)
  const [oral, setOral] = useState<OralScreening>({
    screening_location: '醫療院所',
    doctor_dept: '耳鼻喉科',
    screening_unit: '竹山秀傳醫療社團法人竹山秀傳醫院',
    screening_unit_code: '0938040012',
    doctor_name: '',
    doctor_license_no: '',
    betel_nut_tier: 1, // 已戒
    smoking_tier: 4, // >10年，<20支
    self_reported_symptoms: true,
    inspection_result: 'PENDING',
    referral_reason_code: '00',
    referral_reasons_selected: [],
    other_reason_text: '',
    lesion_locations: [],
    referral_hospital: '',
    referral_doctor: '',
    referral_phone: '',
    followup: null
  });

  // Demo auto fill helper
  const handleAutoFill = () => {
    setPatient({
      chart_no: '00389144',
      id_card_no: 'B120987654',
      name: '陳小華',
      gender: 'M',
      birth_date: '1978-04-12',
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '04-23592525',
      mobile: '0922888999',
      zip_code: '557',
      city: '南投縣',
      district: '竹山鎮',
      village: '延平里',
      road: '集山路二段',
      section_lane: '12號',
      education_level: '專科、大學',
      occupation_status: '有，交通運輸',
      marriage_status: '已婚'
    });

    setOral({
      ...oral,
      screening_location: '醫療院所',
      betel_nut_tier: 1, // 已戒
      smoking_tier: 5, // >10年，>=20支
      self_reported_symptoms: true
    });

    const dummyPatientSig = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='70'><path d='M15,45 Q40,15 65,42 T110,30 Q140,55 170,25' fill='none' stroke='%230f172a' stroke-width='3'/></svg>";
    setPatientSignature({ base64Png: dummyPatientSig, signedAt: new Date().toISOString() });
  };

  const handleSubmit = async () => {
    if (!patient.name || !patient.id_card_no) {
      alert('請先填寫受檢者姓名與身分證號！');
      return;
    }
    if (!patientSignature) {
      alert('受檢者尚未完成數位簽名！請點擊「受檢者數位簽名」按鈕。');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitOralForm({
        patient,
        oral: {
          ...oral,
          inspectionResult: 'PENDING'
        },
        patientSignature
      });

      setSubmitResult({
        ...res,
        patient,
        oral: {
          ...oral,
          inspection_result: 'PENDING'
        },
        patient_signature_url: patientSignature.base64Png,
        screening_date: new Date().toISOString().split('T')[0],
        payment_type: '預防保健',
        form_type: 'ORAL',
        status: 'WAITING_DOCTOR',
        data_hash: res.dataHash
      });
    } catch (err: any) {
      alert(err.message || '送出失敗，請確認伺服器連線');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Completion Screen
  if (submitResult) {
    return (
      <div className="survey-wizard-container" style={{ padding: '3rem 2rem', textAlign: 'center', width: '100%', maxWidth: '100%', margin: 0 }}>
        <div style={{ width: '70px', height: '70px', background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#16A34A' }}>
          <CheckCircle2 size={44} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
          受檢者基本資料與菸檳習慣已成功登錄！
        </h2>
        <p style={{ color: '#64748B', fontSize: '1rem', marginBottom: '1.5rem' }}>
          受檢者：<strong>{patient.name}</strong> 先生/女士 ｜ 表單編號：#{submitResult.questionnaireId}
        </p>

        {/* Status Callout Banner */}
        <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: '12px', padding: '1.25rem', maxWidth: '640px', margin: '0 auto 1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: '800', fontSize: '1rem', marginBottom: '6px' }}>
            <Clock size={20} />
            <span>目前狀態：⏳ 待初檢醫師進行口腔黏膜檢查診斷</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#92400E', lineHeight: '1.6' }}>
            受檢者已完成法定基本資料核對、菸檳史填報與數位簽章。
            <br />
            <strong>門診醫師或個管師</strong>可於<strong>「管理後台」</strong>中開啟此筆個案，使用「口腔解剖部位互動標記圖」進行初檢診斷與簽章！
          </p>
        </div>

        {/* SHA-256 Card */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', maxWidth: '640px', margin: '0 auto 2rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#1976D2', fontWeight: '700', fontSize: '0.9rem' }}>
            <ShieldCheck size={18} />
            <span>受檢端數位簽章防偽雜湊 (SHA-256)</span>
          </div>
          <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', color: '#334155' }}>
            {submitResult.dataHash}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {onNavigateToAdmin && (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={onNavigateToAdmin}
              style={{ background: '#00897B' }}
            >
              前往管理後台 (進行醫師初檢)
              <ArrowRight size={18} />
            </button>
          )}

          {onOpenPrintModal && (
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => onOpenPrintModal(submitResult)}
            >
              <Printer size={18} />
              預覽 A4 口篩紀錄表
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => {
              setSubmitResult(null);
              setPatientSignature(null);
            }}
          >
            填寫下一位受檢者
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-wizard-container" style={{ width: '100%', maxWidth: '100%', margin: 0 }}>
      {/* Header */}
      <div className="wizard-header">
        <div className="wizard-title-row">
          <div>
            <span className="wizard-badge" style={{ background: '#E0F2F1', color: '#00796B' }}>
              健康署 113年11月修訂 AT287 ‧ 受檢端
            </span>
            <h1 className="wizard-title">口腔黏膜檢查服務檢查紀錄表單 - 受檢者填寫端</h1>
            <p className="wizard-subtitle">
              受檢者基本資料與菸檳習慣填報（填寫完畢並簽章後，將轉入後台由醫師接手初檢診斷）
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAutoFill}
            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
          >
            <Sparkles size={16} color="#00897B" />
            示範快速填入
          </button>
        </div>

        {/* Screening eligibility callout */}
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#166534', marginTop: '10px' }}>
          <strong>篩檢補助對象：</strong>30 歲以上有嚼檳榔（含已戒）或吸菸習慣之民眾、18 歲以上有嚼檳榔（含已戒）習慣之原住民，每 2 年 1 次。
        </div>
      </div>

      <div className="form-step-content">
        {/* 1. 受檢者基本資料 */}
        <div className="form-section-card">
          <div className="section-header">
            <div className="section-icon-badge" style={{ background: '#E0F2F1', color: '#00796B' }}>
              <User size={20} />
            </div>
            <h3 className="section-title">A 基本資料 (受檢者自填 / 現場登錄)</h3>
          </div>

          <div className="form-grid-3 question-block">
            <div>
              <label className="question-label">
                受檢者姓名 <span className="required-badge">必填</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="例: 陳小華"
                value={patient.name}
                onChange={e => setPatient({ ...patient, name: e.target.value })}
              />
            </div>

            <div>
              <label className="question-label">
                身分證統一編號 <span className="required-badge">必填</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="例: B120987654"
                maxLength={10}
                value={patient.id_card_no}
                onChange={e => setPatient({ ...patient, id_card_no: e.target.value.toUpperCase() })}
              />
            </div>

            <div>
              <label className="question-label">生理性別</label>
              <div className="options-grid-2">
                <div
                  className={`tile-choice ${patient.gender === 'M' ? 'selected' : ''}`}
                  onClick={() => setPatient({ ...patient, gender: 'M' })}
                >
                  <div className="tile-indicator">{patient.gender === 'M' ? '●' : ''}</div>
                  <span>男 (Male)</span>
                </div>
                <div
                  className={`tile-choice ${patient.gender === 'F' ? 'selected' : ''}`}
                  onClick={() => setPatient({ ...patient, gender: 'F' })}
                >
                  <div className="tile-indicator">{patient.gender === 'F' ? '●' : ''}</div>
                  <span>女 (Female)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-grid-3 question-block">
            <div>
              <label className="question-label">出生日期</label>
              <input
                type="date"
                className="input-field"
                value={patient.birth_date}
                onChange={e => setPatient({ ...patient, birth_date: e.target.value })}
              />
            </div>
            <div>
              <label className="question-label">手機號碼 <span className="required-badge">必填</span></label>
              <input
                type="tel"
                className="input-field"
                placeholder="0922-888999"
                value={patient.mobile}
                onChange={e => setPatient({ ...patient, mobile: e.target.value })}
              />
            </div>
            <div>
              <label className="question-label">聯絡市話</label>
              <input
                type="tel"
                className="input-field"
                placeholder="04-23592525"
                value={patient.phone}
                onChange={e => setPatient({ ...patient, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Indigenous */}
          <div className="question-block">
            <label className="question-label">原住民身分 (18歲以上嚼檳習慣專案補助)</label>
            <div className="options-grid-2">
              <div
                className={`tile-choice ${!patient.is_indigenous ? 'selected' : ''}`}
                onClick={() => setPatient({ ...patient, is_indigenous: false, indigenous_tribe: '' })}
              >
                <div className="tile-indicator">{!patient.is_indigenous ? '●' : ''}</div>
                <span>非原住民 (30歲以上補助)</span>
              </div>
              <div
                className={`tile-choice ${patient.is_indigenous ? 'selected' : ''}`}
                onClick={() => setPatient({ ...patient, is_indigenous: true })}
              >
                <div className="tile-indicator">{patient.is_indigenous ? '●' : ''}</div>
                <span>原住民 (18歲以上嚼檳補助)</span>
              </div>
            </div>

            {patient.is_indigenous && (
              <div className="conditional-reveal-box">
                <label className="question-label">原住民族別：</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: 阿美族、泰雅族、排灣族..."
                  value={patient.indigenous_tribe}
                  onChange={e => setPatient({ ...patient, indigenous_tribe: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Address */}
          <div className="question-block">
            <label className="question-label">現居住地址</label>
            <div className="form-grid-4">
              <input
                type="text"
                className="input-field"
                placeholder="郵遞區號 (557)"
                value={patient.zip_code}
                onChange={e => setPatient({ ...patient, zip_code: e.target.value })}
              />
              <input
                type="text"
                className="input-field"
                placeholder="縣市 (南投縣)"
                value={patient.city}
                onChange={e => setPatient({ ...patient, city: e.target.value })}
              />
              <input
                type="text"
                className="input-field"
                placeholder="鄉鎮市區 (竹山鎮)"
                value={patient.district}
                onChange={e => setPatient({ ...patient, district: e.target.value })}
              />
              <input
                type="text"
                className="input-field"
                placeholder="村里 (延平里)"
                value={patient.village}
                onChange={e => setPatient({ ...patient, village: e.target.value })}
              />
            </div>
            <div style={{ marginTop: '8px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="路街巷弄號樓 (例: 集山路二段12號)"
                value={patient.road}
                onChange={e => setPatient({ ...patient, road: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 2. 菸檳習慣評估 (國健署統計階梯) */}
        <div className="form-section-card">
          <div className="section-header">
            <div className="section-icon-badge" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <ClipboardList size={20} />
            </div>
            <h3 className="section-title">菸檳習慣與黏膜異常症狀評估</h3>
          </div>

          <div className="form-grid-2 question-block">
            <div>
              <label className="question-label">1. 嚼檳榔習慣 (國健署階梯)</label>
              <select
                className="input-field"
                value={oral.betel_nut_tier}
                onChange={e => setOral({ ...oral, betel_nut_tier: parseInt(e.target.value) })}
              >
                <option value={0}>0. 無嚼檳習慣</option>
                <option value={1}>1. 已戒檳榔</option>
                <option value={2}>2. 嚼 10 年以下，每天少於 20 顆</option>
                <option value={3}>3. 嚼 10 年以下，每天 20 顆及以上</option>
                <option value={4}>4. 嚼超過 10 年，每天少於 20 顆</option>
                <option value={5}>5. 嚼超過 10 年，每天 20 顆及以上</option>
              </select>
            </div>

            <div>
              <label className="question-label">2. 吸菸習慣 (國健署階梯)</label>
              <select
                className="input-field"
                value={oral.smoking_tier}
                onChange={e => setOral({ ...oral, smoking_tier: parseInt(e.target.value) })}
              >
                <option value={0}>0. 無吸菸習慣</option>
                <option value={1}>1. 已戒菸</option>
                <option value={2}>2. 吸 10 年以下，每天少於 20 支</option>
                <option value={3}>3. 吸 10 年以下，每天 20 支及以上</option>
                <option value={4}>4. 吸超過 10 年，每天少於 20 支</option>
                <option value={5}>5. 吸超過 10 年，每天 20 支及以上</option>
              </select>
            </div>
          </div>

          {/* 自覺異常症狀 */}
          <div className="question-block">
            <label className="question-label">
              3. 自覺口腔黏膜有無異常症狀？(如異常顏色斑塊、疼痛、難癒合潰瘍、腫塊等)
            </label>
            <div className="options-grid-2">
              <div
                className={`tile-choice ${!oral.self_reported_symptoms ? 'selected' : ''}`}
                onClick={() => setOral({ ...oral, self_reported_symptoms: false })}
              >
                <div className="tile-indicator">{!oral.self_reported_symptoms ? '●' : ''}</div>
                <span>無異常自覺症狀</span>
              </div>
              <div
                className={`tile-choice ${oral.self_reported_symptoms ? 'selected' : ''}`}
                onClick={() => setOral({ ...oral, self_reported_symptoms: true })}
              >
                <div className="tile-indicator">{oral.self_reported_symptoms ? '●' : ''}</div>
                <span>有異常自覺症狀 (黏膜粗糙 / 疼痛 / 潰瘍等)</span>
              </div>
            </div>
          </div>

          {/* 篩檢地點與支付方式 */}
          <div className="form-grid-2 question-block" style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '1rem' }}>
            <div>
              <label className="question-label">篩檢地點</label>
              <select
                className="input-field"
                value={oral.screening_location}
                onChange={e => setOral({ ...oral, screening_location: e.target.value })}
              >
                <option value="醫療院所">醫療院所 (院內篩檢站 / 門診)</option>
                <option value="社區或職場設站篩檢">社區或職場設站篩檢 (巡迴醫療車)</option>
              </select>
            </div>
            <div>
              <label className="question-label">支付方式</label>
              <select
                className="input-field"
                value={oral.payment_type || '預防保健'}
                onChange={e => setOral({ ...oral, payment_type: e.target.value })}
              >
                <option value="預防保健">預防保健 (國健署公務補助)</option>
                <option value="健保醫療給付">健保醫療給付</option>
                <option value="自費健康檢查">自費健康檢查</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. 同意書與受檢者數位簽名 */}
        <div style={{ background: '#EFF6FF', border: '1.5px solid #93C5FD', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1D4ED8', fontWeight: '700', fontSize: '1.05rem', marginBottom: '8px' }}>
            <ShieldCheck size={22} />
            <span>法定告知事項與受檢者同意書</span>
          </div>
          <p style={{ color: '#1E40AF', fontSize: '0.9rem', lineHeight: '1.6' }}>
            本人同意接受<strong>「國民健康署口腔黏膜檢查服務」</strong>，相關檢查結果及菸檳習慣資料將作為衛生單位政策評估與個案追蹤健康管理使用，並確認以上所填資料及菸檳習慣資料正確無誤。
          </p>

          <div style={{ marginTop: '1rem', paddingTop: '12px', borderTop: '1px dashed #93C5FD', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1E293B' }}>
                受檢者親筆簽名狀態：
              </span>
              <span style={{ marginLeft: '8px', fontSize: '0.875rem', color: patientSignature ? '#15803D' : '#D97706', fontWeight: 'bold' }}>
                {patientSignature ? '✓ 已完成線上數位簽名' : '⚠️ 尚未簽署 (送出前必簽)'}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsPatientSignModalOpen(true)}
              style={{ fontSize: '0.875rem', padding: '7px 16px' }}
            >
              <ShieldCheck size={16} />
              {patientSignature ? '重新簽名' : '開啟受檢者數位簽名板'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Submit */}
      <div className="wizard-footer">
        <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
          * 送出後問卷將即時連線存入後台資料庫，並由<strong>門診初檢醫師</strong>接手進行口腔黏膜診斷與部位標記
        </div>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{ background: '#00897B' }}
        >
          <ShieldCheck size={20} />
          {isSubmitting ? '送出中...' : '確認資料無誤，送出問卷 (轉交醫師初檢)'}
        </button>
      </div>

      {/* Patient Signature Modal */}
      <SignatureModal
        isOpen={isPatientSignModalOpen}
        onClose={() => setIsPatientSignModalOpen(false)}
        onConfirm={(base64Png, signedAt) => {
          setPatientSignature({ base64Png, signedAt });
          setIsPatientSignModalOpen(false);
        }}
        patientName={patient.name}
        idCardNo={patient.id_card_no}
        consentType="ORAL"
        role="PATIENT"
      />
    </div>
  );
};
