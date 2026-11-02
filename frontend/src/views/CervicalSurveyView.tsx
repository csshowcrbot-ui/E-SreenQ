import React, { useState } from 'react';
import type { Patient, CervicalScreening } from '../types';
import { SignatureModal } from '../components/SignatureModal';
import { submitCervicalForm } from '../services/api';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Printer,
  ClipboardList,
  ArrowRight,
  HeartPulse
} from 'lucide-react';

interface CervicalSurveyViewProps {
  onOpenPrintModal?: (q: any) => void;
  onNavigateToAdmin?: () => void;
}

export const CervicalSurveyView: React.FC<CervicalSurveyViewProps> = ({
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
    gender: 'F', // Default to Female for Cervical Smear
    birth_date: '1988-06-12',
    is_indigenous: false,
    indigenous_tribe: '',
    phone: '049-2651122',
    mobile: '0921-334455',
    zip_code: '5570',
    city: '南投縣',
    district: '竹山鎮',
    village: '中正里',
    road: '頂林路',
    section_lane: '12號',
    education_level: '專科、大學',
    occupation_status: '有',
    marriage_status: '已婚'
  });

  // Cervical Screening State
  const [cervical, setCervical] = useState<CervicalScreening>({
    service_type: 'NO',
    payment_type: '預防保健',
    is_recheck: false,
    timing_code: '01',
    last_smear_time: '1_TO_2Y',
    is_menopause: 'NO',
    last_menstrual_date: '115-05-10',
    is_pregnant: 'NO',
    hysterectomy_status: 'NO',
    radiation_therapy: 'NO',
    hpv_vaccine: 'YES',
    hpv_vaccine_year: '108',
    chart_no: '',
    double_cervix: false,
    sampling_date: new Date().toISOString().split('T')[0],
    sampling_unit_name: '竹山秀傳醫療社團法人竹山秀傳醫院',
    sampling_unit_code: '0938040012',
    sampler_name: '林美惠',
    sampler_role: 'OBGYN_DOC',
    combine_hpv: false,
    smear_purpose: 'SCREENING',
    clinical_findings: '外觀正常，無明顯接觸性出血或異常分泌物'
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

  // Quick Demo Scenarios
  const handleQuickDemo32 = () => {
    setPatient({
      chart_no: '00671822',
      id_card_no: 'L220918273',
      name: '黃雅筑',
      gender: 'F',
      birth_date: '1992-08-16',
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '049-2648899',
      mobile: '0937-223344',
      zip_code: '5570',
      city: '南投縣',
      district: '竹山鎮',
      village: '竹圍里',
      road: '大禮路',
      section_lane: '88號',
      education_level: '專科、大學',
      occupation_status: '有，自由業',
      marriage_status: '未婚'
    });

    setCervical({
      service_type: 'NO',
      payment_type: '預防保健',
      is_recheck: false,
      timing_code: '01',
      last_smear_time: '1_TO_2Y',
      is_menopause: 'NO',
      last_menstrual_date: '115-05-14',
      is_pregnant: 'NO',
      hysterectomy_status: 'NO',
      radiation_therapy: 'NO',
      hpv_vaccine: 'YES',
      hpv_vaccine_year: '109',
      chart_no: '00671822',
      double_cervix: false,
      sampling_date: new Date().toISOString().split('T')[0],
      sampling_unit_name: '竹山秀傳醫療社團法人竹山秀傳醫院',
      sampling_unit_code: '0938040012',
      sampler_name: '陳怡君',
      sampler_role: 'OBGYN_DOC',
      combine_hpv: false,
      smear_purpose: 'SCREENING',
      clinical_findings: '宮頸平滑無糜爛，無接觸性出血'
    });

    setPatientSignature({
      base64Png: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='80'><path d='M20,50 Q45,15 70,48 T120,35 Q150,60 180,30 T220,55' fill='none' stroke='%230f172a' stroke-width='3' stroke-linecap='round'/></svg>",
      signedAt: new Date().toISOString()
    });
  };

  const handleQuickDemo54Menopause = () => {
    setPatient({
      chart_no: '00412890',
      id_card_no: 'N221889900',
      name: '林麗華',
      gender: 'F',
      birth_date: '1970-03-25',
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '049-2651188',
      mobile: '0919-667788',
      zip_code: '5570',
      city: '南投縣',
      district: '竹山鎮',
      village: '雲林里',
      road: '集山路三段',
      section_lane: '210號',
      education_level: '高中(職)',
      occupation_status: '家管',
      marriage_status: '已婚'
    });

    setCervical({
      service_type: 'NO',
      payment_type: '預防保健',
      is_recheck: false,
      timing_code: '01',
      last_smear_time: 'OVER_3Y',
      is_menopause: 'YES',
      last_menstrual_date: '已停經',
      is_pregnant: 'NO',
      hysterectomy_status: 'NO',
      radiation_therapy: 'NO',
      hpv_vaccine: 'NO',
      hpv_vaccine_year: '',
      chart_no: '00412890',
      double_cervix: false,
      sampling_date: new Date().toISOString().split('T')[0],
      sampling_unit_name: '竹山秀傳醫療社團法人竹山秀傳醫院',
      sampling_unit_code: '0938040012',
      sampler_name: '陳怡君',
      sampler_role: 'OBGYN_DOC',
      combine_hpv: true,
      smear_purpose: 'SCREENING',
      clinical_findings: '輕度萎縮性宮頸炎，已採集常規抹片與 HPV 刷檢'
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
      const res = await submitCervicalForm({
        patient,
        cervical,
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
            <span className="badge badge-success">附表三之四修正規定</span>
            <span className="badge badge-info">116 年 1 月修訂</span>
            <span style={{ fontSize: '0.825rem', color: '#64748B' }}>
              第一聯：病理機構回報採檢機構聯 ‧ 衛生福利部國民健康署運用菸品健康福利捐/公務預算補助
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              onClick={handleQuickDemo32}
              title="快速帶入 32 歲常規抹片個案資料"
            >
              <Sparkles size={15} color="#EC4899" />
              示範：32歲常規公費
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              onClick={handleQuickDemo54Menopause}
              title="快速帶入 54 歲停經婦女合併 HPV 檢測個案"
            >
              <Sparkles size={15} color="#8B5CF6" />
              示範：54歲停經合併HPV
            </button>
          </div>
        </div>

        <h1 className="survey-title" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <HeartPulse size={32} color="#DB2777" />
          健康署女性子宮頸抹片檢查服務檢查紀錄結果表單
        </h1>
        <p className="survey-subtitle">
          國民健康署補助 30 歲以上女性每年 1 次子宮頸抹片檢查服務，早期發現子宮頸上皮內病變與早期預防
        </p>
      </div>

      {/* Submission Success Hero */}
      {submitResult ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', border: '2px solid #F472B6' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: '#FCE7F3', borderRadius: '50%', color: '#DB2777', marginBottom: '1rem' }}>
            <CheckCircle2 size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#831843', marginBottom: '0.5rem' }}>
            子宮頸抹片檢查問卷填報完成並成功封存！
          </h2>
          <p style={{ color: '#4B5563', maxWidth: '580px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            受檢者 <strong>{patient.name}</strong> 的資料已完成受檢者同意書親筆數位簽署，檢體已由採檢人員取樣登記並產生 SHA-256 防偽驗證碼，準備送交病理醫療機構判讀。
          </p>

          <div style={{ background: '#F8FAFC', padding: '12px 20px', borderRadius: '8px', display: 'inline-block', marginBottom: '2rem', border: '1px solid #E2E8F0', fontSize: '0.875rem' }}>
            <div>表單流水識別號：<strong>#{submitResult.questionnaireId}</strong></div>
            <div style={{ color: '#64748B', fontFamily: 'monospace', fontSize: '0.75rem', marginTop: '4px' }}>
              SHA-256: {submitResult.dataHash}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onOpenPrintModal && onOpenPrintModal({ ...submitResult, patient, cervical, form_type: 'CERVICAL', screening_date: cervical.sampling_date })}
            >
              <Printer size={18} />
              預覽 / 列印 A4 公版紀錄表單 (附表三之四)
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
          {/* Section 0: 篩檢情境與支付方式 */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <span className="section-badge">表頭</span>
              <h3 className="section-title">篩檢服務型態與支付方式</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label className="question-label">抹片車或社區巡迴服務</label>
                <select
                  className="input-field"
                  value={cervical.service_type}
                  onChange={e => setCervical({ ...cervical, service_type: e.target.value as any })}
                >
                  <option value="NO">① 否 (一般院內門診採檢)</option>
                  <option value="SMIR_BUS">② 抹片車</option>
                  <option value="COMMUNITY">③ 社區巡迴服務篩檢</option>
                </select>
              </div>

              <div>
                <label className="question-label">支付方式</label>
                <select
                  className="input-field"
                  value={cervical.payment_type}
                  onChange={e => setCervical({ ...cervical, payment_type: e.target.value })}
                >
                  <option value="預防保健">① 預防保健 (國健署公費補助)</option>
                  <option value="健保醫療給付">② 健保醫療給付</option>
                  <option value="其他公務預算補助">③ 其他公務預算補助</option>
                  <option value="自費健康檢查">⑥ 自費健康檢查</option>
                  <option value="其他">④ 其他</option>
                </select>
              </div>

              <div>
                <label className="question-label">難判重做?</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    className={`btn ${!cervical.is_recheck ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '8px' }}
                    onClick={() => setCervical({ ...cervical, is_recheck: false })}
                  >
                    ② 否
                  </button>
                  <button
                    type="button"
                    className={`btn ${cervical.is_recheck ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '8px' }}
                    onClick={() => setCervical({ ...cervical, is_recheck: true })}
                  >
                    ① 是
                  </button>
                </div>
              </div>

              <div>
                <label className="question-label">時程代碼</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: 01"
                  value={cervical.timing_code}
                  onChange={e => setCervical({ ...cervical, timing_code: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 1: 個人基本資料 */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <span className="section-badge">基本資料</span>
              <h3 className="section-title">一、個人基本資料（檢查個案填寫）</h3>
              {patientAge > 0 && (
                <span className="badge badge-info" style={{ marginLeft: 'auto' }}>
                  年齡：{patientAge} 歲 {patientAge >= 30 ? '（符合 30 歲以上每年 1 次公費補助）' : '（未滿 30 歲）'}
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
                  placeholder="例: 黃雅筑"
                  value={patient.name}
                  onChange={e => setPatient({ ...patient, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="question-label">
                  身分證統一編號或統一證號(外籍) <span style={{ color: '#EF4444' }}>*必填</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: L220918273"
                  maxLength={10}
                  value={patient.id_card_no}
                  onChange={e => setPatient({ ...patient, id_card_no: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div>
                <label className="question-label">生理性別</label>
                <input
                  type="text"
                  className="input-field"
                  value="女 (女性公費子宮頸抹片)"
                  disabled
                  style={{ background: '#F1F5F9' }}
                />
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
                <label className="question-label">手機號碼</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: 0921-334455"
                  value={patient.mobile}
                  onChange={e => setPatient({ ...patient, mobile: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="question-label">市話</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: 049-2651122"
                  value={patient.phone}
                  onChange={e => setPatient({ ...patient, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="question-label">教育程度</label>
                <select
                  className="input-field"
                  value={patient.education_level}
                  onChange={e => setPatient({ ...patient, education_level: e.target.value })}
                >
                  <option value="無">① 無</option>
                  <option value="小學">② 小學</option>
                  <option value="國(初)中">③ 國(初)中</option>
                  <option value="高中(職)">④ 高中(職)</option>
                  <option value="專科、大學">⑤ 專科、大學</option>
                  <option value="研究所以上">⑥ 研究所以上</option>
                  <option value="拒答">⑦ 拒答</option>
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
                  placeholder="村里 (中正里)"
                  value={patient.village}
                  onChange={e => setPatient({ ...patient, village: e.target.value })}
                />
                <input
                  type="text"
                  className="input-field"
                  placeholder="路街 (頂林路)"
                  value={patient.road}
                  onChange={e => setPatient({ ...patient, road: e.target.value })}
                />
                <input
                  type="text"
                  className="input-field"
                  placeholder="段巷弄號 (12號)"
                  value={patient.section_lane}
                  onChange={e => setPatient({ ...patient, section_lane: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: 個案臨床資料 */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <span className="section-badge">臨床問診</span>
              <h3 className="section-title">二、個案臨床資料（檢查個案填寫）</h3>
            </div>

            {/* 8. 最近一次抹片時間 */}
            <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
              <label className="question-label">8. 最近一次抹片檢查時間？</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                {[
                  { key: 'WITHIN_1Y', label: '① 1 年內' },
                  { key: '1_TO_2Y', label: '② 1 至 2 年內' },
                  { key: '2_TO_3Y', label: '③ 2 至 3 年內' },
                  { key: 'OVER_3Y', label: '④ 3 年以上' },
                  { key: 'NEVER', label: '⑤ 從未檢查過' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`btn ${cervical.last_smear_time === opt.key ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setCervical({ ...cervical, last_smear_time: opt.key as any })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 9 & 10. 停經與最後月經日期 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
              <div>
                <label className="question-label">9. 已停經？（一年無月經）</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {[
                    { key: 'YES', label: '① 是' },
                    { key: 'NO', label: '② 否' },
                    { key: 'UNKNOWN', label: '③ 不知道' }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`btn ${cervical.is_menopause === opt.key ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1 }}
                      onClick={() => setCervical({ ...cervical, is_menopause: opt.key as any })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="question-label">10. 最後一次月經日期</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: 民國 115 年 05 月 10 日 或 停經"
                  value={cervical.last_menstrual_date}
                  onChange={e => setCervical({ ...cervical, last_menstrual_date: e.target.value })}
                />
              </div>
            </div>

            {/* 11 & 12. 懷孕與子宮切除 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
              <div>
                <label className="question-label">11. 現在是否懷孕？</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {[
                    { key: 'YES', label: '① 是' },
                    { key: 'NO', label: '② 否' },
                    { key: 'UNKNOWN', label: '③ 不知道' }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`btn ${cervical.is_pregnant === opt.key ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1 }}
                      onClick={() => setCervical({ ...cervical, is_pregnant: opt.key as any })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="question-label">*12. 子宮是否切除？</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {[
                    { key: 'YES', label: '① 是' },
                    { key: 'NO', label: '② 否' },
                    { key: 'UNKNOWN', label: '③ 不知道' }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`btn ${cervical.hysterectomy_status === opt.key ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1 }}
                      onClick={() => setCervical({ ...cervical, hysterectomy_status: opt.key as any })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 13 & 14. 放射線治療與 HPV 疫苗 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label className="question-label">*13. 子宮是否接受過放射線治療？</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {[
                    { key: 'YES', label: '① 是' },
                    { key: 'NO', label: '② 否' },
                    { key: 'UNKNOWN', label: '③ 不知道' }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`btn ${cervical.radiation_therapy === opt.key ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1 }}
                      onClick={() => setCervical({ ...cervical, radiation_therapy: opt.key as any })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="question-label">*14. 是否曾接種人類乳突病毒(HPV)疫苗？(95年起有HPV疫苗)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                  <button
                    type="button"
                    className={`btn ${cervical.hpv_vaccine === 'YES' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setCervical({ ...cervical, hpv_vaccine: 'YES', hpv_vaccine_year: cervical.hpv_vaccine_year || '108' })}
                  >
                    ① 是
                  </button>
                  <button
                    type="button"
                    className={`btn ${cervical.hpv_vaccine === 'NO' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setCervical({ ...cervical, hpv_vaccine: 'NO', hpv_vaccine_year: '' })}
                  >
                    ② 否
                  </button>
                  <button
                    type="button"
                    className={`btn ${cervical.hpv_vaccine === 'UNKNOWN' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setCervical({ ...cervical, hpv_vaccine: 'UNKNOWN', hpv_vaccine_year: '' })}
                  >
                    ③ 不知道
                  </button>

                  {cervical.hpv_vaccine === 'YES' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
                      <span style={{ fontSize: '0.85rem' }}>民國</span>
                      <input
                        type="text"
                        className="input-field"
                        style={{ width: '60px', padding: '4px 6px' }}
                        placeholder="年"
                        value={cervical.hpv_vaccine_year}
                        onChange={e => setCervical({ ...cervical, hpv_vaccine_year: e.target.value })}
                      />
                      <span style={{ fontSize: '0.85rem' }}>年</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 抹片採檢醫療機構填寫 */}
          <div className="card" style={{ marginBottom: '1.5rem', background: '#FDF2F8', border: '1.5px solid #FBCFE8' }}>
            <div className="card-header">
              <span className="section-badge" style={{ background: '#DB2777' }}>採檢機構</span>
              <h3 className="section-title" style={{ color: '#9D174D' }}>三之一、抹片資料（採檢醫療機構填寫）</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="question-label">15. 病歷號</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: 00671822"
                  value={cervical.chart_no || patient.chart_no}
                  onChange={e => setCervical({ ...cervical, chart_no: e.target.value })}
                />
              </div>

              <div>
                <label className="question-label">*雙子宮頸?</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    className={`btn ${!cervical.double_cervix ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '8px' }}
                    onClick={() => setCervical({ ...cervical, double_cervix: false })}
                  >
                    ② 否
                  </button>
                  <button
                    type="button"
                    className={`btn ${cervical.double_cervix ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '8px' }}
                    onClick={() => setCervical({ ...cervical, double_cervix: true })}
                  >
                    ① 是
                  </button>
                </div>
              </div>

              <div>
                <label className="question-label">*16. 抹片檢體取樣日期</label>
                <input
                  type="date"
                  className="input-field"
                  value={cervical.sampling_date}
                  onChange={e => setCervical({ ...cervical, sampling_date: e.target.value })}
                />
              </div>

              <div>
                <label className="question-label">*17. 抹片檢體取樣機構名稱及代碼</label>
                <input
                  type="text"
                  className="input-field"
                  disabled
                  value={`${cervical.sampling_unit_name} (${cervical.sampling_unit_code})`}
                  style={{ background: '#F1F5F9' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="question-label">*18. 取樣醫事人員姓名</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="醫師或護理人員姓名"
                  value={cervical.sampler_name}
                  onChange={e => setCervical({ ...cervical, sampler_name: e.target.value })}
                />
              </div>

              <div>
                <label className="question-label">抹片檢體取樣人員身分別</label>
                <select
                  className="input-field"
                  value={cervical.sampler_role}
                  onChange={e => setCervical({ ...cervical, sampler_role: e.target.value as any })}
                >
                  <option value="OBGYN_DOC">① 婦產科醫師</option>
                  <option value="FM_DOC">② 家醫科專科醫師</option>
                  <option value="MIDWIFE">③ 助產人員</option>
                  <option value="HEALTH_NURSE">④ 衛生所護理人員</option>
                  <option value="HEALTH_DOC">⑤ 衛生所醫師（非屬①②）</option>
                </select>
              </div>

              <div>
                <label className="question-label">*19. 本次檢查是否合併 HPV 檢測服務?</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    className={`btn ${!cervical.combine_hpv ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '8px' }}
                    onClick={() => setCervical({ ...cervical, combine_hpv: false })}
                  >
                    ① 否
                  </button>
                  <button
                    type="button"
                    className={`btn ${cervical.combine_hpv ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '8px' }}
                    onClick={() => setCervical({ ...cervical, combine_hpv: true })}
                  >
                    ② 是
                  </button>
                </div>
              </div>

              <div>
                <label className="question-label">*20. 做抹片目的</label>
                <select
                  className="input-field"
                  value={cervical.smear_purpose}
                  onChange={e => setCervical({ ...cervical, smear_purpose: e.target.value as any })}
                >
                  <option value="SCREENING">① 篩檢 (例行常規公費)</option>
                  <option value="SUSPECT_CANCER">② 懷疑癌症</option>
                  <option value="FOLLOWUP">③ 追蹤 (前次異常抹片追蹤)</option>
                  <option value="PREV_DIFFICULT">④ 前次抹片難以判讀重做</option>
                  <option value="OTHER">⑤ 其他</option>
                </select>
              </div>
            </div>

            <div>
              <label className="question-label">21. 臨床所見（含骨盆腔檢查結果）</label>
              <textarea
                className="input-field"
                rows={2}
                placeholder="請描述子宮頸外觀、接觸性出血、息肉、糜爛或異常分泌物情形..."
                value={cervical.clinical_findings}
                onChange={e => setCervical({ ...cervical, clinical_findings: e.target.value })}
              />
            </div>
          </div>

          {/* Section 4: 法定告知事項與受檢者親筆簽名 */}
          <div className="card" style={{ marginBottom: '2rem', border: '1.5px solid #F472B6', background: '#FFFDFD' }}>
            <div className="card-header">
              <span className="section-badge" style={{ background: '#DB2777' }}>法規同意</span>
              <h3 className="section-title">法定告知事項與受檢者親筆數位簽名</h3>
            </div>

            <div style={{ background: '#FDF2F8', border: '1px solid #FBCFE8', borderRadius: '8px', padding: '12px 16px', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#9D174D', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '4px' }}>
                <ShieldCheck size={18} />
                <span>受檢者法定告知聲明：</span>
              </div>
              本人同意接受女性子宮頸抹片檢查服務，本表資料將會作為衛生及學術單位進行個案追蹤關懷及健康管理、資格檢核、比對連結、統計分析、政策評估及其他相關目的使用。確認以上資料正確無誤。
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
                  style={{ background: '#DB2777', borderColor: '#DB2777' }}
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
              style={{ fontSize: '1.05rem', padding: '12px 28px', background: '#DB2777', borderColor: '#DB2777' }}
            >
              {isSubmitting ? '問卷封存加密中...' : '送出子宮頸抹片問卷並建立採檢紀錄'}
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
        consentType="CERVICAL"
        title="受檢者親筆簽名（女性子宮頸抹片檢查服務同意書）"
      />
    </div>
  );
};
