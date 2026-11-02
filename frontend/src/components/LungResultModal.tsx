import React, { useState, useEffect } from 'react';
import type { Questionnaire } from '../types';
import { submitLungResult } from '../services/api';
import {
  X,
  Stethoscope,
  Activity,
  Sparkles
} from 'lucide-react';

interface LungResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionnaire: Questionnaire | null;
  onSuccess: (updated: Questionnaire) => void;
}

export const LungResultModal: React.FC<LungResultModalProps> = ({
  isOpen,
  onClose,
  questionnaire,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 攝影與判讀醫師基本資料
  const [imagingHospitalName, setImagingHospitalName] = useState('竹山秀傳醫療社團法人竹山秀傳醫院');
  const [ctMachineRegisterNo, setCtMachineRegisterNo] = useState('衛部醫器製字第004128號 (GE Revolution 128切)');
  const [scanDate, setScanDate] = useState(new Date().toISOString().split('T')[0]);
  const [radiologicTechnologist, setRadiologicTechnologist] = useState('王銘憲 (放射師 RT0298)');
  const [interpretationDate, setInterpretationDate] = useState(new Date().toISOString().split('T')[0]);
  const [interpretationDoctor, setInterpretationDoctor] = useState('林博仁 醫師 (胸腔專科 R0388)');

  // 品質與劑量
  const [ldctQuality, setLdctQuality] = useState<'Good' | 'Acceptable' | 'Not Acceptable'>('Good');
  const [ctdivolMgy, setCtdivolMgy] = useState<number | null>(2.1);
  const [totalDlpMgyCm, setTotalDlpMgyCm] = useState<number | null>(75.6);
  const [priorCtComparison, setPriorCtComparison] = useState<'NO_PRIOR' | 'HAS_PRIOR'>('NO_PRIOR');
  const [priorCtDate, setPriorCtDate] = useState('');

  // 結節基本分類 (Lung nodule findings related to cancer screening)
  const [hasNoLungNodule, setHasNoLungNodule] = useState(true);
  const [hasBenignFeatures, setHasBenignFeatures] = useState(false);
  const [lungNodulesUnder6mm, setLungNodulesUnder6mm] = useState(false);
  const [under6mmSe, setUnder6mmSe] = useState('');
  const [under6mmIm, setUnder6mmIm] = useState('');
  const [juxtapleuralNodule, setJuxtapleuralNodule] = useState(false);
  const [lungNodulesOver6mm, setLungNodulesOver6mm] = useState(false);
  const [over6mmTotalNumber, setOver6mmTotalNumber] = useState<'1' | '2' | '3' | '>=4'>('1');

  // 最懷疑之肺結節 (最多3個)
  const [nodule1, setNodule1] = useState({
    active: false,
    entire_size_mm: 7.0,
    density: 'solid' as 'non-solid' | 'part-solid' | 'solid',
    solid_part_size_mm: null as number | null,
    lobe: 'RUL' as 'RUL' | 'RML' | 'RLL' | 'LUL' | 'LLL',
    se: '2',
    im: '45',
    comparison: 'no_prior' as 'unchanged' | 'enlarging' | 'newly_found' | 'no_prior'
  });

  const [nodule2, setNodule2] = useState({
    active: false,
    entire_size_mm: 5.0,
    density: 'non-solid' as 'non-solid' | 'part-solid' | 'solid',
    solid_part_size_mm: null as number | null,
    lobe: 'LUL' as 'RUL' | 'RML' | 'RLL' | 'LUL' | 'LLL',
    se: '2',
    im: '60',
    comparison: 'no_prior' as 'unchanged' | 'enlarging' | 'newly_found' | 'no_prior'
  });

  // 其他肺葉細節
  const [airwayNodulePresent, setAirwayNodulePresent] = useState(false);
  const [airwaySubsegmental, setAirwaySubsegmental] = useState(false);
  const [airwaySegmentalProximal, setAirwaySegmentalProximal] = useState(false);
  const [atypicalCystPresent, setAtypicalCystPresent] = useState(false);
  const [higherMetastasesProb, setHigherMetastasesProb] = useState(false);

  // Other Lung Findings
  const [emphysema, setEmphysema] = useState(false);
  const [bronchiectasis, setBronchiectasis] = useState(false);
  const [treeInBud, setTreeInBud] = useState(false);
  const [oldTb, setOldTb] = useState(false);
  const [ild, setIld] = useState(false);
  const [otherLungText, setOtherLungText] = useState('');

  // Other Findings
  const [enlargedLymphNodes, setEnlargedLymphNodes] = useState(false);
  const [lymphNodesLocation, setLymphNodesLocation] = useState('');
  const [coronaryCalcification, setCoronaryCalcification] = useState(false);
  const [otherChestFindings, setOtherChestFindings] = useState('');

  // Overall recommendation (Lung-RADS v2022)
  const [lungRadsCategory, setLungRadsCategory] = useState<'0' | '1' | '2' | '3' | '4A' | '4B' | '4X'>('1');
  const [cat0Reason, setCat0Reason] = useState<'prior_ct_located' | 'cannot_be_evaluated' | 'inflammatory_infectious'>('cannot_be_evaluated');
  const [modifierS, setModifierS] = useState(false);
  const [referralNeeded, setReferralNeeded] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');

  // Load existing data if questionnaire has result
  useEffect(() => {
    if (questionnaire?.lung?.result) {
      const r = questionnaire.lung.result;
      setImagingHospitalName(r.imaging_hospital_name || '竹山秀傳醫療社團法人竹山秀傳醫院');
      setCtMachineRegisterNo(r.ct_machine_register_no || '');
      setScanDate(r.scan_date || new Date().toISOString().split('T')[0]);
      setRadiologicTechnologist(r.radiologic_technologist || '');
      setInterpretationDate(r.interpretation_date || new Date().toISOString().split('T')[0]);
      setInterpretationDoctor(r.interpretation_doctor || '');
      setLdctQuality(r.ldct_quality || 'Good');
      setCtdivolMgy(r.ctdivol_mgy ?? 2.1);
      setTotalDlpMgyCm(r.total_dlp_mgy_cm ?? 75.6);
      setPriorCtComparison(r.prior_ct_comparison || 'NO_PRIOR');
      setPriorCtDate(r.prior_ct_date || '');

      setHasNoLungNodule(!!r.has_no_lung_nodule);
      setHasBenignFeatures(!!r.has_benign_features);
      setLungNodulesUnder6mm(!!r.lung_nodules_under_6mm);
      setUnder6mmSe(r.under_6mm_se || '');
      setUnder6mmIm(r.under_6mm_im || '');
      setJuxtapleuralNodule(!!r.juxtapleural_nodule);
      setLungNodulesOver6mm(!!r.lung_nodules_over_6mm);
      setOver6mmTotalNumber(r.over_6mm_total_number || '1');

      if (r.nodule_1) {
        setNodule1({
          active: true,
          entire_size_mm: r.nodule_1.entire_size_mm || 0,
          density: r.nodule_1.density || 'solid',
          solid_part_size_mm: r.nodule_1.solid_part_size_mm ?? null,
          lobe: r.nodule_1.lobe || 'RUL',
          se: r.nodule_1.se || '',
          im: r.nodule_1.im || '',
          comparison: r.nodule_1.comparison || 'no_prior'
        });
      }

      if (r.nodule_2) {
        setNodule2({
          active: true,
          entire_size_mm: r.nodule_2.entire_size_mm || 0,
          density: r.nodule_2.density || 'non-solid',
          solid_part_size_mm: r.nodule_2.solid_part_size_mm ?? null,
          lobe: r.nodule_2.lobe || 'LUL',
          se: r.nodule_2.se || '',
          im: r.nodule_2.im || '',
          comparison: r.nodule_2.comparison || 'no_prior'
        });
      }

      setAirwayNodulePresent(!!r.airway_nodule?.present);
      setAirwaySubsegmental(!!r.airway_nodule?.subsegmental);
      setAirwaySegmentalProximal(!!r.airway_nodule?.segmental_proximal);
      setAtypicalCystPresent(!!r.atypical_pulmonary_cyst?.present);
      setHigherMetastasesProb(!!r.higher_probability_of_metastases);

      setEmphysema(!!r.other_lung_findings?.emphysema);
      setBronchiectasis(!!r.other_lung_findings?.bronchiectasis);
      setTreeInBud(!!r.other_lung_findings?.tree_in_bud);
      setOldTb(!!r.other_lung_findings?.old_tb);
      setIld(!!r.other_lung_findings?.ild);
      setOtherLungText(r.other_lung_findings?.other_text || '');

      setEnlargedLymphNodes(!!r.other_findings?.enlarged_lymph_nodes);
      setLymphNodesLocation(r.other_findings?.enlarged_lymph_nodes_location || '');
      setCoronaryCalcification(!!r.other_findings?.coronary_artery_calcification);
      setOtherChestFindings(r.other_findings?.other_chest_findings_text || '');

      setLungRadsCategory(r.lung_rads_category || '1');
      setCat0Reason(r.cat_0_reason || 'cannot_be_evaluated');
      setModifierS(!!r.modifier_s);
      setReferralNeeded(!!r.referral_needed);
      setDoctorNotes(r.notes || '');
    }
  }, [questionnaire]);

  if (!isOpen || !questionnaire) return null;

  // Quick Preset: 正常無結節 (Category 1)
  const applyPresetNormal = () => {
    setHasNoLungNodule(true);
    setHasBenignFeatures(false);
    setLungNodulesUnder6mm(false);
    setJuxtapleuralNodule(false);
    setLungNodulesOver6mm(false);
    setNodule1(prev => ({ ...prev, active: false }));
    setNodule2(prev => ({ ...prev, active: false }));
    setLungRadsCategory('1');
    setModifierS(false);
    setReferralNeeded(false);
    setDoctorNotes('雙側肺野透光度良好，無活動性病灶或顯著肺結節 (No lung nodule)。Lung-RADS Category 1，建議 2 年後定期接受低劑量電腦斷層篩檢。');
  };

  // Quick Preset: 陽性需轉介結節 (Category 4A, 右肺上葉 7.2mm 部份實質結節)
  const applyPresetSuspicious = () => {
    setHasNoLungNodule(false);
    setHasBenignFeatures(false);
    setLungNodulesUnder6mm(false);
    setJuxtapleuralNodule(false);
    setLungNodulesOver6mm(true);
    setOver6mmTotalNumber('1');
    setNodule1({
      active: true,
      entire_size_mm: 7.2,
      density: 'part-solid',
      solid_part_size_mm: 3.5,
      lobe: 'RUL',
      se: '2',
      im: '48',
      comparison: 'no_prior'
    });
    setCoronaryCalcification(true);
    setLungRadsCategory('4A');
    setModifierS(true);
    setReferralNeeded(true);
    setDoctorNotes('右肺上葉 (RUL, SE:2, IM:48) 可見一 7.2 mm 部份實質結節 (solid component 3.5 mm)，屬 Lung-RADS 4A (Suspicious)。另可見冠狀動脈鈣化 (Modifier S)。建議 3 個月後以 LDCT 複查或轉介胸腔專科門診評估確診。');
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        imaging_hospital_name: imagingHospitalName,
        ct_machine_register_no: ctMachineRegisterNo,
        scan_date: scanDate,
        radiologic_technologist: radiologicTechnologist,
        interpretation_date: interpretationDate,
        interpretation_doctor: interpretationDoctor,
        ldct_quality: ldctQuality,
        ctdivol_mgy: ctdivolMgy,
        total_dlp_mgy_cm: totalDlpMgyCm,
        prior_ct_comparison: priorCtComparison,
        prior_ct_date: priorCtComparison === 'HAS_PRIOR' ? priorCtDate : undefined,
        has_no_lung_nodule: hasNoLungNodule,
        has_benign_features: hasBenignFeatures,
        lung_nodules_under_6mm: lungNodulesUnder6mm,
        under_6mm_se: lungNodulesUnder6mm ? under6mmSe : undefined,
        under_6mm_im: lungNodulesUnder6mm ? under6mmIm : undefined,
        juxtapleural_nodule: juxtapleuralNodule,
        lung_nodules_over_6mm: lungNodulesOver6mm,
        over_6mm_total_number: lungNodulesOver6mm ? over6mmTotalNumber : undefined,
        nodule_1: nodule1.active
          ? {
              entire_size_mm: nodule1.entire_size_mm,
              density: nodule1.density,
              solid_part_size_mm: nodule1.density === 'part-solid' ? nodule1.solid_part_size_mm : null,
              lobe: nodule1.lobe,
              se: nodule1.se,
              im: nodule1.im,
              comparison: nodule1.comparison
            }
          : undefined,
        nodule_2: nodule2.active
          ? {
              entire_size_mm: nodule2.entire_size_mm,
              density: nodule2.density,
              solid_part_size_mm: nodule2.density === 'part-solid' ? nodule2.solid_part_size_mm : null,
              lobe: nodule2.lobe,
              se: nodule2.se,
              im: nodule2.im,
              comparison: nodule2.comparison
            }
          : undefined,
        airway_nodule: airwayNodulePresent
          ? {
              present: true,
              subsegmental: airwaySubsegmental,
              segmental_proximal: airwaySegmentalProximal
            }
          : { present: false },
        atypical_pulmonary_cyst: { present: atypicalCystPresent },
        higher_probability_of_metastases: higherMetastasesProb,
        other_lung_findings: {
          emphysema,
          bronchiectasis,
          tree_in_bud: treeInBud,
          old_tb: oldTb,
          ild,
          other: !!otherLungText,
          other_text: otherLungText
        },
        other_findings: {
          enlarged_lymph_nodes: enlargedLymphNodes,
          enlarged_lymph_nodes_location: enlargedLymphNodes ? lymphNodesLocation : undefined,
          coronary_artery_calcification: coronaryCalcification,
          other_chest_findings: !!otherChestFindings,
          other_chest_findings_text: otherChestFindings
        },
        lung_rads_category: lungRadsCategory,
        cat_0_reason: lungRadsCategory === '0' ? cat0Reason : undefined,
        modifier_s: modifierS,
        referral_needed: referralNeeded,
        notes: doctorNotes
      };

      const updated = await submitLungResult(questionnaire.questionnaire_id, payload);
      alert('已成功登錄胸部低劑量電腦斷層檢查 (LDCT) 判讀結果！');
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      alert('儲存失敗：' + (err.message || '伺服器異常'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ overflowY: 'auto', padding: '2rem 1rem' }}>
      <div className="modal-dialog" style={{ maxWidth: '900px', maxHeight: 'none', background: '#fff' }}>
        {/* Header */}
        <div className="modal-header" style={{ background: '#0284c7', color: '#fff', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: '1.25rem 1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Stethoscope size={22} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                胸部低劑量電腦斷層 (LDCT) 檢查結果判讀登錄【附件一之四】
              </h2>
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem' }}>
              受檢者：{questionnaire.patient.name} ({questionnaire.patient.gender === 'M' ? '男' : '女'}，
              病歷號: {questionnaire.patient.chart_no || '未填'}，身分證: {questionnaire.patient.id_card_no})
            </div>
          </div>
          <button type="button" className="btn-close" style={{ color: '#fff' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-body" style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f9ff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #bae6fd', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0369a1' }}>
              常用判讀快速套版：
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ background: '#fff', borderColor: '#0284c7', color: '#0284c7' }}
                onClick={applyPresetNormal}
              >
                <Sparkles size={14} style={{ marginRight: '4px' }} />
                常規陰性正常 (Cat 1)
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ background: '#fff', borderColor: '#e11d48', color: '#e11d48' }}
                onClick={applyPresetSuspicious}
              >
                <Sparkles size={14} style={{ marginRight: '4px' }} />
                可疑實質結節需追蹤 (Cat 4A)
              </button>
            </div>
          </div>

          {/* Section 1: 攝影醫院、設備與人員 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
              1. 攝影醫院與掃描設備資訊
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>醫院名稱</label>
                <input
                  type="text"
                  className="form-control"
                  value={imagingHospitalName}
                  onChange={e => setImagingHospitalName(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>CT 儀登設字號/型號</label>
                <input
                  type="text"
                  className="form-control"
                  value={ctMachineRegisterNo}
                  onChange={e => setCtMachineRegisterNo(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>攝影日期</label>
                <input
                  type="date"
                  className="form-control"
                  value={scanDate}
                  onChange={e => setScanDate(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>醫事放射師</label>
                <input
                  type="text"
                  className="form-control"
                  value={radiologicTechnologist}
                  onChange={e => setRadiologicTechnologist(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>判讀日期</label>
                <input
                  type="date"
                  className="form-control"
                  value={interpretationDate}
                  onChange={e => setInterpretationDate(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>判讀專科醫師</label>
                <input
                  type="text"
                  className="form-control"
                  value={interpretationDoctor}
                  onChange={e => setInterpretationDoctor(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: 影像品質與輻射劑量 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem', background: '#fafafa' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
              2. 判讀結果：品質與劑量參數 (LDCT Quality & Dose Report)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>LDCT Quality</label>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  {(['Good', 'Acceptable', 'Not Acceptable'] as const).map(q => (
                    <label key={q} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="ldct_quality"
                        checked={ldctQuality === q}
                        onChange={() => setLdctQuality(q)}
                      />
                      {q}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  CTDIvol (mGy) <span style={{ color: '#059669', fontSize: '0.75rem' }}>(規範 ≤ 3 mGy)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={ctdivolMgy ?? ''}
                  onChange={e => setCtdivolMgy(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Total DLP (mGy*cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={totalDlpMgyCm ?? ''}
                  onChange={e => setTotalDlpMgyCm(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>前次 CT 影像比對</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="prior_ct"
                      checked={priorCtComparison === 'NO_PRIOR'}
                      onChange={() => setPriorCtComparison('NO_PRIOR')}
                    />
                    No prior CT
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="prior_ct"
                      checked={priorCtComparison === 'HAS_PRIOR'}
                      onChange={() => setPriorCtComparison('HAS_PRIOR')}
                    />
                    有前次 CT (Date)
                  </label>
                </div>
                {priorCtComparison === 'HAS_PRIOR' && (
                  <input
                    type="date"
                    className="form-control"
                    style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}
                    value={priorCtDate}
                    onChange={e => setPriorCtDate(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Lung nodule findings (Lung-RADS v2022) */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
              3. 肺結節特徵描述 (Lung Nodule Findings related to cancer screening - Lung-RADS v2022)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasNoLungNodule}
                  onChange={e => {
                    setHasNoLungNodule(e.target.checked);
                    if (e.target.checked) {
                      setLungNodulesOver6mm(false);
                      setNodule1(prev => ({ ...prev, active: false }));
                    }
                  }}
                />
                <span style={{ fontWeight: 600 }}>No lung nodule (無顯著肺結節)</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasBenignFeatures}
                  onChange={e => setHasBenignFeatures(e.target.checked)}
                />
                <span>Nodule with benign features (具確定良性特徵之結節，如完全鈣化、含脂肪錯構瘤等)</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={lungNodulesUnder6mm}
                    onChange={e => setLungNodulesUnder6mm(e.target.checked)}
                  />
                  <span>Lung nodule(s) (&lt; 6mm)</span>
                </label>
                {lungNodulesUnder6mm && (
                  <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span>(選填 SE:</span>
                    <input
                      type="text"
                      style={{ width: '50px', padding: '0.2rem' }}
                      value={under6mmSe}
                      onChange={e => setUnder6mmSe(e.target.value)}
                    />
                    <span>IM:</span>
                    <input
                      type="text"
                      style={{ width: '80px', padding: '0.2rem' }}
                      value={under6mmIm}
                      onChange={e => setUnder6mmIm(e.target.value)}
                    />
                    <span>)</span>
                  </div>
                )}
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={juxtapleuralNodule}
                  onChange={e => setJuxtapleuralNodule(e.target.checked)}
                />
                <span>Juxtapleural nodule (肋膜旁結節)</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, color: '#dc2626' }}>
                  <input
                    type="checkbox"
                    checked={lungNodulesOver6mm}
                    onChange={e => {
                      setLungNodulesOver6mm(e.target.checked);
                      if (e.target.checked) {
                        setHasNoLungNodule(false);
                        setNodule1(prev => ({ ...prev, active: true }));
                      }
                    }}
                  />
                  <span>Lung nodule(s) (≥ 6mm or enlarging &gt; 1.5mm or new ≥ 4mm)</span>
                </label>
                {lungNodulesOver6mm && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <span>Total number:</span>
                    {(['1', '2', '3', '>=4'] as const).map(num => (
                      <label key={num} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="over6mm_count"
                          checked={over6mmTotalNumber === num}
                          onChange={() => setOver6mmTotalNumber(num)}
                        />
                        {num}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 最懷疑之肺結節描述 (Nodule 1) */}
            {lungNodulesOver6mm && (
              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, color: '#be123c', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  最懷疑之肺結節 1 (Describe the most suspicious nodule 1)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Entire Nodule (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={nodule1.entire_size_mm || ''}
                      onChange={e => setNodule1(prev => ({ ...prev, entire_size_mm: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Density (結節質地)</label>
                    <select
                      className="form-control"
                      value={nodule1.density}
                      onChange={e => setNodule1(prev => ({ ...prev, density: e.target.value as any }))}
                    >
                      <option value="solid">Solid (完全實質)</option>
                      <option value="part-solid">Part-solid (部份實質)</option>
                      <option value="non-solid">Non-solid / Ground Glass (毛玻璃狀)</option>
                    </select>
                  </div>

                  {nodule1.density === 'part-solid' && (
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Solid Part (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder="實質成分大小"
                        value={nodule1.solid_part_size_mm ?? ''}
                        onChange={e => setNodule1(prev => ({ ...prev, solid_part_size_mm: parseFloat(e.target.value) || null }))}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Lobe (肺葉)</label>
                    <select
                      className="form-control"
                      value={nodule1.lobe}
                      onChange={e => setNodule1(prev => ({ ...prev, lobe: e.target.value as any }))}
                    >
                      <option value="RUL">RUL (右肺上葉)</option>
                      <option value="RML">RML (右肺中葉)</option>
                      <option value="RLL">RLL (右肺下葉)</option>
                      <option value="LUL">LUL (左肺上葉)</option>
                      <option value="LLL">LLL (左肺下葉)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>SE & IM</label>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <input
                        type="text"
                        placeholder="SE"
                        style={{ width: '45%' }}
                        className="form-control"
                        value={nodule1.se}
                        onChange={e => setNodule1(prev => ({ ...prev, se: e.target.value }))}
                      />
                      <input
                        type="text"
                        placeholder="IM"
                        style={{ width: '55%' }}
                        className="form-control"
                        value={nodule1.im}
                        onChange={e => setNodule1(prev => ({ ...prev, im: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>比對狀態 (Comparison)</label>
                    <select
                      className="form-control"
                      value={nodule1.comparison}
                      onChange={e => setNodule1(prev => ({ ...prev, comparison: e.target.value as any }))}
                    >
                      <option value="no_prior">No prior CT comparison</option>
                      <option value="unchanged">Unchanged (大小穩定)</option>
                      <option value="enlarging">Enlarging (&gt;1.5 mm)</option>
                      <option value="newly_found">Newly found (≥4 mm)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Other Lung & Chest Findings */}
            <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Other Lung & Chest Findings (其他胸部/肺部發現 - 選填)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', fontSize: '0.85rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={emphysema}
                    onChange={e => setEmphysema(e.target.checked)}
                  />
                  <span>Emphysema (肺氣腫)</span>
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={coronaryCalcification}
                    onChange={e => {
                      setCoronaryCalcification(e.target.checked);
                      if (e.target.checked) setModifierS(true);
                    }}
                  />
                  <span>Coronary artery calcification</span>
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={enlargedLymphNodes}
                    onChange={e => setEnlargedLymphNodes(e.target.checked)}
                  />
                  <span>Enlarged lymph nodes</span>
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={oldTb}
                    onChange={e => setOldTb(e.target.checked)}
                  />
                  <span>Old pulmonary TB</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Overall Recommendation (Lung-RADS v2022 分級與處置) */}
          <div style={{ border: '2px solid #0284c7', borderRadius: '8px', padding: '1.25rem', background: '#f0f9ff' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0369a1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} />
              4. 總體分級與處置建議 (Lung-RADS v2022 Overall Recommendation)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
              {[
                { cat: '0', title: 'Category 0: Incomplete', desc: '需調閱前片比對 / 呼吸假影未完成' },
                { cat: '1', title: 'Category 1: Negative', desc: '陰性，無肺結節或確定良性，2年後定期LDCT' },
                { cat: '2', title: 'Category 2: Benign', desc: '良性外觀或極低風險，12個月後定期LDCT' },
                { cat: '3', title: 'Category 3: Probably Benign', desc: '可能良性結節，建議 6 個月後 LDCT 追蹤' },
                { cat: '4A', title: 'Category 4A: Suspicious', desc: '可疑惡性結節，建議 3 個月後 LDCT 複查或胸腔科' },
                { cat: '4B', title: 'Category 4B: Very Suspicious', desc: '高度可疑惡性，建議胸腔科安排切片或手術' },
                { cat: '4X', title: 'Category 4X: High Risk Additional Findings', desc: 'Cat 3/4 結節合併淋巴腫大或毛刺狀高風險特徵' }
              ].map(item => (
                <label
                  key={item.cat}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    background: lungRadsCategory === item.cat ? '#e0f2fe' : '#ffffff',
                    border: lungRadsCategory === item.cat ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="lung_rads_cat"
                    style={{ marginTop: '3px' }}
                    checked={lungRadsCategory === item.cat}
                    onChange={() => {
                      setLungRadsCategory(item.cat as any);
                      if (['4A', '4B', '4X'].includes(item.cat)) {
                        setReferralNeeded(true);
                      } else {
                        setReferralNeeded(false);
                      }
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: ['4A', '4B', '4X'].includes(item.cat) ? '#dc2626' : '#0f172a' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', background: '#fff', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '1rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={modifierS}
                  onChange={e => setModifierS(e.target.checked)}
                />
                <span>Modifier S: 具有臨床意義或潛在臨床意義之肺癌無關發現 (如顯著心血管鈣化等)</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, color: '#dc2626' }}>
                <input
                  type="checkbox"
                  checked={referralNeeded}
                  onChange={e => setReferralNeeded(e.target.checked)}
                />
                <span>需轉介 / 請至門診就診 (Referral Needed)</span>
              </label>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                醫師總結與臨床處置建議 (Clinical Recommendation Notes)
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="請輸入醫師總體判讀備註或回診/轉介指引..."
                value={doctorNotes}
                onChange={e => setDoctorNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            取消
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#0284c7', borderColor: '#0284c7' }}
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? '正在儲存入檔...' : '確認登錄並保存判讀結果'}
          </button>
        </div>
      </div>
    </div>
  );
};
