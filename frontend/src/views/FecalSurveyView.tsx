import React, { useState } from 'react';
import type { Patient, FecalScreening } from '../types';
import { SignatureModal } from '../components/SignatureModal';
import { submitFecalForm } from '../services/api';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Printer,
  ClipboardList,
  Clock,
  ArrowRight,
  TestTube2
} from 'lucide-react';

interface FecalSurveyViewProps {
  onOpenPrintModal?: (q: any) => void;
  onNavigateToAdmin?: () => void;
}

export const FecalSurveyView: React.FC<FecalSurveyViewProps> = ({
  onOpenPrintModal,
  onNavigateToAdmin
}) => {
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
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
    birth_date: '1974-05-18',
    is_indigenous: false,
    indigenous_tribe: '',
    phone: '049-2658977',
    mobile: '0912-345678',
    zip_code: '5570',
    city: '南投縣',
    district: '竹山鎮',
    village: '雲林里',
    road: '集山路三段',
    section_lane: '480號',
    education_level: '高中(職)',
    occupation_status: '有',
    marriage_status: '已婚'
  });

  // Fecal Screening State
  const [fecal, setFecal] = useState<FecalScreening>({
    payment_type: '預防保健',
    screening_location: '門診',
    hospital_name: '竹山秀傳醫療社團法人竹山秀傳醫院',
    hospital_code: '0938040012',
    clinic_date: new Date().toISOString().split('T')[0],
    smoking_history: false,
    smoking_start_age: null,
    family_colorectal_cancer: 0,
    family_other_cancer: 0,
    has_bowel_symptoms: false,
    declaration_statement: {
      enabled: false,
      inability_reason: '',
      relative_relation: '父親',
      relative_name: '',
      relative_id_card: '',
      is_relative_deceased: false
    }
  });

  // Calculate age from birth date
  const calculateAge = (birthDateStr: string): number => {
    if (!birthDateStr) return 0;
    const birth = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const patientAge = calculateAge(patient.birth_date);
  const is40to44 = patientAge >= 40 && patientAge <= 44;

  // Quick Demo fill scenarios
  const handleQuickDemo50 = () => {
    setPatient({
      chart_no: '00329184',
      id_card_no: 'B120987654',
      name: '李建華',
      gender: 'M',
      birth_date: '1974-06-15',
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '049-2642155',
      mobile: '0928-112233',
      zip_code: '5570',
      city: '南投縣',
      district: '竹山鎮',
      village: '延平里',
      road: '集山路二段',
      section_lane: '120號',
      education_level: '高中(職)',
      occupation_status: '有，製造業',
      marriage_status: '已婚'
    });

    setFecal({
      payment_type: '預防保健',
      screening_location: '門診',
      hospital_name: '竹山秀傳醫療社團法人竹山秀傳醫院',
      hospital_code: '0938040012',
      clinic_date: new Date().toISOString().split('T')[0],
      smoking_history: true,
      smoking_start_age: 22,
      family_colorectal_cancer: 0,
      family_other_cancer: 0,
      has_bowel_symptoms: false,
      declaration_statement: {
        enabled: false,
        inability_reason: '',
        relative_relation: '父親',
        relative_name: '',
        relative_id_card: '',
        is_relative_deceased: false
      }
    });

    // Auto mockup patient signature
    setPatientSignature({
      base64Png: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='80'><path d='M20,50 Q45,15 70,48 T120,35 Q150,60 180,30 T220,55' fill='none' stroke='%230f172a' stroke-width='3' stroke-linecap='round'/></svg>",
      signedAt: new Date().toISOString()
    });
  };

  const handleQuickDemo42WithDeclaration = () => {
    setPatient({
      chart_no: '00874512',
      id_card_no: 'M221456987',
      name: '張雅雯',
      gender: 'F',
      birth_date: '1982-09-20', // ~44 years old
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '049-2651199',
      mobile: '0933-667788',
      zip_code: '5570',
      city: '南投縣',
      district: '竹山鎮',
      village: '竹圍里',
      road: '大禮路',
      section_lane: '68號',
      education_level: '專科、大學',
      occupation_status: '有，金融服務',
      marriage_status: '已婚'
    });

    setFecal({
      payment_type: '預防保健',
      screening_location: '社區或職場設站篩檢',
      hospital_name: '竹山秀傳醫療社團法人竹山秀傳醫院',
      hospital_code: '0938040012',
      clinic_date: new Date().toISOString().split('T')[0],
      smoking_history: false,
      smoking_start_age: null,
      family_colorectal_cancer: 1, // 有直系大腸癌家族史
      family_other_cancer: 0,
      has_bowel_symptoms: true, // 有輕微便秘或血絲症狀
      declaration_statement: {
        enabled: true,
        inability_reason: '父親已過世多年，早期病歷未妥善保存無法調閱診斷證明',
        relative_relation: '父親',
        relative_name: '張明德',
        relative_id_card: 'M100234567',
        is_relative_deceased: true,
        declaration_signed_at: new Date().toISOString()
      }
    });

    setPatientSignature({
      base64Png: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='80'><path d='M25,55 Q50,20 80,50 T130,30 Q160,55 190,25 T220,50' fill='none' stroke='%230f172a' stroke-width='3' stroke-linecap='round'/></svg>",
      signedAt: new Date().toISOString()
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patient.name || !patient.id_card_no) {
      alert('請務必填寫受檢者姓名及身分證號');
      return;
    }

    if (!patientSignature) {
      alert('受檢者請於下方完成親筆數位簽名以符合法規');
      setIsSignModalOpen(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitFecalForm({
        patient,
        fecal,
        signature: patientSignature
      });

      setSubmitResult(res);
    } catch (err: any) {
      alert(err.message || '問卷送出失敗，請檢查網路連線或諮詢櫃檯人員');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="survey-container">
      {/* Official Form Header Banner */}
      <div className="survey-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-success">附表五之四</span>
            <span className="badge badge-info">健康署 114年1月修訂</span>
            <span style={{ fontSize: '0.825rem', color: '#64748B' }}>
              本檢查經費由衛生福利部國民健康署運用菸品健康福利捐/公務預算補助 ‧ 第二聯：存確診及治療醫院
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              onClick={handleQuickDemo50}
              title="快速帶入 50 歲一般公費篩檢受檢者資料"
            >
              <Sparkles size={15} color="#2563EB" />
              示範：50歲一般公費
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              onClick={handleQuickDemo42WithDeclaration}
              title="快速帶入 42 歲具直系大腸癌家族史並附聲明書"
            >
              <Sparkles size={15} color="#7C3AED" />
              示範：42歲+附表五之五聲明書
            </button>
          </div>
        </div>

        <h1 className="survey-title" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TestTube2 size={32} color="#0284C7" />
          健康署定量免疫法糞便潛血檢查服務檢查紀錄結果表單
        </h1>
        <p className="survey-subtitle">
          適用於 50-74 歲民眾每 2 年 1 次公費篩檢，以及 40-44 歲具二親等以內大腸癌家族史之高風險族群早期預防
        </p>
      </div>

      {/* Submission Success Hero */}
      {submitResult ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', border: '2px solid #86EFAC' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: '#DCFCE7', borderRadius: '50%', color: '#16A34A', marginBottom: '1rem' }}>
            <CheckCircle2 size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#14532D', marginBottom: '0.5rem' }}>
            糞便潛血檢查問卷填報完成並成功封存！
          </h2>
          <p style={{ color: '#4B5563', maxWidth: '560px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            受檢者 <strong>{patient.name}</strong> 的資料已完成受檢者同意書數位簽署，系統已產生 SHA-256 防偽驗證雜湊碼，採便管檢體已登錄入檔。
          </p>

          <div style={{ background: '#F8FAFC', padding: '12px 20px', borderRadius: '8px', display: 'inline-block', marginBottom: '2rem', border: '1px solid #E2E8F0', fontSize: '0.875rem' }}>
            <div>問卷流水識別號：<strong>#{submitResult.questionnaireId}</strong></div>
            <div style={{ color: '#64748B', fontFamily: 'monospace', fontSize: '0.75rem', marginTop: '4px' }}>
              SHA-256: {submitResult.dataHash}
            </div>
          </div>

          {/* Instructions for Stool Sample Collection */}
          <div style={{ maxWidth: '640px', margin: '0 auto 2rem', textAlign: 'left', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369A1', fontWeight: '700', marginBottom: '6px' }}>
              <Clock size={18} />
              <span>採便管檢體收集與回繳提醒</span>
            </div>
            <ul style={{ color: '#0C4A6E', fontSize: '0.875rem', paddingLeft: '1.25rem', lineHeight: '1.6', margin: 0 }}>
              <li>請使用採便棒前端螺紋在不同糞便表面來回劃刻 4~6 次，微量沾取即足夠。</li>
              <li>採檢後請將採便棒確實旋緊推回保存管，建議於 24 小時內送回本院篩檢櫃檯或指定收件點。</li>
              <li>檢驗機構將於 3~5 個工作天內完成定量免疫法（Eiken / Kyowa）測定並由系統通報。</li>
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onOpenPrintModal && onOpenPrintModal({ ...submitResult, patient, fecal, form_type: 'FECAL', screening_date: fecal.clinic_date })}
            >
              <Printer size={18} />
              預覽 / 列印 A4 公版紀錄表單
            </button>

            {onNavigateToAdmin && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onNavigateToAdmin}
              >
                <ClipboardList size={18} />
                前往個管後台檢視
                <ArrowRight size={16} />
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSubmitResult(null);
                setPatientSignature(null);
              }}
            >
              填寫下一位受檢者
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Section 0: 支付方式與篩檢地點 */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <span className="section-badge">表頭</span>
              <h3 className="section-title">支付方式與篩檢情境</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label className="question-label">支付方式</label>
                <select
                  className="input-field"
                  value={fecal.payment_type}
                  onChange={e => setFecal({ ...fecal, payment_type: e.target.value })}
                >
                  <option value="預防保健"> 預防保健 (國健署公費補助)</option>
                  <option value="健保醫療給付"> 健保醫療給付</option>
                  <option value="其他公務預算補助"> 其他公務預算補助</option>
                  <option value="自費健康檢查"> 自費健康檢查</option>
                  <option value="其他"> 其他</option>
                </select>
              </div>

              <div>
                <label className="question-label">篩檢地點</label>
                <select
                  className="input-field"
                  value={fecal.screening_location}
                  onChange={e => setFecal({ ...fecal, screening_location: e.target.value })}
                >
                  <option value="門診"> 門診 (本院篩檢櫃檯/家醫科)</option>
                  <option value="社區或職場設站篩檢"> 社區或職場設站篩檢</option>
                  <option value="住院"> 住院</option>
                  <option value="郵寄"> 郵寄</option>
                  <option value="其他"> 其他</option>
                </select>
              </div>

              <div>
                <label className="question-label">檢查醫療院所</label>
                <input
                  type="text"
                  className="input-field"
                  value={fecal.hospital_name}
                  disabled
                  style={{ background: '#F1F5F9' }}
                />
              </div>

              <div>
                <label className="question-label">門診 / 採檢日期</label>
                <input
                  type="date"
                  className="input-field"
                  value={fecal.clinic_date}
                  onChange={e => setFecal({ ...fecal, clinic_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 1: 基本資料 */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <span className="section-badge">基本資料</span>
              <h3 className="section-title">受檢者基本資料</h3>
              {patientAge > 0 && (
                <span className="badge badge-info" style={{ marginLeft: 'auto' }}>
                  年齡：{patientAge} 歲 {is40to44 ? '（符合 40-44 歲高風險族群資格）' : patientAge >= 50 && patientAge <= 74 ? '（符合 50-74 歲常規公費年齡）' : ''}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="question-label">
                  受檢者姓名 <span style={{ color: '#EF4444' }}>*必填</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: 李建華"
                  value={patient.name}
                  onChange={e => setPatient({ ...patient, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="question-label">
                  身分證統一編號 / 居留證號 <span style={{ color: '#EF4444' }}>*必填</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: B120987654"
                  maxLength={10}
                  value={patient.id_card_no}
                  onChange={e => setPatient({ ...patient, id_card_no: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div>
                <label className="question-label">生理性別</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn ${patient.gender === 'M' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '8px' }}
                    onClick={() => setPatient({ ...patient, gender: 'M' })}
                  >
                    男
                  </button>
                  <button
                    type="button"
                    className={`btn ${patient.gender === 'F' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '8px' }}
                    onClick={() => setPatient({ ...patient, gender: 'F' })}
                  >
                    女
                  </button>
                </div>
              </div>

              <div>
                <label className="question-label">出生日期</label>
                <input
                  type="date"
                  className="input-field"
                  value={patient.birth_date}
                  onChange={e => setPatient({ ...patient, birth_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="question-label">聯絡電話 (室話)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: 049-2658977"
                  value={patient.phone}
                  onChange={e => setPatient({ ...patient, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="question-label">手機號碼</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: 0912-345678"
                  value={patient.mobile}
                  onChange={e => setPatient({ ...patient, mobile: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="question-label">教育程度</label>
                <select
                  className="input-field"
                  value={patient.education_level}
                  onChange={e => setPatient({ ...patient, education_level: e.target.value })}
                >
                  <option value="無"> 無</option>
                  <option value="小學"> 小學</option>
                  <option value="國(初)中"> 國(初)中</option>
                  <option value="高中(職)"> 高中(職)</option>
                  <option value="專科、大學"> 專科、大學</option>
                  <option value="研究所以上"> 研究所以上</option>
                  <option value="拒答"> 拒答</option>
                </select>
              </div>

              <div>
                <label className="question-label">鄉鎮市區代碼 (4碼)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: 5570"
                  maxLength={4}
                  value={patient.zip_code}
                  onChange={e => setPatient({ ...patient, zip_code: e.target.value })}
                />
              </div>
            </div>

            {/* Address fields */}
            <div>
              <label className="question-label">現居住地址</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
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
                  placeholder="村里 (雲林里)"
                  value={patient.village}
                  onChange={e => setPatient({ ...patient, village: e.target.value })}
                />
                <input
                  type="text"
                  className="input-field"
                  placeholder="路街 (集山路三段)"
                  value={patient.road}
                  onChange={e => setPatient({ ...patient, road: e.target.value })}
                />
                <input
                  type="text"
                  className="input-field"
                  placeholder="段巷弄號 (480號)"
                  value={patient.section_lane}
                  onChange={e => setPatient({ ...patient, section_lane: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: 家族病史及吸菸習慣 */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <span className="section-badge">生活與家族</span>
              <h3 className="section-title">家族病史及吸菸習慣</h3>
            </div>

            {/* Question 1: 吸菸史 */}
            <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
              <label className="question-label" style={{ fontSize: '1rem' }}>
                1. 吸菸史
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  className={`btn ${!fecal.smoking_history ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFecal({ ...fecal, smoking_history: false, smoking_start_age: null })}
                >
                  無
                </button>
                <button
                  type="button"
                  className={`btn ${fecal.smoking_history ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFecal({ ...fecal, smoking_history: true, smoking_start_age: fecal.smoking_start_age || 20 })}
                >
                  有（含已戒菸）
                </button>

                {fecal.smoking_history && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#475569' }}>開始吸菸年齡：</span>
                    <input
                      type="number"
                      className="input-field"
                      style={{ width: '90px' }}
                      min={5}
                      max={90}
                      value={fecal.smoking_start_age || ''}
                      onChange={e => setFecal({ ...fecal, smoking_start_age: parseInt(e.target.value) || null })}
                      placeholder="歲"
                    />
                    <span style={{ fontSize: '0.9rem', color: '#475569' }}>歲</span>
                  </div>
                )}
              </div>
            </div>

            {/* Question 2: 大腸直腸癌家族史 */}
            <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
              <label className="question-label" style={{ fontSize: '1rem' }}>
                2. 請問與您有血緣的父母、兄弟姐妹或子女或其他親屬有無得過大腸直腸癌？
              </label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                {[
                  { val: 0, label: ' 無' },
                  { val: 1, label: ' 有' },
                  { val: 2, label: ' 不知道' }
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    className={`btn ${fecal.family_colorectal_cancer === opt.val ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                      const updated = { ...fecal, family_colorectal_cancer: opt.val };
                      // If user selects "有" and is 40-44, suggest enabling declaration
                      if (opt.val === 1 && is40to44 && !fecal.declaration_statement?.enabled) {
                        updated.declaration_statement = {
                          ...fecal.declaration_statement,
                          enabled: true
                        };
                      }
                      setFecal(updated);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {fecal.family_colorectal_cancer === 1 && (
                <div style={{ marginTop: '8px', fontSize: '0.825rem', color: '#B45309', background: '#FEF3C7', padding: '6px 12px', borderRadius: '6px' }}>
                  * 您具有大腸癌直系/血親家族史，建議定期接受篩檢並注意飲食纖維攝取與排便狀況。
                </div>
              )}
            </div>

            {/* Question 3: 其他癌症家族史 */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label className="question-label" style={{ fontSize: '1rem' }}>
                3. 請問與您有血緣的父母、兄弟姐妹或子女或其他親屬有無得過其他癌症？
              </label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                {[
                  { val: 0, label: ' 無' },
                  { val: 1, label: ' 有' },
                  { val: 2, label: ' 不知道' }
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    className={`btn ${fecal.family_other_cancer === opt.val ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFecal({ ...fecal, family_other_cancer: opt.val })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {(fecal.family_colorectal_cancer === 1 || fecal.family_other_cancer === 1) && (
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748B' }}>
                  (以上若有任一項填寫”有”，請繼續填寫附表五之六)
                </div>
              )}
            </div>
          </div>

          {/* Section 2.5: 附表五之五聲明書 (40~44歲二親等血親大腸癌聲明書) */}
          <div
            className="card"
            style={{
              marginBottom: '1.5rem',
              border: fecal.declaration_statement?.enabled ? '2px solid #8B5CF6' : '1px solid #E2E8F0',
              background: fecal.declaration_statement?.enabled ? '#FAF5FF' : '#FFFFFF'
            }}
          >
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-warning" style={{ marginRight: '8px' }}>附表五之五</span>
                <span style={{ fontWeight: '700', fontSize: '1rem', color: '#5B21B6' }}>
                  40~44歲具大腸癌家族史之定量免疫法糞便潛血檢查服務聲明書
                </span>
              </div>
              <button
                type="button"
                className={`btn ${fecal.declaration_statement?.enabled ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                onClick={() => {
                  const curr = !!fecal.declaration_statement?.enabled;
                  setFecal({
                    ...fecal,
                    declaration_statement: {
                      ...fecal.declaration_statement,
                      enabled: !curr
                    }
                  });
                }}
              >
                {fecal.declaration_statement?.enabled ? '✓ 已啟用聲明書' : '+ 填寫附表五之五聲明書'}
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '4px 0 12px' }}>
              若受檢者為 40-44 歲且血親患有大腸癌，但無法出具一親等以內血親之診斷證明與親屬關係證明文件時，得填具本聲明書由醫療院所留存於病歷中。
            </p>

            {fecal.declaration_statement?.enabled && (
              <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid #DDD6FE' }}>
                <div style={{ fontSize: '0.9rem', color: '#1F2937', lineHeight: '1.7', marginBottom: '1rem' }}>
                  立聲明書人 <strong>{patient.name || '______'}</strong>（以下簡稱本人），因為
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: '280px', display: 'inline-block', margin: '0 6px', padding: '4px 8px' }}
                    placeholder="例: 親屬已故無留存診斷證明"
                    value={fecal.declaration_statement?.inability_reason || ''}
                    onChange={e =>
                      setFecal({
                        ...fecal,
                        declaration_statement: {
                          ...fecal.declaration_statement!,
                          inability_reason: e.target.value
                        }
                      })
                    }
                  />
                  之原因，故無法出具一親等以內血親曾患有大腸癌之診斷證明與其親屬關係相關文件，茲證明我的
                  <select
                    className="input-field"
                    style={{ width: '130px', display: 'inline-block', margin: '0 6px', padding: '4px 8px' }}
                    value={fecal.declaration_statement?.relative_relation || '父親'}
                    onChange={e =>
                      setFecal({
                        ...fecal,
                        declaration_statement: {
                          ...fecal.declaration_statement!,
                          relative_relation: e.target.value as any
                        }
                      })
                    }
                  >
                    <option value="父親">父親</option>
                    <option value="母親">母親</option>
                    <option value="兄弟姐妹">兄弟姐妹</option>
                    <option value="子女">子女</option>
                  </select>
                  曾患有大腸癌，該名親屬姓名為
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: '120px', display: 'inline-block', margin: '0 6px', padding: '4px 8px' }}
                    placeholder="親屬姓名"
                    value={fecal.declaration_statement?.relative_name || ''}
                    onChange={e =>
                      setFecal({
                        ...fecal,
                        declaration_statement: {
                          ...fecal.declaration_statement!,
                          relative_name: e.target.value
                        }
                      })
                    }
                  />
                  ，身分證統一編號：
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: '150px', display: 'inline-block', margin: '0 6px', padding: '4px 8px' }}
                    placeholder="親屬身分證號"
                    maxLength={10}
                    disabled={fecal.declaration_statement?.is_relative_deceased}
                    value={fecal.declaration_statement?.is_relative_deceased ? '（死亡免填）' : fecal.declaration_statement?.relative_id_card || ''}
                    onChange={e =>
                      setFecal({
                        ...fecal,
                        declaration_statement: {
                          ...fecal.declaration_statement!,
                          relative_id_card: e.target.value.toUpperCase()
                        }
                      })
                    }
                  />
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={!!fecal.declaration_statement?.is_relative_deceased}
                      onChange={e =>
                        setFecal({
                          ...fecal,
                          declaration_statement: {
                            ...fecal.declaration_statement!,
                            is_relative_deceased: e.target.checked
                          }
                        })
                      }
                    />
                    死亡者免填身分證號
                  </label>
                  ，本人聲明全部屬實，如有不實者願負一切法律責任。
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6D28D9', fontSize: '0.825rem' }}>
                  <ShieldCheck size={16} />
                  <span>聲明書簽章將與下方受檢者數位簽名一併綁定與加密封存，留存於醫療院所病歷系統。</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: 有無症狀 */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <span className="section-badge">臨床自覺</span>
              <h3 className="section-title">有無腸道不適症狀</h3>
            </div>

            <div>
              <label className="question-label" style={{ fontSize: '1rem', marginBottom: '8px' }}>
                請問您有無腸道不適症狀？如腹瀉、便秘、糞便變稠、排泄黏液、便血、黃便帶血或其他症狀
              </label>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  className={`btn ${!fecal.has_bowel_symptoms ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '12px' }}
                  onClick={() => setFecal({ ...fecal, has_bowel_symptoms: false })}
                >
                   無症狀 (排便正常)
                </button>
                <button
                  type="button"
                  className={`btn ${fecal.has_bowel_symptoms ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '12px', background: fecal.has_bowel_symptoms ? '#DC2626' : undefined }}
                  onClick={() => setFecal({ ...fecal, has_bowel_symptoms: true })}
                >
                   有症狀 (腹瀉/便秘/排泄黏液/便血等)
                </button>
              </div>

              {fecal.has_bowel_symptoms && (
                <div style={{ marginTop: '10px', background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: '8px', color: '#991B1B', fontSize: '0.875rem' }}>
                  ⚠️ 您有腸道不適相關症狀，除完成本次糞便潛血檢查外，若症狀持續或加劇，請主動至胃腸肝膽科或大腸直腸外科門診評估是否需進一步安排大腸鏡檢查。
                </div>
              )}
            </div>
          </div>

          {/* Section 4: 法定告知事項與受檢者親筆簽名 */}
          <div className="card" style={{ marginBottom: '2rem', border: '1.5px solid #93C5FD', background: '#F8FAFC' }}>
            <div className="card-header">
              <span className="section-badge">法規同意</span>
              <h3 className="section-title">法定告知事項與受檢者親筆數位簽名</h3>
            </div>

            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px 16px', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#1E40AF', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '4px' }}>
                <ShieldCheck size={18} />
                <span>受檢者個資與檢查同意事項：</span>
              </div>
              本人同意接受糞便潛血檢查，本表資料將作為衛生及學術單位進行個案追蹤關懷及健康管理、資格檢核、比對連結、統計分析、政策評估及其他相關目的使用。確認以上資料正確無誤。
            </div>

            {/* Signature Area */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: '#FFFFFF', padding: '1rem', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>
                  受檢者親筆簽署（電子簽名板）
                </div>
                <div style={{ fontSize: '0.825rem', color: '#64748B' }}>
                  {patientSignature ? `簽署時間：${new Date(patientSignature.signedAt).toLocaleString()}` : '尚未簽名，請點擊右方按鈕進行簽名'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {patientSignature?.base64Png ? (
                  <div style={{ border: '1px dashed #94A3B8', padding: '4px 8px', borderRadius: '6px', background: '#F8FAFC' }}>
                    <img src={patientSignature.base64Png} alt="受檢者簽名" style={{ maxHeight: '48px' }} />
                  </div>
                ) : (
                  <span style={{ color: '#EF4444', fontSize: '0.85rem' }}>* 尚未簽章</span>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsSignModalOpen(true)}
                >
                  {patientSignature ? '重新簽名' : '開啟簽名板簽署'}
                </button>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ fontSize: '1.05rem', padding: '12px 28px' }}
            >
              {isSubmitting ? '問卷封存加密中...' : '送出糞便潛血問卷並產生採檢紀錄'}
            </button>
          </div>
        </form>
      )}

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirm={(base64Png, signedAt) => {
          setPatientSignature({
            base64Png,
            signedAt
          });
          setIsSignModalOpen(false);
        }}
        patientName={patient.name}
        idCardNo={patient.id_card_no}
        consentType="FECAL"
        title="受檢者親筆簽名（定量免疫法糞便潛血檢查同意書）"
      />
    </div>
  );
};
