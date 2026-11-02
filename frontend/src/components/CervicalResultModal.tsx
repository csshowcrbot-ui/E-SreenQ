import React, { useState, useEffect } from 'react';
import type { Questionnaire, CervicalScreening } from '../types';
import { submitCervicalResult } from '../services/api';
import {
  FileText,
  X,
  ClipboardList,
  AlertTriangle,
  Stethoscope
} from 'lucide-react';

interface CervicalResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionnaire: Questionnaire | null;
  onSuccess: (updated: Questionnaire) => void;
}

export const CervicalResultModal: React.FC<CervicalResultModalProps> = ({
  isOpen,
  onClose,
  questionnaire,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 三之二、抹片資料 (病理機構填寫)
  const [pathologyNo, setPathologyNo] = useState('');
  const [labUnitName, setLabUnitName] = useState('竹山秀傳醫療社團法人竹山秀傳醫院 病理檢驗科 (0938040012)');
  const [labUnitCode, setLabUnitCode] = useState('0938040012');
  const [receivedDate, setReceivedDate] = useState('');
  const [specimenType, setSpecimenType] = useState<'CONVENTIONAL' | 'LBC'>('CONVENTIONAL');

  // 四、抹片判讀結果 (病理機構填寫)
  const [readingMethod, setReadingMethod] = useState<'MANUAL' | 'AUTO' | 'MANUAL_AUTO'>('MANUAL');
  const [smearQuality, setSmearQuality] = useState<'GOOD' | 'SATISFACTORY' | 'UNSATISFACTORY'>('GOOD');
  const [qualityReasons, setQualityReasons] = useState<string[]>([]);
  const [qualityReasonOther, setQualityReasonOther] = useState('');

  // 感染病原體
  const [infections, setInfections] = useState<string[]>([]);
  const [infectionOther, setInfectionOther] = useState('');

  // 抹片細胞學診斷 Bethesda (1~18)
  const [cytologyDiagnosis, setCytologyDiagnosis] = useState<string>('1');
  const [endometrialCellsOver40, setEndometrialCellsOver40] = useState<boolean>(false);

  // 處置建議
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [recommendationOther, setRecommendationOther] = useState('');

  // 簽章與日期
  const [cytotechnologistName, setCytotechnologistName] = useState('李雅婷 (醫檢師 CT0418)');
  const [cytotechnologistCode, setCytotechnologistCode] = useState('CT0418');
  const [cytopathologistName, setCytopathologistName] = useState('陳建宏 (病理專科醫師 P1088)');
  const [cytopathologistCode, setCytopathologistCode] = useState('P1088');
  const [confirmedDate, setConfirmedDate] = useState('');

  useEffect(() => {
    if (questionnaire?.cervical) {
      const c = questionnaire.cervical;
      setPathologyNo(c.pathology_no || `CY-${new Date().getFullYear()}-${String(questionnaire.questionnaire_id).padStart(5, '0')}`);
      setLabUnitName(c.lab_unit_name || '竹山秀傳醫療社團法人竹山秀傳醫院 病理檢驗科 (0938040012)');
      setLabUnitCode(c.lab_unit_code || '0938040012');
      setReceivedDate(c.received_date || new Date().toISOString().split('T')[0]);
      setSpecimenType(c.specimen_type || 'CONVENTIONAL');

      setReadingMethod(c.reading_method || 'MANUAL');
      setSmearQuality(c.smear_quality || 'GOOD');
      setQualityReasons(c.quality_reasons || []);
      setQualityReasonOther(c.quality_reason_other || '');

      setInfections(c.infections || []);
      setInfectionOther(c.infection_other || '');

      setCytologyDiagnosis(c.cytology_diagnosis || '1');
      setEndometrialCellsOver40(!!c.endometrial_cells_over_40);

      setRecommendations(c.recommendations || []);
      setRecommendationOther(c.recommendation_other || '');

      setCytotechnologistName(c.cytotechnologist_name || '李雅婷 (醫檢師 CT0418)');
      setCytotechnologistCode(c.cytotechnologist_code || 'CT0418');
      setCytopathologistName(c.cytopathologist_name || '陳建宏 (病理專科醫師 P1088)');
      setCytopathologistCode(c.cytopathologist_code || 'P1088');
      setConfirmedDate(c.confirmed_date || new Date().toISOString().split('T')[0]);
    }
  }, [questionnaire]);

  if (!isOpen || !questionnaire) return null;

  const toggleArrayItem = (arr: string[], item: string, setter: (val: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter(i => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const handleQualityChange = (q: 'GOOD' | 'SATISFACTORY' | 'UNSATISFACTORY') => {
    setSmearQuality(q);
    if (q === 'UNSATISFACTORY' && !recommendations.includes('REDO_DIFFICULT')) {
      // Auto recommend redo for unsatisfactory smear
      setRecommendations(prev => [...prev, 'REDO_DIFFICULT']);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload: Partial<CervicalScreening> = {
        pathology_no: pathologyNo,
        lab_unit_name: labUnitName,
        lab_unit_code: labUnitCode,
        received_date: receivedDate,
        specimen_type: specimenType,

        reading_method: readingMethod,
        smear_quality: smearQuality,
        quality_reasons: qualityReasons,
        quality_reason_other: qualityReasonOther,

        infections: infections,
        infection_other: infectionOther,

        cytology_diagnosis: cytologyDiagnosis,
        endometrial_cells_over_40: endometrialCellsOver40,

        recommendations: recommendations,
        recommendation_other: recommendationOther,

        cytotechnologist_name: cytotechnologistName,
        cytotechnologist_code: cytotechnologistCode,
        cytopathologist_name: cytopathologistName,
        cytopathologist_code: cytopathologistCode,
        confirmed_date: confirmedDate
      };

      const updated = await submitCervicalResult(questionnaire.questionnaire_id, payload);
      alert('子宮頸抹片病理細胞學判讀結果已成功登錄入檔！');
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      alert(err.message || '更新失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const p = questionnaire.patient;
  const c = questionnaire.cervical;

  // Diagnosis options according to official form
  const diagnosisOptions = [
    { code: '1', group: '正常/良性', label: '① 正常或良性反應 (WNL / Within Normal Limits)' },
    { code: '2', group: '正常/良性', label: '② 反應性變化 (修復、萎縮伴隨發炎、放療等)' },
    { code: '3', group: '正常/良性', label: '③ 萎縮性變化 (Atrophy)' },
    { code: '4', group: '鱗狀上皮異常 (Squamous)', label: '④ 非典型鱗狀細胞－意義未明 (ASC-US)' },
    { code: '16', group: '鱗狀上皮異常 (Squamous)', label: '⑯ 非典型鱗狀細胞－無法排除高度鱗狀上皮內病變 (ASC-H)' },
    { code: '6', group: '鱗狀上皮異常 (Squamous)', label: '⑥ 輕度鱗狀上皮內病變－含細胞病變/病毒感染 (LSIL: CIN1 with koilocytosis)' },
    { code: '7', group: '鱗狀上皮異常 (Squamous)', label: '⑦ 輕度鱗狀上皮內病變－不含細胞病變/病毒感染 (LSIL: CIN1 without koilocytosis)' },
    { code: '8', group: '鱗狀上皮異常 (Squamous)', label: '⑧ 高度鱗狀上皮內病變 (HSIL: CIN2)' },
    { code: '9', group: '鱗狀上皮異常 (Squamous)', label: '⑨ 高度鱗狀上皮內病變 (HSIL: CIN3)' },
    { code: '10', group: '鱗狀上皮異常 (Squamous)', label: '⑩ 原位癌 (Carcinoma in situ, CIS)' },
    { code: '11', group: '鱗狀上皮異常 (Squamous)', label: '⑪ 鱗狀細胞癌 (Squamous Cell Carcinoma, SCC)' },
    { code: '17', group: '鱗狀上皮異常 (Squamous)', label: '⑰ 上皮內病變，無法排除高度鱗狀上皮內病變 (Dysplasia cannot exclude HSIL)' },
    { code: '5', group: '腺體細胞異常 (Glandular)', label: '⑤ 非典型腺體細胞 (Atypical Glandular Cells, AGC-NOS)' },
    { code: '15', group: '腺體細胞異常 (Glandular)', label: '⑮ 非典型腺體細胞－傾向惡性腫瘤 (AGC favor neoplasm)' },
    { code: '18', group: '腺體細胞異常 (Glandular)', label: '⑱ 原位腺癌 (Adenocarcinoma in situ, AIS)' },
    { code: '12', group: '腺體細胞異常 (Glandular)', label: '⑫ 侵襲性腺癌 (Adenocarcinoma)' },
    { code: '13', group: '其他', label: '⑬ 其他惡性腫瘤 (Other Malignant Neoplasms)' },
    { code: '14', group: '其他', label: '⑭ 其他細胞學變化 (Other)' },
  ];

  const isAbnormalDiagnosis = ['4', '16', '6', '7', '8', '9', '10', '11', '17', '5', '15', '18', '12', '13'].includes(cytologyDiagnosis);

  return (
    <div className="modal-overlay" style={{ overflowY: 'auto', padding: '2rem 1rem' }}>
      <div className="modal-dialog" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Stethoscope size={24} color="#BE185D" />
            <span>
              子宮頸抹片病理細胞學判讀與報告登錄 - #{questionnaire.questionnaire_id}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
            {/* Header: 受檢者與臨床採檢摘要 */}
            <div style={{ background: '#FDF2F8', border: '1px solid #FBCFE8', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '0.875rem' }}>
                <div><span style={{ color: '#9D174D' }}>受檢姓名：</span><strong>{p.name}</strong> (女)</div>
                <div><span style={{ color: '#9D174D' }}>身分證號：</span><strong>{p.id_card_no}</strong></div>
                <div><span style={{ color: '#9D174D' }}>出生日期：</span>{p.birth_date}</div>
                <div><span style={{ color: '#9D174D' }}>病歷號：</span>{c?.chart_no || '無'}</div>
                <div><span style={{ color: '#9D174D' }}>採檢日期：</span>{c?.sampling_date || questionnaire.screening_date}</div>
                <div><span style={{ color: '#9D174D' }}>採檢醫師/人員：</span>{c?.sampler_name || '醫師'}</div>
                <div><span style={{ color: '#9D174D' }}>停經狀態：</span>{c?.is_menopause === 'YES' ? '已停經' : '未停經'}</div>
                <div><span style={{ color: '#9D174D' }}>子宮切除：</span>{c?.hysterectomy_status === 'YES' ? '⚠️ 已切除' : '否'}</div>
                <div><span style={{ color: '#9D174D' }}>合併HPV檢查：</span>{c?.combine_hpv ? '✅ 有合併HPV檢查' : '無'}</div>
                <div><span style={{ color: '#9D174D' }}>抹片目的：</span>{c?.smear_purpose === 'SCREENING' ? '常規篩檢' : '異常追蹤/其他'}</div>
              </div>
            </div>

            {/* 三之二、抹片資料 (病理機構填寫) */}
            <div style={{ border: '1.5px solid #BE185D', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', background: '#FFF1F2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9F1239', fontWeight: '800', fontSize: '1.05rem', marginBottom: '12px', borderBottom: '1px solid #FECDD3', paddingBottom: '6px' }}>
                <FileText size={20} />
                <span>三之二、抹片資料（病理機構填寫）</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="question-label">1. 病理編號 (Pathology No.)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={pathologyNo}
                    onChange={e => setPathologyNo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="question-label">2. 病理檢驗機構名稱及代碼</label>
                  <input
                    type="text"
                    className="input-field"
                    value={labUnitName}
                    onChange={e => setLabUnitName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="question-label">3. 收到檢體日期</label>
                  <input
                    type="date"
                    className="input-field"
                    value={receivedDate}
                    onChange={e => setReceivedDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="question-label">4. 抹片種類</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="specimenType"
                      checked={specimenType === 'CONVENTIONAL'}
                      onChange={() => setSpecimenType('CONVENTIONAL')}
                    />
                    ① 常規抹片 (Conventional Smear)
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="specimenType"
                      checked={specimenType === 'LBC'}
                      onChange={() => setSpecimenType('LBC')}
                    />
                    ② 液體標本 (Liquid-based Cytology, LBC)
                  </label>
                </div>
              </div>
            </div>

            {/* 四、抹片判讀結果 (病理機構填寫) */}
            <div style={{ border: '1.5px solid #0284C7', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', background: '#F0F9FF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369A1', fontWeight: '800', fontSize: '1.05rem', marginBottom: '12px', borderBottom: '1px solid #BAE6FD', paddingBottom: '6px' }}>
                <ClipboardList size={20} />
                <span>四、抹片判讀結果（病理機構填寫）</span>
              </div>

              {/* 1. 判讀方式 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="question-label">1. 判讀方式</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="readingMethod"
                      checked={readingMethod === 'MANUAL'}
                      onChange={() => setReadingMethod('MANUAL')}
                    />
                    ① 人工閱片
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="readingMethod"
                      checked={readingMethod === 'AUTO'}
                      onChange={() => setReadingMethod('AUTO')}
                    />
                    ② 機械自動判讀
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="readingMethod"
                      checked={readingMethod === 'MANUAL_AUTO'}
                      onChange={() => setReadingMethod('MANUAL_AUTO')}
                    />
                    ③ 人工與機械自動判讀
                  </label>
                </div>
              </div>

              {/* 2. 抹片品質 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="question-label">2. 抹片品質 (Specimen Adequacy)</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="smearQuality"
                      checked={smearQuality === 'GOOD'}
                      onChange={() => handleQualityChange('GOOD')}
                    />
                    ① 良好，可供判讀 (Satisfactory for evaluation)
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="smearQuality"
                      checked={smearQuality === 'SATISFACTORY'}
                      onChange={() => handleQualityChange('SATISFACTORY')}
                    />
                    ② 尚可，但因故影響判讀
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#DC2626', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="smearQuality"
                      checked={smearQuality === 'UNSATISFACTORY'}
                      onChange={() => handleQualityChange('UNSATISFACTORY')}
                    />
                    ③ 難以判讀 (Unsatisfactory for evaluation)
                  </label>
                </div>

                {/* 抹片品質不良原因 */}
                {(smearQuality === 'SATISFACTORY' || smearQuality === 'UNSATISFACTORY') && (
                  <div style={{ marginTop: '8px', background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>品質影響/難以判讀之原因（可複選）：</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '6px' }}>
                      {[
                        { code: 'Q1', label: '① 鱗狀上皮細胞太少 (<8,000或<5,000)' },
                        { code: 'Q2', label: '② 無子宮頸內管細胞或轉化區成分' },
                        { code: 'Q3', label: '③ 血液遮蓋 >75%' },
                        { code: 'Q4', label: '④ 發炎細胞遮蓋 >75%' },
                        { code: 'Q5', label: '⑤ 抹片固定不良或風乾' },
                        { code: 'Q6', label: '⑥ 抹片過厚細胞重疊' },
                        { code: 'Q7', label: '⑦ 其他原因' },
                      ].map(item => (
                        <label key={item.code} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={qualityReasons.includes(item.code)}
                            onChange={() => toggleArrayItem(qualityReasons, item.code, setQualityReasons)}
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                    {qualityReasons.includes('Q7') && (
                      <input
                        type="text"
                        className="input-field"
                        style={{ marginTop: '8px' }}
                        placeholder="請說明其他品質原因"
                        value={qualityReasonOther}
                        onChange={e => setQualityReasonOther(e.target.value)}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* 3. 感染病原體 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="question-label">3. 感染病原體 (Organisms / Infection)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px', marginTop: '4px' }}>
                  {[
                    { code: '1', label: '① 念珠菌感染 (Candida spp.)' },
                    { code: '2', label: '② 陰道滴蟲 (Trichomonas vaginalis)' },
                    { code: '3', label: '③ 單純疱疹病毒 (Herpes simplex virus)' },
                    { code: '7', label: '⑦ 陰道桿菌菌群改變 (Shift in flora / BV)' },
                    { code: '8', label: '⑧ 放射線菌 (Actinomyces spp.)' },
                    { code: '6', label: '⑥ 其他感染病原體' },
                  ].map(inf => (
                    <label key={inf.code} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={infections.includes(inf.code)}
                        onChange={() => toggleArrayItem(infections, inf.code, setInfections)}
                      />
                      {inf.label}
                    </label>
                  ))}
                </div>
                {infections.includes('6') && (
                  <input
                    type="text"
                    className="input-field"
                    style={{ marginTop: '6px' }}
                    placeholder="請說明其他病原體"
                    value={infectionOther}
                    onChange={e => setInfectionOther(e.target.value)}
                  />
                )}
              </div>

              {/* 4. 上皮細胞診斷 Bethesda 分類 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="question-label" style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                    4. 上皮細胞診斷（Bethesda System 2014 分類，單選）
                  </label>
                  {isAbnormalDiagnosis && (
                    <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={14} /> 細胞學異常－需進一步檢查或切片
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '8px', marginTop: '8px', maxHeight: '280px', overflowY: 'auto', background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                  {diagnosisOptions.map(opt => (
                    <label
                      key={opt.code}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: cytologyDiagnosis === opt.code ? '#FEF2F2' : '#F8FAFC',
                        border: cytologyDiagnosis === opt.code ? '1.5px solid #EF4444' : '1px solid #E2E8F0',
                        cursor: 'pointer',
                        fontSize: '0.825rem',
                        fontWeight: cytologyDiagnosis === opt.code ? 700 : 400
                      }}
                    >
                      <input
                        type="radio"
                        name="cytologyDiagnosis"
                        checked={cytologyDiagnosis === opt.code}
                        onChange={() => setCytologyDiagnosis(opt.code)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>

                {/* 40歲以上婦女出現子宮內膜細胞 */}
                <div style={{ marginTop: '10px', padding: '8px 12px', background: '#FEF3C7', borderRadius: '6px', border: '1px solid #FCD34D' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#92400E' }}>
                    <input
                      type="checkbox"
                      checked={endometrialCellsOver40}
                      onChange={e => setEndometrialCellsOver40(e.target.checked)}
                    />
                    檢出良性子宮內膜細胞（適用於 40 歲或以上婦女，Endometrial cells present in women ≥40 years）
                  </label>
                </div>
              </div>

              {/* 5. 建議處置 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="question-label">5. 建議處置 (Recommendations)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', marginTop: '4px' }}>
                  {[
                    { code: 'REDO_DIFFICULT', label: '① 抹片難以判讀，請重做抹片' },
                    { code: 'TREAT_INFLAMMATION', label: '② 請治療發炎，治療後三個月重做抹片' },
                    { code: 'FURTHER_CHECK', label: '③ 抹片異常，請至醫療院所進一步檢查 (陰道鏡/切片)' },
                    { code: 'OTHER_REC', label: '④ 其他建議' },
                  ].map(rec => (
                    <label key={rec.code} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={recommendations.includes(rec.code)}
                        onChange={() => toggleArrayItem(recommendations, rec.code, setRecommendations)}
                      />
                      {rec.label}
                    </label>
                  ))}
                </div>
                {recommendations.includes('OTHER_REC') && (
                  <input
                    type="text"
                    className="input-field"
                    style={{ marginTop: '6px' }}
                    placeholder="請說明其他建議"
                    value={recommendationOther}
                    onChange={e => setRecommendationOther(e.target.value)}
                  />
                )}
              </div>

              {/* 6. 人員簽章與登錄日期 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                <div>
                  <label className="question-label">細胞醫檢師 (簽章/證號)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={cytotechnologistName}
                    onChange={e => setCytotechnologistName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="question-label">病理專科醫師 (簽章/證號)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={cytopathologistName}
                    onChange={e => setCytopathologistName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="question-label">報告確定/確認日期</label>
                  <input
                    type="date"
                    className="input-field"
                    value={confirmedDate}
                    onChange={e => setConfirmedDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? '儲存中...' : '儲存子宮頸抹片病理報告'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
