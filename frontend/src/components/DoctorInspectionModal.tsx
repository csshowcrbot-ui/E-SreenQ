import React, { useState, useEffect } from 'react';
import type { Questionnaire, LesionLocation } from '../types';
import { OralAnatomyMap, REFERRAL_CODES } from './OralAnatomyMap';
import { SignatureModal } from './SignatureModal';
import { submitDoctorInspection } from '../services/api';
import {
  Stethoscope,
  X,
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
  User
} from 'lucide-react';

interface DoctorInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionnaire: Questionnaire | null;
  onSuccess: (updated: Questionnaire) => void;
}

export const DoctorInspectionModal: React.FC<DoctorInspectionModalProps> = ({
  isOpen,
  onClose,
  questionnaire,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'INSPECTION' | 'FOLLOWUP'>('INSPECTION');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDoctorSignModalOpen, setIsDoctorSignModalOpen] = useState<boolean>(false);

  // Form states
  const [screeningUnit, setScreeningUnit] = useState<string>('竹山秀傳醫療社團法人竹山秀傳醫院');
  const [screeningUnitCode, setScreeningUnitCode] = useState<string>('0938040012');
  const [doctorDept, setDoctorDept] = useState<string>('耳鼻喉科');
  const [doctorName, setDoctorName] = useState<string>('李宗霖');
  const [doctorLicenseNo, setDoctorLicenseNo] = useState<string>('醫字第041892號');

  const [inspectionResult, setInspectionResult] = useState<'NORMAL' | 'REFERRAL'>('NORMAL');
  const [referralReasonsSelected, setReferralReasonsSelected] = useState<string[]>([]);
  const [referralReasonCode, setReferralReasonCode] = useState<string>('00');
  const [otherReasonText, setOtherReasonText] = useState<string>('');
  const [lesionLocations, setLesionLocations] = useState<LesionLocation[]>([]);

  const [referralHospital, setReferralHospital] = useState<string>('彰化基督教醫院');
  const [referralDoctor, setReferralDoctor] = useState<string>('李宗霖');
  const [referralPhone, setReferralPhone] = useState<string>('049-2658977 分機218');

  // Doctor Signature
  const [doctorSignature, setDoctorSignature] = useState<{ base64Png: string; signedAt: string } | null>(null);

  // Followup
  const [followup, setFollowup] = useState<{
    recheck_within_2months?: boolean;
    recheck_hospital?: string;
    recheck_date?: string;
    biopsy_performed?: boolean;
    clinical_diagnosis?: string;
    pathology_diagnosis?: string;
    treatment_status?: string;
  }>({
    recheck_within_2months: false,
    recheck_hospital: '',
    recheck_date: '',
    biopsy_performed: false,
    clinical_diagnosis: '',
    pathology_diagnosis: '',
    treatment_status: ''
  });

  useEffect(() => {
    if (questionnaire && questionnaire.form_type === 'ORAL') {
      const o = questionnaire.oral;
      if (o) {
        if (o.screening_unit) setScreeningUnit(o.screening_unit);
        if (o.screening_unit_code) setScreeningUnitCode(o.screening_unit_code);
        if (o.doctor_dept) setDoctorDept(o.doctor_dept);
        if (o.doctor_name) setDoctorName(o.doctor_name);
        if (o.doctor_license_no) setDoctorLicenseNo(o.doctor_license_no);

        if (o.inspection_result === 'REFERRAL') {
          setInspectionResult('REFERRAL');
          setReferralReasonCode(o.referral_reason_code || '01');
          setReferralReasonsSelected(o.referral_reasons_selected || [o.referral_reason_code || '01']);
        } else {
          setInspectionResult('NORMAL');
          setReferralReasonCode('00');
          setReferralReasonsSelected([]);
        }

        setOtherReasonText(o.other_reason_text || '');
        setLesionLocations(o.lesion_locations || []);
        if (o.referral_hospital) setReferralHospital(o.referral_hospital);
        if (o.referral_doctor) setReferralDoctor(o.referral_doctor);
        if (o.referral_phone) setReferralPhone(o.referral_phone);

        if (o.followup) {
          setFollowup(o.followup);
        }
      }

      if (questionnaire.doctor_signature_url) {
        setDoctorSignature({
          base64Png: questionnaire.doctor_signature_url,
          signedAt: questionnaire.doctor_signed_at || new Date().toISOString()
        });
      } else {
        // Provide convenient default electronic stamp signature for physician
        const defaultDocStamp = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='75'><path d='M10,35 Q40,5 80,40 T130,15' fill='none' stroke='%231e3a8a' stroke-width='3'/><circle cx='165' cy='32' r='16' fill='none' stroke='%23dc2626' stroke-width='2'/><text x='157' y='38' font-size='14' fill='%23dc2626' font-weight='bold'>李</text><text x='25' y='65' font-size='11' fill='%23475569'>醫師執業簽章核可</text></svg>";
        setDoctorSignature({
          base64Png: defaultDocStamp,
          signedAt: new Date().toISOString()
        });
      }
    }
  }, [questionnaire]);

  if (!isOpen || !questionnaire) return null;

  const p = questionnaire.patient;
  const o = questionnaire.oral;

  // Calculate age
  const calculateAge = (birthDateStr?: string) => {
    if (!birthDateStr) return '';
    const birthYear = parseInt(birthDateStr.split('-')[0]);
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  const betelTierText = (tier?: number) => {
    switch (tier) {
      case 0: return '無嚼檳習慣';
      case 1: return '已戒檳榔';
      case 2: return '嚼 10 年以下，每天少於 20 顆';
      case 3: return '嚼 10 年以下，每天 20 顆及以上';
      case 4: return '嚼超過 10 年，每天少於 20 顆';
      case 5: return '嚼超過 10 年，每天 20 顆及以上';
      default: return '未填';
    }
  };

  const smokingTierText = (tier?: number) => {
    switch (tier) {
      case 0: return '無吸菸習慣';
      case 1: return '已戒菸';
      case 2: return '吸 10 年以下，每天少於 20 支';
      case 3: return '吸 10 年以下，每天 20 支及以上';
      case 4: return '吸超過 10 年，每天少於 20 支';
      case 5: return '吸超過 10 年，每天 20 支及以上';
      default: return '未填';
    }
  };

  const handleReasonCheckboxToggle = (code: string) => {
    const list = [...referralReasonsSelected];
    const idx = list.indexOf(code);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(code);
    }
    list.sort();
    const primary = list.length > 0 ? list[0] : '00';
    setReferralReasonsSelected(list);
    setReferralReasonCode(primary);
  };

  const handleSaveInspection = async () => {
    if (!doctorName) {
      alert('請填寫初檢醫師姓名！');
      return;
    }
    if (inspectionResult === 'REFERRAL' && referralReasonsSelected.length === 0) {
      alert('判定需轉介時，請至少勾選一項轉介原因代碼！');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        screeningUnit,
        screeningUnitCode,
        doctorDept,
        doctorName,
        doctorLicenseNo,
        inspectionResult,
        referralReasonCode: inspectionResult === 'NORMAL' ? '00' : referralReasonCode,
        referralReasonsSelected: inspectionResult === 'NORMAL' ? [] : referralReasonsSelected,
        otherReasonText,
        lesionLocations: inspectionResult === 'NORMAL' ? [] : lesionLocations,
        referralHospital,
        referralDoctor,
        referralPhone,
        doctorSignature,
        followup: activeTab === 'FOLLOWUP' ? followup : questionnaire.oral?.followup
      };

      const updated = await submitDoctorInspection(questionnaire.questionnaire_id, payload);
      alert(`問卷 #${questionnaire.questionnaire_id} 初檢診斷已成功儲存並完成簽署封存！`);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      alert(err.message || '儲存初檢診斷失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" style={{ maxWidth: '960px', maxHeight: '92vh' }}>
        {/* Modal Header */}
        <div className="modal-header" style={{ background: '#F8FAFC' }}>
          <div>
            <div className="modal-title" style={{ color: '#0F172A' }}>
              <Stethoscope size={24} color="#00897B" />
              <span>口腔黏膜檢查 - 醫師初檢診斷填報</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
              國健署 AT287 標準表單 ‧ 表單編號 #{questionnaire.questionnaire_id}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {/* Patient Profile & Habit Review Banner */}
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '12px 16px', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={18} />
                受檢者：{p.name} ({p.gender === 'M' ? '男' : '女'}, {calculateAge(p.birth_date)}歲)
              </span>
              <span style={{ fontSize: '0.85rem', color: '#1E40AF', fontFamily: 'monospace' }}>
                病歷號：<strong>{p.chart_no}</strong> ｜ 身分證：<strong>{p.id_card_no_masked || p.id_card_no}</strong>
              </span>
            </div>

            {/* Smoking & Betel Nut Summary Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.85rem' }}>
              <span style={{ background: '#FFFFFF', border: '1px solid #93C5FD', padding: '3px 10px', borderRadius: '9999px', color: '#1E40AF', fontWeight: '600' }}>
                檳榔習慣：{betelTierText(o?.betel_nut_tier)}
              </span>
              <span style={{ background: '#FFFFFF', border: '1px solid #93C5FD', padding: '3px 10px', borderRadius: '9999px', color: '#1E40AF', fontWeight: '600' }}>
                吸菸習慣：{smokingTierText(o?.smoking_tier)}
              </span>
              <span style={{
                background: o?.self_reported_symptoms ? '#FEE2E2' : '#DCFCE7',
                border: o?.self_reported_symptoms ? '1px solid #FCA5A5' : '1px solid #86EFAC',
                color: o?.self_reported_symptoms ? '#B91C1C' : '#15803D',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontWeight: '700'
              }}>
                自覺症狀：{o?.self_reported_symptoms ? '⚠️ 自覺有黏膜異常症狀' : '無異常自覺症狀'}
              </span>
              <span style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '3px 10px', borderRadius: '9999px', color: '#475569' }}>
                受檢者簽署：{new Date(questionnaire.patient_signed_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
            <button
              type="button"
              className={`btn ${activeTab === 'INSPECTION' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('INSPECTION')}
              style={{ padding: '7px 18px', fontSize: '0.9rem' }}
            >
              <Stethoscope size={16} />
              初檢醫師診斷與病灶解剖標記
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'FOLLOWUP' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('FOLLOWUP')}
              style={{ padding: '7px 18px', fontSize: '0.9rem' }}
            >
              <ClipboardList size={16} />
              B 個案複檢(確診)追蹤資料
            </button>
          </div>

          {activeTab === 'INSPECTION' ? (
            <div>
              {/* Doctor Details Row */}
              <div className="form-grid-3 question-block" style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <div>
                  <label className="question-label" style={{ fontSize: '0.85rem' }}>初檢醫師姓名</label>
                  <input
                    type="text"
                    className="input-field"
                    value={doctorName}
                    onChange={e => setDoctorName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="question-label" style={{ fontSize: '0.85rem' }}>專科別</label>
                  <select
                    className="input-field"
                    value={doctorDept}
                    onChange={e => setDoctorDept(e.target.value)}
                  >
                    <option value="耳鼻喉科">耳鼻喉科</option>
                    <option value="牙科">牙科</option>
                    <option value="口腔顎面外科">口腔顎面外科</option>
                    <option value="其他">其他核可專科</option>
                  </select>
                </div>
                <div>
                  <label className="question-label" style={{ fontSize: '0.85rem' }}>醫師執業執照號碼</label>
                  <input
                    type="text"
                    className="input-field"
                    value={doctorLicenseNo}
                    onChange={e => setDoctorLicenseNo(e.target.value)}
                  />
                </div>
              </div>

              {/* Diagnosis Result Buttons */}
              <div className="question-block">
                <label className="question-label" style={{ fontSize: '1.05rem', fontWeight: '700' }}>
                  初檢診斷結果判定：
                </label>
                <div className="options-grid-2">
                  <div
                    className={`tile-choice ${inspectionResult === 'NORMAL' ? 'selected' : ''}`}
                    onClick={() => {
                      setInspectionResult('NORMAL');
                      setReferralReasonsSelected([]);
                      setReferralReasonCode('00');
                      setLesionLocations([]);
                    }}
                    style={{ minHeight: '60px' }}
                  >
                    <div className="tile-indicator">{inspectionResult === 'NORMAL' ? '●' : ''}</div>
                    <div>
                      <strong style={{ display: 'block', color: '#15803D' }}>0. 未發現需轉介之異常</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>口腔黏膜正常，無疑似病灶</span>
                    </div>
                  </div>

                  <div
                    className={`tile-choice ${inspectionResult === 'REFERRAL' ? 'selected' : ''}`}
                    onClick={() => {
                      setInspectionResult('REFERRAL');
                      if (referralReasonsSelected.length === 0) {
                        setReferralReasonsSelected(['01']);
                        setReferralReasonCode('01');
                      }
                    }}
                    style={{ minHeight: '60px' }}
                  >
                    <div className="tile-indicator">{inspectionResult === 'REFERRAL' ? '●' : ''}</div>
                    <div>
                      <strong style={{ display: 'block', color: '#DC2626' }}>1. 需轉介 (發現疑似病灶)</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>需勾選轉介代碼並於解剖圖標註部位</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditional Reveal for REFERRAL */}
              {inspectionResult === 'REFERRAL' && (
                <div style={{ marginTop: '1.25rem', borderTop: '2px solid #FCA5A5', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', marginBottom: '10px' }}>
                    <AlertTriangle size={20} />
                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>
                      請勾選轉介原因，並於右方解剖圖點選標記病灶部位：
                    </span>
                  </div>

                  {/* Referral Reason Checkboxes */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label className="question-label" style={{ fontSize: '0.9rem' }}>
                      轉介原因代碼 (勾選多項時，系統自動取較小編碼為主代碼)：
                    </label>
                    <div className="options-grid">
                      {REFERRAL_CODES.map(rc => {
                        const isChecked = referralReasonsSelected.includes(rc.code);
                        return (
                          <div
                            key={rc.code}
                            className={`tile-choice ${isChecked ? 'selected' : ''}`}
                            onClick={() => handleReasonCheckboxToggle(rc.code)}
                            style={{ minHeight: '44px', padding: '6px 10px', fontSize: '0.85rem' }}
                          >
                            <div className="tile-indicator checkbox">{isChecked ? '✓' : ''}</div>
                            <span>[{rc.code}] {rc.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Oral Anatomy Map */}
                  <OralAnatomyMap
                    lesions={lesionLocations}
                    onChange={updated => setLesionLocations(updated)}
                  />

                  {/* Referral Hospital Details */}
                  <div className="form-grid-3 question-block" style={{ marginTop: '1.25rem', background: '#FEF2F2', padding: '12px', borderRadius: '10px', border: '1px solid #FECACA' }}>
                    <div>
                      <label className="question-label" style={{ color: '#991B1B', fontSize: '0.85rem' }}>轉診確診醫院</label>
                      <input
                        type="text"
                        className="input-field"
                        value={referralHospital}
                        onChange={e => setReferralHospital(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="question-label" style={{ color: '#991B1B', fontSize: '0.85rem' }}>轉診醫師</label>
                      <input
                        type="text"
                        className="input-field"
                        value={referralDoctor}
                        onChange={e => setReferralDoctor(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="question-label" style={{ color: '#991B1B', fontSize: '0.85rem' }}>聯絡電話/分機</label>
                      <input
                        type="text"
                        className="input-field"
                        value={referralPhone}
                        onChange={e => setReferralPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor Electronic Signature */}
              <div style={{ marginTop: '1.25rem', padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={26} color="#00897B" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1E293B' }}>
                      初檢醫師電子診斷簽章認證
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      {doctorSignature ? `已掛載 ${doctorName} 醫師執業認證章` : '未簽章'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {doctorSignature && (
                    <img src={doctorSignature.base64Png} alt="醫師簽章" style={{ maxHeight: '42px', border: '1px dashed #CBD5E1', padding: '2px', background: '#FFF' }} />
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsDoctorSignModalOpen(true)}
                    style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                  >
                    重簽/修改簽名
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Followup Tab */
            <div>
              <div className="question-block">
                <label className="question-label">
                  1. 疑似異常個案於檢查後 2 個月內有無接受後續複檢(確診)？
                </label>
                <div className="options-grid-2">
                  <div
                    className={`tile-choice ${followup.recheck_within_2months ? 'selected' : ''}`}
                    onClick={() => setFollowup({ ...followup, recheck_within_2months: true })}
                  >
                    <div className="tile-indicator">{followup.recheck_within_2months ? '●' : ''}</div>
                    <span>有接受複檢</span>
                  </div>
                  <div
                    className={`tile-choice ${!followup.recheck_within_2months ? 'selected' : ''}`}
                    onClick={() => setFollowup({ ...followup, recheck_within_2months: false })}
                  >
                    <div className="tile-indicator">{!followup.recheck_within_2months ? '●' : ''}</div>
                    <span>未受檢</span>
                  </div>
                </div>
              </div>

              <div className="form-grid-3 question-block">
                <div>
                  <label className="question-label">確診醫院名稱</label>
                  <input
                    type="text"
                    className="input-field"
                    value={followup.recheck_hospital || ''}
                    onChange={e => setFollowup({ ...followup, recheck_hospital: e.target.value })}
                  />
                </div>
                <div>
                  <label className="question-label">確診日期</label>
                  <input
                    type="date"
                    className="input-field"
                    value={followup.recheck_date || ''}
                    onChange={e => setFollowup({ ...followup, recheck_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="question-label">病理切片</label>
                  <div className="options-grid-2">
                    <div
                      className={`tile-choice ${followup.biopsy_performed ? 'selected' : ''}`}
                      onClick={() => setFollowup({ ...followup, biopsy_performed: true })}
                    >
                      <div className="tile-indicator">{followup.biopsy_performed ? '●' : ''}</div>
                      <span>有切片</span>
                    </div>
                    <div
                      className={`tile-choice ${!followup.biopsy_performed ? 'selected' : ''}`}
                      onClick={() => setFollowup({ ...followup, biopsy_performed: false })}
                    >
                      <div className="tile-indicator">{!followup.biopsy_performed ? '●' : ''}</div>
                      <span>無切片</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-grid-2 question-block">
                <div>
                  <label className="question-label">臨床診斷結果</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="例: 均質性厚白斑、疑似口腔癌"
                    value={followup.clinical_diagnosis || ''}
                    onChange={e => setFollowup({ ...followup, clinical_diagnosis: e.target.value })}
                  />
                </div>
                <div>
                  <label className="question-label">病理確診結果</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="例: 上皮變異 (輕度/中度/重度)"
                    value={followup.pathology_diagnosis || ''}
                    onChange={e => setFollowup({ ...followup, pathology_diagnosis: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveInspection}
            disabled={isSubmitting}
            style={{ background: '#00897B' }}
          >
            <ShieldCheck size={18} />
            {isSubmitting ? '儲存中...' : '儲存初檢診斷並完成簽章封存'}
          </button>
        </div>
      </div>

      {/* Signature Modal for Doctor */}
      <SignatureModal
        isOpen={isDoctorSignModalOpen}
        onClose={() => setIsDoctorSignModalOpen(false)}
        onConfirm={(base64Png, signedAt) => {
          setDoctorSignature({ base64Png, signedAt });
          setIsDoctorSignModalOpen(false);
        }}
        patientName={p.name}
        idCardNo={p.id_card_no}
        consentType="ORAL"
        role="DOCTOR"
        doctorName={doctorName}
        title="醫師初檢數位簽章認證"
      />
    </div>
  );
};
