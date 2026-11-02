import React, { useState } from 'react';
import type { Patient, LungScreening } from '../types';
import { SignatureModal } from '../components/SignatureModal';
import { submitLungForm } from '../services/api';
import {
  Wind,
  Activity,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Printer,
  ClipboardList,
  AlertTriangle,
  Clock,
  ArrowRight,
  User,
  Cigarette,
  Flame,
  Building2,
  FileCheck
} from 'lucide-react';

// Custom Lungs Icon Component
const LungsIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 4v7" />
    <path d="M10 8c-3.3 0-6 2.7-6 6a6 6 0 0 0 6 6c.5 0 1-.1 1.5-.2V13h-3" />
    <path d="M14 8c3.3 0 6 2.7 6 6a6 6 0 0 1-6 6c-.5 0-1-.1-1.5-.2V13h3" />
    <path d="M12 4c-.5-1-1.5-1.5-2.5-1.5" />
    <path d="M12 4c.5-1 1.5-1.5 2.5-1.5" />
  </svg>
);

interface LungSurveyViewProps {
  onOpenPrintModal?: (q: any) => void;
  onNavigateToAdmin?: () => void;
}

export const LungSurveyView: React.FC<LungSurveyViewProps> = ({
  onOpenPrintModal,
  onNavigateToAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'CONSENT' | 'PATIENT' | 'CLINICAL' | 'DECLARATION'>('CONSENT');
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<any | null>(null);

  // Patient Signature
  const [patientSignature, setPatientSignature] = useState<{ base64Png: string; signedAt: string } | null>(null);

  // Patient Profile State
  const [patient, setPatient] = useState<Patient>({
    chart_no: '',
    id_card_no: '',
    name: '',
    gender: 'M',
    birth_date: '1971-04-15',
    is_indigenous: false,
    indigenous_tribe: '',
    phone: '049-2642123',
    mobile: '0932-123456',
    zip_code: '557',
    city: '南投縣',
    district: '竹山鎮',
    village: '中正里',
    road: '中正巷',
    section_lane: '12號',
    education_level: '高中/高職',
    occupation_status: '有',
    marriage_status: '已婚'
  });

  // Lung Screening State
  const [lung, setLung] = useState<LungScreening>({
    payment_type: '預防保健',
    hospital_name: '竹山秀傳醫療社團法人竹山秀傳醫院',
    hospital_code: '0938040012',
    clinic_date: new Date().toISOString().split('T')[0],
    consent: {
      screened_past_2years: false,
      is_pregnant: false,
      had_chest_ct_past_12months: false,
      had_lung_cancer: false,
      cannot_hold_breath: false,
      hemoptysis_past_month: false,
      weight_loss_past_year: false,
      accept_biopsy_or_surgery: 'YES',
      agreed_items: {
        reduced_mortality_informed: true,
        early_detection_limitation_informed: true,
        nodule_ratio_and_followup_informed: true,
        not_cancer_prevention_informed: true,
        biennial_screening_fee_liability_informed: true,
        followup_clinic_or_mail_informed: true,
        image_upload_and_cross_query_agreed: true,
        data_linkage_privacy_agreed: true
      },
      educator_name: '張雅筑 個管師',
      checked_system_no_duplicate: true
    },
    height_cm: 170,
    weight_kg: 68,
    bmi: 23.5,
    pulmonary_disease_history: {
      copd: false,
      tb: false,
      pneumonia: false,
      chronic_bronchitis: false,
      pneumoconiosis: false,
      emphysema: false,
      ipf: false,
      systemic_sclerosis: false,
      none: true,
      exception_declared: false
    },
    family_history: {
      has_family_history: false,
      total_affected_count: 0,
      details: {
        father: { affectedCount: 0, diagnosedAgeMin: null },
        mother: { affectedCount: 0, diagnosedAgeMin: null },
        brother: { affectedCount: 0, diagnosedAgeMin: null },
        sister: { affectedCount: 0, diagnosedAgeMin: null },
        son: { affectedCount: 0, diagnosedAgeMin: null },
        daughter: { affectedCount: 0, diagnosedAgeMin: null }
      },
      proof_relative_name: '',
      proof_relative_birth: '',
      proof_relative_id: ''
    },
    smoking_history: {
      co_reading_ppm: null,
      has_smoking_history: true,
      packs_per_day: 1,
      smoking_years: 30,
      pack_years: 30,
      is_quit: false,
      quit_year_minguo: null,
      smoking_cessation_service: 'OFFERED',
      secondhand_smoke_exposure: false,
      no_smoke_and_no_secondhand: false
    },
    oil_smoke: {
      cooking_years: 0,
      fried_days_per_week: 0,
      stir_fry_days_per_week: 0,
      deep_fry_days_per_week: 0,
      use_range_hood: true
    },
    occupational_exposure: {
      asbestos: false,
      heavy_metals_coal: false,
      dust_cotton: false,
      radiation_environment: false,
      temple_incense: false,
      none: true
    },
    declarations: {
      family_relative_declaration: false,
      heavy_smoker_declaration: true,
      exclusion_exception_declaration: false,
      family_declaration_reason: '',
      heavy_smoker_declaration_text: '吸菸史達30包-年以上，符合健康署低劑量電腦斷層公費篩檢資格。',
      exclusion_exception_doctor: '',
      exclusion_exception_hospital: ''
    }
  });

  // Calculate BMI
  const updateBmi = (h: number | null, w: number | null) => {
    if (h && w && h > 0) {
      const val = Number((w / Math.pow(h / 100, 2)).toFixed(1));
      setLung(prev => ({ ...prev, height_cm: h, weight_kg: w, bmi: val }));
    } else {
      setLung(prev => ({ ...prev, height_cm: h, weight_kg: w, bmi: null }));
    }
  };

  // Calculate smoking pack-years
  const updateSmokingCalculation = (packs: number | null, years: number | null) => {
    let py: number | null = null;
    if (packs && years && packs > 0 && years > 0) {
      py = Number((packs * years).toFixed(1));
    }
    setLung(prev => ({
      ...prev,
      smoking_history: {
        ...prev.smoking_history,
        packs_per_day: packs,
        smoking_years: years,
        pack_years: py
      },
      declarations: {
        ...prev.declarations,
        heavy_smoker_declaration: py ? py >= 30 : false
      }
    }));
  };

  // Demo Fill 1: 重度吸菸者 (男性 55歲，抽菸32年，符合30包-年)
  const handleQuickDemoSmoker = () => {
    setPatient({
      chart_no: '00681924',
      id_card_no: 'B120987654',
      name: '林健雄',
      gender: 'M',
      birth_date: '1971-08-20',
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '049-2658899',
      mobile: '0919-876543',
      zip_code: '557',
      city: '南投縣',
      district: '竹山鎮',
      village: '延平里',
      road: '集山路二段',
      section_lane: '105號',
      education_level: '高中/高職',
      occupation_status: '有',
      marriage_status: '已婚'
    });

    setLung(prev => ({
      ...prev,
      payment_type: '預防保健',
      height_cm: 172,
      weight_kg: 74,
      bmi: 25.0,
      consent: {
        ...prev.consent,
        screened_past_2years: false,
        is_pregnant: false,
        had_chest_ct_past_12months: false,
        had_lung_cancer: false,
        cannot_hold_breath: false,
        hemoptysis_past_month: false,
        weight_loss_past_year: false,
        accept_biopsy_or_surgery: 'YES',
        educator_name: '張雅筑 個管師',
        checked_system_no_duplicate: true
      },
      pulmonary_disease_history: {
        copd: true,
        tb: false,
        pneumonia: false,
        chronic_bronchitis: true,
        pneumoconiosis: false,
        emphysema: false,
        ipf: false,
        systemic_sclerosis: false,
        none: false,
        exception_declared: false
      },
      family_history: {
        has_family_history: false,
        total_affected_count: 0,
        details: {
          father: { affectedCount: 0, diagnosedAgeMin: null },
          mother: { affectedCount: 0, diagnosedAgeMin: null },
          brother: { affectedCount: 0, diagnosedAgeMin: null },
          sister: { affectedCount: 0, diagnosedAgeMin: null },
          son: { affectedCount: 0, diagnosedAgeMin: null },
          daughter: { affectedCount: 0, diagnosedAgeMin: null }
        },
        proof_relative_name: '',
        proof_relative_birth: '',
        proof_relative_id: ''
      },
      smoking_history: {
        co_reading_ppm: 16,
        has_smoking_history: true,
        packs_per_day: 1.5,
        smoking_years: 25,
        pack_years: 37.5,
        is_quit: false,
        quit_year_minguo: null,
        smoking_cessation_service: 'OFFERED',
        secondhand_smoke_exposure: false,
        no_smoke_and_no_secondhand: false
      },
      oil_smoke: {
        cooking_years: 2,
        fried_days_per_week: 1,
        stir_fry_days_per_week: 1,
        deep_fry_days_per_week: 0,
        use_range_hood: true
      },
      occupational_exposure: {
        asbestos: false,
        heavy_metals_coal: true,
        dust_cotton: false,
        radiation_environment: false,
        temple_incense: false,
        none: false
      },
      declarations: {
        family_relative_declaration: false,
        heavy_smoker_declaration: true,
        exclusion_exception_declaration: false,
        family_declaration_reason: '',
        heavy_smoker_declaration_text: '吸菸史達37.5包-年，符合健康署低劑量電腦斷層重度吸菸公費補助資格。',
        exclusion_exception_doctor: '',
        exclusion_exception_hospital: ''
      }
    }));
  };

  // Demo Fill 2: 具肺癌家族史女性 (50歲女性，不抽菸，母親罹患肺癌，油煙暴露)
  const handleQuickDemoFamily = () => {
    setPatient({
      chart_no: '00732109',
      id_card_no: 'L220198273',
      name: '陳美娟',
      gender: 'F',
      birth_date: '1976-11-03',
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '049-2651122',
      mobile: '0928-334455',
      zip_code: '557',
      city: '南投縣',
      district: '竹山鎮',
      village: '雲林里',
      road: '頂林路',
      section_lane: '52號',
      education_level: '專科、大學',
      occupation_status: '有',
      marriage_status: '已婚'
    });

    setLung(prev => ({
      ...prev,
      payment_type: '預防保健',
      height_cm: 158,
      weight_kg: 54,
      bmi: 21.6,
      consent: {
        ...prev.consent,
        screened_past_2years: false,
        is_pregnant: false,
        had_chest_ct_past_12months: false,
        had_lung_cancer: false,
        cannot_hold_breath: false,
        hemoptysis_past_month: false,
        weight_loss_past_year: false,
        accept_biopsy_or_surgery: 'YES',
        educator_name: '張雅筑 個管師',
        checked_system_no_duplicate: true
      },
      pulmonary_disease_history: {
        copd: false,
        tb: false,
        pneumonia: false,
        chronic_bronchitis: false,
        pneumoconiosis: false,
        emphysema: false,
        ipf: false,
        systemic_sclerosis: false,
        none: true,
        exception_declared: false
      },
      family_history: {
        has_family_history: true,
        total_affected_count: 1,
        details: {
          father: { affectedCount: 0, diagnosedAgeMin: null },
          mother: { affectedCount: 1, diagnosedAgeMin: 58 },
          brother: { affectedCount: 0, diagnosedAgeMin: null },
          sister: { affectedCount: 0, diagnosedAgeMin: null },
          son: { affectedCount: 0, diagnosedAgeMin: null },
          daughter: { affectedCount: 0, diagnosedAgeMin: null }
        },
        proof_relative_name: '陳林罔市',
        proof_relative_birth: '42年03月15日',
        proof_relative_id: 'L200889911'
      },
      smoking_history: {
        co_reading_ppm: 2,
        has_smoking_history: false,
        packs_per_day: null,
        smoking_years: null,
        pack_years: null,
        is_quit: false,
        quit_year_minguo: null,
        smoking_cessation_service: 'NONE',
        secondhand_smoke_exposure: true,
        no_smoke_and_no_secondhand: false
      },
      oil_smoke: {
        cooking_years: 28,
        fried_days_per_week: 3,
        stir_fry_days_per_week: 6,
        deep_fry_days_per_week: 1,
        use_range_hood: true
      },
      occupational_exposure: {
        asbestos: false,
        heavy_metals_coal: false,
        dust_cotton: false,
        radiation_environment: false,
        temple_incense: true,
        none: false
      },
      declarations: {
        family_relative_declaration: true,
        heavy_smoker_declaration: false,
        exclusion_exception_declaration: false,
        family_declaration_reason: '母親曾於外院診斷罹患肺腺癌，現特簽立具血親家族史聲明書符合公費LDCT條件。',
        heavy_smoker_declaration_text: '',
        exclusion_exception_doctor: '',
        exclusion_exception_hospital: ''
      }
    }));
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!patient.name || !patient.id_card_no) {
      alert('請填寫受檢者姓名與身分證統一編號');
      setActiveTab('PATIENT');
      return;
    }

    if (!patientSignature) {
      alert('請先點選「受檢者數位親筆簽名」完成簽署確認');
      setIsSignModalOpen(true);
      return;
    }

    // Check if any exclusion condition is checked
    const c = lung.consent;
    const hasExclusion =
      c.screened_past_2years ||
      c.is_pregnant ||
      c.had_chest_ct_past_12months ||
      c.had_lung_cancer ||
      c.cannot_hold_breath;

    if (hasExclusion && !lung.pulmonary_disease_history.exception_declared && !lung.declarations?.exclusion_exception_declaration) {
      const confirmProceed = window.confirm(
        '【提醒】受檢者勾選了疑似篩檢排除狀況（如2年內曾檢查、懷孕、12個月內胸部CT或得過肺癌等）。\n是否已由專科醫師評估排除並簽具聲明書？確認要繼續送出？'
      );
      if (!confirmProceed) return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitLungForm({
        patient,
        lung,
        signature: patientSignature
      });
      setSubmitResult(result);
    } catch (err: any) {
      alert('送出失敗：' + (err.message || '網路異常'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // If successfully submitted
  if (submitResult) {
    return (
      <div className="survey-container fade-in" style={{ width: '100%', maxWidth: '100%', margin: '0' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: '#ecfdf5', borderRadius: '50%', color: '#059669', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={56} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
            胸部低劑量電腦斷層檢查 (LDCT) 問卷簽署完成
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '2rem' }}>
            已依法令規範將個案同意書、受檢者臨床資料與數位簽章封存，並產生防篡改 SHA-256 數位雜湊憑證。
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>問卷流水編號</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0284c7' }}>
                  #{submitResult.questionnaireId}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>受檢者姓名</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>
                  {patient.name} ({patient.id_card_no})
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>檢查給付類別</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0d9488' }}>
                  {lung.payment_type} (國民健康署補助)
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>吸菸史指標</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e11d48' }}>
                  {lung.smoking_history.has_smoking_history ? `${lung.smoking_history.pack_years || 0} 包-年` : '無吸菸史'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>
                區塊鏈防篡改雜湊 (SHA-256 Data Hash)
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#475569', wordBreak: 'break-all', background: '#f1f5f9', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                {submitResult.dataHash}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {onOpenPrintModal && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() =>
                  onOpenPrintModal({
                    questionnaire_id: submitResult.questionnaireId,
                    form_type: 'LUNG',
                    payment_type: lung.payment_type,
                    screening_date: lung.clinic_date,
                    status: 'COMPLETED',
                    patient,
                    lung,
                    patient_signature_url: patientSignature?.base64Png,
                    patient_signed_at: patientSignature?.signedAt || new Date().toISOString(),
                    data_hash: submitResult.dataHash,
                    is_deleted: false,
                    version: 1
                  })
                }
              >
                <Printer size={18} />
                預覽與列印 1:1 公版紀錄表 (A4)
              </button>
            )}

            {onNavigateToAdmin && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={onNavigateToAdmin}
              >
                <ClipboardList size={18} />
                進入後台個案管理與判讀登錄
              </button>
            )}

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setSubmitResult(null);
                setPatientSignature(null);
                setActiveTab('CONSENT');
              }}
            >
              填寫下一位受檢者
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-container fade-in" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: '0 0.25rem' }}>
      {/* Top Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <LungsIcon size={16} />
              <span>衛生福利部國民健康署 115年最新公版【附件一之三、附件一之四】</span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              胸部低劑量電腦斷層檢查 (LDCT) 個案同意書與紀錄表單
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
              竹山秀傳醫院 ‧ 早期肺癌偵測公費篩檢計畫 (平板電子化自填與醫護衛教系統)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn"
              style={{ background: 'rgba(255,255,255,0.95)', color: '#0369a1', fontWeight: 600, fontSize: '0.85rem' }}
              onClick={handleQuickDemoSmoker}
              title="快速帶入重度吸菸史範例"
            >
              <Sparkles size={15} style={{ marginRight: '4px' }} />
              範例：重度吸菸男性 (37.5包-年)
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: 'rgba(255,255,255,0.95)', color: '#0369a1', fontWeight: 600, fontSize: '0.85rem' }}
              onClick={handleQuickDemoFamily}
              title="快速帶入具家族史女性範例"
            >
              <Sparkles size={15} style={{ marginRight: '4px' }} />
              範例：具家族史女性 (油煙暴露)
            </button>
          </div>
        </div>

        {/* Tab Stepper */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem', overflowX: 'auto' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'CONSENT' ? 'btn-light' : 'btn-ghost-light'}`}
            style={{
              background: activeTab === 'CONSENT' ? '#fff' : 'rgba(255,255,255,0.15)',
              color: activeTab === 'CONSENT' ? '#0369a1' : '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '8px'
            }}
            onClick={() => setActiveTab('CONSENT')}
          >
            <span>1. 個案同意書 (附件一之三)</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'PATIENT' ? 'btn-light' : 'btn-ghost-light'}`}
            style={{
              background: activeTab === 'PATIENT' ? '#fff' : 'rgba(255,255,255,0.15)',
              color: activeTab === 'PATIENT' ? '#0369a1' : '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '8px'
            }}
            onClick={() => setActiveTab('PATIENT')}
          >
            <span>2. 受檢者基本資料 (附件一之四)</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'CLINICAL' ? 'btn-light' : 'btn-ghost-light'}`}
            style={{
              background: activeTab === 'CLINICAL' ? '#fff' : 'rgba(255,255,255,0.15)',
              color: activeTab === 'CLINICAL' ? '#0369a1' : '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '8px'
            }}
            onClick={() => setActiveTab('CLINICAL')}
          >
            <span>3. 個案臨床資料 (病史/家族/吸菸)</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'DECLARATION' ? 'btn-light' : 'btn-ghost-light'}`}
            style={{
              background: activeTab === 'DECLARATION' ? '#fff' : 'rgba(255,255,255,0.15)',
              color: activeTab === 'DECLARATION' ? '#0369a1' : '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '8px'
            }}
            onClick={() => setActiveTab('DECLARATION')}
          >
            <span>4. 聲明書與簽名確認</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 個案同意書 */}
      {activeTab === 'CONSENT' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <FileCheck size={24} color="#0284c7" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                國民健康署胸部低劑量電腦斷層檢查服務 個案同意書【附件一之三】
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                本檢查由衛生福利部國民健康署運用菸品健康福利捐/公務預算補助
              </span>
            </div>
          </div>

          {/* 7 大篩檢資格與排除條件 */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="#f59e0b" />
              我是否有下列任一狀況：（請逐項誠實確認）
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                {
                  id: 'screened_past_2years',
                  label: '我過去 2 年內（2 次篩檢年份差距小於 2）是否曾接受過本檢查服務？',
                  hint: '依規定每 2 年補助一次，未滿 2 年不得公費複檢'
                },
                {
                  id: 'is_pregnant',
                  label: '我目前有無懷孕？',
                  hint: '孕婦避免接受電腦斷層輻射曝露'
                },
                {
                  id: 'had_chest_ct_past_12months',
                  label: '我過去 12 個月內有無接受過胸部電腦斷層檢查(含低劑量電腦斷層檢查)？',
                  hint: '過去1年內已有胸部CT影像者宜優先調閱'
                },
                {
                  id: 'had_lung_cancer',
                  label: '我是否得過肺癌？',
                  hint: '本項為早期偵測篩檢，確診肺癌患者應依臨床指引定期追蹤治療'
                },
                {
                  id: 'cannot_hold_breath',
                  label: '我是否有無法閉氣等無法完成檢查程序之情形？',
                  hint: '掃描時需吸飽氣後閉氣約5~10秒以獲得清晰影像'
                },
                {
                  id: 'hemoptysis_past_month',
                  label: '我過去 1 個月內是否有不明原因之咳血，或明顯可疑肺癌病灶？',
                  hint: '若有症狀應立即轉介胸腔科專科門診直接診療'
                },
                {
                  id: 'weight_loss_past_year',
                  label: '我過去 1 年內是否有不明原因體重減輕超過 6 公斤？',
                  hint: '若有非刻意減重情形應評估排除其他病灶'
                }
              ].map(item => {
                const val = (lung.consent as any)[item.id];
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: val ? '#fff1f2' : '#ffffff',
                      border: val ? '1px solid #fecdd3' : '1px solid #e2e8f0',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ fontWeight: 600, color: val ? '#be123c' : '#334155' }}>{item.label}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.hint}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 600, color: val ? '#e11d48' : '#64748b' }}>
                        <input
                          type="radio"
                          name={`consent_${item.id}`}
                          checked={val === true}
                          onChange={() => setLung(prev => ({ ...prev, consent: { ...prev.consent, [item.id]: true } }))}
                        />
                        有
                      </label>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 600, color: !val ? '#059669' : '#64748b' }}>
                        <input
                          type="radio"
                          name={`consent_${item.id}`}
                          checked={val === false}
                          onChange={() => setLung(prev => ({ ...prev, consent: { ...prev.consent, [item.id]: false } }))}
                        />
                        無
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 胸腔穿刺或手術意願 */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontWeight: 700, color: '#166534', fontSize: '1rem' }}>
                  若有醫療上的需要，我是否接受胸腔穿刺或手術：
                </span>
                <div style={{ fontSize: '0.85rem', color: '#15803d' }}>
                  若篩檢發現高風險疑似惡性肺結節，需配合胸腔科專科醫師進一步切片或手術評估
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#166534', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="accept_biopsy"
                    checked={lung.consent.accept_biopsy_or_surgery === 'YES'}
                    onChange={() => setLung(prev => ({ ...prev, consent: { ...prev.consent, accept_biopsy_or_surgery: 'YES' } }))}
                  />
                  可以接受
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#991b1b', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="accept_biopsy"
                    checked={lung.consent.accept_biopsy_or_surgery === 'NO'}
                    onChange={() => setLung(prev => ({ ...prev, consent: { ...prev.consent, accept_biopsy_or_surgery: 'NO' } }))}
                  />
                  不可以
                </label>
              </div>
            </div>
          </div>

          {/* 知情同意條款 */}
          <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                本人於觀看衛教資訊後，在醫事人員的輔助及解說下，確認已經知道低劑量電腦斷層檢查之優缺點及風險，並同意下列事項：
              </h3>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => {
                  setLung(prev => ({
                    ...prev,
                    consent: {
                      ...prev.consent,
                      agreed_items: {
                        reduced_mortality_informed: true,
                        early_detection_limitation_informed: true,
                        nodule_ratio_and_followup_informed: true,
                        not_cancer_prevention_informed: true,
                        biennial_screening_fee_liability_informed: true,
                        followup_clinic_or_mail_informed: true,
                        image_upload_and_cross_query_agreed: true,
                        data_linkage_privacy_agreed: true
                      }
                    }
                  }));
                }}
              >
                全選同意
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: '#334155' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={lung.consent.agreed_items.reduced_mortality_informed}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      consent: {
                        ...prev.consent,
                        agreed_items: { ...prev.consent.agreed_items, reduced_mortality_informed: e.target.checked }
                      }
                    }))
                  }
                />
                <span>
                  <strong>【降低死亡率】</strong> 我知道胸部低劑量電腦斷層檢查，對於重度吸菸者，可降低肺癌死亡率達 20% 以上，但對於非高風險者，其效益證據尚不明確。
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={lung.consent.agreed_items.early_detection_limitation_informed}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      consent: {
                        ...prev.consent,
                        agreed_items: { ...prev.consent.agreed_items, early_detection_limitation_informed: e.target.checked }
                      }
                    }))
                  }
                />
                <span>
                  <strong>【偵測極限與新發】</strong> 我知道胸部低劑量電腦斷層檢查可發現早期肺癌，但仍有部分肺癌無法有效偵測，且有新發肺癌的可能性，所以即使檢查結果正常，在下次定期檢查前，如有發現異狀，仍應儘速就醫。
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={lung.consent.agreed_items.nodule_ratio_and_followup_informed}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      consent: {
                        ...prev.consent,
                        agreed_items: { ...prev.consent.agreed_items, nodule_ratio_and_followup_informed: e.target.checked }
                      }
                    }))
                  }
                />
                <span>
                  <strong>【結節良性率與追蹤】</strong> 我知道接受胸部低劑量電腦斷層檢查後，發現結節的比例很高(約 2/3)，但多數（約 95%）為良性結節，將配合醫師建議持續定期追蹤（依指引或醫師建議），以觀察結節有無新增或變化情形。惟若屬風險較高之結節，將請胸腔科醫師評估後進行確診程序。
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={lung.consent.agreed_items.not_cancer_prevention_informed}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      consent: {
                        ...prev.consent,
                        agreed_items: { ...prev.consent.agreed_items, not_cancer_prevention_informed: e.target.checked }
                      }
                    }))
                  }
                />
                <span>
                  <strong>【不代替戒菸】</strong> 我知道胸部低劑量電腦斷層檢查並不能預防肺癌的發生，吸菸者不應將肺癌篩檢做為戒菸的替代選擇，若我目前有吸菸情形，我應同意接受衛教戒菸。
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={lung.consent.agreed_items.biennial_screening_fee_liability_informed}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      consent: {
                        ...prev.consent,
                        agreed_items: { ...prev.consent.agreed_items, biennial_screening_fee_liability_informed: e.target.checked }
                      }
                    }))
                  }
                />
                <span>
                  <strong>【每2年1次與自費切結】</strong> 我知道本檢查為每 2 年 1 次胸部低劑量電腦斷層檢查，若我 2 年內（以年份檢核）曾接受本檢查服務，或有不符篩檢資格情形，我同意自費負擔篩檢費用。
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={lung.consent.agreed_items.followup_clinic_or_mail_informed}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      consent: {
                        ...prev.consent,
                        agreed_items: { ...prev.consent.agreed_items, followup_clinic_or_mail_informed: e.target.checked }
                      }
                    }))
                  }
                />
                <span>
                  <strong>【結果報告交付】</strong> 我知道且同意檢查後如疑似異常，應回診看報告。如無顯著異常或發現惰性結節，報告將採寄送方式。
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={lung.consent.agreed_items.image_upload_and_cross_query_agreed}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      consent: {
                        ...prev.consent,
                        agreed_items: { ...prev.consent.agreed_items, image_upload_and_cross_query_agreed: e.target.checked }
                      }
                    }))
                  }
                />
                <span>
                  <strong>【歷次影像上傳與跨院查詢】</strong> 我知道比較歷次影像有助於提升影像判讀準確性，本人同意將歷次胸部電腦斷層等影像上傳，並供不同醫院或醫師於看診或判讀報告時查詢，以綜整判斷結節變化及風險。亦同意將其進行後續相關分析及研究之用。
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={lung.consent.agreed_items.data_linkage_privacy_agreed}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      consent: {
                        ...prev.consent,
                        agreed_items: { ...prev.consent.agreed_items, data_linkage_privacy_agreed: e.target.checked }
                      }
                    }))
                  }
                />
                <span>
                  <strong>【個資法定保密聲明】</strong> 我已清楚瞭解個案資料運用說明，同意接受本檢查並同意將相關資料（含問卷、影像、追蹤）供資格檢核、學術統計、政策評估及依法保密使用。
                </span>
              </label>
            </div>
          </div>

          {/* 醫院端衛教與系統核對項目 */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Building2 size={20} color="#1d4ed8" />
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e40af', display: 'block' }}>
                  醫院對民眾進行衛教及知情同意人員：
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ width: '220px', padding: '0.35rem 0.6rem', fontSize: '0.9rem' }}
                  value={lung.consent.educator_name}
                  onChange={e => setLung(prev => ({ ...prev, consent: { ...prev.consent, educator_name: e.target.value } }))}
                  placeholder="請輸入衛教人員/個管師姓名"
                />
              </div>
            </div>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#1e40af', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={lung.consent.checked_system_no_duplicate}
                onChange={e => setLung(prev => ({ ...prev, consent: { ...prev.consent, checked_system_no_duplicate: e.target.checked } }))}
              />
              <span>已至「肺癌早期偵測計畫追蹤管理系統」查詢民眾無 2 年內接受胸部低劑量電腦斷層檢查服務之情形</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setActiveTab('PATIENT')}
            >
              下一步：填寫受檢者基本資料
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: 受檢者基本資料 */}
      {activeTab === 'PATIENT' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <User size={24} color="#0284c7" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                個人基本資料（受檢者填寫）【附件一之四】
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                請核對受檢者健保身分與聯絡居住資訊
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* 支付方式 */}
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>支付方式 (費用別)</label>
              <select
                className="form-control"
                value={lung.payment_type}
                onChange={e => setLung(prev => ({ ...prev, payment_type: e.target.value as any }))}
              >
                <option value="預防保健">預防保健 (公費補助)</option>
                <option value="健保醫療給付">健保醫療給付</option>
                <option value="其他公務預算補助">其他公務預算補助</option>
                <option value="自費健康檢查">自費健康檢查</option>
                <option value="其他">其他</option>
              </select>
            </div>

            {/* 病歷號 */}
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>病歷號碼</label>
              <input
                type="text"
                className="form-control"
                placeholder="例如: 00552199"
                value={patient.chart_no || ''}
                onChange={e => setPatient(prev => ({ ...prev, chart_no: e.target.value }))}
              />
            </div>

            {/* 姓名 */}
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>
                受檢者姓名 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="請輸入中文全名"
                value={patient.name}
                onChange={e => setPatient(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* 性別 */}
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>生理性別</label>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="patient_gender"
                    checked={patient.gender === 'M'}
                    onChange={() => setPatient(prev => ({ ...prev, gender: 'M' }))}
                  />
                  男
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="patient_gender"
                    checked={patient.gender === 'F'}
                    onChange={() => setPatient(prev => ({ ...prev, gender: 'F' }))}
                  />
                  女
                </label>
              </div>
            </div>

            {/* 身分證號 / 居留證號 */}
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>
                身分證統一編號 / 居留統一證號 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="例如: A123456789"
                value={patient.id_card_no}
                onChange={e => setPatient(prev => ({ ...prev, id_card_no: e.target.value.toUpperCase() }))}
              />
            </div>

            {/* 出生日期 */}
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>出生日期 (西元)</label>
              <input
                type="date"
                className="form-control"
                value={patient.birth_date}
                onChange={e => setPatient(prev => ({ ...prev, birth_date: e.target.value }))}
              />
            </div>

            {/* 電話 */}
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>市話聯絡電話</label>
              <input
                type="text"
                className="form-control"
                placeholder="例如: 049-2658977"
                value={patient.phone || ''}
                onChange={e => setPatient(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            {/* 手機 */}
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>
                手機號碼 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="例如: 0912-345678"
                value={patient.mobile}
                onChange={e => setPatient(prev => ({ ...prev, mobile: e.target.value }))}
              />
            </div>
          </div>

          {/* 現居住地址 */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>現居住地址</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>郵遞區號</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="557"
                  value={patient.zip_code || ''}
                  onChange={e => setPatient(prev => ({ ...prev, zip_code: e.target.value }))}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>縣/市</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="南投縣"
                  value={patient.city || ''}
                  onChange={e => setPatient(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>鄉/鎮/市/區</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="竹山鎮"
                  value={patient.district || ''}
                  onChange={e => setPatient(prev => ({ ...prev, district: e.target.value }))}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>村/里</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="中正里"
                  value={patient.village || ''}
                  onChange={e => setPatient(prev => ({ ...prev, village: e.target.value }))}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>路/街</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="集山路三段"
                  value={patient.road || ''}
                  onChange={e => setPatient(prev => ({ ...prev, road: e.target.value }))}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>段/巷/弄/號/樓</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="480號"
                  value={patient.section_lane || ''}
                  onChange={e => setPatient(prev => ({ ...prev, section_lane: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveTab('CONSENT')}
            >
              回上一步：個案同意書
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setActiveTab('CLINICAL')}
            >
              下一步：填寫臨床資料與病史
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: 個案臨床資料 */}
      {activeTab === 'CLINICAL' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <Activity size={24} color="#0284c7" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                個案臨床資料（建議由醫院詢問受檢者後填寫）【附件一之四】
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                肺部疾病史、直系家族史、吸菸及二手菸史、油煙與職業暴露
              </span>
            </div>
          </div>

          {/* 教育程度與體位資訊 */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>教育程度</label>
                <select
                  className="form-control"
                  value={patient.education_level || '高中/高職'}
                  onChange={e => setPatient(prev => ({ ...prev, education_level: e.target.value }))}
                >
                  <option value="無">無</option>
                  <option value="小學">小學</option>
                  <option value="國（初）中">國（初）中</option>
                  <option value="高中/高職">高中/高職</option>
                  <option value="專科、大學">專科、大學</option>
                  <option value="研究所以上">研究所以上</option>
                  <option value="拒答">拒答</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>身高 (公分)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="170"
                  value={lung.height_cm || ''}
                  onChange={e => updateBmi(e.target.value ? parseFloat(e.target.value) : null, lung.weight_kg)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>體重 (公斤)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="65"
                  value={lung.weight_kg || ''}
                  onChange={e => updateBmi(lung.height_cm, e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>BMI (自動計算)</label>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0284c7', paddingTop: '0.35rem' }}>
                  {lung.bmi ? `${lung.bmi} kg/m²` : '--'}
                </div>
              </div>
            </div>
          </div>

          {/* 肺部相關疾病史 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LungsIcon size={18} />
              肺部相關疾病史（有無得過下列肺部相關疾病？）
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
              {[
                { key: 'copd', label: '肺阻塞 (COPD)' },
                { key: 'tb', label: '肺結核 (TB)' },
                { key: 'pneumonia', label: '肺炎' },
                { key: 'chronic_bronchitis', label: '慢性支氣管炎' },
                { key: 'pneumoconiosis', label: '塵肺症 (Pneumoconiosis)' },
                { key: 'emphysema', label: '肺氣腫 (Emphysema)' },
                { key: 'ipf', label: '特發性肺纖維化 (IPF)' },
                { key: 'systemic_sclerosis', label: '全身性硬化症 (Systemic Sclerosis)' }
              ].map(item => (
                <label key={item.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!(lung.pulmonary_disease_history as any)[item.key]}
                    onChange={e => {
                      const checked = e.target.checked;
                      setLung(prev => ({
                        ...prev,
                        pulmonary_disease_history: {
                          ...prev.pulmonary_disease_history,
                          [item.key]: checked,
                          none: false
                        }
                      }));
                    }}
                  />
                  <span>{item.label}</span>
                </label>
              ))}

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#059669' }}>
                <input
                  type="checkbox"
                  checked={lung.pulmonary_disease_history.none}
                  onChange={e => {
                    if (e.target.checked) {
                      setLung(prev => ({
                        ...prev,
                        pulmonary_disease_history: {
                          copd: false,
                          tb: false,
                          pneumonia: false,
                          chronic_bronchitis: false,
                          pneumoconiosis: false,
                          emphysema: false,
                          ipf: false,
                          systemic_sclerosis: false,
                          none: true,
                          exception_declared: prev.pulmonary_disease_history.exception_declared
                        }
                      }));
                    } else {
                      setLung(prev => ({
                        ...prev,
                        pulmonary_disease_history: { ...prev.pulmonary_disease_history, none: false }
                      }));
                    }
                  }}
                />
                <span>無以上疾病</span>
              </label>
            </div>

            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', color: '#be123c', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={lung.pulmonary_disease_history.exception_declared}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      pulmonary_disease_history: { ...prev.pulmonary_disease_history, exception_declared: e.target.checked },
                      declarations: { ...prev.declarations, exclusion_exception_declaration: e.target.checked }
                    }))
                  }
                />
                <span>
                  雖具疑似肺癌排除狀況，但已檢附醫師診斷或評估結果，認為非疑似肺癌情形，且個案狀況能接受 LDCT 肺癌篩檢，並簽具聲明書【附件一之七】。
                </span>
              </label>
            </div>
          </div>

          {/* 家族史 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem', background: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                家族史（與您有血緣的父母、子女或兄弟姊妹中，有無人得過肺癌？）
              </h3>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="has_fam_lung"
                    checked={!lung.family_history.has_family_history}
                    onChange={() =>
                      setLung(prev => ({
                        ...prev,
                        family_history: {
                          ...prev.family_history,
                          has_family_history: false,
                          total_affected_count: 0
                        },
                        declarations: { ...prev.declarations, family_relative_declaration: false }
                      }))
                    }
                  />
                  無
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 600, color: '#e11d48' }}>
                  <input
                    type="radio"
                    name="has_fam_lung"
                    checked={lung.family_history.has_family_history}
                    onChange={() =>
                      setLung(prev => ({
                        ...prev,
                        family_history: {
                          ...prev.family_history,
                          has_family_history: true
                        },
                        declarations: { ...prev.declarations, family_relative_declaration: true }
                      }))
                    }
                  />
                  有 (符合公費肺癌篩檢資格)
                </label>
              </div>
            </div>

            {lung.family_history.has_family_history && (
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                <div style={{ marginBottom: '1rem', fontWeight: 600, color: '#be123c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>共罹患人數：</span>
                  <input
                    type="number"
                    style={{ width: '80px', padding: '0.25rem 0.5rem' }}
                    className="form-control"
                    value={lung.family_history.total_affected_count || 1}
                    onChange={e =>
                      setLung(prev => ({
                        ...prev,
                        family_history: { ...prev.family_history, total_affected_count: parseInt(e.target.value) || 0 }
                      }))
                    }
                  />
                  <span>人，請填下方表格各親屬罹癌人數及確診年齡：</span>
                </div>

                <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>血緣關係</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>父親</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>母親</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>兄弟</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>姊妹</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>兒子</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>女兒</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem', fontWeight: 600 }}>罹患肺癌人數</td>
                        {(['father', 'mother', 'brother', 'sister', 'son', 'daughter'] as const).map(rel => (
                          <td key={rel} style={{ border: '1px solid #cbd5e1', padding: '0.4rem' }}>
                            <input
                              type="number"
                              min="0"
                              style={{ width: '55px', textAlign: 'center', padding: '0.2rem' }}
                              value={lung.family_history.details[rel]?.affectedCount || 0}
                              onChange={e => {
                                const count = parseInt(e.target.value) || 0;
                                setLung(prev => ({
                                  ...prev,
                                  family_history: {
                                    ...prev.family_history,
                                    details: {
                                      ...prev.family_history.details,
                                      [rel]: {
                                        ...prev.family_history.details[rel],
                                        affectedCount: count
                                      }
                                    }
                                  }
                                }));
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem', fontWeight: 600 }}>
                          確診時年齡 (歲)<br />
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>同類型填最小值</span>
                        </td>
                        {(['father', 'mother', 'brother', 'sister', 'son', 'daughter'] as const).map(rel => (
                          <td key={rel} style={{ border: '1px solid #cbd5e1', padding: '0.4rem' }}>
                            <input
                              type="number"
                              min="1"
                              max="120"
                              placeholder="歲"
                              style={{ width: '55px', textAlign: 'center', padding: '0.2rem' }}
                              value={lung.family_history.details[rel]?.diagnosedAgeMin || ''}
                              onChange={e => {
                                const age = e.target.value ? parseInt(e.target.value) : null;
                                setLung(prev => ({
                                  ...prev,
                                  family_history: {
                                    ...prev.family_history,
                                    details: {
                                      ...prev.family_history.details,
                                      [rel]: {
                                        ...prev.family_history.details[rel],
                                        diagnosedAgeMin: age
                                      }
                                    }
                                  }
                                }));
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 證明文件或聲明書所列家屬資訊 */}
                <div style={{ background: '#fdf2f8', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #fbcfe8' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9d174d', marginBottom: '0.5rem' }}>
                    診斷證明或聲明書所列家屬資訊：
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>家屬姓名</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="例如: 王美麗"
                        value={lung.family_history.proof_relative_name}
                        onChange={e =>
                          setLung(prev => ({
                            ...prev,
                            family_history: { ...prev.family_history, proof_relative_name: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>民國出生年月日</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="例如: 38年5月12日"
                        value={lung.family_history.proof_relative_birth}
                        onChange={e =>
                          setLung(prev => ({
                            ...prev,
                            family_history: { ...prev.family_history, proof_relative_birth: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>身分證字號 (民國38年前無ID得免填)</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="例如: A200112233"
                        value={lung.family_history.proof_relative_id}
                        onChange={e =>
                          setLung(prev => ({
                            ...prev,
                            family_history: { ...prev.family_history, proof_relative_id: e.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 吸菸史及二手菸 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Cigarette size={20} color="#dc2626" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                吸菸史及二手菸（含一氧化碳檢測與包-年計算）
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>一氧化碳檢測值 (ppm)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="例如: 12"
                  value={lung.smoking_history.co_reading_ppm ?? ''}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      smoking_history: {
                        ...prev.smoking_history,
                        co_reading_ppm: e.target.value ? parseInt(e.target.value) : null
                      }
                    }))
                  }
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>吸菸史狀態</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="has_smoke"
                      checked={lung.smoking_history.has_smoking_history}
                      onChange={() =>
                        setLung(prev => ({
                          ...prev,
                          smoking_history: {
                            ...prev.smoking_history,
                            has_smoking_history: true,
                            no_smoke_and_no_secondhand: false
                          }
                        }))
                      }
                    />
                    有吸菸史
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="has_smoke"
                      checked={!lung.smoking_history.has_smoking_history}
                      onChange={() =>
                        setLung(prev => ({
                          ...prev,
                          smoking_history: {
                            ...prev.smoking_history,
                            has_smoking_history: false,
                            packs_per_day: null,
                            smoking_years: null,
                            pack_years: null
                          }
                        }))
                      }
                    />
                    從不吸菸
                  </label>
                </div>
              </div>
            </div>

            {/* 吸菸史細節與公式 */}
            {lung.smoking_history.has_smoking_history && (
              <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <span>每天抽</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    style={{ width: '70px', textAlign: 'center' }}
                    className="form-control"
                    placeholder="包"
                    value={lung.smoking_history.packs_per_day ?? ''}
                    onChange={e => {
                      const p = e.target.value ? parseFloat(e.target.value) : null;
                      updateSmokingCalculation(p, lung.smoking_history.smoking_years);
                    }}
                  />
                  <span>包 (20支/包) × 抽菸</span>
                  <input
                    type="number"
                    min="0"
                    style={{ width: '70px', textAlign: 'center' }}
                    className="form-control"
                    placeholder="年"
                    value={lung.smoking_history.smoking_years ?? ''}
                    onChange={e => {
                      const y = e.target.value ? parseInt(e.target.value) : null;
                      updateSmokingCalculation(lung.smoking_history.packs_per_day, y);
                    }}
                  />
                  <span>年 ＝ </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: (lung.smoking_history.pack_years || 0) >= 30 ? '#dc2626' : '#2563eb' }}>
                    {lung.smoking_history.pack_years ?? 0} 包-年
                  </span>
                  {(lung.smoking_history.pack_years || 0) >= 30 && (
                    <span style={{ background: '#fecaca', color: '#991b1b', fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                      ✓ 達 30 包-年（符重度吸菸公費補助資格）
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #feb2b2' }}>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>是否已戒菸？</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="is_quit"
                          checked={lung.smoking_history.is_quit}
                          onChange={() => setLung(prev => ({ ...prev, smoking_history: { ...prev.smoking_history, is_quit: true } }))}
                        />
                        已戒菸
                      </label>
                      {lung.smoking_history.is_quit && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.8rem' }}>自民國</span>
                          <input
                            type="number"
                            placeholder="年"
                            style={{ width: '60px', padding: '0.2rem' }}
                            value={lung.smoking_history.quit_year_minguo ?? ''}
                            onChange={e =>
                              setLung(prev => ({
                                ...prev,
                                smoking_history: {
                                  ...prev.smoking_history,
                                  quit_year_minguo: e.target.value ? parseInt(e.target.value) : null
                                }
                              }))
                            }
                          />
                          <span style={{ fontSize: '0.8rem' }}>年成功戒菸</span>
                        </div>
                      )}
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="is_quit"
                          checked={!lung.smoking_history.is_quit}
                          onChange={() => setLung(prev => ({ ...prev, smoking_history: { ...prev.smoking_history, is_quit: false } }))}
                        />
                        否，目前仍有吸菸
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>戒菸服務</label>
                    <select
                      className="form-control"
                      value={lung.smoking_history.smoking_cessation_service}
                      onChange={e =>
                        setLung(prev => ({
                          ...prev,
                          smoking_history: { ...prev.smoking_history, smoking_cessation_service: e.target.value as any }
                        }))
                      }
                    >
                      <option value="OFFERED">提供戒菸服務</option>
                      <option value="IN_TREATMENT">已在戒菸療程</option>
                      <option value="NONE">未接受戒菸服務</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 二手菸暴露與無菸狀態 */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={lung.smoking_history.secondhand_smoke_exposure}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      smoking_history: {
                        ...prev.smoking_history,
                        secondhand_smoke_exposure: e.target.checked,
                        no_smoke_and_no_secondhand: false
                      }
                    }))
                  }
                />
                <span>有二手菸暴露（每週至少 1 天吸入菸草煙霧 15 分鐘以上）</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#059669', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={lung.smoking_history.no_smoke_and_no_secondhand}
                  onChange={e => {
                    if (e.target.checked) {
                      setLung(prev => ({
                        ...prev,
                        smoking_history: {
                          ...prev.smoking_history,
                          has_smoking_history: false,
                          packs_per_day: null,
                          smoking_years: null,
                          pack_years: null,
                          secondhand_smoke_exposure: false,
                          no_smoke_and_no_secondhand: true
                        }
                      }));
                    } else {
                      setLung(prev => ({
                        ...prev,
                        smoking_history: { ...prev.smoking_history, no_smoke_and_no_secondhand: false }
                      }));
                    }
                  }}
                />
                <span>無吸菸也無二手菸暴露</span>
              </label>
            </div>
          </div>

          {/* 油煙暴露 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Flame size={20} color="#ea580c" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                油煙暴露（烹飪習慣）
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span>煮食經歷</span>
              <input
                type="number"
                min="0"
                style={{ width: '70px', textAlign: 'center' }}
                className="form-control"
                placeholder="年"
                value={lung.oil_smoke.cooking_years ?? ''}
                onChange={e =>
                  setLung(prev => ({
                    ...prev,
                    oil_smoke: { ...prev.oil_smoke, cooking_years: e.target.value ? parseInt(e.target.value) : null }
                  }))
                }
              />
              <span>年，每週煎</span>
              <input
                type="number"
                min="0"
                max="7"
                style={{ width: '60px', textAlign: 'center' }}
                className="form-control"
                value={lung.oil_smoke.fried_days_per_week ?? ''}
                onChange={e =>
                  setLung(prev => ({
                    ...prev,
                    oil_smoke: { ...prev.oil_smoke, fried_days_per_week: e.target.value ? parseInt(e.target.value) : null }
                  }))
                }
              />
              <span>天，炒</span>
              <input
                type="number"
                min="0"
                max="7"
                style={{ width: '60px', textAlign: 'center' }}
                className="form-control"
                value={lung.oil_smoke.stir_fry_days_per_week ?? ''}
                onChange={e =>
                  setLung(prev => ({
                    ...prev,
                    oil_smoke: { ...prev.oil_smoke, stir_fry_days_per_week: e.target.value ? parseInt(e.target.value) : null }
                  }))
                }
              />
              <span>天，炸</span>
              <input
                type="number"
                min="0"
                max="7"
                style={{ width: '60px', textAlign: 'center' }}
                className="form-control"
                value={lung.oil_smoke.deep_fry_days_per_week ?? ''}
                onChange={e =>
                  setLung(prev => ({
                    ...prev,
                    oil_smoke: { ...prev.oil_smoke, deep_fry_days_per_week: e.target.value ? parseInt(e.target.value) : null }
                  }))
                }
              />
              <span>天 (填整數)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>使用排油煙機情形：</span>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="use_range_hood"
                  checked={lung.oil_smoke.use_range_hood === true}
                  onChange={() => setLung(prev => ({ ...prev, oil_smoke: { ...prev.oil_smoke, use_range_hood: true } }))}
                />
                有使用
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="use_range_hood"
                  checked={lung.oil_smoke.use_range_hood === false}
                  onChange={() => setLung(prev => ({ ...prev, oil_smoke: { ...prev.oil_smoke, use_range_hood: false } }))}
                />
                無使用
              </label>
            </div>
          </div>

          {/* 職業暴露 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Building2 size={20} color="#475569" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                職業暴露史
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.6rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={lung.occupational_exposure.asbestos}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      occupational_exposure: { ...prev.occupational_exposure, asbestos: e.target.checked, none: false }
                    }))
                  }
                />
                <span>接觸石綿如石綿製造、造/拆船、鍋爐管線保養業等</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={lung.occupational_exposure.heavy_metals_coal}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      occupational_exposure: { ...prev.occupational_exposure, heavy_metals_coal: e.target.checked, none: false }
                    }))
                  }
                />
                <span>接觸重金屬、煤、瀝青等如冶煉工廠、金屬製造業、焊接、礦業等</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={lung.occupational_exposure.dust_cotton}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      occupational_exposure: { ...prev.occupational_exposure, dust_cotton: e.target.checked, none: false }
                    }))
                  }
                />
                <span>暴露於粉塵、棉絮</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={lung.occupational_exposure.radiation_environment}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      occupational_exposure: { ...prev.occupational_exposure, radiation_environment: e.target.checked, none: false }
                    }))
                  }
                />
                <span>放射環境</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={lung.occupational_exposure.temple_incense}
                  onChange={e =>
                    setLung(prev => ({
                      ...prev,
                      occupational_exposure: { ...prev.occupational_exposure, temple_incense: e.target.checked, none: false }
                    }))
                  }
                />
                <span>廟宇工作 (燒香)</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#059669' }}>
                <input
                  type="checkbox"
                  checked={lung.occupational_exposure.none}
                  onChange={e => {
                    if (e.target.checked) {
                      setLung(prev => ({
                        ...prev,
                        occupational_exposure: {
                          asbestos: false,
                          heavy_metals_coal: false,
                          dust_cotton: false,
                          radiation_environment: false,
                          temple_incense: false,
                          none: true
                        }
                      }));
                    } else {
                      setLung(prev => ({
                        ...prev,
                        occupational_exposure: { ...prev.occupational_exposure, none: false }
                      }));
                    }
                  }}
                />
                <span>無上述暴露</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveTab('PATIENT')}
            >
              回上一步：基本資料
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setActiveTab('DECLARATION')}
            >
              下一步：聲明書確認與簽名
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: 聲明書與簽名確認 */}
      {activeTab === 'DECLARATION' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <ShieldCheck size={24} color="#0284c7" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                相關公費資格聲明書與數位親筆簽名【附件一之五、六、七】
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                若無法出具實體證明文件或具特定情況，請簽具相對應聲明書留存病歷
              </span>
            </div>
          </div>

          {/* 3 大聲明書區塊 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* 附件一之五：血親肺癌聲明書 */}
            <div
              style={{
                border: lung.declarations?.family_relative_declaration ? '2px solid #ec4899' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                background: lung.declarations?.family_relative_declaration ? '#fdf2f8' : '#fafafa'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#9d174d', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!lung.declarations?.family_relative_declaration}
                    onChange={e =>
                      setLung(prev => ({
                        ...prev,
                        declarations: { ...prev.declarations, family_relative_declaration: e.target.checked }
                      }))
                    }
                  />
                  <span>【附件一之五】具血緣關係之父母、子女或兄弟姊妹曾患有肺癌聲明書</span>
                </label>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>國健署公版</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.5rem 0' }}>
                因長輩早期罹病診斷證明書佚失或其他原因，無法出具血親罹患肺癌證明時填具。
              </p>
              {lung.declarations?.family_relative_declaration && (
                <div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="聲明原因（例如：長輩民國80年間於它院診斷肺癌病歷逾保存期限無法出具）"
                    value={lung.declarations?.family_declaration_reason || ''}
                    onChange={e =>
                      setLung(prev => ({
                        ...prev,
                        declarations: { ...prev.declarations, family_declaration_reason: e.target.value }
                      }))
                    }
                  />
                </div>
              )}
            </div>

            {/* 附件一之六：重度吸菸史聲明書 */}
            <div
              style={{
                border: lung.declarations?.heavy_smoker_declaration ? '2px solid #f97316' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                background: lung.declarations?.heavy_smoker_declaration ? '#fff7ed' : '#fafafa'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#c2410c', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!lung.declarations?.heavy_smoker_declaration}
                    onChange={e =>
                      setLung(prev => ({
                        ...prev,
                        declarations: { ...prev.declarations, heavy_smoker_declaration: e.target.checked }
                      }))
                    }
                  />
                  <span>【附件一之六】具重度吸菸史聲明書（吸菸史達 30 包-年以上）</span>
                </label>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>國健署公版</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.5rem 0' }}>
                立聲明書人仍在吸菸或曾經吸菸，平均每日抽菸包數乘年數達 30 包-年，聲明屬實並願負法律責任。
              </p>
              {lung.declarations?.heavy_smoker_declaration && (
                <div style={{ fontSize: '0.85rem', background: '#fff', padding: '0.5rem', borderRadius: '6px', border: '1px solid #fed7aa', color: '#9a3412' }}>
                  ✓ 本人吸菸史經計算為 {lung.smoking_history.pack_years || 0} 包-年，聲明符合公費補助條件並簽具留存病歷。
                </div>
              )}
            </div>

            {/* 附件一之七：具排除狀況聲明書 */}
            <div
              style={{
                border: lung.declarations?.exclusion_exception_declaration ? '2px solid #ef4444' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                background: lung.declarations?.exclusion_exception_declaration ? '#fef2f2' : '#fafafa'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#b91c1c', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!lung.declarations?.exclusion_exception_declaration}
                    onChange={e =>
                      setLung(prev => ({
                        ...prev,
                        declarations: { ...prev.declarations, exclusion_exception_declaration: e.target.checked }
                      }))
                    }
                  />
                  <span>【附件一之七】具排除狀況聲明書（咳血/體重減輕已由醫師評估排除非疑似肺癌）</span>
                </label>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>國健署公版</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.5rem 0' }}>
                雖然過去1個月內有咳血或1年內體重減輕超過6kg，但經專科醫師評估非疑似肺癌且能接受LDCT篩檢者填寫。
              </p>
              {lung.declarations?.exclusion_exception_declaration && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="評估醫院名稱 (例如: 竹山秀傳醫院)"
                    value={lung.declarations?.exclusion_exception_hospital || ''}
                    onChange={e =>
                      setLung(prev => ({
                        ...prev,
                        declarations: { ...prev.declarations, exclusion_exception_hospital: e.target.value }
                      }))
                    }
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="評估醫師姓名 (例如: 林博仁 醫師)"
                    value={lung.declarations?.exclusion_exception_doctor || ''}
                    onChange={e =>
                      setLung(prev => ({
                        ...prev,
                        declarations: { ...prev.declarations, exclusion_exception_doctor: e.target.value }
                      }))
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* 受檢者數位親筆簽名 */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
              受檢者本人簽名或蓋章 (手印)
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              本人同意接受 LDCT 肺癌篩檢，確認以上資料正確無誤，並同意相關資料作為統計分析、政策評估、查詢及追蹤管理使用。
            </p>

            {patientSignature ? (
              <div style={{ display: 'inline-block', background: '#fff', border: '2px solid #0284c7', borderRadius: '8px', padding: '1rem', position: 'relative' }}>
                <img
                  src={patientSignature.base64Png}
                  alt="受檢者親筆簽名"
                  style={{ maxHeight: '100px', display: 'block', margin: '0 auto' }}
                />
                <div style={{ fontSize: '0.8rem', color: '#0369a1', marginTop: '0.5rem', fontWeight: 600 }}>
                  簽署時間：{new Date(patientSignature.signedAt).toLocaleString()}
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  style={{ marginTop: '0.5rem' }}
                  onClick={() => setIsSignModalOpen(true)}
                >
                  重新簽名
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => setIsSignModalOpen(true)}
              >
                <Wind size={20} />
                點此開啟手寫簽名板 (平板觸控簽名)
              </button>
            )}
          </div>

          {/* 底部按鈕 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveTab('CLINICAL')}
            >
              回上一步：臨床資料
            </button>

            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '0.75rem 2.5rem', fontSize: '1.05rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#0284c7', borderColor: '#0284c7' }}
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Clock className="animate-spin" size={18} />
                  雜湊計算與封存中...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  完成並送出肺癌篩檢問卷
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirm={(base64Png, signedAt) => {
          setPatientSignature({ base64Png, signedAt });
          setIsSignModalOpen(false);
        }}
        patientName={patient.name}
        idCardNo={patient.id_card_no}
        consentType="LUNG"
        title="受檢者親筆簽署：胸部低劑量電腦斷層檢查 (LDCT) 個案同意書"
      />
    </div>
  );
};
