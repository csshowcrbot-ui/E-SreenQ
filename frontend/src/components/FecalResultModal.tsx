import React, { useState, useEffect } from 'react';
import type { Questionnaire, FecalScreening } from '../types';
import { submitFecalResult } from '../services/api';
import {
  TestTube2,
  X,
  ClipboardList,
  Activity
} from 'lucide-react';

interface FecalResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionnaire: Questionnaire | null;
  onSuccess: (updated: Questionnaire) => void;
}

export const FecalResultModal: React.FC<FecalResultModalProps> = ({
  isOpen,
  onClose,
  questionnaire,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [labUnitName, setLabUnitName] = useState('竹山秀傳醫療社團法人竹山秀傳醫院 檢驗醫學科 (0938040012)');
  const [labTestDate, setLabTestDate] = useState('');
  const [testResult, setTestResult] = useState<'NEGATIVE' | 'POSITIVE' | 'PENDING'>('NEGATIVE');
  const [testValue, setTestValue] = useState('');
  const [reagentBrand, setReagentBrand] = useState<'Eiken' | 'Kyowa' | 'OTHER'>('Kyowa');
  const [reagentBrandOther, setReagentBrandOther] = useState('');

  // Followup confirmation state
  const [hasFollowup3months, setHasFollowup3months] = useState<boolean | null>(null);
  const [unconfirmedReason, setUnconfirmedReason] = useState('');
  const [unconfirmedReasonOther, setUnconfirmedReasonOther] = useState('');
  const [confirmHospital, setConfirmHospital] = useState('');
  const [confirmDate, setConfirmDate] = useState('');
  const [confirmMethod, setConfirmMethod] = useState<'COLONOSCOPY' | 'OTHER'>('COLONOSCOPY');
  const [confirmMethodOther, setConfirmMethodOther] = useState('');
  const [diagnosis, setDiagnosis] = useState<'NORMAL' | 'HEMORRHOIDS' | 'COLITIS' | 'POLYP' | 'COLORECTAL_CANCER' | 'OTHER'>('NORMAL');
  const [diagnosisOther, setDiagnosisOther] = useState('');
  const [polypRemovalStatus, setPolypRemovalStatus] = useState<'NOT_REMOVED' | 'COMPLETELY_REMOVED' | 'INCOMPLETELY_REMOVED'>('COMPLETELY_REMOVED');

  useEffect(() => {
    if (questionnaire?.fecal) {
      const f = questionnaire.fecal;
      setLabUnitName(f.lab_unit_name || '竹山秀傳醫療社團法人竹山秀傳醫院 檢驗醫學科 (0938040012)');
      setLabTestDate(f.lab_test_date || new Date().toISOString().split('T')[0]);
      setTestResult(f.test_result || 'NEGATIVE');
      setTestValue(f.test_value || (f.test_result === 'POSITIVE' ? '128' : '4.5'));
      setReagentBrand(f.reagent_brand || 'Kyowa');
      setReagentBrandOther(f.reagent_brand_other || '');

      // Followup
      setHasFollowup3months(f.has_followup_3months !== undefined ? f.has_followup_3months : null);
      setUnconfirmedReason(f.unconfirmed_reason || '');
      setUnconfirmedReasonOther(f.unconfirmed_reason_other || '');
      setConfirmHospital(f.confirm_hospital || '竹山秀傳醫院 胃腸肝膽科 (0938040012)');
      setConfirmDate(f.confirm_date || '');
      setConfirmMethod(f.confirm_method || 'COLONOSCOPY');
      setConfirmMethodOther(f.confirm_method_other || '');
      setDiagnosis(f.diagnosis || 'NORMAL');
      setDiagnosisOther(f.diagnosis_other || '');
      setPolypRemovalStatus(f.polyp_removal_status || 'COMPLETELY_REMOVED');
    }
  }, [questionnaire]);

  if (!isOpen || !questionnaire) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload: Partial<FecalScreening> = {
        lab_unit_name: labUnitName,
        lab_test_date: labTestDate,
        test_result: testResult,
        test_value: testValue,
        reagent_brand: reagentBrand,
        reagent_brand_other: reagentBrandOther,
        has_followup_3months: hasFollowup3months,
        unconfirmed_reason: unconfirmedReason,
        unconfirmed_reason_other: unconfirmedReasonOther,
        confirm_hospital: confirmHospital,
        confirm_date: confirmDate,
        confirm_method: confirmMethod,
        confirm_method_other: confirmMethodOther,
        diagnosis: diagnosis,
        diagnosis_other: diagnosisOther,
        polyp_removal_status: polypRemovalStatus
      };

      const updated = await submitFecalResult(questionnaire.questionnaire_id, payload);
      alert('定量免疫法糞便潛血檢查結果已成功更新入檔');
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      alert(err.message || '更新失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const p = questionnaire.patient;
  const f = questionnaire.fecal;

  return (
    <div className="modal-overlay" style={{ overflowY: 'auto', padding: '2rem 1rem' }}>
      <div className="modal-dialog" style={{ maxWidth: '820px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <TestTube2 size={24} color="#0284C7" />
            <span>
              登錄檢驗結果與陽性確診追蹤 - #{questionnaire.questionnaire_id}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
            {/* Patient Header Strip */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '0.875rem' }}>
                <div><span style={{ color: '#64748B' }}>受檢姓名：</span><strong>{p.name}</strong> ({p.gender === 'M' ? '男' : '女'})</div>
                <div><span style={{ color: '#64748B' }}>身分證號：</span><strong>{p.id_card_no}</strong></div>
                <div><span style={{ color: '#64748B' }}>出生日期：</span>{p.birth_date}</div>
                <div><span style={{ color: '#64748B' }}>手機號碼：</span>{p.mobile}</div>
                <div><span style={{ color: '#64748B' }}>吸菸歷史：</span>{f?.smoking_history ? `有 (${f.smoking_start_age || ''}歲起)` : '無'}</div>
                <div><span style={{ color: '#64748B' }}>大腸癌家族史：</span>{f?.family_colorectal_cancer === 1 ? '⚠️ 有血親大腸癌' : '無'}</div>
                <div><span style={{ color: '#64748B' }}>腸道自覺症狀：</span>{f?.has_bowel_symptoms ? '⚠️ 有不適症狀' : '無症狀'}</div>
              </div>
            </div>

            {/* Section 1: 糞便潛血檢查結果 (醫事檢驗機構填寫) */}
            <div style={{ border: '1.5px solid #0284C7', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', background: '#F0F9FF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369A1', fontWeight: '800', fontSize: '1.05rem', marginBottom: '12px', borderBottom: '1px solid #BAE6FD', paddingBottom: '6px' }}>
                <Activity size={20} />
                <span>糞便潛血檢查結果（糞便潛血檢驗機構填寫）</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="question-label">1. 醫事檢驗機構/醫療院所名稱及代碼</label>
                  <input
                    type="text"
                    className="input-field"
                    value={labUnitName}
                    onChange={e => setLabUnitName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="question-label">2. 檢驗日期</label>
                  <input
                    type="date"
                    className="input-field"
                    value={labTestDate}
                    onChange={e => setLabTestDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="question-label">3. 檢驗結果</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      className={`btn ${testResult === 'NEGATIVE' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '8px' }}
                      onClick={() => setTestResult('NEGATIVE')}
                    >
                       陰性 (正常)
                    </button>
                    <button
                      type="button"
                      className={`btn ${testResult === 'POSITIVE' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '8px', background: testResult === 'POSITIVE' ? '#DC2626' : undefined }}
                      onClick={() => setTestResult('POSITIVE')}
                    >
                       陽性 (異常)
                    </button>
                    <button
                      type="button"
                      className={`btn ${testResult === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '8px' }}
                      onClick={() => setTestResult('PENDING')}
                    >
                      待檢驗
                    </button>
                  </div>
                </div>

                <div>
                  <label className="question-label">測定數值 (濃度 ng/mL 或 ug/g)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="例: 128 (通常 ≥100 為陽性)"
                    value={testValue}
                    onChange={e => setTestValue(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="question-label">4. 定量試劑商品名稱</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '4px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="reagentBrand"
                      checked={reagentBrand === 'Kyowa'}
                      onChange={() => setReagentBrand('Kyowa')}
                    />
                     Kyowa（HM-JACKarc）
                  </label>

                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="reagentBrand"
                      checked={reagentBrand === 'Eiken'}
                      onChange={() => setReagentBrand('Eiken')}
                    />
                     Eiken
                  </label>

                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="reagentBrand"
                      checked={reagentBrand === 'OTHER'}
                      onChange={() => setReagentBrand('OTHER')}
                    />
                     其他：
                  </label>

                  {reagentBrand === 'OTHER' && (
                    <input
                      type="text"
                      className="input-field"
                      style={{ width: '180px', padding: '4px 8px' }}
                      placeholder="試劑名稱"
                      value={reagentBrandOther}
                      onChange={e => setReagentBrandOther(e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: 個案確診結果 (陽性追蹤專區) */}
            <div style={{ border: '1.5px solid #F59E0B', borderRadius: '12px', padding: '1.25rem', background: '#FFFBEB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: '800', fontSize: '1.05rem', marginBottom: '12px', borderBottom: '1px solid #FDE68A', paddingBottom: '6px' }}>
                <ClipboardList size={20} />
                <span>個案確診結果（陽性追蹤 / 確診醫院填寫）</span>
                {testResult === 'POSITIVE' && (
                  <span className="badge badge-danger" style={{ marginLeft: 'auto' }}>
                    ⚠️ 陽性個案需於 3 個月內完成大腸鏡確診
                  </span>
                )}
              </div>

              {/* 1. 3個月內有無接受後續確診 */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="question-label">1. 前項檢查陽性個案於檢查後三個月內有沒有接受後續確診？</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    className={`btn ${hasFollowup3months === true ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setHasFollowup3months(true)}
                  >
                     有
                  </button>
                  <button
                    type="button"
                    className={`btn ${hasFollowup3months === false ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setHasFollowup3months(false)}
                  >
                     沒有
                  </button>
                  <button
                    type="button"
                    className={`btn ${hasFollowup3months === null ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setHasFollowup3months(null)}
                  >
                    未填 / 追蹤中
                  </button>
                </div>
              </div>

              {/* 沒有接受確診理由 */}
              {hasFollowup3months === false && (
                <div style={{ marginBottom: '1rem', background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FCD34D' }}>
                  <label className="question-label">2. 沒有接受確診理由為：</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {['無法聯繫', '出國', '搬家', '死亡', '拒做', '其他'].map((r, idx) => (
                      <label key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input
                          type="radio"
                          name="unconfirmedReason"
                          checked={unconfirmedReason === r}
                          onChange={() => setUnconfirmedReason(r)}
                        />
                        {``[idx]} {r}
                      </label>
                    ))}
                  </div>
                  {unconfirmedReason === '其他' && (
                    <input
                      type="text"
                      className="input-field"
                      style={{ marginTop: '6px' }}
                      placeholder="請說明其他未確診原因"
                      value={unconfirmedReasonOther}
                      onChange={e => setUnconfirmedReasonOther(e.target.value)}
                    />
                  )}
                </div>
              )}

              {/* 有確診詳細內容 */}
              {hasFollowup3months === true && (
                <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '8px', border: '1px solid #FCD34D' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label className="question-label">3. 確診醫療院所名稱及代碼</label>
                      <input
                        type="text"
                        className="input-field"
                        value={confirmHospital}
                        onChange={e => setConfirmHospital(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="question-label">確診日期</label>
                      <input
                        type="date"
                        className="input-field"
                        value={confirmDate}
                        onChange={e => setConfirmDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label className="question-label">4. 檢查方法</label>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="confirmMethod"
                          checked={confirmMethod === 'COLONOSCOPY'}
                          onChange={() => setConfirmMethod('COLONOSCOPY')}
                        />
                         大腸鏡
                      </label>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="confirmMethod"
                          checked={confirmMethod === 'OTHER'}
                          onChange={() => setConfirmMethod('OTHER')}
                        />
                         其他：
                      </label>
                      {confirmMethod === 'OTHER' && (
                        <input
                          type="text"
                          className="input-field"
                          style={{ width: '160px', padding: '4px 8px' }}
                          value={confirmMethodOther}
                          onChange={e => setConfirmMethodOther(e.target.value)}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="question-label">5. 診斷結果</label>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {[
                        { key: 'NORMAL', label: ' 正常' },
                        { key: 'HEMORRHOIDS', label: ' 痔瘡' },
                        { key: 'COLITIS', label: ' 潰瘍性大腸炎' },
                        { key: 'POLYP', label: ' 瘜肉' },
                        { key: 'COLORECTAL_CANCER', label: ' 大腸癌' },
                        { key: 'OTHER', label: ' 其他' }
                      ].map(d => (
                        <label key={d.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="diagnosis"
                            checked={diagnosis === d.key}
                            onChange={() => setDiagnosis(d.key as any)}
                          />
                          {d.label}
                        </label>
                      ))}
                    </div>

                    {diagnosis === 'OTHER' && (
                      <input
                        type="text"
                        className="input-field"
                        style={{ marginTop: '8px' }}
                        placeholder="請說明其他診斷"
                        value={diagnosisOther}
                        onChange={e => setDiagnosisOther(e.target.value)}
                      />
                    )}

                    {/* 瘜肉切除情形 */}
                    {diagnosis === 'POLYP' && (
                      <div style={{ marginTop: '10px', background: '#F8FAFC', padding: '10px', borderRadius: '6px', border: '1px dashed #CBD5E1' }}>
                        <label className="question-label" style={{ color: '#0F172A' }}>* 如有瘜肉，瘜肉有無切除：</label>
                        <div style={{ display: 'flex', gap: '14px', marginTop: '4px' }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="polypRemoval"
                              checked={polypRemovalStatus === 'NOT_REMOVED'}
                              onChange={() => setPolypRemovalStatus('NOT_REMOVED')}
                            />
                             未切除
                          </label>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="polypRemoval"
                              checked={polypRemovalStatus === 'COMPLETELY_REMOVED'}
                              onChange={() => setPolypRemovalStatus('COMPLETELY_REMOVED')}
                            />
                             已完全切除
                          </label>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="polypRemoval"
                              checked={polypRemovalStatus === 'INCOMPLETELY_REMOVED'}
                              onChange={() => setPolypRemovalStatus('INCOMPLETELY_REMOVED')}
                            />
                             未完全切除
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? '儲存中...' : '儲存檢驗報告與確診紀錄'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
