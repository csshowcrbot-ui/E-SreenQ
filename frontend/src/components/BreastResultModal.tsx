import React, { useState, useEffect } from 'react';
import type { Questionnaire } from '../types';
import { submitBreastResult } from '../services/api';
import {
  X,
  Heart,
  CheckCircle2,
  Info
} from 'lucide-react';

interface BreastResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionnaire: Questionnaire | null;
  onSuccess: (updated: Questionnaire) => void;
}

export const BreastResultModal: React.FC<BreastResultModalProps> = ({
  isOpen,
  onClose,
  questionnaire,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [machineType, setMachineType] = useState<'CR' | 'DR' | 'Tomo'>('DR');
  const [palpationResult, setPalpationResult] = useState('未觸摸到硬塊');
  const [palpationRemark, setPalpationRemark] = useState('');
  const [breastDensity, setBreastDensity] = useState<'a' | 'b' | 'c' | 'd'>('c');
  const [priorFilmComparison, setPriorFilmComparison] = useState('無舊片可比對');
  const [priorFilmDate, setPriorFilmDate] = useState('');
  const [biradsCategory, setBiradsCategory] = useState<'0' | '1' | '2' | '3' | '4' | '4A' | '4B' | '4C' | '5'>('1');
  const [assessmentFinding, setAssessmentFinding] = useState('兩側乳房乳腺實質對稱，無顯著腫塊、微小鈣化或結構扭曲');
  const [recommendation, setRecommendation] = useState('定期每2年接受一次乳房X光攝影檢查');
  const [referralNeeded, setReferralNeeded] = useState(false);
  const [radiologyPhysician, setRadiologyPhysician] = useState('王立德 醫師 (放射診斷專科 #4128)');
  const [radiologicTechnologist, setRadiologicTechnologist] = useState('張慈芬 醫事放射師 (#2091)');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  // Load existing data when modal opens
  useEffect(() => {
    if (questionnaire && questionnaire.breast?.result) {
      const res = questionnaire.breast.result;
      if (res.machine_type) setMachineType(res.machine_type);
      if (res.palpation_result) setPalpationResult(res.palpation_result);
      if (res.palpation_remark) setPalpationRemark(res.palpation_remark);
      if (res.breast_density) setBreastDensity(res.breast_density);
      if (res.prior_film_comparison) setPriorFilmComparison(res.prior_film_comparison);
      if (res.prior_film_date) setPriorFilmDate(res.prior_film_date);
      if (res.birads_category) setBiradsCategory(res.birads_category);
      if (res.assessment_finding) setAssessmentFinding(res.assessment_finding);
      if (res.recommendation) setRecommendation(res.recommendation);
      if (res.referral_needed !== undefined) setReferralNeeded(res.referral_needed);
      if (res.radiology_physician) setRadiologyPhysician(res.radiology_physician);
      if (res.radiologic_technologist) setRadiologicTechnologist(res.radiologic_technologist);
      if (res.report_date) setReportDate(res.report_date);
    } else {
      // Default reset
      setMachineType('DR');
      setPalpationResult('未觸摸到硬塊');
      setPalpationRemark('');
      setBreastDensity('c');
      setPriorFilmComparison('無舊片可比對');
      setPriorFilmDate('');
      setBiradsCategory('1');
      setAssessmentFinding('兩側乳房乳腺實質對稱，無顯著腫塊、微小鈣化或結構扭曲');
      setRecommendation('定期每2年接受一次乳房X光攝影檢查');
      setReferralNeeded(false);
      setRadiologyPhysician('王立德 醫師 (放射診斷專科 #4128)');
      setRadiologicTechnologist('張慈芬 醫事放射師 (#2091)');
      setReportDate(new Date().toISOString().split('T')[0]);
    }
  }, [questionnaire, isOpen]);

  // Auto-tune recommendations when BI-RADS changes
  const handleCategoryChange = (cat: '0' | '1' | '2' | '3' | '4' | '4A' | '4B' | '4C' | '5') => {
    setBiradsCategory(cat);
    if (cat === '0') {
      setAssessmentFinding('影像評估不完整，需進一步加做乳房超音波或放大局部攝影比對');
      setRecommendation('需加做其他影像檢查 (如乳房超音波) 或調閱前次舊片比對');
      setReferralNeeded(true);
    } else if (cat === '1') {
      setAssessmentFinding('兩側乳房影像正常，未發現病灶');
      setRecommendation('定期每2年接受一次乳房X光攝影檢查');
      setReferralNeeded(false);
    } else if (cat === '2') {
      setAssessmentFinding('良性乳房發現 (如良性鈣化點、退化性纖維腺瘤或穩定囊腫)');
      setRecommendation('定期每2年接受一次乳房X光攝影檢查');
      setReferralNeeded(false);
    } else if (cat === '3') {
      setAssessmentFinding('可能是良性病灶 (惡性機率小於2%)，建議短期追蹤');
      setRecommendation('建議6個月後回診追蹤單側或雙側乳房X光攝影');
      setReferralNeeded(true);
    } else if (cat === '4' || cat === '4A') {
      setAssessmentFinding('可疑異常 (4A: 低度懷疑惡性，機率 2%~10%)，建議組織切片');
      setRecommendation('請轉介至乳房外科門診進行粗針切片檢查 (Core Biopsy)');
      setReferralNeeded(true);
    } else if (cat === '4B') {
      setAssessmentFinding('可疑異常 (4B: 中度懷疑惡性，機率 10%~50%)，高度建議切片病理診斷');
      setRecommendation('請儘速轉介乳房外科專科安排組織穿刺切片或定位切除');
      setReferralNeeded(true);
    } else if (cat === '4C') {
      setAssessmentFinding('可疑異常 (4C: 高度懷疑惡性，機率 50%~95%)');
      setRecommendation('請即刻轉介乳房外科專科治療門診積極處理');
      setReferralNeeded(true);
    } else if (cat === '5') {
      setAssessmentFinding('高度懷疑為惡性腫瘤 (惡性機率大於95%)，具典型乳癌影像特徵');
      setRecommendation('應立即轉介乳房外科治療團隊安排切片並規劃後續確診治療');
      setReferralNeeded(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionnaire) return;

    try {
      setIsSubmitting(true);
      const updated = await submitBreastResult(questionnaire.questionnaire_id, {
        machine_type: machineType,
        palpation_result: palpationResult,
        palpation_remark: palpationRemark,
        breast_density: breastDensity,
        prior_film_comparison: priorFilmComparison,
        prior_film_date: priorFilmDate,
        birads_category: biradsCategory,
        assessment_finding: assessmentFinding,
        recommendation,
        referral_needed: referralNeeded,
        radiology_physician: radiologyPhysician,
        radiologic_technologist: radiologicTechnologist,
        report_date: reportDate
      });

      if (updated) {
        onSuccess(updated);
        onClose();
      } else {
        alert('判讀結果更新失敗');
      }
    } catch (err: any) {
      console.error('Breast result submit error:', err);
      alert('更新發生錯誤: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !questionnaire) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div
        className="modal-card"
        style={{
          width: '94%',
          maxWidth: '880px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #be123c 0%, #881337 100%)',
            color: '#fff',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
              <Heart size={14} />
              <span>國健署附表四之四 ‧ 放射科醫師報告登錄</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              婦女乳房 X 光攝影檢查 判讀結果登錄 (BI-RADS)
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              受檢婦女：{questionnaire.patient.name} ({questionnaire.patient.id_card_no}) ‧ 檢查日期：{questionnaire.screening_date}
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost-light"
            onClick={onClose}
            style={{ borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem 1.75rem', flex: 1 }}>
          {/* Quick preset banners */}
          <div style={{ background: '#fdf2f8', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #fbcfe8', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9d174d' }}>
              ⚡ 快速套用範本：
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#fff', color: '#059669', border: '1px solid #a7f3d0', fontSize: '0.8rem' }}
                onClick={() => handleCategoryChange('1')}
              >
                BI-RADS 1 (正常)
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#fff', color: '#0284c7', border: '1px solid #bae6fd', fontSize: '0.8rem' }}
                onClick={() => handleCategoryChange('2')}
              >
                BI-RADS 2 (良性發現)
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#fff', color: '#d97706', border: '1px solid #fde68a', fontSize: '0.8rem' }}
                onClick={() => handleCategoryChange('3')}
              >
                BI-RADS 3 (短期追蹤)
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#fff', color: '#e11d48', border: '1px solid #fecdd3', fontSize: '0.8rem' }}
                onClick={() => handleCategoryChange('4A')}
              >
                BI-RADS 4A (疑似病灶)
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#fff', color: '#881337', border: '1px solid #fda4af', fontSize: '0.8rem' }}
                onClick={() => handleCategoryChange('5')}
              >
                BI-RADS 5 (高度懷疑)
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Machine Type */}
            <div>
              <label className="form-label">攝影機型種類</label>
              <select
                className="form-select"
                value={machineType}
                onChange={e => setMachineType(e.target.value as any)}
              >
                <option value="DR">數位乳房攝影機 (DR, Digital Radiography)</option>
                <option value="CR">電腦放射攝影機 (CR, Computed Radiography)</option>
                <option value="Tomo">3D乳房斷層攝影 (Tomosynthesis)</option>
              </select>
            </div>

            {/* Breast Density */}
            <div>
              <label className="form-label">乳腺組成 (Breast Density, a~d)</label>
              <select
                className="form-select"
                value={breastDensity}
                onChange={e => setBreastDensity(e.target.value as any)}
              >
                <option value="a">a: 脂肪組織型 (&lt;25% 纖維腺體)</option>
                <option value="b">b: 散在性纖維腺體型 (25-50% 纖維腺體)</option>
                <option value="c">c: 不均勻緻密型 (51-75% 纖維腺體)</option>
                <option value="d">d: 極度緻密型 (&gt;75% 纖維腺體)</option>
              </select>
            </div>

            {/* Prior Film Comparison */}
            <div>
              <label className="form-label">舊片比對狀況</label>
              <select
                className="form-select"
                value={priorFilmComparison}
                onChange={e => setPriorFilmComparison(e.target.value)}
              >
                <option value="無舊片可比對">無舊片可比對 (初檢或未調閱到舊片)</option>
                <option value="與舊片比對無變化">與舊片比對無顯著變化 (Unchanged)</option>
                <option value="與舊片比對病灶有變化">與舊片比對病灶有變化 (Changed)</option>
                <option value="新出現病灶">新出現病灶 (Newly found)</option>
              </select>
            </div>

            {/* Palpation */}
            <div>
              <label className="form-label">乳房觸診結果 (門診/車上)</label>
              <select
                className="form-select"
                value={palpationResult}
                onChange={e => setPalpationResult(e.target.value)}
              >
                <option value="未觸摸到硬塊">未觸摸到硬塊 (無觸診異常)</option>
                <option value="觸摸到硬塊">觸摸到硬塊 (有觸摸異常)</option>
                <option value="未做觸診">未做觸診</option>
              </select>
            </div>
          </div>

          {/* BI-RADS Category Selection Box */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
              乳房 X 光攝影評級結果 (BI-RADS Category) <span style={{ color: '#e11d48' }}>*</span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
              {[
                { cat: '0', label: '0: 需加做評估', color: '#64748b' },
                { cat: '1', label: '1: 陰性/正常', color: '#059669' },
                { cat: '2', label: '2: 良性發現', color: '#0284c7' },
                { cat: '3', label: '3: 可能是良性', color: '#d97706' },
                { cat: '4A', label: '4A: 低度懷疑', color: '#f43f5e' },
                { cat: '4B', label: '4B: 中度懷疑', color: '#e11d48' },
                { cat: '4C', label: '4C: 高度懷疑', color: '#be123c' },
                { cat: '5', label: '5: 高度惡性', color: '#881337' }
              ].map(item => (
                <button
                  key={item.cat}
                  type="button"
                  onClick={() => handleCategoryChange(item.cat as any)}
                  style={{
                    padding: '0.6rem 0.5rem',
                    borderRadius: '8px',
                    border: biradsCategory === item.cat ? `2px solid ${item.color}` : '1px solid #cbd5e1',
                    background: biradsCategory === item.cat ? item.color : '#fff',
                    color: biradsCategory === item.cat ? '#fff' : '#1e293b',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  Category {item.cat}
                </button>
              ))}
            </div>

            {/* Category Note */}
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={16} />
              <span>
                {biradsCategory === '0' && 'Category 0: 評估不完全，需調閱舊片或加做超音波/放大攝影'}
                {biradsCategory === '1' && 'Category 1: 正常無病灶，建議2年後常規篩檢'}
                {biradsCategory === '2' && 'Category 2: 良性病灶，建議2年後常規篩檢'}
                {biradsCategory === '3' && 'Category 3: 可能是良性 (惡性率<=2%)，建議6個月短期追蹤'}
                {biradsCategory === '4A' && 'Category 4A: 低度懷疑惡性 (2%~10%)，建議組織切片'}
                {biradsCategory === '4B' && 'Category 4B: 中度懷疑惡性 (10%~50%)，建議組織切片'}
                {biradsCategory === '4C' && 'Category 4C: 高度懷疑惡性 (50%~95%)，建議組織切片'}
                {biradsCategory === '5' && 'Category 5: 高度懷疑為乳癌 (>=95%)，應立即採取切片或治療措施'}
              </span>
            </div>
          </div>

          {/* Assessment & Recommendation Text */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">影像發現與特徵說明 (Assessment Findings)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={assessmentFinding}
              onChange={e => setAssessmentFinding(e.target.value)}
              placeholder="描述腫塊、鈣化形態、微小鈣化群、不對稱密度或結構扭曲等"
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">臨床處置與追蹤建議 (Recommendations)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={recommendation}
              onChange={e => setRecommendation(e.target.value)}
              placeholder="例：建議定期每2年接受一次乳房X光攝影檢查 / 請轉介專科門診"
            />
          </div>

          {/* Referral Needed Checkbox */}
          <div style={{ background: referralNeeded ? '#fff1f2' : '#f8fafc', padding: '1rem', borderRadius: '8px', border: referralNeeded ? '1px solid #fecdd3' : '1px solid #cbd5e1', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, color: referralNeeded ? '#be123c' : '#334155' }}>
                是否列入陽性/需專科轉介個管追蹤名單？
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                BI-RADS 0、3、4、5 均建議標記為專科轉介個案
              </div>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={referralNeeded}
                onChange={e => setReferralNeeded(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              列入轉介追蹤
            </label>
          </div>

          {/* Signatures & Staff */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <div>
              <label className="form-label">判讀放射科專科醫師</label>
              <input
                type="text"
                className="form-input"
                value={radiologyPhysician}
                onChange={e => setRadiologyPhysician(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">執行醫事放射師</label>
              <input
                type="text"
                className="form-input"
                value={radiologicTechnologist}
                onChange={e => setRadiologicTechnologist(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">報告完成日期</label>
              <input
                type="date"
                className="form-input"
                value={reportDate}
                onChange={e => setReportDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#be123c',
                borderColor: '#be123c',
                padding: '0.65rem 1.75rem'
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px' }} />
                  儲存中...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  儲存判讀結果
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
