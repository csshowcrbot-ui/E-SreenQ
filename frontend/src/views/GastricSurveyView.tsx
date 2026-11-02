import React, { useState } from 'react';
import type { Patient, GastricScreening } from '../types';
import { SignatureModal } from '../components/SignatureModal';
import { submitGastricForm } from '../services/api';
import {
  User,
  HeartPulse,
  Activity,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Printer
} from 'lucide-react';


interface GastricSurveyViewProps {
  onOpenPrintModal?: (q: any) => void;
}

export const GastricSurveyView: React.FC<GastricSurveyViewProps> = ({ onOpenPrintModal }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<any | null>(null);

  // Form State: Patient Information
  const [patient, setPatient] = useState<Patient>({
    chart_no: '',
    id_card_no: '',
    name: '',
    gender: 'M',
    birth_date: '1970-01-01',
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

  // Form State: Screening Details
  const [screening, setScreening] = useState<GastricScreening>({
    sampling_unit: '竹山秀傳醫療社團法人竹山秀傳醫院',
    sampling_unit_code: '0938040012',
    second_clinic_date: '',
    religion: '佛教',
    personal_history: {
      gastritis: false,
      ulcer: false,
      duodenal_ulcer: false,
      reflux: false,
      tumor: false,
      cancer: false,
      hp_infection: false,
      other: false,
      other_text: '',
      year_minguo: '',
      year_unknown: false,
      none: true
    },
    hp_eradication: false,
    gastroscopy_history: false,
    gastroscopy_year: null,
    gastroscopy_year_unknown: false,
    anti_ulcer_drugs_recent_month: false,
    drug_allergy: false,
    drug_allergy_detail: '',
    family_hp_history: { unknown: false, none: true, has: false },
    family_ulcer_history: { unknown: false, none: true, has: false },
    family_gastric_cancer_history: { unknown: false, none: true, has: false },
    medication_history: {
      has: false,
      painkiller: false,
      steroid: false,
      antiplatelet: false,
      antiplatelet_aspirin: false,
      antiplatelet_plavix: false,
      antiplatelet_other: '',
      anticoagulant: false,
      anticoagulant_coumadin: false,
      anticoagulant_other: '',
      diabetes: false,
      diabetes_oral: false,
      diabetes_insulin: false,
      iron_supplement: false
    },
    smoking_habit: 0,
    drinking_habit: 0,
    betel_nut_habit: 0,
    diet_pickled_freq: false,
    diet_smoked_freq: false,
    diet_raw_freq: false,
    test_result: 'WAITING'
  });

  // Demo auto-fill helper
  const handleAutoFill = () => {
    setPatient({
      chart_no: '00984120',
      id_card_no: 'A123456789',
      name: '王大明',
      gender: 'M',
      birth_date: '1965-08-15',
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '049-2658977',
      mobile: '0912345678',
      zip_code: '557',
      city: '南投縣',
      district: '竹山鎮',
      village: '雲林里',
      road: '集山路三段',
      section_lane: '480號',
      education_level: '高中(職)',
      occupation_status: '有，製造業',
      marriage_status: '已婚'
    });

    setScreening({
      sampling_unit: '竹山秀傳醫療社團法人竹山秀傳醫院',
      sampling_unit_code: '0938040012',
      second_clinic_date: '',
      religion: '佛教',
      personal_history: {
        gastritis: true,
        ulcer: true,
        duodenal_ulcer: false,
        reflux: false,
        tumor: false,
        cancer: false,
        hp_infection: false,
        other: false,
        other_text: '',
        year_minguo: '108',
        year_unknown: false,
        none: false
      },
      hp_eradication: false,
      gastroscopy_history: true,
      gastroscopy_year: 110,
      gastroscopy_year_unknown: false,
      anti_ulcer_drugs_recent_month: true,
      drug_allergy: false,
      drug_allergy_detail: '',
      family_hp_history: { unknown: false, none: true, has: false },
      family_ulcer_history: {
        unknown: false, none: false, has: true,
        father: true, mother: false, spouse: false, siblings: false, siblings_count: 0,
        children: false, children_count: 0, other: false, other_text: '', other_count: 0
      },
      family_gastric_cancer_history: {
        unknown: false, none: false, has: true,
        father: true, mother: false, spouse: false, siblings: false, siblings_count: 0,
        children: false, children_count: 0, other: false, other_text: '', other_count: 0
      },
      medication_history: {
        has: true,
        painkiller: true,
        steroid: false,
        antiplatelet: true,
        antiplatelet_aspirin: true,
        antiplatelet_plavix: false,
        antiplatelet_other: '',
        anticoagulant: false,
        anticoagulant_coumadin: false,
        anticoagulant_other: '',
        diabetes: false,
        diabetes_oral: false,
        diabetes_insulin: false,
        iron_supplement: false
      },
      smoking_habit: 1, // 已戒
      drinking_habit: 0, // 從不
      betel_nut_habit: 0, // 從不
      diet_pickled_freq: true,
      diet_smoked_freq: true,
      diet_raw_freq: false,
      test_result: 'WAITING'
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!patient.name || !patient.id_card_no || !patient.mobile) {
        alert('請先填寫受檢者姓名、身分證號及手機號碼！');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSignatureConfirmed = async (base64Png: string, signedAt: string) => {
    setIsSignModalOpen(false);
    setIsSubmitting(true);
    try {
      const res = await submitGastricForm({
        patient,
        screening,
        signature: { base64Png, signedAt }
      });
      setSubmitResult({
        ...res,
        patient,
        screening,
        patient_signature_url: base64Png,
        screening_date: new Date().toISOString().split('T')[0],
        payment_type: '預防保健',
        form_type: 'GASTRIC',
        data_hash: res.dataHash
      });
    } catch (err: any) {
      alert(err.message || '送出失敗，請確認伺服器連線');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If completed submission
  if (submitResult) {
    return (
      <div className="survey-wizard-container" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ width: '70px', height: '70px', background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#16A34A' }}>
          <CheckCircle2 size={44} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
          問卷簽署完成，資料已加密封存！
        </h2>
        <p style={{ color: '#64748B', fontSize: '1rem', marginBottom: '1.5rem' }}>
          受檢者：<strong>{patient.name}</strong> 先生/女士　|　表單識別號：#{submitResult.questionnaireId}
        </p>

        {/* Tamper-proof Hash Card */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', maxWidth: '640px', margin: '0 auto 2rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1976D2', fontWeight: '700', fontSize: '0.95rem' }}>
            <ShieldCheck size={20} />
            <span>數位防偽 SHA-256 完整性簽署標記已生成</span>
          </div>
          <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.825rem', background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#334155' }}>
            {submitResult.dataHash}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '8px' }}>
            * 本份問卷內容與簽名字軌已透過雜湊演算法鎖定，任何非授權竄改均會立即導致校驗失效。
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {onOpenPrintModal && (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => onOpenPrintModal(submitResult)}
            >
              <Printer size={18} />
              預覽或列印 A4 國健署紀錄表
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => {
              setSubmitResult(null);
              setCurrentStep(1);
            }}
          >
            填寫下一位受檢者
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-wizard-container">
      {/* Wizard Header */}
      <div className="wizard-header">
        <div className="wizard-title-row">
          <div>
            <span className="wizard-badge">國健署附表八之四</span>
            <h1 className="wizard-title">糞便抗原檢測胃幽門螺旋桿菌服務 - 管理紀錄表</h1>
            <p className="wizard-subtitle">請受檢者或醫護人員依實際健康狀況逐項核對並完成電子簽署</p>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAutoFill}
            title="自動代入範例資料"
            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
          >
            <Sparkles size={16} color="#1976D2" />
            示範快速填入
          </button>
        </div>

        {/* Step tracker */}
        <div className="step-tracker">
          <div className={`step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-circle">{currentStep > 1 ? '✓' : '1'}</div>
            <span className="step-label">步驟 1: 基本資料</span>
          </div>

          <div className={`step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-circle">{currentStep > 2 ? '✓' : '2'}</div>
            <span className="step-label">步驟 2: 個人病史與用藥</span>
          </div>

          <div className={`step-item ${currentStep === 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span className="step-label">步驟 3: 生活型態與簽名</span>
          </div>
        </div>
      </div>

      {/* Step Contents */}
      <div className="form-step-content">
        {/* ================= STEP 1: 基本資料 ================= */}
        {currentStep === 1 && (
          <div>
            <div className="form-section-card">
              <div className="section-header">
                <div className="section-icon-badge">
                  <User size={20} />
                </div>
                <h3 className="section-title">受檢者基本身分核對</h3>
              </div>

              <div className="form-grid-3 question-block">
                <div>
                  <label className="question-label">
                    受檢者姓名 <span className="required-badge">必填</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="例: 王大明"
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
                    placeholder="例: A123456789"
                    maxLength={10}
                    value={patient.id_card_no}
                    onChange={e => setPatient({ ...patient, id_card_no: e.target.value.toUpperCase() })}
                  />
                </div>

                <div>
                  <label className="question-label">
                    生理性別 <span className="required-badge">必填</span>
                  </label>
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
                    placeholder="0912-345678"
                    value={patient.mobile}
                    onChange={e => setPatient({ ...patient, mobile: e.target.value })}
                  />
                </div>

                <div>
                  <label className="question-label">聯絡市話 (選填)</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="049-2658977"
                    value={patient.phone}
                    onChange={e => setPatient({ ...patient, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Indigenous & Tribe */}
              <div className="question-block">
                <label className="question-label">是否具備原住民身分？</label>
                <div className="options-grid-2">
                  <div
                    className={`tile-choice ${!patient.is_indigenous ? 'selected' : ''}`}
                    onClick={() => setPatient({ ...patient, is_indigenous: false, indigenous_tribe: '' })}
                  >
                    <div className="tile-indicator">{!patient.is_indigenous ? '●' : ''}</div>
                    <span>否 (一般民眾 45-74 歲補助)</span>
                  </div>
                  <div
                    className={`tile-choice ${patient.is_indigenous ? 'selected' : ''}`}
                    onClick={() => setPatient({ ...patient, is_indigenous: true })}
                  >
                    <div className="tile-indicator">{patient.is_indigenous ? '●' : ''}</div>
                    <span>是 (原住民專案補助)</span>
                  </div>
                </div>

                {patient.is_indigenous && (
                  <div className="conditional-reveal-box">
                    <label className="question-label">原住民族別：</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="例: 阿美族、泰雅族、布農族..."
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
                    placeholder="村里 (雲林里)"
                    value={patient.village}
                    onChange={e => setPatient({ ...patient, village: e.target.value })}
                  />
                </div>
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="詳細路段/巷弄/號 (例: 集山路三段480號)"
                    value={patient.road}
                    onChange={e => setPatient({ ...patient, road: e.target.value })}
                  />
                </div>
              </div>

              {/* Socio-demographic */}
              <div className="form-grid-3 question-block">
                <div>
                  <label className="question-label">教育程度</label>
                  <select
                    className="input-field"
                    value={patient.education_level}
                    onChange={e => setPatient({ ...patient, education_level: e.target.value })}
                  >
                    <option value="無">無</option>
                    <option value="小學">小學</option>
                    <option value="國(初)中">國(初)中</option>
                    <option value="高中(職)">高中(職)</option>
                    <option value="專科、大學">專科、大學</option>
                    <option value="研究所以上">研究所以上</option>
                    <option value="拒答">拒答</option>
                  </select>
                </div>

                <div>
                  <label className="question-label">職業狀況</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="例: 有，製造業 / 無"
                    value={patient.occupation_status}
                    onChange={e => setPatient({ ...patient, occupation_status: e.target.value })}
                  />
                </div>

                <div>
                  <label className="question-label">婚姻狀況</label>
                  <select
                    className="input-field"
                    value={patient.marriage_status}
                    onChange={e => setPatient({ ...patient, marriage_status: e.target.value })}
                  >
                    <option value="未婚">未婚</option>
                    <option value="已婚">已婚</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: 個人病史與用藥 ================= */}
        {currentStep === 2 && (
          <div>
            {/* 1. 個人病史 */}
            <div className="form-section-card">
              <div className="section-header">
                <div className="section-icon-badge">
                  <HeartPulse size={20} />
                </div>
                <h3 className="section-title">一、個人病史與治療經驗</h3>
              </div>

              {/* Q1: 疾病複選 */}
              <div className="question-block">
                <label className="question-label">
                  Q1. 您個人過去或目前是否曾患有以下疾病？ (可複選)
                </label>
                <div className="options-grid">
                  {[
                    { key: 'none', label: '0. 無病史' },
                    { key: 'gastritis', label: '1. 胃炎' },
                    { key: 'ulcer', label: '2. 胃潰瘍' },
                    { key: 'duodenal_ulcer', label: '3. 十二指腸潰瘍' },
                    { key: 'reflux', label: '4. 胃食道逆流' },
                    { key: 'hp_infection', label: '5. 幽門桿菌感染' },
                    { key: 'tumor', label: '6. 胃腫瘤' },
                    { key: 'cancer', label: '7. 胃癌' }
                  ].map(item => {
                    const isSelected = !!screening.personal_history[item.key as keyof typeof screening.personal_history];
                    return (
                      <div
                        key={item.key}
                        className={`tile-choice ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          const curr = { ...screening.personal_history };
                          if (item.key === 'none') {
                            // If none selected, uncheck everything else
                            setScreening({
                              ...screening,
                              personal_history: {
                                none: !curr.none,
                                gastritis: false, ulcer: false, duodenal_ulcer: false,
                                reflux: false, tumor: false, cancer: false, hp_infection: false
                              }
                            });
                          } else {
                            (curr as any)[item.key] = !(curr as any)[item.key];
                            curr.none = false;
                            setScreening({ ...screening, personal_history: curr });
                          }
                        }}
                      >
                        <div className="tile-indicator checkbox">{isSelected ? '✓' : ''}</div>
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Q2: 幽門桿菌除菌治療 */}
              <div className="question-block">
                <label className="question-label">
                  Q2. 曾否接受過幽門螺旋桿菌「除菌治療」？
                </label>
                <div className="options-grid-2">
                  <div
                    className={`tile-choice ${!screening.hp_eradication ? 'selected' : ''}`}
                    onClick={() => setScreening({ ...screening, hp_eradication: false })}
                  >
                    <div className="tile-indicator">{!screening.hp_eradication ? '●' : ''}</div>
                    <span>無 (從未接受過除菌)</span>
                  </div>
                  <div
                    className={`tile-choice ${screening.hp_eradication ? 'selected' : ''}`}
                    onClick={() => setScreening({ ...screening, hp_eradication: true })}
                  >
                    <div className="tile-indicator">{screening.hp_eradication ? '●' : ''}</div>
                    <span>有 (曾服用除菌藥物組合)</span>
                  </div>
                </div>
              </div>

              {/* Q3: 胃鏡檢查 */}
              <div className="question-block">
                <label className="question-label">
                  Q3. 曾否接受過「胃鏡檢查」？
                </label>
                <div className="options-grid-2">
                  <div
                    className={`tile-choice ${!screening.gastroscopy_history ? 'selected' : ''}`}
                    onClick={() => setScreening({ ...screening, gastroscopy_history: false, gastroscopy_year: null })}
                  >
                    <div className="tile-indicator">{!screening.gastroscopy_history ? '●' : ''}</div>
                    <span>無 (從未做過胃鏡)</span>
                  </div>
                  <div
                    className={`tile-choice ${screening.gastroscopy_history ? 'selected' : ''}`}
                    onClick={() => setScreening({ ...screening, gastroscopy_history: true })}
                  >
                    <div className="tile-indicator">{screening.gastroscopy_history ? '●' : ''}</div>
                    <span>有 (請填寫受檢年份)</span>
                  </div>
                </div>

                {screening.gastroscopy_history && (
                  <div className="conditional-reveal-box">
                    <label className="question-label">接受胃鏡檢查之民國年份：</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.95rem' }}>民國</span>
                      <input
                        type="number"
                        className="input-field"
                        style={{ width: '120px' }}
                        placeholder="例: 110"
                        value={screening.gastroscopy_year || ''}
                        onChange={e => setScreening({ ...screening, gastroscopy_year: parseInt(e.target.value) || null })}
                      />
                      <span style={{ fontSize: '0.95rem' }}>年</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer', marginLeft: '16px' }}>
                        <input
                          type="checkbox"
                          checked={screening.gastroscopy_year_unknown}
                          onChange={e => setScreening({ ...screening, gastroscopy_year_unknown: e.target.checked })}
                        />
                        年代久遠不詳
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Q4: 近一個月特效藥 */}
              <div className="question-block">
                <label className="question-label">
                  Q4. 近一個月內是否服用潰瘍/胃食道逆流特效藥 (一日一顆)？
                </label>
                <div className="options-grid-2">
                  <div
                    className={`tile-choice ${!screening.anti_ulcer_drugs_recent_month ? 'selected' : ''}`}
                    onClick={() => setScreening({ ...screening, anti_ulcer_drugs_recent_month: false })}
                  >
                    <div className="tile-indicator">{!screening.anti_ulcer_drugs_recent_month ? '●' : ''}</div>
                    <span>無 (未服用)</span>
                  </div>
                  <div
                    className={`tile-choice ${screening.anti_ulcer_drugs_recent_month ? 'selected' : ''}`}
                    onClick={() => setScreening({ ...screening, anti_ulcer_drugs_recent_month: true })}
                  >
                    <div className="tile-indicator">{screening.anti_ulcer_drugs_recent_month ? '●' : ''}</div>
                    <span>有 (質子幫浦抑制劑 PPI 等)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 家族史與用藥史 */}
            <div className="form-section-card">
              <div className="section-header">
                <div className="section-icon-badge">
                  <Activity size={20} />
                </div>
                <h3 className="section-title">二、家族病史與最近三個月用藥</h3>
              </div>

              {/* 家族幽門桿菌與胃癌 */}
              <div className="form-grid-2 question-block">
                <div>
                  <label className="question-label">家族胃癌病史 (直系親屬)</label>
                  <div className="options-grid-2">
                    <div
                      className={`tile-choice ${!screening.family_gastric_cancer_history?.has ? 'selected' : ''}`}
                      onClick={() => setScreening({
                        ...screening,
                        family_gastric_cancer_history: { has: false, none: true }
                      })}
                    >
                      <div className="tile-indicator">{!screening.family_gastric_cancer_history?.has ? '●' : ''}</div>
                      <span>無或不詳</span>
                    </div>
                    <div
                      className={`tile-choice ${screening.family_gastric_cancer_history?.has ? 'selected' : ''}`}
                      onClick={() => setScreening({
                        ...screening,
                        family_gastric_cancer_history: { has: true, none: false, father: true }
                      })}
                    >
                      <div className="tile-indicator">{screening.family_gastric_cancer_history?.has ? '●' : ''}</div>
                      <span>有家族史</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="question-label">家族消化性潰瘍病史</label>
                  <div className="options-grid-2">
                    <div
                      className={`tile-choice ${!screening.family_ulcer_history?.has ? 'selected' : ''}`}
                      onClick={() => setScreening({
                        ...screening,
                        family_ulcer_history: { has: false, none: true }
                      })}
                    >
                      <div className="tile-indicator">{!screening.family_ulcer_history?.has ? '●' : ''}</div>
                      <span>無或不詳</span>
                    </div>
                    <div
                      className={`tile-choice ${screening.family_ulcer_history?.has ? 'selected' : ''}`}
                      onClick={() => setScreening({
                        ...screening,
                        family_ulcer_history: { has: true, none: false, father: true }
                      })}
                    >
                      <div className="tile-indicator">{screening.family_ulcer_history?.has ? '●' : ''}</div>
                      <span>有家族史</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 最近三個月特殊用藥 */}
              <div className="question-block">
                <label className="question-label">最近三個月有無服用特定藥物？</label>
                <div className="options-grid-2">
                  <div
                    className={`tile-choice ${!screening.medication_history?.has ? 'selected' : ''}`}
                    onClick={() => setScreening({
                      ...screening,
                      medication_history: { has: false }
                    })}
                  >
                    <div className="tile-indicator">{!screening.medication_history?.has ? '●' : ''}</div>
                    <span>無特殊用藥</span>
                  </div>
                  <div
                    className={`tile-choice ${screening.medication_history?.has ? 'selected' : ''}`}
                    onClick={() => setScreening({
                      ...screening,
                      medication_history: { ...screening.medication_history, has: true }
                    })}
                  >
                    <div className="tile-indicator">{screening.medication_history?.has ? '●' : ''}</div>
                    <span>有 (展開勾選品項)</span>
                  </div>
                </div>

                {screening.medication_history?.has && (
                  <div className="conditional-reveal-box">
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1E293B', display: 'block', marginBottom: '8px' }}>
                      請勾選服用之藥物類別 (可複選)：
                    </span>
                    <div className="options-grid">
                      <div
                        className={`tile-choice ${screening.medication_history?.painkiller ? 'selected' : ''}`}
                        onClick={() => setScreening({
                          ...screening,
                          medication_history: {
                            ...screening.medication_history,
                            painkiller: !screening.medication_history?.painkiller
                          }
                        })}
                      >
                        <div className="tile-indicator checkbox">{screening.medication_history?.painkiller ? '✓' : ''}</div>
                        <span>止痛藥 (NSAIDs)</span>
                      </div>

                      <div
                        className={`tile-choice ${screening.medication_history?.antiplatelet_aspirin ? 'selected' : ''}`}
                        onClick={() => setScreening({
                          ...screening,
                          medication_history: {
                            ...screening.medication_history,
                            antiplatelet: true,
                            antiplatelet_aspirin: !screening.medication_history?.antiplatelet_aspirin
                          }
                        })}
                      >
                        <div className="tile-indicator checkbox">{screening.medication_history?.antiplatelet_aspirin ? '✓' : ''}</div>
                        <span>阿斯匹靈 (Aspirin)</span>
                      </div>

                      <div
                        className={`tile-choice ${screening.medication_history?.antiplatelet_plavix ? 'selected' : ''}`}
                        onClick={() => setScreening({
                          ...screening,
                          medication_history: {
                            ...screening.medication_history,
                            antiplatelet: true,
                            antiplatelet_plavix: !screening.medication_history?.antiplatelet_plavix
                          }
                        })}
                      >
                        <div className="tile-indicator checkbox">{screening.medication_history?.antiplatelet_plavix ? '✓' : ''}</div>
                        <span>保栓通 (Plavix)</span>
                      </div>

                      <div
                        className={`tile-choice ${screening.medication_history?.anticoagulant_coumadin ? 'selected' : ''}`}
                        onClick={() => setScreening({
                          ...screening,
                          medication_history: {
                            ...screening.medication_history,
                            anticoagulant: true,
                            anticoagulant_coumadin: !screening.medication_history?.anticoagulant_coumadin
                          }
                        })}
                      >
                        <div className="tile-indicator checkbox">{screening.medication_history?.anticoagulant_coumadin ? '✓' : ''}</div>
                        <span>抗凝血劑 (可邁丁)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: 生活型態與簽名確認 ================= */}
        {currentStep === 3 && (
          <div>
            <div className="form-section-card">
              <div className="section-header">
                <div className="section-icon-badge">
                  <Activity size={20} />
                </div>
                <h3 className="section-title">三、生活型態與飲食習慣</h3>
              </div>

              {/* 菸酒檳習慣 */}
              <div className="form-grid-3 question-block">
                <div>
                  <label className="question-label">1. 吸菸習慣</label>
                  <select
                    className="input-field"
                    value={screening.smoking_habit}
                    onChange={e => setScreening({ ...screening, smoking_habit: parseInt(e.target.value) })}
                  >
                    <option value={0}>0. 從不吸菸</option>
                    <option value={1}>1. 已戒菸</option>
                    <option value={2}>2. 目前有吸菸</option>
                    <option value={3}>3. 其他</option>
                  </select>
                </div>

                <div>
                  <label className="question-label">2. 飲酒習慣</label>
                  <select
                    className="input-field"
                    value={screening.drinking_habit}
                    onChange={e => setScreening({ ...screening, drinking_habit: parseInt(e.target.value) })}
                  >
                    <option value={0}>0. 從不喝酒</option>
                    <option value={1}>1. 已戒酒</option>
                    <option value={2}>2. 目前有飲酒</option>
                    <option value={3}>3. 其他</option>
                  </select>
                </div>

                <div>
                  <label className="question-label">3. 嚼檳榔習慣</label>
                  <select
                    className="input-field"
                    value={screening.betel_nut_habit}
                    onChange={e => setScreening({ ...screening, betel_nut_habit: parseInt(e.target.value) })}
                  >
                    <option value={0}>0. 從不嚼檳榔</option>
                    <option value={1}>1. 已戒檳榔</option>
                    <option value={2}>2. 目前有嚼檳榔</option>
                    <option value={3}>3. 其他</option>
                  </select>
                </div>
              </div>

              {/* 飲食頻率 (每週>=3次) */}
              <div className="question-block">
                <label className="question-label">
                  4. 高風險飲食頻率 (每週 3 次或以上)：
                </label>
                <div className="options-grid-3">
                  <div
                    className={`tile-choice ${screening.diet_pickled_freq ? 'selected' : ''}`}
                    onClick={() => setScreening({ ...screening, diet_pickled_freq: !screening.diet_pickled_freq })}
                  >
                    <div className="tile-indicator checkbox">{screening.diet_pickled_freq ? '✓' : ''}</div>
                    <span>常吃醃漬品 (鹹魚/醬瓜/酸菜)</span>
                  </div>

                  <div
                    className={`tile-choice ${screening.diet_smoked_freq ? 'selected' : ''}`}
                    onClick={() => setScreening({ ...screening, diet_smoked_freq: !screening.diet_smoked_freq })}
                  >
                    <div className="tile-indicator checkbox">{screening.diet_smoked_freq ? '✓' : ''}</div>
                    <span>常吃煙燻、燒烤、香腸</span>
                  </div>

                  <div
                    className={`tile-choice ${screening.diet_raw_freq ? 'selected' : ''}`}
                    onClick={() => setScreening({ ...screening, diet_raw_freq: !screening.diet_raw_freq })}
                  >
                    <div className="tile-indicator checkbox">{screening.diet_raw_freq ? '✓' : ''}</div>
                    <span>常吃生食 (生魚片/生牛肉)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consent Card Preview */}
            <div style={{ background: '#EFF6FF', border: '1.5px solid #93C5FD', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1D4ED8', fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px' }}>
                <ShieldCheck size={22} />
                <span>法定受檢者告知同意書</span>
              </div>
              <p style={{ color: '#1E40AF', fontSize: '0.925rem', lineHeight: '1.6' }}>
                本人同意接受以<strong>「糞便抗原檢測胃幽門螺旋桿菌檢查」</strong>服務，相關檢查資料將作為衛生主管機關政策評估或個案追蹤健康管理使用，並確認以上所填之個人資料與病史皆正確無誤。
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#3B82F6' }}>
                * 點擊下方按鈕將開啟數位簽名板，請受檢者正楷親筆書寫全名以完成法定簽章。
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div className="wizard-footer">
        {currentStep > 1 ? (
          <button type="button" className="btn btn-secondary btn-lg" onClick={handlePrev}>
            <ChevronLeft size={20} />
            上一步
          </button>
        ) : (
          <div />
        )}

        {currentStep < 3 ? (
          <button type="button" className="btn btn-primary btn-lg" onClick={handleNext}>
            儲存並進入下一步
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => setIsSignModalOpen(true)}
            disabled={isSubmitting}
            style={{ background: '#1976D2', boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)' }}
          >
            <ShieldCheck size={20} />
            {isSubmitting ? '問卷封存加密中...' : '確認無誤，進行數位簽名送出'}
          </button>
        )}
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirm={handleSignatureConfirmed}
        patientName={patient.name}
        idCardNo={patient.id_card_no}
        consentType="GASTRIC"
      />
    </div>
  );
};
