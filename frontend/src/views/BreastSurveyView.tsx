import React, { useState } from 'react';
import type { Patient, BreastScreening, BreastLesionLocation } from '../types';
import { SignatureModal } from '../components/SignatureModal';
import { submitBreastForm } from '../services/api';
import {
  Heart,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Printer,
  ClipboardList,
  AlertTriangle,
  User,
  Truck,
  Activity,
  FileCheck,
  ChevronRight,
  Info
} from 'lucide-react';

interface BreastSurveyViewProps {
  onOpenPrintModal?: (q: any) => void;
  onNavigateToAdmin?: () => void;
}

export const BreastSurveyView: React.FC<BreastSurveyViewProps> = ({
  onOpenPrintModal,
  onNavigateToAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'PATIENT' | 'HISTORY' | 'EXAM' | 'DECLARATION'>('PATIENT');
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
    gender: 'F',
    birth_date: '1974-05-18',
    is_indigenous: false,
    indigenous_tribe: '',
    phone: '049-2642123',
    mobile: '0928-333444',
    zip_code: '557',
    city: '南投縣',
    district: '竹山鎮',
    village: '雲林里',
    road: '大禮路',
    section_lane: '56號',
    education_level: '專科/大學',
    occupation_status: '有',
    marriage_status: '已婚'
  });

  // Breast Screening State (114年1月附表四之四)
  const [breast, setBreast] = useState<BreastScreening>({
    sampling_unit: '竹山秀傳醫療社團法人竹山秀傳醫院',
    sampling_unit_code: '0938040012',
    clinic_date: new Date().toISOString().split('T')[0],
    payment_type: '預防保健',
    screening_van: false,
    van_plate_number: '',

    disease_history: {
      breast_cancer: false,
      breast_cancer_left: false,
      breast_cancer_right: false,
      other_cancer: false,
      other_cancer_detail: '',
      breast_benign_disease: false,
      benign_fibroadenoma: false,
      benign_fibrocystic: false,
      benign_hyperplasia: false,
      benign_other: false,
      benign_other_detail: '',
      benign_unknown: false
    },

    family_history: {
      has_breast_cancer: false,
      mother: false,
      mother_diagnosed_age: '',
      sister: false,
      sister_diagnosed_age: '',
      daughter: false,
      daughter_diagnosed_age: '',
      grandmother: false,
      grandmother_diagnosed_age: '',
      maternal_grandmother: false,
      maternal_grandmother_diagnosed_age: '',
      other_relative: false,
      other_relative_relation: '',
      other_relative_diagnosed_age: ''
    },

    menstruation_history: {
      menarche_age: '13',
      menopause_status: '自然停經',
      menopause_age: '50',
      hysterectomy_left_ovary_retained: false,
      hysterectomy_right_ovary_retained: false,
      hysterectomy_both_ovaries_removed: false,
      chemo_radiation_menopause: false,
      last_menstrual_period_date: ''
    },

    reproductive_history: {
      has_given_birth: true,
      first_birth_age: '26',
      has_breastfed: true,
      breastfeeding_duration_months: '12'
    },

    medication_history: {
      has_used_hormone_replacement: false,
      hormone_duration_months: '',
      is_currently_using_hormone: false,
      has_used_oral_contraceptives: false,
      contraceptive_duration_months: ''
    },

    breast_symptoms: {
      has_symptoms: false,
      mass_tender_right: false,
      mass_tender_left: false,
      nipple_discharge_right: false,
      nipple_discharge_left: false,
      other_symptom: false,
      other_symptom_detail: '',
      lesion_location: {
        right_outer_upper: false,
        right_inner_upper: false,
        right_outer_lower: false,
        right_inner_lower: false,
        right_areola: false,
        left_outer_upper: false,
        left_inner_upper: false,
        left_outer_lower: false,
        left_inner_lower: false,
        left_areola: false
      }
    },

    surgery_history: {
      has_surgery: false,
      biopsy_right: false,
      biopsy_left: false,
      biopsy_year: '',
      lumpectomy_right: false,
      lumpectomy_left: false,
      lumpectomy_year: '',
      mastectomy_right: false,
      mastectomy_left: false,
      mastectomy_year: '',
      reconstruction_right: false,
      reconstruction_left: false,
      reconstruction_year: '',
      augmentation_right: false,
      augmentation_left: false,
      augmentation_year: ''
    }
  });

  // Demo Fill 1: 一般定期篩檢婦女 (52歲，無異常)
  const handleQuickDemoNormal = () => {
    setPatient({
      chart_no: '00551982',
      id_card_no: 'A229871234',
      name: '陳秋萍',
      gender: 'F',
      birth_date: '1974-05-18',
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '049-2642123',
      mobile: '0928-333444',
      zip_code: '557',
      city: '南投縣',
      district: '竹山鎮',
      village: '雲林里',
      road: '大禮路',
      section_lane: '56號',
      education_level: '專科/大學',
      occupation_status: '有',
      marriage_status: '已婚'
    });

    setBreast({
      sampling_unit: '竹山秀傳醫療社團法人竹山秀傳醫院',
      sampling_unit_code: '0938040012',
      clinic_date: new Date().toISOString().split('T')[0],
      payment_type: '預防保健',
      screening_van: true,
      van_plate_number: '88-XY',

      disease_history: {
        breast_cancer: false,
        breast_cancer_left: false,
        breast_cancer_right: false,
        other_cancer: false,
        other_cancer_detail: '',
        breast_benign_disease: false,
        benign_fibroadenoma: false,
        benign_fibrocystic: false,
        benign_hyperplasia: false,
        benign_other: false,
        benign_other_detail: '',
        benign_unknown: false
      },

      family_history: {
        has_breast_cancer: false,
        mother: false,
        mother_diagnosed_age: '',
        sister: false,
        sister_diagnosed_age: '',
        daughter: false,
        daughter_diagnosed_age: '',
        grandmother: false,
        grandmother_diagnosed_age: '',
        maternal_grandmother: false,
        maternal_grandmother_diagnosed_age: '',
        other_relative: false,
        other_relative_relation: '',
        other_relative_diagnosed_age: ''
      },

      menstruation_history: {
        menarche_age: '13',
        menopause_status: '自然停經',
        menopause_age: '50',
        hysterectomy_left_ovary_retained: false,
        hysterectomy_right_ovary_retained: false,
        hysterectomy_both_ovaries_removed: false,
        chemo_radiation_menopause: false,
        last_menstrual_period_date: ''
      },

      reproductive_history: {
        has_given_birth: true,
        first_birth_age: '26',
        has_breastfed: true,
        breastfeeding_duration_months: '12'
      },

      medication_history: {
        has_used_hormone_replacement: false,
        hormone_duration_months: '',
        is_currently_using_hormone: false,
        has_used_oral_contraceptives: true,
        contraceptive_duration_months: '24'
      },

      breast_symptoms: {
        has_symptoms: false,
        mass_tender_right: false,
        mass_tender_left: false,
        nipple_discharge_right: false,
        nipple_discharge_left: false,
        other_symptom: false,
        other_symptom_detail: '',
        lesion_location: {
          right_outer_upper: false,
          right_inner_upper: false,
          right_outer_lower: false,
          right_inner_lower: false,
          right_areola: false,
          left_outer_upper: false,
          left_inner_upper: false,
          left_outer_lower: false,
          left_inner_lower: false,
          left_areola: false
        }
      },

      surgery_history: {
        has_surgery: false,
        biopsy_right: false,
        biopsy_left: false,
        biopsy_year: '',
        lumpectomy_right: false,
        lumpectomy_left: false,
        lumpectomy_year: '',
        mastectomy_right: false,
        mastectomy_left: false,
        mastectomy_year: '',
        reconstruction_right: false,
        reconstruction_left: false,
        reconstruction_year: '',
        augmentation_right: false,
        augmentation_left: false,
        augmentation_year: ''
      }
    });
  };

  // Demo Fill 2: 具家族史與自覺腫塊 (46歲，母親52歲罹乳癌，右乳外上有硬塊)
  const handleQuickDemoHighRisk = () => {
    setPatient({
      chart_no: '00628841',
      id_card_no: 'B221199334',
      name: '黃雅琪',
      gender: 'F',
      birth_date: '1980-09-12',
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '049-2651234',
      mobile: '0937-665544',
      zip_code: '557',
      city: '南投縣',
      district: '竹山鎮',
      village: '延平里',
      road: '延祥路',
      section_lane: '120號',
      education_level: '專科/大學',
      occupation_status: '有',
      marriage_status: '已婚'
    });

    setBreast({
      sampling_unit: '竹山秀傳醫療社團法人竹山秀傳醫院',
      sampling_unit_code: '0938040012',
      clinic_date: new Date().toISOString().split('T')[0],
      payment_type: '預防保健',
      screening_van: false,
      van_plate_number: '',

      disease_history: {
        breast_cancer: false,
        breast_cancer_left: false,
        breast_cancer_right: false,
        other_cancer: false,
        other_cancer_detail: '',
        breast_benign_disease: true,
        benign_fibroadenoma: true,
        benign_fibrocystic: false,
        benign_hyperplasia: false,
        benign_other: false,
        benign_other_detail: '',
        benign_unknown: false
      },

      family_history: {
        has_breast_cancer: true,
        mother: true,
        mother_diagnosed_age: '52',
        sister: false,
        sister_diagnosed_age: '',
        daughter: false,
        daughter_diagnosed_age: '',
        grandmother: false,
        grandmother_diagnosed_age: '',
        maternal_grandmother: false,
        maternal_grandmother_diagnosed_age: '',
        other_relative: false,
        other_relative_relation: '',
        other_relative_diagnosed_age: ''
      },

      menstruation_history: {
        menarche_age: '12',
        menopause_status: '尚未停經',
        menopause_age: '',
        hysterectomy_left_ovary_retained: false,
        hysterectomy_right_ovary_retained: false,
        hysterectomy_both_ovaries_removed: false,
        chemo_radiation_menopause: false,
        last_menstrual_period_date: '2026-10-15'
      },

      reproductive_history: {
        has_given_birth: true,
        first_birth_age: '31',
        has_breastfed: true,
        breastfeeding_duration_months: '8'
      },

      medication_history: {
        has_used_hormone_replacement: false,
        hormone_duration_months: '',
        is_currently_using_hormone: false,
        has_used_oral_contraceptives: false,
        contraceptive_duration_months: ''
      },

      breast_symptoms: {
        has_symptoms: true,
        mass_tender_right: true,
        mass_tender_left: false,
        nipple_discharge_right: false,
        nipple_discharge_left: false,
        other_symptom: false,
        other_symptom_detail: '',
        lesion_location: {
          right_outer_upper: true,
          right_inner_upper: false,
          right_outer_lower: false,
          right_inner_lower: false,
          right_areola: false,
          left_outer_upper: false,
          left_inner_upper: false,
          left_outer_lower: false,
          left_inner_lower: false,
          left_areola: false
        }
      },

      surgery_history: {
        has_surgery: true,
        biopsy_right: true,
        biopsy_left: false,
        biopsy_year: '110',
        lumpectomy_right: false,
        lumpectomy_left: false,
        lumpectomy_year: '',
        mastectomy_right: false,
        mastectomy_left: false,
        mastectomy_year: '',
        reconstruction_right: false,
        reconstruction_left: false,
        reconstruction_year: '',
        augmentation_right: false,
        augmentation_left: false,
        augmentation_year: ''
      }
    });
  };

  const handleSignatureConfirm = (base64Png: string, signedAt: string) => {
    setPatientSignature({ base64Png, signedAt });
    setIsSignModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patient.name || !patient.id_card_no) {
      alert('請先填寫受檢者姓名及身分證號');
      setActiveTab('PATIENT');
      return;
    }

    if (!patientSignature) {
      alert('請先完成受檢婦女數位親筆簽名');
      setActiveTab('DECLARATION');
      setIsSignModalOpen(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const res: any = await submitBreastForm({
        patient,
        breast,
        signature: patientSignature
      });

      if (res) {
        setSubmitResult({
          questionnaireId: res.questionnaire_id || res.questionnaireId,
          dataHash: res.data_hash || res.dataHash,
          createdAt: res.created_at || new Date().toISOString()
        });
      } else {
        alert('儲存失敗');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      alert('送出問卷發生錯誤：' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLesion = (key: keyof BreastLesionLocation) => {
    setBreast(prev => ({
      ...prev,
      breast_symptoms: {
        ...prev.breast_symptoms,
        has_symptoms: true,
        lesion_location: {
          ...prev.breast_symptoms.lesion_location,
          [key]: !prev.breast_symptoms.lesion_location[key]
        }
      }
    }));
  };

  // Success State View
  if (submitResult) {
    return (
      <div className="survey-container fade-in" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: '1rem' }}>
        <div className="card text-center" style={{ maxWidth: '800px', margin: '3rem auto', padding: '3rem 2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1.2rem', background: '#ecfdf5', borderRadius: '50%', color: '#059669', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={64} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#065f46', marginBottom: '0.75rem' }}>
            婦女乳房X光攝影檢查紀錄表單 已成功入檔
          </h2>
          <p style={{ color: '#4b5563', fontSize: '1rem', marginBottom: '2rem' }}>
            國民健康署公版【附表四之四】紀錄已透過 TLS 1.3 與 SHA-256 數位簽章存入加密資料庫，待放射師與專科醫師判讀登錄。
          </p>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div><strong>案件編號：</strong>#{submitResult.questionnaireId}</div>
              <div><strong>受檢婦女：</strong>{patient.name} ({patient.id_card_no})</div>
              <div><strong>受檢日期：</strong>{breast.clinic_date}</div>
              <div><strong>攝影模式：</strong>{breast.screening_van ? `乳房攝影巡迴車 (${breast.van_plate_number || '無車牌'})` : '醫院院內篩檢'}</div>
              <div style={{ gridColumn: '1 / -1', wordBreak: 'break-all' }}>
                <strong>SHA-256 存證雜湊：</strong><br />
                <code style={{ fontSize: '0.8rem', color: '#0284c7' }}>{submitResult.dataHash}</code>
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
                    form_type: 'BREAST',
                    payment_type: breast.payment_type,
                    screening_date: breast.clinic_date,
                    status: 'COMPLETED',
                    patient,
                    breast,
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
                setActiveTab('PATIENT');
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
    <div className="survey-container fade-in" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: '0 0.5rem' }}>
      {/* Top Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <Heart size={16} />
              <span>衛生福利部國民健康署 114年1月最新修訂【附表四之四】</span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              婦女乳房 X 光攝影檢查服務檢查紀錄表單 (受檢者自填端)
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
              竹山秀傳醫院 ‧ 婦女乳癌公費篩檢計畫 (行動乳房攝影巡迴車與院內電子化紀錄系統)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn"
              style={{ background: 'rgba(255,255,255,0.95)', color: '#be123c', fontWeight: 600, fontSize: '0.85rem' }}
              onClick={handleQuickDemoNormal}
              title="快速帶入常規巡檢示範"
            >
              <Sparkles size={15} style={{ marginRight: '4px' }} />
              範例：一般巡迴車常規篩檢 (52歲)
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: 'rgba(255,255,255,0.95)', color: '#be123c', fontWeight: 600, fontSize: '0.85rem' }}
              onClick={handleQuickDemoHighRisk}
              title="快速帶入具家族史與自覺硬塊示範"
            >
              <Sparkles size={15} style={{ marginRight: '4px' }} />
              範例：家族史與自覺腫塊 (46歲)
            </button>
          </div>
        </div>

        {/* Tab Stepper */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem', overflowX: 'auto' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'PATIENT' ? 'btn-light' : 'btn-ghost-light'}`}
            style={{
              background: activeTab === 'PATIENT' ? '#fff' : 'rgba(255,255,255,0.15)',
              color: activeTab === 'PATIENT' ? '#be123c' : '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '8px'
            }}
            onClick={() => setActiveTab('PATIENT')}
          >
            <span>1. 受檢者基本資料與攝影場所</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'HISTORY' ? 'btn-light' : 'btn-ghost-light'}`}
            style={{
              background: activeTab === 'HISTORY' ? '#fff' : 'rgba(255,255,255,0.15)',
              color: activeTab === 'HISTORY' ? '#be123c' : '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '8px'
            }}
            onClick={() => setActiveTab('HISTORY')}
          >
            <span>2. 疾病史、家族史與生理用藥史</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'EXAM' ? 'btn-light' : 'btn-ghost-light'}`}
            style={{
              background: activeTab === 'EXAM' ? '#fff' : 'rgba(255,255,255,0.15)',
              color: activeTab === 'EXAM' ? '#be123c' : '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '8px'
            }}
            onClick={() => setActiveTab('EXAM')}
          >
            <span>3. 自覺症狀、解剖標記與手術史</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'DECLARATION' ? 'btn-light' : 'btn-ghost-light'}`}
            style={{
              background: activeTab === 'DECLARATION' ? '#fff' : 'rgba(255,255,255,0.15)',
              color: activeTab === 'DECLARATION' ? '#be123c' : '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '8px'
            }}
            onClick={() => setActiveTab('DECLARATION')}
          >
            <span>4. 受檢婦女簽名與宣告條款</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ===================== TAB 1: PATIENT PROFILE & VAN ===================== */}
        {activeTab === 'PATIENT' && (
          <div className="card fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User className="text-rose-600" size={22} />
              受檢婦女基本資料與攝影場所登錄
            </h3>

            {/* Screening Location & Van */}
            <div style={{ background: '#fff1f2', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #fecdd3' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#9f1239', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={18} />
                檢查醫療院所與攝影巡迴車設定
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="form-label">檢查醫療院所代碼與名稱</label>
                  <input
                    type="text"
                    className="form-input"
                    value={`${breast.sampling_unit_code} - ${breast.sampling_unit}`}
                    disabled
                    style={{ background: '#f8fafc' }}
                  />
                </div>
                <div>
                  <label className="form-label">檢查日期</label>
                  <input
                    type="date"
                    className="form-input"
                    value={breast.clinic_date}
                    onChange={e => setBreast({ ...breast, clinic_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">健保申報類別</label>
                  <select
                    className="form-select"
                    value={breast.payment_type}
                    onChange={e => setBreast({ ...breast, payment_type: e.target.value })}
                  >
                    <option value="預防保健">預防保健 (45-69歲或40-44歲二等親內血親曾患乳癌)</option>
                    <option value="健保公費">健保公費門診專案</option>
                    <option value="自費檢查">自費高階檢查</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">是否由乳房攝影巡迴車提供服務？</label>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        checked={!breast.screening_van}
                        onChange={() => setBreast({ ...breast, screening_van: false, van_plate_number: '' })}
                      />
                      否 (醫院院內檢查)
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        checked={breast.screening_van}
                        onChange={() => setBreast({ ...breast, screening_van: true })}
                      />
                      是 (巡迴車篩檢)
                    </label>
                  </div>
                </div>
                {breast.screening_van && (
                  <div>
                    <label className="form-label">巡迴車車牌號碼 <span style={{ color: '#e11d48' }}>*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="例：88-XY"
                      value={breast.van_plate_number}
                      onChange={e => setBreast({ ...breast, van_plate_number: e.target.value })}
                      required={breast.screening_van}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Personal Profile Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label className="form-label">受檢婦女姓名 <span style={{ color: '#e11d48' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="例：陳秋萍"
                  value={patient.name}
                  onChange={e => setPatient({ ...patient, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">身分證統一編號 <span style={{ color: '#e11d48' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="例：A229871234"
                  maxLength={10}
                  value={patient.id_card_no}
                  onChange={e => setPatient({ ...patient, id_card_no: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div>
                <label className="form-label">出生日期</label>
                <input
                  type="date"
                  className="form-input"
                  value={patient.birth_date}
                  onChange={e => setPatient({ ...patient, birth_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">病歷號碼 (Chart No.)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="例：00551982"
                  value={patient.chart_no}
                  onChange={e => setPatient({ ...patient, chart_no: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">行動電話 <span style={{ color: '#e11d48' }}>*</span></label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="例：0928-333444"
                  value={patient.mobile}
                  onChange={e => setPatient({ ...patient, mobile: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">聯絡電話 (室話)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="例：049-2642123"
                  value={patient.phone}
                  onChange={e => setPatient({ ...patient, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">婚姻狀況</label>
                <select
                  className="form-select"
                  value={patient.marriage_status}
                  onChange={e => setPatient({ ...patient, marriage_status: e.target.value })}
                >
                  <option value="已婚">已婚</option>
                  <option value="未婚">未婚</option>
                  <option value="喪偶">喪偶</option>
                  <option value="離婚">離婚</option>
                </select>
              </div>

              <div>
                <label className="form-label">教育程度</label>
                <select
                  className="form-select"
                  value={patient.education_level}
                  onChange={e => setPatient({ ...patient, education_level: e.target.value })}
                >
                  <option value="國小">國小</option>
                  <option value="國(初)中">國(初)中</option>
                  <option value="高中/高職">高中/高職</option>
                  <option value="專科/大學">專科/大學</option>
                  <option value="研究所以上">研究所以上</option>
                  <option value="不識字">不識字</option>
                </select>
              </div>

              <div>
                <label className="form-label">原住民族身分</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={!patient.is_indigenous}
                      onChange={() => setPatient({ ...patient, is_indigenous: false, indigenous_tribe: '' })}
                    />
                    非原住民
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={patient.is_indigenous}
                      onChange={() => setPatient({ ...patient, is_indigenous: true })}
                    />
                    具原住民身分
                  </label>
                </div>
              </div>
            </div>

            {/* Address */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
              <label className="form-label">通訊 / 戶籍地址</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="郵遞區號"
                  value={patient.zip_code}
                  onChange={e => setPatient({ ...patient, zip_code: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="縣市 (例: 南投縣)"
                  value={patient.city}
                  onChange={e => setPatient({ ...patient, city: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="鄉鎮市區 (例: 竹山鎮)"
                  value={patient.district}
                  onChange={e => setPatient({ ...patient, district: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="村里 (例: 雲林里)"
                  value={patient.village}
                  onChange={e => setPatient({ ...patient, village: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ gridColumn: 'span 2' }}
                  placeholder="路街號巷樓 (例: 大禮路56號)"
                  value={patient.road}
                  onChange={e => setPatient({ ...patient, road: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#be123c', borderColor: '#be123c' }}
                onClick={() => setActiveTab('HISTORY')}
              >
                下一步：疾病史、家族史與生理用藥史
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: CLINICAL HISTORY ===================== */}
        {activeTab === 'HISTORY' && (
          <div className="card fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity className="text-rose-600" size={22} />
              疾病史、血親乳癌家族史與生理用藥史
            </h3>

            {/* 1. Disease History */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', marginBottom: '1rem' }}>
                一、個人疾病史
              </h4>

              {/* Breast Cancer */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>1. 曾否患乳癌？</span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={!breast.disease_history.breast_cancer}
                      onChange={() =>
                        setBreast({
                          ...breast,
                          disease_history: {
                            ...breast.disease_history,
                            breast_cancer: false,
                            breast_cancer_left: false,
                            breast_cancer_right: false
                          }
                        })
                      }
                    />
                    無
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={breast.disease_history.breast_cancer}
                      onChange={() =>
                        setBreast({
                          ...breast,
                          disease_history: {
                            ...breast.disease_history,
                            breast_cancer: true
                          }
                        })
                      }
                    />
                    有 (請勾選罹患側)：
                  </label>
                  {breast.disease_history.breast_cancer && (
                    <div style={{ display: 'inline-flex', gap: '1rem', marginLeft: '1rem', background: '#fff', padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={breast.disease_history.breast_cancer_right}
                          onChange={e =>
                            setBreast({
                              ...breast,
                              disease_history: {
                                ...breast.disease_history,
                                breast_cancer_right: e.target.checked
                              }
                            })
                          }
                        />
                        右側
                      </label>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={breast.disease_history.breast_cancer_left}
                          onChange={e =>
                            setBreast({
                              ...breast,
                              disease_history: {
                                ...breast.disease_history,
                                breast_cancer_left: e.target.checked
                              }
                            })
                          }
                        />
                        左側
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Other Cancer */}
              <div style={{ marginBottom: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>2. 曾否患其他癌症？</span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={!breast.disease_history.other_cancer}
                      onChange={() =>
                        setBreast({
                          ...breast,
                          disease_history: {
                            ...breast.disease_history,
                            other_cancer: false,
                            other_cancer_detail: ''
                          }
                        })
                      }
                    />
                    無
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={breast.disease_history.other_cancer}
                      onChange={() =>
                        setBreast({
                          ...breast,
                          disease_history: {
                            ...breast.disease_history,
                            other_cancer: true
                          }
                        })
                      }
                    />
                    有 (請填寫癌症名稱)：
                  </label>
                  {breast.disease_history.other_cancer && (
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '220px', padding: '0.35rem 0.6rem' }}
                      placeholder="例：甲狀腺癌、子宮頸癌"
                      value={breast.disease_history.other_cancer_detail}
                      onChange={e =>
                        setBreast({
                          ...breast,
                          disease_history: {
                            ...breast.disease_history,
                            other_cancer_detail: e.target.value
                          }
                        })
                      }
                    />
                  )}
                </div>
              </div>

              {/* Benign Breast Disease */}
              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>3. 曾否患乳房良性疾病？</span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={!breast.disease_history.breast_benign_disease}
                      onChange={() =>
                        setBreast({
                          ...breast,
                          disease_history: {
                            ...breast.disease_history,
                            breast_benign_disease: false,
                            benign_fibroadenoma: false,
                            benign_fibrocystic: false,
                            benign_hyperplasia: false,
                            benign_other: false,
                            benign_other_detail: '',
                            benign_unknown: false
                          }
                        })
                      }
                    />
                    無
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={breast.disease_history.breast_benign_disease}
                      onChange={() =>
                        setBreast({
                          ...breast,
                          disease_history: {
                            ...breast.disease_history,
                            breast_benign_disease: true
                          }
                        })
                      }
                    />
                    有 (可複選下列診斷)：
                  </label>
                </div>

                {breast.disease_history.breast_benign_disease && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', background: '#fff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={breast.disease_history.benign_fibroadenoma}
                        onChange={e =>
                          setBreast({
                            ...breast,
                            disease_history: {
                              ...breast.disease_history,
                              benign_fibroadenoma: e.target.checked
                            }
                          })
                        }
                      />
                      纖維腺瘤
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={breast.disease_history.benign_fibrocystic}
                        onChange={e =>
                          setBreast({
                            ...breast,
                            disease_history: {
                              ...breast.disease_history,
                              benign_fibrocystic: e.target.checked
                            }
                          })
                        }
                      />
                      纖維囊腫
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={breast.disease_history.benign_hyperplasia}
                        onChange={e =>
                          setBreast({
                            ...breast,
                            disease_history: {
                              ...breast.disease_history,
                              benign_hyperplasia: e.target.checked
                            }
                          })
                        }
                      />
                      上皮增生
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={breast.disease_history.benign_other}
                        onChange={e =>
                          setBreast({
                            ...breast,
                            disease_history: {
                              ...breast.disease_history,
                              benign_other: e.target.checked
                            }
                          })
                        }
                      />
                      其他
                    </label>
                    {breast.disease_history.benign_other && (
                      <input
                        type="text"
                        className="form-input"
                        style={{ width: '160px', padding: '0.2rem 0.5rem' }}
                        placeholder="說明其他良性病灶"
                        value={breast.disease_history.benign_other_detail}
                        onChange={e =>
                          setBreast({
                            ...breast,
                            disease_history: {
                              ...breast.disease_history,
                              benign_other_detail: e.target.value
                            }
                          })
                        }
                      />
                    )}
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={breast.disease_history.benign_unknown}
                        onChange={e =>
                          setBreast({
                            ...breast,
                            disease_history: {
                              ...breast.disease_history,
                              benign_unknown: e.target.checked
                            }
                          })
                        }
                      />
                      不知道具體診斷
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Family History */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                  二、血親乳癌家族史 (具血親之親屬是否曾患乳癌？)
                </h4>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={!breast.family_history.has_breast_cancer}
                      onChange={() =>
                        setBreast({
                          ...breast,
                          family_history: {
                            ...breast.family_history,
                            has_breast_cancer: false,
                            mother: false,
                            mother_diagnosed_age: '',
                            sister: false,
                            sister_diagnosed_age: '',
                            daughter: false,
                            daughter_diagnosed_age: '',
                            grandmother: false,
                            grandmother_diagnosed_age: '',
                            maternal_grandmother: false,
                            maternal_grandmother_diagnosed_age: '',
                            other_relative: false,
                            other_relative_relation: '',
                            other_relative_diagnosed_age: ''
                          }
                        })
                      }
                    />
                    無
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={breast.family_history.has_breast_cancer}
                      onChange={() =>
                        setBreast({
                          ...breast,
                          family_history: {
                            ...breast.family_history,
                            has_breast_cancer: true
                          }
                        })
                      }
                    />
                    有
                  </label>
                </div>
              </div>

              {breast.family_history.has_breast_cancer && (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', overflowX: 'auto', marginTop: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>血親親屬稱謂</th>
                        <th style={{ padding: '0.75rem 1rem' }}>是否曾患乳癌</th>
                        <th style={{ padding: '0.75rem 1rem' }}>罹患年齡 (歲)</th>
                        <th style={{ padding: '0.75rem 1rem' }}>備註說明</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Mother */}
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>母親</td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.family_history.mother}
                            onChange={e => setBreast({
                              ...breast,
                              family_history: { ...breast.family_history, mother: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="number"
                            className="form-input"
                            style={{ width: '100px', padding: '0.2rem 0.5rem' }}
                            placeholder="年齡"
                            disabled={!breast.family_history.mother}
                            value={breast.family_history.mother_diagnosed_age}
                            onChange={e => setBreast({
                              ...breast,
                              family_history: { ...breast.family_history, mother_diagnosed_age: e.target.value }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem', color: '#64748b' }}>一等親 (高風險公費降至40歲)</td>
                      </tr>

                      {/* Sister */}
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>姊妹</td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.family_history.sister}
                            onChange={e => setBreast({
                              ...breast,
                              family_history: { ...breast.family_history, sister: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="number"
                            className="form-input"
                            style={{ width: '100px', padding: '0.2rem 0.5rem' }}
                            placeholder="年齡"
                            disabled={!breast.family_history.sister}
                            value={breast.family_history.sister_diagnosed_age}
                            onChange={e => setBreast({
                              ...breast,
                              family_history: { ...breast.family_history, sister_diagnosed_age: e.target.value }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem', color: '#64748b' }}>二等親</td>
                      </tr>

                      {/* Daughter */}
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>女兒</td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.family_history.daughter}
                            onChange={e => setBreast({
                              ...breast,
                              family_history: { ...breast.family_history, daughter: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="number"
                            className="form-input"
                            style={{ width: '100px', padding: '0.2rem 0.5rem' }}
                            placeholder="年齡"
                            disabled={!breast.family_history.daughter}
                            value={breast.family_history.daughter_diagnosed_age}
                            onChange={e => setBreast({
                              ...breast,
                              family_history: { ...breast.family_history, daughter_diagnosed_age: e.target.value }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem', color: '#64748b' }}>一等親</td>
                      </tr>

                      {/* Grandmother (Father's mother) */}
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>祖母 (父系)</td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.family_history.grandmother}
                            onChange={e => setBreast({
                              ...breast,
                              family_history: { ...breast.family_history, grandmother: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="number"
                            className="form-input"
                            style={{ width: '100px', padding: '0.2rem 0.5rem' }}
                            placeholder="年齡"
                            disabled={!breast.family_history.grandmother}
                            value={breast.family_history.grandmother_diagnosed_age}
                            onChange={e => setBreast({
                              ...breast,
                              family_history: { ...breast.family_history, grandmother_diagnosed_age: e.target.value }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem', color: '#64748b' }}>二等親</td>
                      </tr>

                      {/* Maternal Grandmother */}
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>外祖母 (母系)</td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.family_history.maternal_grandmother}
                            onChange={e => setBreast({
                              ...breast,
                              family_history: { ...breast.family_history, maternal_grandmother: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="number"
                            className="form-input"
                            style={{ width: '100px', padding: '0.2rem 0.5rem' }}
                            placeholder="年齡"
                            disabled={!breast.family_history.maternal_grandmother}
                            value={breast.family_history.maternal_grandmother_diagnosed_age}
                            onChange={e => setBreast({
                              ...breast,
                              family_history: { ...breast.family_history, maternal_grandmother_diagnosed_age: e.target.value }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem', color: '#64748b' }}>二等親</td>
                      </tr>

                      {/* Other Relative */}
                      <tr>
                        <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>其他血親</td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.family_history.other_relative}
                            onChange={e => setBreast({
                              ...breast,
                              family_history: { ...breast.family_history, other_relative: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="number"
                            className="form-input"
                            style={{ width: '100px', padding: '0.2rem 0.5rem' }}
                            placeholder="年齡"
                            disabled={!breast.family_history.other_relative}
                            value={breast.family_history.other_relative_diagnosed_age}
                            onChange={e => setBreast({
                              ...breast,
                              family_history: { ...breast.family_history, other_relative_diagnosed_age: e.target.value }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ width: '160px', padding: '0.2rem 0.5rem' }}
                            placeholder="關係稱謂 (例: 姑姑)"
                            disabled={!breast.family_history.other_relative}
                            value={breast.family_history.other_relative_relation}
                            onChange={e => setBreast({
                              ...breast,
                              family_history: { ...breast.family_history, other_relative_relation: e.target.value }
                            })}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 3. Menstruation, Reproductive & Medication */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', marginBottom: '1rem' }}>
                三、月經史、生育史與用藥史
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {/* Menarche & Menopause */}
                <div>
                  <label className="form-label">初經年齡 (歲)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="例：13"
                    value={breast.menstruation_history.menarche_age}
                    onChange={e =>
                      setBreast({
                        ...breast,
                        menstruation_history: {
                          ...breast.menstruation_history,
                          menarche_age: e.target.value
                        }
                      })
                    }
                  />
                </div>

                <div>
                  <label className="form-label">停經狀況</label>
                  <select
                    className="form-select"
                    value={breast.menstruation_history.menopause_status}
                    onChange={e =>
                      setBreast({
                        ...breast,
                        menstruation_history: {
                          ...breast.menstruation_history,
                          menopause_status: e.target.value
                        }
                      })
                    }
                  >
                    <option value="尚未停經">尚未停經 (有月經週期)</option>
                    <option value="自然停經">自然停經</option>
                    <option value="子宮切除保留單側卵巢">子宮切除保留單側卵巢</option>
                    <option value="兩側卵巢皆切除">兩側卵巢皆切除</option>
                    <option value="化療放療停經">化療放療停經</option>
                  </select>
                </div>

                {breast.menstruation_history.menopause_status === '自然停經' ? (
                  <div>
                    <label className="form-label">自然停經年齡 (歲)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="例：50"
                      value={breast.menstruation_history.menopause_age}
                      onChange={e =>
                        setBreast({
                          ...breast,
                          menstruation_history: {
                            ...breast.menstruation_history,
                            menopause_age: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                ) : (
                  <div>
                    <label className="form-label">最後一次月經日期</label>
                    <input
                      type="date"
                      className="form-input"
                      value={breast.menstruation_history.last_menstrual_period_date}
                      onChange={e =>
                        setBreast({
                          ...breast,
                          menstruation_history: {
                            ...breast.menstruation_history,
                            last_menstrual_period_date: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                )}

                {/* Birth & Breastfeeding */}
                <div>
                  <label className="form-label">曾否生產過？</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        checked={breast.reproductive_history.has_given_birth}
                        onChange={() =>
                          setBreast({
                            ...breast,
                            reproductive_history: { ...breast.reproductive_history, has_given_birth: true }
                          })
                        }
                      />
                      是 (第一胎年齡：
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: '70px', padding: '0.2rem 0.4rem', marginLeft: '4px' }}
                        value={breast.reproductive_history.first_birth_age}
                        onChange={e =>
                          setBreast({
                            ...breast,
                            reproductive_history: { ...breast.reproductive_history, first_birth_age: e.target.value }
                          })
                        }
                      />
                      歲)
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        checked={!breast.reproductive_history.has_given_birth}
                        onChange={() =>
                          setBreast({
                            ...breast,
                            reproductive_history: { ...breast.reproductive_history, has_given_birth: false, first_birth_age: '' }
                          })
                        }
                      />
                      否
                    </label>
                  </div>
                </div>

                <div>
                  <label className="form-label">曾否哺育母乳？</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        checked={breast.reproductive_history.has_breastfed}
                        onChange={() =>
                          setBreast({
                            ...breast,
                            reproductive_history: { ...breast.reproductive_history, has_breastfed: true }
                          })
                        }
                      />
                      是 (總月數：
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: '70px', padding: '0.2rem 0.4rem', marginLeft: '4px' }}
                        value={breast.reproductive_history.breastfeeding_duration_months}
                        onChange={e =>
                          setBreast({
                            ...breast,
                            reproductive_history: { ...breast.reproductive_history, breastfeeding_duration_months: e.target.value }
                          })
                        }
                      />
                      個月)
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        checked={!breast.reproductive_history.has_breastfed}
                        onChange={() =>
                          setBreast({
                            ...breast,
                            reproductive_history: { ...breast.reproductive_history, has_breastfed: false, breastfeeding_duration_months: '' }
                          })
                        }
                      />
                      否
                    </label>
                  </div>
                </div>

                {/* Hormone Replacement */}
                <div>
                  <label className="form-label">曾否使用荷爾蒙補充療法？</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        checked={breast.medication_history.has_used_hormone_replacement}
                        onChange={() =>
                          setBreast({
                            ...breast,
                            medication_history: { ...breast.medication_history, has_used_hormone_replacement: true }
                          })
                        }
                      />
                      是 (月數：
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: '65px', padding: '0.2rem 0.4rem', margin: '0 4px' }}
                        value={breast.medication_history.hormone_duration_months}
                        onChange={e =>
                          setBreast({
                            ...breast,
                            medication_history: { ...breast.medication_history, hormone_duration_months: e.target.value }
                          })
                        }
                      />
                      月，目前
                      <input
                        type="checkbox"
                        style={{ margin: '0 4px 0 8px' }}
                        checked={breast.medication_history.is_currently_using_hormone}
                        onChange={e =>
                          setBreast({
                            ...breast,
                            medication_history: { ...breast.medication_history, is_currently_using_hormone: e.target.checked }
                          })
                        }
                      />
                      仍使用)
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        checked={!breast.medication_history.has_used_hormone_replacement}
                        onChange={() =>
                          setBreast({
                            ...breast,
                            medication_history: { ...breast.medication_history, has_used_hormone_replacement: false, hormone_duration_months: '', is_currently_using_hormone: false }
                          })
                        }
                      />
                      否
                    </label>
                  </div>
                </div>

                {/* Oral Contraceptives */}
                <div>
                  <label className="form-label">曾否使用口服避孕藥？</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        checked={breast.medication_history.has_used_oral_contraceptives}
                        onChange={() =>
                          setBreast({
                            ...breast,
                            medication_history: { ...breast.medication_history, has_used_oral_contraceptives: true }
                          })
                        }
                      />
                      是 (使用總月數：
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: '70px', padding: '0.2rem 0.4rem', marginLeft: '4px' }}
                        value={breast.medication_history.contraceptive_duration_months}
                        onChange={e =>
                          setBreast({
                            ...breast,
                            medication_history: { ...breast.medication_history, contraceptive_duration_months: e.target.value }
                          })
                        }
                      />
                      個月)
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        checked={!breast.medication_history.has_used_oral_contraceptives}
                        onChange={() =>
                          setBreast({
                            ...breast,
                            medication_history: { ...breast.medication_history, has_used_oral_contraceptives: false, contraceptive_duration_months: '' }
                          })
                        }
                      />
                      否
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setActiveTab('PATIENT')}
              >
                上一步
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#be123c', borderColor: '#be123c' }}
                onClick={() => setActiveTab('EXAM')}
              >
                下一步：自覺症狀與乳房解剖定位標記
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: SYMPTOMS & ANATOMY QUADRANTS ===================== */}
        {activeTab === 'EXAM' && (
          <div className="card fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart className="text-rose-600" size={22} />
              自覺症狀、乳房解剖象限互動標記與手術史
            </h3>

            {/* 1. Self-reported Symptoms */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', marginBottom: '1rem' }}>
                一、乳房自覺症狀
              </h4>

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>目前是否有任何自覺不適或症狀？</span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={!breast.breast_symptoms.has_symptoms}
                      onChange={() =>
                        setBreast({
                          ...breast,
                          breast_symptoms: {
                            ...breast.breast_symptoms,
                            has_symptoms: false,
                            mass_tender_right: false,
                            mass_tender_left: false,
                            nipple_discharge_right: false,
                            nipple_discharge_left: false,
                            other_symptom: false,
                            other_symptom_detail: '',
                            lesion_location: {
                              right_outer_upper: false,
                              right_inner_upper: false,
                              right_outer_lower: false,
                              right_inner_lower: false,
                              right_areola: false,
                              left_outer_upper: false,
                              left_inner_upper: false,
                              left_outer_lower: false,
                              left_inner_lower: false,
                              left_areola: false
                            }
                          }
                        })
                      }
                    />
                    無自覺症狀 (健康無異樣)
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={breast.breast_symptoms.has_symptoms}
                      onChange={() =>
                        setBreast({
                          ...breast,
                          breast_symptoms: {
                            ...breast.breast_symptoms,
                            has_symptoms: true
                          }
                        })
                      }
                    />
                    有自覺症狀 (請勾選下列情況)
                  </label>
                </div>
              </div>

              {breast.breast_symptoms.has_symptoms && (
                <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: '0.4rem' }}>摸到硬塊或壓痛：</span>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={breast.breast_symptoms.mass_tender_right}
                            onChange={e =>
                              setBreast({
                                ...breast,
                                breast_symptoms: { ...breast.breast_symptoms, mass_tender_right: e.target.checked }
                              })
                            }
                          />
                          右側
                        </label>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={breast.breast_symptoms.mass_tender_left}
                            onChange={e =>
                              setBreast({
                                ...breast,
                                breast_symptoms: { ...breast.breast_symptoms, mass_tender_left: e.target.checked }
                              })
                            }
                          />
                          左側
                        </label>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: '0.4rem' }}>乳頭異常分泌物：</span>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={breast.breast_symptoms.nipple_discharge_right}
                            onChange={e =>
                              setBreast({
                                ...breast,
                                breast_symptoms: { ...breast.breast_symptoms, nipple_discharge_right: e.target.checked }
                              })
                            }
                          />
                          右側
                        </label>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={breast.breast_symptoms.nipple_discharge_left}
                            onChange={e =>
                              setBreast({
                                ...breast,
                                breast_symptoms: { ...breast.breast_symptoms, nipple_discharge_left: e.target.checked }
                              })
                            }
                          />
                          左側
                        </label>
                      </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={breast.breast_symptoms.other_symptom}
                          onChange={e =>
                            setBreast({
                              ...breast,
                              breast_symptoms: { ...breast.breast_symptoms, other_symptom: e.target.checked }
                            })
                          }
                        />
                        其他自覺症狀：
                      </label>
                      {breast.breast_symptoms.other_symptom && (
                        <input
                          type="text"
                          className="form-input"
                          style={{ marginTop: '0.4rem' }}
                          placeholder="請說明其他異常感受 (例如: 乳房皮膚紅腫、橘皮樣變、乳頭凹陷等)"
                          value={breast.breast_symptoms.other_symptom_detail}
                          onChange={e =>
                            setBreast({
                              ...breast,
                              breast_symptoms: { ...breast.breast_symptoms, other_symptom_detail: e.target.value }
                            })
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Interactive Breast Quadrant Diagram */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                  二、乳房自覺硬塊或病灶解剖象限互動標記 (公版位置圖)
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Info size={15} />
                  點擊圖形區塊即可快速選取或取消標記
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                包含外上(UO)、外下(LO)、內上(UI)、內下(LI)與乳暈區(Areola)。
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}>
                {/* Right Breast */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                  <h5 style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem', marginBottom: '1rem' }}>
                    右側乳房 (Right Breast)
                  </h5>

                  <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto' }}>
                    {/* Circle Container */}
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #cbd5e1', position: 'relative', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
                      {/* Quadrant: Right Outer Upper (Top-Left from patient's perspective, or anatomical right UO) */}
                      <button
                        type="button"
                        onClick={() => toggleLesion('right_outer_upper')}
                        style={{
                          background: breast.breast_symptoms.lesion_location.right_outer_upper ? '#f43f5e' : '#f8fafc',
                          color: breast.breast_symptoms.lesion_location.right_outer_upper ? '#fff' : '#475569',
                          border: 'none',
                          borderRight: '1px dashed #cbd5e1',
                          borderBottom: '1px dashed #cbd5e1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        外上 (UO)
                      </button>

                      {/* Quadrant: Right Inner Upper (UI) */}
                      <button
                        type="button"
                        onClick={() => toggleLesion('right_inner_upper')}
                        style={{
                          background: breast.breast_symptoms.lesion_location.right_inner_upper ? '#f43f5e' : '#f8fafc',
                          color: breast.breast_symptoms.lesion_location.right_inner_upper ? '#fff' : '#475569',
                          border: 'none',
                          borderBottom: '1px dashed #cbd5e1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        內上 (UI)
                      </button>

                      {/* Quadrant: Right Outer Lower (LO) */}
                      <button
                        type="button"
                        onClick={() => toggleLesion('right_outer_lower')}
                        style={{
                          background: breast.breast_symptoms.lesion_location.right_outer_lower ? '#f43f5e' : '#f8fafc',
                          color: breast.breast_symptoms.lesion_location.right_outer_lower ? '#fff' : '#475569',
                          border: 'none',
                          borderRight: '1px dashed #cbd5e1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        外下 (LO)
                      </button>

                      {/* Quadrant: Right Inner Lower (LI) */}
                      <button
                        type="button"
                        onClick={() => toggleLesion('right_inner_lower')}
                        style={{
                          background: breast.breast_symptoms.lesion_location.right_inner_lower ? '#f43f5e' : '#f8fafc',
                          color: breast.breast_symptoms.lesion_location.right_inner_lower ? '#fff' : '#475569',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        內下 (LI)
                      </button>
                    </div>

                    {/* Central Areola Button */}
                    <button
                      type="button"
                      onClick={() => toggleLesion('right_areola')}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '74px',
                        height: '74px',
                        borderRadius: '50%',
                        background: breast.breast_symptoms.lesion_location.right_areola ? '#be123c' : '#e2e8f0',
                        color: breast.breast_symptoms.lesion_location.right_areola ? '#fff' : '#1e293b',
                        border: '2px solid #fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      乳暈區
                    </button>
                  </div>
                </div>

                {/* Left Breast */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                  <h5 style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem', marginBottom: '1rem' }}>
                    左側乳房 (Left Breast)
                  </h5>

                  <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto' }}>
                    {/* Circle Container */}
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #cbd5e1', position: 'relative', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
                      {/* Left Inner Upper (UI) */}
                      <button
                        type="button"
                        onClick={() => toggleLesion('left_inner_upper')}
                        style={{
                          background: breast.breast_symptoms.lesion_location.left_inner_upper ? '#f43f5e' : '#f8fafc',
                          color: breast.breast_symptoms.lesion_location.left_inner_upper ? '#fff' : '#475569',
                          border: 'none',
                          borderRight: '1px dashed #cbd5e1',
                          borderBottom: '1px dashed #cbd5e1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        內上 (UI)
                      </button>

                      {/* Left Outer Upper (UO) */}
                      <button
                        type="button"
                        onClick={() => toggleLesion('left_outer_upper')}
                        style={{
                          background: breast.breast_symptoms.lesion_location.left_outer_upper ? '#f43f5e' : '#f8fafc',
                          color: breast.breast_symptoms.lesion_location.left_outer_upper ? '#fff' : '#475569',
                          border: 'none',
                          borderBottom: '1px dashed #cbd5e1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        外上 (UO)
                      </button>

                      {/* Left Inner Lower (LI) */}
                      <button
                        type="button"
                        onClick={() => toggleLesion('left_inner_lower')}
                        style={{
                          background: breast.breast_symptoms.lesion_location.left_inner_lower ? '#f43f5e' : '#f8fafc',
                          color: breast.breast_symptoms.lesion_location.left_inner_lower ? '#fff' : '#475569',
                          border: 'none',
                          borderRight: '1px dashed #cbd5e1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        內下 (LI)
                      </button>

                      {/* Left Outer Lower (LO) */}
                      <button
                        type="button"
                        onClick={() => toggleLesion('left_outer_lower')}
                        style={{
                          background: breast.breast_symptoms.lesion_location.left_outer_lower ? '#f43f5e' : '#f8fafc',
                          color: breast.breast_symptoms.lesion_location.left_outer_lower ? '#fff' : '#475569',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        外下 (LO)
                      </button>
                    </div>

                    {/* Central Areola Button */}
                    <button
                      type="button"
                      onClick={() => toggleLesion('left_areola')}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '74px',
                        height: '74px',
                        borderRadius: '50%',
                        background: breast.breast_symptoms.lesion_location.left_areola ? '#be123c' : '#e2e8f0',
                        color: breast.breast_symptoms.lesion_location.left_areola ? '#fff' : '#1e293b',
                        border: '2px solid #fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      乳暈區
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Surgery History */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                  三、乳房手術史 (包含切片、切除、重建或隆乳)
                </h4>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={!breast.surgery_history.has_surgery}
                      onChange={() =>
                        setBreast({
                          ...breast,
                          surgery_history: {
                            ...breast.surgery_history,
                            has_surgery: false,
                            biopsy_right: false,
                            biopsy_left: false,
                            biopsy_year: '',
                            lumpectomy_right: false,
                            lumpectomy_left: false,
                            lumpectomy_year: '',
                            mastectomy_right: false,
                            mastectomy_left: false,
                            mastectomy_year: '',
                            reconstruction_right: false,
                            reconstruction_left: false,
                            reconstruction_year: '',
                            augmentation_right: false,
                            augmentation_left: false,
                            augmentation_year: ''
                          }
                        })
                      }
                    />
                    無手術史
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={breast.surgery_history.has_surgery}
                      onChange={() =>
                        setBreast({
                          ...breast,
                          surgery_history: {
                            ...breast.surgery_history,
                            has_surgery: true
                          }
                        })
                      }
                    />
                    曾接受過乳房手術
                  </label>
                </div>
              </div>

              {breast.surgery_history.has_surgery && (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>手術項目</th>
                        <th style={{ padding: '0.75rem 1rem' }}>右側</th>
                        <th style={{ padding: '0.75rem 1rem' }}>左側</th>
                        <th style={{ padding: '0.75rem 1rem' }}>手術年份 (民國年/西元年)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Biopsy */}
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>乳房切片檢查 (Biopsy)</td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.surgery_history.biopsy_right}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, biopsy_right: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.surgery_history.biopsy_left}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, biopsy_left: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ width: '130px', padding: '0.2rem 0.5rem' }}
                            placeholder="例: 110年"
                            value={breast.surgery_history.biopsy_year}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, biopsy_year: e.target.value }
                            })}
                          />
                        </td>
                      </tr>

                      {/* Lumpectomy */}
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>腫瘤局部切除 (Lumpectomy)</td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.surgery_history.lumpectomy_right}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, lumpectomy_right: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.surgery_history.lumpectomy_left}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, lumpectomy_left: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ width: '130px', padding: '0.2rem 0.5rem' }}
                            placeholder="例: 108年"
                            value={breast.surgery_history.lumpectomy_year}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, lumpectomy_year: e.target.value }
                            })}
                          />
                        </td>
                      </tr>

                      {/* Mastectomy */}
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>乳房全切除 (Mastectomy)</td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.surgery_history.mastectomy_right}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, mastectomy_right: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.surgery_history.mastectomy_left}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, mastectomy_left: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ width: '130px', padding: '0.2rem 0.5rem' }}
                            placeholder="例: 105年"
                            value={breast.surgery_history.mastectomy_year}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, mastectomy_year: e.target.value }
                            })}
                          />
                        </td>
                      </tr>

                      {/* Reconstruction */}
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>乳房重建手術 (Reconstruction)</td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.surgery_history.reconstruction_right}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, reconstruction_right: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.surgery_history.reconstruction_left}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, reconstruction_left: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ width: '130px', padding: '0.2rem 0.5rem' }}
                            placeholder="例: 106年"
                            value={breast.surgery_history.reconstruction_year}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, reconstruction_year: e.target.value }
                            })}
                          />
                        </td>
                      </tr>

                      {/* Augmentation */}
                      <tr>
                        <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>隆乳 / 義乳植入 (Augmentation)</td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.surgery_history.augmentation_right}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, augmentation_right: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={breast.surgery_history.augmentation_left}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, augmentation_left: e.target.checked }
                            })}
                          />
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ width: '130px', padding: '0.2rem 0.5rem' }}
                            placeholder="例: 102年"
                            value={breast.surgery_history.augmentation_year}
                            onChange={e => setBreast({
                              ...breast,
                              surgery_history: { ...breast.surgery_history, augmentation_year: e.target.value }
                            })}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setActiveTab('HISTORY')}
              >
                上一步
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#be123c', borderColor: '#be123c' }}
                onClick={() => setActiveTab('DECLARATION')}
              >
                下一步：法定知情條款與簽名確認
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: DECLARATION & SIGNATURE ===================== */}
        {activeTab === 'DECLARATION' && (
          <div className="card fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck className="text-rose-600" size={22} />
              受檢婦女法定知情宣告與數位親筆簽名確認
            </h3>

            {/* Legal Statement */}
            <div style={{ background: '#fdf2f8', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fbcfe8', marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#9d174d', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCheck size={18} />
                衛生福利部國民健康署 婦女乳房 X 光攝影檢查服務受檢須知
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <li>
                  <strong>篩檢補助資格：</strong>補助 45 歲以上至未滿 70 歲婦女，或 40 歲以上至未滿 45 歲具乳癌家族史（祖母、外祖母、母親、姊妹、女兒曾患乳癌）之婦女，每 2 年 1 次乳房 X 光攝影檢查。
                </li>
                <li>
                  <strong>檢查限制與限制通知：</strong>乳房 X 光攝影為目前國際公認最有效之乳癌早期篩檢工具，但仍約有 10%~15% 之早期病灶可能因乳腺緻密或其他生理因素未顯影。若檢查結果正常，仍請每兩年定期受檢；如平時自覺乳房異常腫塊或乳頭異樣分泌物，應立即至乳房外科專科門診就醫。
                </li>
                <li>
                  <strong>資料蒐集法定授權：</strong>本表單所填報之個人資料、疾病史及影像判讀結果，將依癌症防治法規定登錄於國民健康署乳癌篩檢資料庫，專供醫療保健、個案追蹤與公共衛生統計使用。
                </li>
              </ul>
            </div>

            {/* Signature Area */}
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    受檢者數位親筆簽名確認 <span style={{ color: '#e11d48' }}>*</span>
                  </h4>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    本人已詳閱上述說明並確認上述自填資料皆屬實無訛。
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsSignModalOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {patientSignature ? '重新簽名' : '開啟手寫簽名板'}
                </button>
              </div>

              {patientSignature ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <img
                    src={patientSignature.base64Png}
                    alt="受檢者數位簽名"
                    style={{ maxHeight: '100px', display: 'inline-block' }}
                  />
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={16} />
                    已於 {new Date(patientSignature.signedAt).toLocaleString('zh-TW')} 完成親筆簽名存證
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsSignModalOpen(true)}
                  style={{
                    padding: '2.5rem',
                    textAlign: 'center',
                    background: '#fff',
                    borderRadius: '8px',
                    border: '2px dashed #cbd5e1',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  <AlertTriangle size={32} style={{ color: '#f59e0b', margin: '0 auto 0.5rem auto' }} />
                  <div style={{ fontWeight: 600 }}>點此開啟手寫簽名板進行數位簽名</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    （符合電子簽章法，加密防竄改存檔）
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setActiveTab('EXAM')}
              >
                上一步
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !patientSignature}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: isSubmitting || !patientSignature ? '#94a3b8' : '#be123c',
                  borderColor: isSubmitting || !patientSignature ? '#94a3b8' : '#be123c',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 700
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner" style={{ width: '16px', height: '16px' }} />
                    資料加密入檔中...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    確認送出紀錄表單
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirm={handleSignatureConfirm}
        patientName={patient.name || '受檢婦女'}
        idCardNo={patient.id_card_no || 'A229871234'}
        consentType="BREAST"
      />
    </div>
  );
};
