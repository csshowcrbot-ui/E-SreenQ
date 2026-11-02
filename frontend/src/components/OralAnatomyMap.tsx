import React, { useState } from 'react';
import type { LesionLocation } from '../types';
import { Plus, Trash2, MapPin, CheckCircle } from 'lucide-react';


interface OralAnatomyMapProps {
  lesions: LesionLocation[];
  onChange: (lesions: LesionLocation[]) => void;
  disabled?: boolean;
}

export const ANATOMY_SITES = [
  { code: 'AU', label: '上唇 (AU)', category: '口唇' },
  { code: 'AD', label: '下唇 (AD)', category: '口唇' },
  { code: 'BR', label: '右頰黏膜 (BR)', category: '頰黏膜' },
  { code: 'BL', label: '左頰黏膜 (BL)', category: '頰黏膜' },
  { code: 'CR', label: '右臼齒後三角區 (CR)', category: '臼齒區' },
  { code: 'CL', label: '左臼齒後三角區 (CL)', category: '臼齒區' },
  { code: 'DR', label: '右上牙齦 (DR)', category: '牙齦' },
  { code: 'DL', label: '左上牙齦 (DL)', category: '牙齦' },
  { code: 'ER', label: '右下牙齦 (ER)', category: '牙齦' },
  { code: 'EL', label: '左下牙齦 (EL)', category: '牙齦' },
  { code: 'FR', label: '舌右側緣 (FR)', category: '舌部' },
  { code: 'FL', label: '舌左側緣 (FL)', category: '舌部' },
  { code: 'F',  label: '舌面/舌背 (F)', category: '舌部' },
  { code: 'GR', label: '右口底黏膜 (GR)', category: '口底' },
  { code: 'GL', label: '左口底黏膜 (GL)', category: '口底' },
  { code: 'HR', label: '右硬腭 (HR)', category: '腭部' },
  { code: 'HL', label: '左硬腭 (HL)', category: '腭部' },
  { code: 'IR', label: '右軟腭 (IR)', category: '腭部' },
  { code: 'IL', label: '左軟腭 (IL)', category: '腭部' },
  { code: 'JR', label: '右扁桃體 (JR)', category: '咽喉' },
  { code: 'JL', label: '左扁桃體 (JL)', category: '咽喉' },
  { code: 'KR', label: '右口咽後壁 (KR)', category: '口咽' },
  { code: 'KL', label: '左口咽後壁 (KL)', category: '口咽' },
  { code: 'MR', label: '右頸部腫塊 (MR)', category: '頸部' },
  { code: 'ML', label: '左頸部腫塊 (ML)', category: '頸部' },
  { code: 'L',  label: '其他解剖部位 (L)', category: '其他' }
];

export const REFERRAL_CODES = [
  { code: '01', name: '疑似口腔癌' },
  { code: '02', name: '口腔內外不明原因之持續性腫塊' },
  { code: '03', name: '紅斑' },
  { code: '04', name: '紅白斑' },
  { code: '05', name: '疣狀增生' },
  { code: '71', name: '非均質性白斑' },
  { code: '72', name: '均質性厚白斑' },
  { code: '73', name: '均質性薄白斑' },
  { code: '76', name: '口腔黏膜下纖維化症 (張口或舌運動困難)' },
  { code: '08', name: '約2星期仍不癒之口腔潰瘍/糜爛' },
  { code: '09', name: '扁平苔癬' },
  { code: '10', name: '口腔黏膜不正常，但診斷未明' },
  { code: '99', name: '其他' }
];

export const OralAnatomyMap: React.FC<OralAnatomyMapProps> = ({
  lesions,
  onChange,
  disabled = false
}) => {
  const [selectedSiteCode, setSelectedSiteCode] = useState<string>('BR');
  const [selectedDiseaseCode, setSelectedDiseaseCode] = useState<string>('01');
  const [customRemark, setCustomRemark] = useState<string>('');

  const handleAddLesion = () => {
    if (disabled) return;
    const siteObj = ANATOMY_SITES.find(s => s.code === selectedSiteCode);
    const diseaseObj = REFERRAL_CODES.find(d => d.code === selectedDiseaseCode);
    if (!siteObj || !diseaseObj) return;

    // Check if site already added with this disease
    const exists = lesions.some(l => l.loc === siteObj.code && l.code === diseaseObj.code);
    if (exists) return;

    const newLesion: LesionLocation = {
      loc: siteObj.code,
      name: siteObj.label,
      code: diseaseObj.code,
      desc: customRemark ? `${diseaseObj.name} (${customRemark})` : diseaseObj.name
    };

    onChange([...lesions, newLesion]);
    setCustomRemark('');
  };

  const handleRemoveLesion = (index: number) => {
    if (disabled) return;
    const updated = [...lesions];
    updated.splice(index, 1);
    onChange(updated);
  };

  const isSiteMarked = (code: string) => {
    return lesions.some(l => l.loc === code);
  };

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Left: SVG Anatomical Schema & Interactive Sites */}
        <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={18} color="#1976D2" />
              口腔解剖部位互動標記圖 (點選部位快速選取)
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              已標註 {lesions.length} 處病灶
            </span>
          </div>

          {/* Graphical Representation of Oral Cavity */}
          <div style={{ position: 'relative', width: '100%', height: '220px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 400 240" style={{ width: '100%', height: '100%' }}>
              {/* Outer Lip / Oral Opening Outline */}
              <ellipse cx="200" cy="120" rx="170" ry="95" fill="#FFF5F5" stroke="#CBD5E1" strokeWidth="2" />
              <ellipse cx="200" cy="120" rx="130" ry="75" fill="#FFE4E6" stroke="#FDA4AF" strokeWidth="1.5" />

              {/* Upper & Lower Teeth Arch */}
              <path d="M 100,105 Q 200,60 300,105" fill="none" stroke="#94A3B8" strokeWidth="4" strokeDasharray="6,4" />
              <path d="M 105,135 Q 200,180 295,135" fill="none" stroke="#94A3B8" strokeWidth="4" strokeDasharray="6,4" />

              {/* Hard / Soft Palate */}
              <ellipse cx="200" cy="85" rx="55" ry="25" fill="#FCE7F3" stroke="#F472B6" strokeWidth="1" />
              <text x="200" y="85" textAnchor="middle" fontSize="10" fill="#9D174D" fontWeight="600">硬腭/軟腭 (HR/IR)</text>

              {/* Tongue in Center */}
              <path d="M 150,115 C 150,85 250,85 250,115 C 250,165 150,165 150,115 Z" fill="#FECDD3" stroke="#FB7185" strokeWidth="2" />
              <text x="200" y="130" textAnchor="middle" fontSize="11" fill="#9F1239" fontWeight="700">舌 (FR/FL/F)</text>

              {/* Floor of mouth below tongue */}
              <text x="200" y="165" textAnchor="middle" fontSize="9" fill="#64748B">口底 (GR/GL)</text>

              {/* Cheeks on sides */}
              <text x="55" y="125" textAnchor="middle" fontSize="11" fill="#1E3A8A" fontWeight="700">右頰 (BR)</text>
              <text x="345" y="125" textAnchor="middle" fontSize="11" fill="#1E3A8A" fontWeight="700">左頰 (BL)</text>

              {/* Upper / Lower Lip text */}
              <text x="200" y="42" textAnchor="middle" fontSize="10" fill="#1E3A8A" fontWeight="600">上唇 (AU)</text>
              <text x="200" y="210" textAnchor="middle" fontSize="10" fill="#1E3A8A" fontWeight="600">下唇 (AD)</text>

              {/* Retromolar Trigone */}
              <text x="95" y="80" textAnchor="middle" fontSize="8" fill="#475569">CR:臼齒三角</text>
              <text x="305" y="80" textAnchor="middle" fontSize="8" fill="#475569">CL:臼齒三角</text>

              {/* Dynamic Lesion Marker Pins on SVG */}
              {lesions.map((les, idx) => {
                let cx = 200, cy = 120;
                if (les.loc === 'AU') { cx = 200; cy = 48; }
                else if (les.loc === 'AD') { cx = 200; cy = 195; }
                else if (les.loc === 'BR') { cx = 70; cy = 120; }
                else if (les.loc === 'BL') { cx = 330; cy = 120; }
                else if (les.loc === 'FR') { cx = 175; cy = 120; }
                else if (les.loc === 'FL') { cx = 225; cy = 120; }
                else if (les.loc === 'F') { cx = 200; cy = 115; }
                else if (les.loc === 'HR' || les.loc === 'HL') { cx = 200; cy = 80; }
                else if (les.loc === 'GR' || les.loc === 'GL') { cx = 200; cy = 150; }
                else if (les.loc === 'CR') { cx = 100; cy = 95; }
                else if (les.loc === 'CL') { cx = 300; cy = 95; }
                else if (les.loc === 'DR' || les.loc === 'DL') { cx = 200; cy = 68; }
                else if (les.loc === 'ER' || les.loc === 'EL') { cx = 200; cy = 175; }

                return (
                  <g key={idx}>
                    <circle cx={cx} cy={cy} r="10" fill="#DC2626" opacity="0.85" />
                    <circle cx={cx} cy={cy} r="14" fill="none" stroke="#DC2626" strokeWidth="1.5">
                      <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="9" fill="#FFFFFF" fontWeight="800">
                      {les.code}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Select Buttons Grid */}
          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block', marginBottom: '6px' }}>
              快速選定解剖部位：
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
              {ANATOMY_SITES.map(site => {
                const marked = isSiteMarked(site.code);
                const isSelected = selectedSiteCode === site.code;
                return (
                  <button
                    key={site.code}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedSiteCode(site.code)}
                    style={{
                      border: isSelected ? '2px solid #1976D2' : marked ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                      background: isSelected ? '#EFF6FF' : marked ? '#FEF2F2' : '#FFFFFF',
                      color: isSelected ? '#1976D2' : marked ? '#B91C1C' : '#334155',
                      padding: '5px 4px',
                      borderRadius: '6px',
                      fontSize: '0.775rem',
                      fontWeight: isSelected || marked ? '700' : '500',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <span>{site.code}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>{site.category}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Disease Code Binding & Current Lesions */}
        <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={18} color="#00897B" />
            新增病灶診斷關聯
          </h4>

          {/* Select Location */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
              1. 標記部位代碼：
            </label>
            <select
              disabled={disabled}
              className="input-field"
              value={selectedSiteCode}
              onChange={e => setSelectedSiteCode(e.target.value)}
              style={{ fontSize: '0.9rem', padding: '8px' }}
            >
              {ANATOMY_SITES.map(s => (
                <option key={s.code} value={s.code}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Select Referral Disease Code */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
              2. 轉介原因病灶代碼：
            </label>
            <select
              disabled={disabled}
              className="input-field"
              value={selectedDiseaseCode}
              onChange={e => setSelectedDiseaseCode(e.target.value)}
              style={{ fontSize: '0.9rem', padding: '8px' }}
            >
              {REFERRAL_CODES.map(d => (
                <option key={d.code} value={d.code}>
                  [{d.code}] {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom remark */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
              3. 病灶質地/備註 (選填)：
            </label>
            <input
              type="text"
              disabled={disabled}
              className="input-field"
              placeholder="例: 質硬邊緣隆起、約1.2cm"
              value={customRemark}
              onChange={e => setCustomRemark(e.target.value)}
              style={{ fontSize: '0.9rem', padding: '8px' }}
            />
          </div>

          <button
            type="button"
            disabled={disabled}
            className="btn btn-primary"
            onClick={handleAddLesion}
            style={{ width: '100%', padding: '9px 16px', fontSize: '0.9rem' }}
          >
            <Plus size={16} />
            加入此處病灶標記
          </button>

          {/* List of currently added lesions */}
          <div style={{ marginTop: '1.25rem', flex: 1, borderTop: '1px dashed #E2E8F0', paddingTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>
                已標註病灶清單：
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {lesions.length === 0 ? '目前無異常標記' : `${lesions.length} 項`}
              </span>
            </div>

            {lesions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#F8FAFC', borderRadius: '8px', color: '#94A3B8', fontSize: '0.85rem' }}>
                <CheckCircle size={24} color="#10B981" style={{ margin: '0 auto 6px', display: 'block' }} />
                初檢未標記異常病灶
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                {lesions.map((les, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '6px',
                      fontSize: '0.825rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: '800', color: '#B91C1C', marginRight: '6px' }}>
                        [{les.loc}]
                      </span>
                      <span style={{ color: '#1E293B' }}>{les.name}</span>
                      <div style={{ color: '#DC2626', fontWeight: '600', fontSize: '0.775rem', marginTop: '2px' }}>
                        代碼 {les.code}：{les.desc}
                      </div>
                    </div>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLesion(index)}
                        style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                        title="移除此項"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
