import React, { useEffect } from 'react';
import type { Questionnaire } from '../types';
import { recordPrintAudit } from '../services/api';
import { Printer, X } from 'lucide-react';


interface A4PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionnaire: Questionnaire | null;
}

export const A4PrintModal: React.FC<A4PrintModalProps> = ({
  isOpen,
  onClose,
  questionnaire
}) => {
  useEffect(() => {
    // Record audit when user opens print modal
    if (isOpen && questionnaire) {
      recordPrintAudit(questionnaire.questionnaire_id);
    }
  }, [isOpen, questionnaire]);

  if (!isOpen || !questionnaire) return null;

  const handlePrint = () => {
    window.print();
  };

  const isVoided = questionnaire.is_deleted || questionnaire.status === 'VOIDED';
  const q = questionnaire;
  const p = q.patient;
  const isGastric = q.form_type === 'GASTRIC';
  const isOral = q.form_type === 'ORAL';
  const isFecal = q.form_type === 'FECAL';
  const isCervical = q.form_type === 'CERVICAL';
  const isLung = q.form_type === 'LUNG';
  const isBreast = q.form_type === 'BREAST';
  const g = q.gastric;
  const o = q.oral;
  const f = q.fecal;
  const c = q.cervical;
  const l = q.lung;
  const b = q.breast;

  // Convert Gregorian to Minguo Year
  const getMinguoYear = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length >= 1) {
      const year = parseInt(parts[0]);
      return `${year - 1911} 年 ${parts[1] || ''} 月 ${parts[2] || ''} 日`;
    }
    return dateStr;
  };

  return (
    <div className="modal-overlay" style={{ overflowY: 'auto', padding: '2rem 1rem' }}>
      <div
        className="modal-dialog"
        style={{
          maxWidth: '880px',
          maxHeight: 'none',
          background: '#E2E8F0',
          padding: '0',
          overflow: 'visible'
        }}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div
          className="no-print"
          style={{
            background: '#1E293B',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '16px 16px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={20} color="#38BDF8" />
            <span style={{ fontWeight: '700', fontSize: '1rem' }}>
              A4 國健署標準公版套印預覽 - {isGastric ? '胃幽門桿菌篩檢表 (附表八之四)' : isOral ? '口腔黏膜檢查表 (AT287)' : isFecal ? '定量免疫法糞便潛血檢查表 (附表五之四)' : isCervical ? '健康署女性子宮頸抹片檢查表 (附表三之四)' : isLung ? '胸部低劑量電腦斷層檢查同意書與紀錄表單 (附件一之三、四)' : '健康署婦女乳房X光攝影檢查紀錄結果表 (附表四之四)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ padding: '6px 16px', fontSize: '0.9rem' }}
            >
              <Printer size={16} />
              立即套印 / 匯出 PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* The 1:1 A4 Printable Sheet */}
        <div style={{ padding: '20px', overflowX: 'auto' }}>
          <div className="a4-print-sheet" id="printable-a4-sheet">
            {/* Watermark for Voided Records */}
            {isVoided && (
              <div className="void-watermark">
                已 作 廢  V O I D
                <div style={{ fontSize: '14px', marginTop: '6px', fontWeight: 'normal', color: '#B91C1C' }}>
                  作廢人員：{q.deleted_by || '管理師'} | 時間：{q.deleted_at ? new Date(q.deleted_at).toLocaleString() : ''}
                  <br />
                  原因：{q.void_reason_code} - {q.void_reason_remark || '無備註'}
                </div>
              </div>
            )}

            {/* Document Header */}
            {isGastric && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: '#333' }}>
                  <span>附表八之四</span>
                  <span>本項經費由衛生福利部國民健康署運用菸品健康福利捐/公務預算補助</span>
                  <span>115 年 1 月</span>
                </div>

                <div style={{ textAlign: 'center', margin: '8px 0 12px' }}>
                  <h2 style={{ fontSize: '15pt', fontWeight: '900', letterSpacing: '0.05em' }}>
                    健康署「糞便抗原檢測胃幽門螺旋桿菌服務」管理紀錄表
                  </h2>
                </div>

                {/* Meta info row */}
                <div style={{ fontSize: '9.5pt', lineHeight: '1.6', marginBottom: '6px' }}>
                  <div>
                    支付方式：[ {q.payment_type === '預防保健' ? '✓' : ' '} ] 預防保健　[ {q.payment_type === '健保醫療給付' ? '✓' : ' '} ] 健保醫療給付　[ {q.payment_type === '其他公務預算補助' ? '✓' : ' '} ] 其他公務預算補助　[ {q.payment_type === '自費健康檢查' ? '✓' : ' '} ] 自費健康檢查
                  </div>
                  <div>
                    採檢單位：<u>{g?.sampling_unit || '竹山秀傳醫院'}</u>　醫事機構代碼：<u>{g?.sampling_unit_code || '0938040012'}</u>　門診日期：<u>{getMinguoYear(q.screening_date)}</u>
                  </div>
                </div>

                {/* Patient Table */}
                <table className="print-table">
                  <tbody>
                    <tr>
                      <td style={{ width: '25%' }}>姓名：<strong>{p.name}</strong></td>
                      <td style={{ width: '20%' }}>性別：[ {p.gender === 'M' ? '✓' : ' '} ] 男　[ {p.gender === 'F' ? '✓' : ' '} ] 女</td>
                      <td style={{ width: '25%' }}>身分證：<strong>{p.id_card_no}</strong></td>
                      <td style={{ width: '30%' }}>原住民：[ {p.is_indigenous ? '✓' : ' '} ] 是 ({p.indigenous_tribe || ' '})　[ {!p.is_indigenous ? '✓' : ' '} ] 否</td>
                    </tr>
                    <tr>
                      <td colSpan={2}>出生日期：民國 {getMinguoYear(p.birth_date)}</td>
                      <td colSpan={2}>聯絡電話：({p.phone || ' '})　手機：{p.mobile}</td>
                    </tr>
                    <tr>
                      <td colSpan={4}>
                        現居住地址：({p.zip_code || '   '}) {p.city || ''}{p.district || ''}{p.village || ''}{p.road || ''}{p.section_lane || ''}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4}>
                        教育：{p.education_level || '高中(職)'}　｜　職業：{p.occupation_status || '有'}　｜　婚姻：{p.marriage_status || '已婚'}　｜　宗教：{g?.religion || '無'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Gastric Section 1: 個人病史 */}
                <div style={{ marginTop: '8px', border: '1px solid black', padding: '6px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '10pt', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '4px' }}>
                    【個人病史】
                  </div>
                  <div style={{ fontSize: '9pt', lineHeight: '1.5' }}>
                    1. 個人曾患疾病：
                    [ {g?.personal_history?.gastritis ? '✓' : ' '} ] 胃炎　
                    [ {g?.personal_history?.ulcer ? '✓' : ' '} ] 胃潰瘍　
                    [ {g?.personal_history?.duodenal_ulcer ? '✓' : ' '} ] 十二指腸潰瘍　
                    [ {g?.personal_history?.reflux ? '✓' : ' '} ] 胃食道逆流　
                    [ {g?.personal_history?.cancer ? '✓' : ' '} ] 胃癌/腫瘤　
                    [ {g?.personal_history?.hp_infection ? '✓' : ' '} ] 幽門桿菌感染　
                    [ {g?.personal_history?.none ? '✓' : ' '} ] 無
                    <br />
                    2. 曾接受幽門桿菌除菌治療：[ {g?.hp_eradication ? '✓' : ' '} ] 有　[ {!g?.hp_eradication ? '✓' : ' '} ] 無
                    <br />
                    3. 曾接受胃鏡檢查：[ {g?.gastroscopy_history ? '✓' : ' '} ] 有 (民國 {g?.gastroscopy_year || ' '} 年)　[ {!g?.gastroscopy_history ? '✓' : ' '} ] 無
                    <br />
                    4. 近一個月內是否服用潰瘍/逆流特效藥 (一日一顆)：[ {g?.anti_ulcer_drugs_recent_month ? '✓' : ' '} ] 有　[ {!g?.anti_ulcer_drugs_recent_month ? '✓' : ' '} ] 無
                    <br />
                    5. 藥物過敏：[ {g?.drug_allergy ? '✓' : ' '} ] 有 ({g?.drug_allergy_detail || ''})　[ {!g?.drug_allergy ? '✓' : ' '} ] 無
                  </div>
                </div>

                {/* Gastric Section 2: 家族病史 */}
                <div style={{ marginTop: '6px', border: '1px solid black', padding: '6px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '10pt', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '4px' }}>
                    【家族病史】
                  </div>
                  <div style={{ fontSize: '9pt', lineHeight: '1.5' }}>
                    1. 幽門桿菌家族史：[ {g?.family_hp_history?.has ? '✓' : ' '} ] 有　[ {g?.family_hp_history?.none ? '✓' : ' '} ] 無　[ {g?.family_hp_history?.unknown ? '✓' : ' '} ] 不詳
                    <br />
                    2. 消化性潰瘍家族史：[ {g?.family_ulcer_history?.has ? '✓' : ' '} ] 有 (父/母/手足)　[ {g?.family_ulcer_history?.none ? '✓' : ' '} ] 無　[ {g?.family_ulcer_history?.unknown ? '✓' : ' '} ] 不詳
                    <br />
                    3. 胃癌家族史：[ {g?.family_gastric_cancer_history?.has ? '✓' : ' '} ] 有 (直系二等親)　[ {g?.family_gastric_cancer_history?.none ? '✓' : ' '} ] 無　[ {g?.family_gastric_cancer_history?.unknown ? '✓' : ' '} ] 不詳
                  </div>
                </div>

                {/* Gastric Section 3: 用藥史與生活型態 */}
                <div style={{ marginTop: '6px', border: '1px solid black', padding: '6px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '10pt', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '4px' }}>
                    【用藥史與生活型態】
                  </div>
                  <div style={{ fontSize: '9pt', lineHeight: '1.5' }}>
                    用藥史(最近三個月)：[ {g?.medication_history?.has ? '✓' : ' '} ] 有用藥
                    ( [ {g?.medication_history?.painkiller ? '✓' : ' '} ] 止痛藥　[ {g?.medication_history?.steroid ? '✓' : ' '} ] 類固醇　[ {g?.medication_history?.antiplatelet ? '✓' : ' '} ] 抗血小板藥物(阿斯匹靈/保栓通)　[ {g?.medication_history?.anticoagulant ? '✓' : ' '} ] 抗凝血劑 )
                    <br />
                    生活型態：
                    吸菸：[ {g?.smoking_habit === 0 ? '✓' : ' '} 從不 / {g?.smoking_habit === 1 ? '✓' : ' '} 已戒 / {g?.smoking_habit === 2 ? '✓' : ' '} 有吸]　｜　
                    飲酒：[ {g?.drinking_habit === 0 ? '✓' : ' '} 從不 / {g?.drinking_habit === 2 ? '✓' : ' '} 有喝]　｜　
                    嚼檳：[ {g?.betel_nut_habit === 0 ? '✓' : ' '} 從不 / {g?.betel_nut_habit === 1 ? '✓' : ' '} 已戒]
                    <br />
                    飲食習慣：醃漬食品每週≥3次 [ {g?.diet_pickled_freq ? '✓' : '無'} ]　煙燻燒烤每週≥3次 [ {g?.diet_smoked_freq ? '✓' : '無'} ]
                  </div>
                </div>

                {/* Consent & Signature Box */}
                <div style={{ marginTop: '10px', border: '1.5px solid black', padding: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, paddingRight: '15px', fontSize: '8.5pt', lineHeight: '1.4' }}>
                      <strong>* 本人同意接受以糞便抗原檢測胃幽門螺旋桿菌檢查</strong>，相關資料將作為衛生單位政策評估或個案追蹤健康管理使用，確認以上資料正確無誤。
                      <div style={{ marginTop: '4px', color: '#475569', fontSize: '7.5pt' }}>
                        數位雜湊簽章驗證碼 (SHA-256)：<code>{q.data_hash.substring(0, 32)}...</code>
                      </div>
                    </div>

                    <div style={{ width: '180px', textAlign: 'center', borderLeft: '1px dashed #999', paddingLeft: '10px' }}>
                      <div style={{ fontSize: '8.5pt', marginBottom: '4px' }}>受檢者簽名：</div>
                      {q.patient_signature_url ? (
                        <img
                          src={q.patient_signature_url}
                          alt="受檢者數位簽名"
                          style={{ maxHeight: '45px', maxWidth: '160px', objectFit: 'contain' }}
                        />
                      ) : (
                        <span style={{ fontSize: '10pt', color: '#999' }}>[ 尚未簽署 ]</span>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Oral AT287 Document */}
            {isOral && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: '#333' }}>
                  <span>病歷號碼：<u>{p.chart_no}</u></span>
                  <span style={{ fontWeight: 'bold' }}>第一聯：存檢查醫療機構</span>
                  <span>113 年 11 月修訂 AT287</span>
                </div>

                <div style={{ textAlign: 'center', margin: '6px 0 10px' }}>
                  <h2 style={{ fontSize: '15pt', fontWeight: '900', letterSpacing: '0.05em' }}>
                    健康署口腔黏膜檢查服務檢查紀錄結果表單
                  </h2>
                </div>

                <div style={{ fontSize: '9pt', marginBottom: '6px', lineHeight: '1.5' }}>
                  篩檢補助對象：30 歲以上有嚼檳榔（含已戒）或吸菸習慣之民眾、18 歲以上有嚼檳榔（含已戒）習慣之原住民，每 2 年 1 次。
                  <br />
                  支付方式：[ {q.payment_type === '預防保健' ? '✓' : ' '} ] 預防保健　[ {q.payment_type === '健保醫療給付' ? '✓' : ' '} ] 健保醫療給付
                  <br />
                  篩檢地點：[ {o?.screening_location === '社區或職場設站篩檢' ? '✓' : ' '} ] 社區或職場設站篩檢　[ {o?.screening_location === '醫療院所' ? '✓' : ' '} ] 醫療院所
                  <br />
                  檢查醫師科別：[ {o?.doctor_dept === '牙科' ? '✓' : ' '} ] 牙科　[ {o?.doctor_dept === '耳鼻喉科' ? '✓' : ' '} ] 耳鼻喉科　[ {o?.doctor_dept === '其他' ? '✓' : ' '} ] 其他核可科別
                </div>

                {/* Section A: 基本資料 */}
                <table className="print-table">
                  <tbody>
                    <tr>
                      <td colSpan={4} style={{ background: '#F1F5F9', fontWeight: 'bold' }}>
                        A 基本資料 (受檢者自填)
                      </td>
                    </tr>
                    <tr>
                      <td>姓名：<strong>{p.name}</strong></td>
                      <td>性別：[ {p.gender === 'M' ? '✓' : ' '} ] 男　[ {p.gender === 'F' ? '✓' : ' '} ] 女</td>
                      <td>身分證統一編號：<strong>{p.id_card_no}</strong></td>
                      <td>原住民：[ {p.is_indigenous ? '✓' : ' '} ] 是 ({p.indigenous_tribe || ' '})　[ {!p.is_indigenous ? '✓' : ' '} ] 否</td>
                    </tr>
                    <tr>
                      <td colSpan={2}>出生日期：民國 {getMinguoYear(p.birth_date)}</td>
                      <td colSpan={2}>聯絡電話：({p.phone || ' '})　手機：{p.mobile}</td>
                    </tr>
                    <tr>
                      <td colSpan={4}>
                        現居住地址：({p.zip_code || '   '}) {p.city || ''}{p.district || ''}{p.village || ''}{p.road || ''}{p.section_lane || ''}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4}>
                        <strong>菸檳習慣：</strong>
                        嚼檳習慣：[ {o?.betel_nut_tier === 0 ? '無' : o?.betel_nut_tier === 1 ? '已戒' : o?.betel_nut_tier === 2 ? '10年以下，<20顆' : o?.betel_nut_tier === 3 ? '10年以下，≥20顆' : o?.betel_nut_tier === 4 ? '>10年，<20顆' : '>10年，≥20顆'} ]　｜　
                        吸菸習慣：[ {o?.smoking_tier === 0 ? '無' : o?.smoking_tier === 1 ? '已戒' : o?.smoking_tier === 2 ? '10年以下，<20支' : o?.smoking_tier === 3 ? '10年以下，≥20支' : o?.smoking_tier === 4 ? '>10年，<20支' : '>10年，≥20支'} ]　｜　
                        自覺症狀：[ {o?.self_reported_symptoms ? '✓有異常症狀' : '無'} ]
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Patient Signature */}
                <div style={{ margin: '6px 0', border: '1px solid black', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '8pt', flex: 1 }}>
                    * 本人同意接受口腔黏膜檢查，相關資料將作為衛生單位政策評估或個案追蹤健康管理使用，並確認以上資料正確無誤。
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '8.5pt' }}>受檢者簽名：</span>
                    {q.patient_signature_url ? (
                      <img src={q.patient_signature_url} alt="簽名" style={{ height: '35px' }} />
                    ) : (
                      <span>[ 未簽署 ]</span>
                    )}
                  </div>
                </div>

                {/* Section B: 醫師初檢診斷 */}
                <div style={{ border: '1px solid black', padding: '6px', marginTop: '6px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '9.5pt', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '4px' }}>
                    口腔黏膜檢查情形（初檢醫師填寫）
                  </div>
                  <div style={{ fontSize: '9pt', lineHeight: '1.5' }}>
                    檢查醫院：{o?.screening_unit || '竹山秀傳醫院'}　門診日期：民國 {getMinguoYear(q.screening_date)}
                    <br />
                    檢查結果：
                    <strong>[ {o?.inspection_result === 'NORMAL' ? '✓' : ' '} ] 未發現需轉介之異常</strong>　
                    <strong>[ {o?.inspection_result === 'REFERRAL' ? '✓' : ' '} ] 需轉介</strong>
                    {o?.inspection_result === 'REFERRAL' && (
                      <span style={{ color: '#B91C1C', marginLeft: '6px' }}>
                        (轉介原因代碼: {o?.referral_reason_code || '01'})
                      </span>
                    )}
                  </div>

                  {/* Anatomical lesion marks summary */}
                  {o?.lesion_locations && o.lesion_locations.length > 0 && (
                    <div style={{ marginTop: '6px', background: '#F8FAFC', padding: '6px', border: '1px dashed #CBD5E1', fontSize: '8.5pt' }}>
                      <strong>標註病灶部位：</strong>
                      {o.lesion_locations.map((l, i) => (
                        <span key={i} style={{ marginRight: '10px' }}>
                          • [{l.loc}] {l.name} → 代碼 {l.code} ({l.desc})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Doctor signature row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px solid #000', paddingTop: '6px' }}>
                    <div style={{ fontSize: '9pt' }}>
                      醫師執照號碼：<strong>{o?.doctor_license_no || '醫字第041892號'}</strong>
                      {o?.referral_hospital && (
                        <div style={{ fontSize: '8.5pt', color: '#334155', marginTop: '2px' }}>
                          轉介確診醫院：{o.referral_hospital}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '9pt' }}>初檢醫師簽章：</span>
                      {q.doctor_signature_url ? (
                        <img src={q.doctor_signature_url} alt="醫師簽章" style={{ height: '40px' }} />
                      ) : (
                        <span>[ {o?.doctor_name || '醫師'} 蓋章 ]</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fecal FIT Document (附表五之四 & 附表五之五) */}
            {isFecal && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: '#333' }}>
                  <span style={{ fontWeight: 'bold' }}>附表五之四</span>
                  <span>本檢查經費「由衛生福利部國民健康署運用菸品健康福利捐/公務預算補助」</span>
                  <span style={{ fontWeight: 'bold' }}>第二聯：存確診及治療醫院</span>
                </div>

                <div style={{ textAlign: 'center', margin: '6px 0 10px' }}>
                  <h2 style={{ fontSize: '15pt', fontWeight: '900', letterSpacing: '0.05em' }}>
                    健康署定量免疫法糞便潛血檢查服務檢查紀錄結果表單
                  </h2>
                </div>

                {/* Meta */}
                <div style={{ fontSize: '9pt', marginBottom: '6px', lineHeight: '1.5' }}>
                  <div>
                    支付方式：
                    [ {q.payment_type === '預防保健' ? '✓' : ' '} ]  預防保健；
                    [ {q.payment_type === '健保醫療給付' ? '✓' : ' '} ]  健保醫療給付；
                    [ {q.payment_type === '其他公務預算補助' ? '✓' : ' '} ]  其他公務預算補助；
                    [ {q.payment_type === '自費健康檢查' ? '✓' : ' '} ]  自費健康檢查；
                    [ {q.payment_type === '其他' ? '✓' : ' '} ]  其他。
                  </div>
                  <div>
                    篩檢地點：
                    [ {f?.screening_location === '社區或職場設站篩檢' ? '✓' : ' '} ]  社區或職場設站篩檢；
                    [ {f?.screening_location === '門診' ? '✓' : ' '} ]  門診；
                    [ {f?.screening_location === '住院' ? '✓' : ' '} ]  住院；
                    [ {f?.screening_location === '郵寄' ? '✓' : ' '} ]  郵寄；
                    [ {f?.screening_location === '其他' ? '✓' : ' '} ]  其他。
                  </div>
                </div>

                {/* Patient Table */}
                <table className="print-table">
                  <tbody>
                    <tr>
                      <td style={{ width: '25%' }}>姓名：<strong>{p.name}</strong></td>
                      <td style={{ width: '20%' }}>性別：[ {p.gender === 'M' ? '✓' : ' '} ] 男　[ {p.gender === 'F' ? '✓' : ' '} ] 女</td>
                      <td colSpan={2} style={{ width: '55%' }}>出生日期：民國 {getMinguoYear(p.birth_date)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        身分證統一編號：<strong>{p.id_card_no}</strong>
                      </td>
                      <td colSpan={2}>
                        聯絡電話：({p.phone || ' '})　手機：{p.mobile}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4}>
                        現居住地址：（鄉鎮市區代碼：<u>{p.zip_code || '5570'}</u>） {p.city || ''}{p.district || ''}{p.village || ''}{p.road || ''}{p.section_lane || ''}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4}>
                        教育：
                        [ {p.education_level === '無' ? '✓' : ' '} ] 無；
                        [ {p.education_level === '小學' ? '✓' : ' '} ] 小學；
                        [ {p.education_level === '國(初)中' ? '✓' : ' '} ] 國（初）中；
                        [ {p.education_level === '高中(職)' ? '✓' : ' '} ] 高中（職）；
                        [ {p.education_level === '專科、大學' ? '✓' : ' '} ] 專科、大學；
                        [ {p.education_level === '研究所以上' ? '✓' : ' '} ] 研究所以上；
                        [ {p.education_level === '拒答' ? '✓' : ' '} ] 拒答
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 家族病史及吸菸習慣 */}
                <div style={{ marginTop: '6px', border: '1px solid black', padding: '6px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '9.5pt', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '4px' }}>
                    【家族病史及吸菸習慣】
                  </div>
                  <div style={{ fontSize: '9pt', lineHeight: '1.5' }}>
                    1. 吸菸史：
                    [ {!f?.smoking_history ? '✓' : ' '} ] 無；
                    [ {f?.smoking_history ? '✓' : ' '} ] 有(含已戒菸)，開始吸菸年齡：<u>{f?.smoking_start_age || ' '}</u> 歲。
                    <br />
                    2. 請問與您有血緣的父母、兄弟姐妹或子女或其他親屬有無得過大腸直腸癌？
                    [ {f?.family_colorectal_cancer === 0 ? '✓' : ' '} ] 無；
                    [ {f?.family_colorectal_cancer === 1 ? '✓' : ' '} ] 有；
                    [ {f?.family_colorectal_cancer === 2 ? '✓' : ' '} ] 不知道。
                    <br />
                    3. 請問與您有血緣的父母、兄弟姐妹或子女或其他親屬有無得過其他癌症？
                    [ {f?.family_other_cancer === 0 ? '✓' : ' '} ] 無；
                    [ {f?.family_other_cancer === 1 ? '✓' : ' '} ] 有；
                    [ {f?.family_other_cancer === 2 ? '✓' : ' '} ] 不知道。
                    <span style={{ fontSize: '8pt', color: '#555', marginLeft: '6px' }}>(以上若有任一項填寫”有”，請繼續填寫附表五之六)</span>
                  </div>
                </div>

                {/* 有無症狀 */}
                <div style={{ marginTop: '6px', border: '1px solid black', padding: '6px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '9.5pt', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '4px' }}>
                    【有無症狀】
                  </div>
                  <div style={{ fontSize: '9pt', lineHeight: '1.5' }}>
                    請問您有無腸道不適症狀?如腹瀉、便秘、糞便變稠、排泄黏液、便血、黃便帶血或其他症狀：
                    [ {!f?.has_bowel_symptoms ? '✓' : ' '} ] 無；
                    [ {f?.has_bowel_symptoms ? '✓' : ' '} ] 有。
                  </div>
                </div>

                {/* 同意與受檢者簽署欄 */}
                <div style={{ margin: '6px 0', border: '1px solid black', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '8pt', flex: 1, paddingRight: '10px' }}>
                    * 本人同意接受糞便潛血檢查，本表資料將作為衛生及學術單位進行個案追蹤關懷及健康管理、資格檢核、比對連結、統計分析、政策評估及其他相關目的使用。確認以上資料正確無誤。
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '8.5pt' }}>受檢者簽名：</span>
                    {q.patient_signature_url ? (
                      <img src={q.patient_signature_url} alt="簽名" style={{ height: '35px' }} />
                    ) : (
                      <span>[ 未簽署 ]</span>
                    )}
                  </div>
                </div>

                {/* 個案檢查情形 */}
                <div style={{ border: '1px solid black', padding: '6px', marginTop: '6px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '9.5pt', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '4px' }}>
                    個案檢查情形（檢查醫療院所）
                  </div>
                  <div style={{ fontSize: '9pt', lineHeight: '1.5' }}>
                    檢查醫療院所名稱及代碼：<u>{f?.hospital_name || '竹山秀傳醫療社團法人竹山秀傳醫院'} ({f?.hospital_code || '0938040012'})</u>，門診日期：民國 <u>{getMinguoYear(f?.clinic_date || q.screening_date)}</u>。
                  </div>
                </div>

                {/* 糞便潛血檢查結果 (糞便潛血檢驗機構填寫) */}
                <div style={{ border: '1px solid black', padding: '6px', marginTop: '6px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '9.5pt', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '4px' }}>
                    糞便潛血檢查結果（糞便潛血檢驗機構填寫）
                  </div>
                  <div style={{ fontSize: '9pt', lineHeight: '1.5' }}>
                    1. 醫事檢驗機構/醫療院所名稱及代碼：<u>{f?.lab_unit_name || '竹山秀傳醫院 檢驗醫學科 (0938040012)'}</u>
                    <br />
                    2. 檢驗日期：民國 <u>{getMinguoYear(f?.lab_test_date || '')}</u>。
                    <br />
                    3. 檢驗結果：
                    [ {f?.test_result === 'NEGATIVE' ? '✓' : ' '} ] 陰性　
                    [ {f?.test_result === 'POSITIVE' ? '✓' : ' '} ] 陽性，數值：<u>{f?.test_value || '   '}</u> ng/mL。
                    <br />
                    4. 定量試劑商品名稱：
                    [ {f?.reagent_brand === 'Eiken' ? '✓' : ' '} ] Eiken，
                    [ {f?.reagent_brand === 'OTHER' ? '✓' : ' '} ] 其他 <u>{f?.reagent_brand_other || ' '}</u>，
                    [ {f?.reagent_brand === 'Kyowa' ? '✓' : ' '} ]  Kyowa（HM-JACKarc）。
                  </div>
                </div>

                {/* 個案確診結果 */}
                <div style={{ border: '1px solid black', padding: '6px', marginTop: '6px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '9.5pt', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '4px' }}>
                    個案確診結果
                  </div>
                  <div style={{ fontSize: '9pt', lineHeight: '1.5' }}>
                    1. 前項檢查陽性個案於檢查後三個月內有沒有接受後續確診？
                    [ {f?.has_followup_3months === false ? '✓' : ' '} ] 沒有；
                    [ {f?.has_followup_3months === true ? '✓' : ' '} ] 有。
                    <br />
                    2. 沒有接受確診理由為：
                    [ {f?.unconfirmed_reason === '無法聯繫' ? '✓' : ' '} ] 無法聯繫，
                    [ {f?.unconfirmed_reason === '出國' ? '✓' : ' '} ] 出國，
                    [ {f?.unconfirmed_reason === '搬家' ? '✓' : ' '} ] 搬家，
                    [ {f?.unconfirmed_reason === '死亡' ? '✓' : ' '} ] 死亡，
                    [ {f?.unconfirmed_reason === '拒做' ? '✓' : ' '} ] 拒做，
                    [ {f?.unconfirmed_reason === '其他' ? '✓' : ' '} ] 其他 <u>{f?.unconfirmed_reason_other || ''}</u>。
                    <br />
                    3. 確診醫療院所名稱及代碼：<u>{f?.confirm_hospital || '  '}</u>，確診日期：民國 <u>{getMinguoYear(f?.confirm_date || '')}</u>。
                    <br />
                    4. 檢查方法：
                    [ {f?.confirm_method === 'COLONOSCOPY' ? '✓' : ' '} ] 大腸鏡，
                    [ {f?.confirm_method === 'OTHER' ? '✓' : ' '} ] 其他 <u>{f?.confirm_method_other || ''}</u>。
                    <br />
                    5. 診斷：
                    [ {f?.diagnosis === 'NORMAL' ? '✓' : ' '} ] 正常，
                    [ {f?.diagnosis === 'HEMORRHOIDS' ? '✓' : ' '} ] 痔瘡，
                    [ {f?.diagnosis === 'COLITIS' ? '✓' : ' '} ] 潰瘍性大腸炎，
                    [ {f?.diagnosis === 'POLYP' ? '✓' : ' '} ] 瘜肉，
                    [ {f?.diagnosis === 'COLORECTAL_CANCER' ? '✓' : ' '} ] 大腸癌，
                    [ {f?.diagnosis === 'OTHER' ? '✓' : ' '} ] 其他 <u>{f?.diagnosis_other || ''}</u>。
                    <br />
                    *如有瘜肉，瘜肉有無切除：
                    [ {f?.polyp_removal_status === 'NOT_REMOVED' ? '✓' : ' '} ] 未切除　
                    [ {f?.polyp_removal_status === 'COMPLETELY_REMOVED' ? '✓' : ' '} ] 已完全切除　
                    [ {f?.polyp_removal_status === 'INCOMPLETELY_REMOVED' ? '✓' : ' '} ] 未完全切除。
                  </div>
                </div>

                {/* Page 2: 附表五之五聲明書 (若有啟用聲明書) */}
                {f?.declaration_statement?.enabled && (
                  <div style={{ pageBreakBefore: 'always', marginTop: '24px', paddingTop: '18px', borderTop: '2px dashed #94A3B8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: '#333' }}>
                      <span style={{ fontWeight: 'bold' }}>附表五之五</span>
                      <span>本檢查經費「由衛生福利部國民健康署運用菸品健康福利捐/公務預算補助」</span>
                      <span>（114 年 1 月修訂）</span>
                    </div>

                    <div style={{ textAlign: 'center', margin: '14px 0 16px' }}>
                      <h2 style={{ fontSize: '13pt', fontWeight: '900', lineHeight: '1.5' }}>
                        健康署四十歲至四十四歲且其父親、母親、兄弟姐妹或子女曾患有大腸癌之定量免疫法糞便潛血檢查服務聲明書
                      </h2>
                    </div>

                    <div style={{ fontSize: '10pt', lineHeight: '2.0', border: '1px solid black', padding: '16px' }}>
                      立聲明書人 <u><strong>{p.name}</strong></u>（以下簡稱本人），因為 <u><strong>{f.declaration_statement.inability_reason || '親屬已故無留存診斷證明'}</strong></u> 之原因，故無法出具一親等以內血親曾患有大腸癌之診斷證明與其親屬關係相關文件，茲證明我的 
                      [ {f.declaration_statement.relative_relation === '父親' ? '✓' : ' '} ] 父親，
                      [ {f.declaration_statement.relative_relation === '母親' ? '✓' : ' '} ] 母親，
                      [ {f.declaration_statement.relative_relation === '兄弟姐妹' ? '✓' : ' '} ] 兄弟姐妹，
                      [ {f.declaration_statement.relative_relation === '子女' ? '✓' : ' '} ] 子女 曾患有大腸癌，該名親屬姓名為 <u><strong>{f.declaration_statement.relative_name || '   '}</strong></u>，身分證統一編號（死亡者免填）：<u><strong>{f.declaration_statement.is_relative_deceased ? '（死亡免填）' : f.declaration_statement.relative_id_card || '   '}</strong></u>，本人聲明全部屬實，如有不實者願負一切法律責任。
                      
                      <div style={{ marginTop: '20px', paddingLeft: '10px' }}>
                        <div>立聲明書人</div>
                        <div>姓名：<strong>{p.name}</strong>　（簽章：{q.patient_signature_url ? <img src={q.patient_signature_url} alt="簽章" style={{ height: '30px', verticalAlign: 'middle' }} /> : '已簽署'}）</div>
                        <div>身分證統一編號或統一證號(外籍)：<strong>{p.id_card_no}</strong></div>
                        <div>通訊地址：{p.city}{p.district}{p.village}{p.road}{p.section_lane}</div>
                        <div>聯絡電話：{p.mobile || p.phone}</div>
                        <div style={{ marginTop: '16px', textAlign: 'center' }}>
                          中華民國 <u>{getMinguoYear(f.clinic_date || q.screening_date)}</u>
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '8.5pt', color: '#666', borderTop: '1px solid #CCC', marginTop: '14px', paddingTop: '6px' }}>
                        備註：本資料請醫療院所留存於病歷中。
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CERVICAL SCREENING FORM (附表三之四) */}
            {isCervical && (
              <div>
                {/* Header Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '9pt', color: '#333' }}>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>附表三之四（修正規定）</span><br />
                    <span>（116 年 1 月修訂）</span>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1, padding: '0 8px' }}>
                    <span style={{ fontSize: '9.5pt', fontWeight: 'bold' }}>第一聯：病理醫療機構回報採檢醫療機構聯 (全3聯)</span><br />
                    <span style={{ fontSize: '8pt', color: '#555' }}>本檢查經費「由衛生福利部國民健康署運用菸品健康福利捐/公務預算補助」</span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '8pt' }}>
                    <span>表單序號：{q.questionnaire_id}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', margin: '8px 0 10px' }}>
                  <h1 style={{ fontSize: '15pt', fontWeight: '900', letterSpacing: '1px', margin: '0' }}>
                    健康署女性子宮頸抹片檢查服務檢查紀錄結果表單
                  </h1>
                </div>

                {/* Service Type & Payment Header Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', border: '1px solid black', padding: '4px 8px', marginBottom: '6px', background: '#FAFAFA' }}>
                  <div>
                    <strong>服務型態：</strong>
                    [ {c?.service_type === 'NO' || !c?.service_type ? '✓' : ' '} ] 1.否　
                    [ {c?.service_type === 'SMIR_BUS' ? '✓' : ' '} ] 2.抹片車　
                    [ {c?.service_type === 'COMMUNITY' ? '✓' : ' '} ] 3.社區巡迴服務篩檢
                  </div>
                  <div>
                    <strong>給付類別：</strong>
                    [ {c?.payment_type === '1' || !c?.payment_type ? '✓' : ' '} ] 1.預防保健　
                    [ {c?.payment_type === '2' ? '✓' : ' '} ] 2.健保給付　
                    [ {c?.payment_type === '3' ? '✓' : ' '} ] 3.其他公務預算　
                    [ {c?.payment_type === '4' ? '✓' : ' '} ] 4.其他　
                    [ {c?.payment_type === '6' ? '✓' : ' '} ] 6.自費
                  </div>
                  <div>
                    <strong>難判重做：</strong>
                    [ {c?.is_recheck ? '✓' : ' '} ] 1.是　
                    [ {!c?.is_recheck ? '✓' : ' '} ] 2.否
                  </div>
                </div>

                {/* Section 1: 受檢者基本資料 */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '8.5pt', marginBottom: '6px' }}>
                  <tbody>
                    <tr style={{ background: '#F1F5F9' }}>
                      <th colSpan={4} style={{ border: '1px solid black', padding: '4px 6px', textAlign: 'left', fontWeight: 'bold' }}>
                        一、受檢者基本資料
                      </th>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '4px 6px', width: '22%' }}><strong>受檢者姓名：</strong>{p.name}</td>
                      <td style={{ border: '1px solid black', padding: '4px 6px', width: '28%' }}><strong>身分證字號：</strong>{p.id_card_no}</td>
                      <td style={{ border: '1px solid black', padding: '4px 6px', width: '28%' }}><strong>出生年月日：</strong>{getMinguoYear(p.birth_date)}</td>
                      <td style={{ border: '1px solid black', padding: '4px 6px', width: '22%' }}><strong>病歷號碼：</strong>{c?.chart_no || '—'}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '4px 6px' }}><strong>聯絡電話：</strong>{p.phone || p.mobile}</td>
                      <td colSpan={3} style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>通訊地址：</strong>{p.city}{p.district}{p.village}{p.road}{p.section_lane}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Section 2: 個案臨床資料 (個案自填) */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '8.5pt', marginBottom: '6px' }}>
                  <tbody>
                    <tr style={{ background: '#F1F5F9' }}>
                      <th colSpan={2} style={{ border: '1px solid black', padding: '4px 6px', textAlign: 'left', fontWeight: 'bold' }}>
                        二、個案臨床資料（個案自填）
                      </th>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>1. 前次抹片檢查時間：</strong>
                        [ {c?.last_smear_time === 'WITHIN_1Y' ? '✓' : ' '} ] 1.一年以內　
                        [ {c?.last_smear_time === '1_TO_2Y' ? '✓' : ' '} ] 2.一年以上未滿二年　
                        [ {c?.last_smear_time === '2_TO_3Y' ? '✓' : ' '} ] 3.二年以上未滿三年　
                        [ {c?.last_smear_time === 'OVER_3Y' ? '✓' : ' '} ] 4.三年以上　
                        [ {c?.last_smear_time === 'NEVER' ? '✓' : ' '} ] 5.未曾做過
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '4px 6px', width: '50%' }}>
                        <strong>2. 停經：</strong>
                        [ {c?.is_menopause === 'YES' ? '✓' : ' '} ] 1.是　
                        [ {c?.is_menopause === 'NO' ? '✓' : ' '} ] 2.否　
                        [ {c?.is_menopause === 'UNKNOWN' ? '✓' : ' '} ] 9.不詳
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px 6px', width: '50%' }}>
                        <strong>3. 最後一次月經：</strong>
                        {c?.last_menstrual_date ? getMinguoYear(c.last_menstrual_date) : (c?.is_menopause === 'YES' ? '已停經' : '—')}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>4. 懷孕：</strong>
                        [ {c?.is_pregnant === 'YES' ? '✓' : ' '} ] 1.是　
                        [ {c?.is_pregnant === 'NO' ? '✓' : ' '} ] 2.否　
                        [ {c?.is_pregnant === 'UNKNOWN' ? '✓' : ' '} ] 9.不詳
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>5. 子宮切除：</strong>
                        [ {c?.hysterectomy_status === 'YES' ? '✓' : ' '} ] 1.是　
                        [ {c?.hysterectomy_status === 'NO' ? '✓' : ' '} ] 2.否　
                        [ {c?.hysterectomy_status === 'UNKNOWN' ? '✓' : ' '} ] 9.不詳
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>6. 放射治療：</strong>
                        [ {c?.radiation_therapy === 'YES' ? '✓' : ' '} ] 1.是　
                        [ {c?.radiation_therapy === 'NO' ? '✓' : ' '} ] 2.否　
                        [ {c?.radiation_therapy === 'UNKNOWN' ? '✓' : ' '} ] 9.不詳
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>7. 接種人類乳突病毒 (HPV) 疫苗：</strong>
                        [ {c?.hpv_vaccine === 'YES' ? '✓' : ' '} ] 1.是 {c?.hpv_vaccine_year ? `(民國 ${parseInt(c.hpv_vaccine_year) - 1911} 年)` : ''}　
                        [ {c?.hpv_vaccine === 'NO' ? '✓' : ' '} ] 2.否　
                        [ {c?.hpv_vaccine === 'UNKNOWN' ? '✓' : ' '} ] 9.不詳
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Section 3: 抹片資料 (三之一採檢機構 / 三之二病理機構) */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '8.5pt', marginBottom: '6px' }}>
                  <tbody>
                    <tr style={{ background: '#F1F5F9' }}>
                      <th colSpan={2} style={{ border: '1px solid black', padding: '4px 6px', textAlign: 'left', fontWeight: 'bold' }}>
                        三之一、抹片資料（採檢機構填寫）
                      </th>
                      <th colSpan={2} style={{ border: '1px solid black', padding: '4px 6px', textAlign: 'left', fontWeight: 'bold' }}>
                        三之二、抹片資料（病理機構填寫）
                      </th>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '4px 6px', width: '25%' }}>
                        <strong>雙子宮頸：</strong>
                        [ {c?.double_cervix ? '✓' : ' '} ] 1.是　
                        [ {!c?.double_cervix ? '✓' : ' '} ] 2.否
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px 6px', width: '25%' }}>
                        <strong>採檢日期：</strong>
                        {getMinguoYear(c?.sampling_date || q.screening_date)}
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px 6px', width: '25%' }}>
                        <strong>病理編號：</strong>
                        {c?.pathology_no || 'CY-2026-0001'}
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px 6px', width: '25%' }}>
                        <strong>收到檢體日期：</strong>
                        {getMinguoYear(c?.received_date || q.screening_date)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>採檢醫療機構及代碼：</strong>
                        {c?.sampling_unit_name || '竹山秀傳醫療社團法人竹山秀傳醫院'} ({c?.sampling_unit_code || '0938040012'})
                      </td>
                      <td colSpan={2} style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>病理檢驗機構及代碼：</strong>
                        {c?.lab_unit_name || '竹山秀傳醫院 病理檢驗科'} ({c?.lab_unit_code || '0938040012'})
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>採檢人員：</strong>
                        {c?.sampler_name || '醫師'}
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>採檢人員職稱：</strong>
                        {c?.sampler_role === 'OBGYN_DOC' ? '1.婦產科專科醫師' : c?.sampler_role === 'FM_DOC' ? '2.家醫科專科醫師' : c?.sampler_role === 'MIDWIFE' ? '4.助產人員' : '5.衛生所醫師/護理人員'}
                      </td>
                      <td colSpan={2} style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>抹片種類：</strong>
                        [ {c?.specimen_type === 'CONVENTIONAL' || !c?.specimen_type ? '✓' : ' '} ] 1.常規抹片　
                        [ {c?.specimen_type === 'LBC' ? '✓' : ' '} ] 2.液體標本
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>抹片合併HPV檢驗：</strong>
                        [ {c?.combine_hpv ? '✓' : ' '} ] 1.是　
                        [ {!c?.combine_hpv ? '✓' : ' '} ] 2.否<br />
                        <strong>抹片目的：</strong>
                        [ {c?.smear_purpose === 'SCREENING' || !c?.smear_purpose ? '✓' : ' '} ] 1.篩檢　
                        [ {c?.smear_purpose === 'SUSPECT_CANCER' ? '✓' : ' '} ] 2.懷疑癌症　
                        [ {c?.smear_purpose === 'FOLLOWUP' ? '✓' : ' '} ] 3.異常追蹤　
                        [ {c?.smear_purpose === 'PREV_DIFFICULT' ? '✓' : ' '} ] 4.難判重做
                      </td>
                      <td colSpan={2} style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>骨盆腔自覺症狀/肉眼觀察：</strong>
                        <div>{c?.clinical_findings || '無異常發現'}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Section 4: 抹片判讀結果 (病理機構填寫) */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '8.5pt', marginBottom: '6px' }}>
                  <tbody>
                    <tr style={{ background: '#F1F5F9' }}>
                      <th colSpan={4} style={{ border: '1px solid black', padding: '4px 6px', textAlign: 'left', fontWeight: 'bold' }}>
                        四、抹片判讀結果（病理機構填寫）
                      </th>
                    </tr>
                    <tr>
                      <td colSpan={4} style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>1. 判讀方式：</strong>
                        [ {c?.reading_method === 'MANUAL' || !c?.reading_method ? '✓' : ' '} ] 1.人工閱片　
                        [ {c?.reading_method === 'AUTO' ? '✓' : ' '} ] 2.機械自動判讀　
                        [ {c?.reading_method === 'MANUAL_AUTO' ? '✓' : ' '} ] 3.人工與機械自動判讀
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>2. 抹片品質：</strong>
                        [ {c?.smear_quality === 'GOOD' || !c?.smear_quality ? '✓' : ' '} ] 1.良好，可供判讀　
                        [ {c?.smear_quality === 'SATISFACTORY' ? '✓' : ' '} ] 2.尚可，但因故影響判讀　
                        [ {c?.smear_quality === 'UNSATISFACTORY' ? '✓' : ' '} ] 3.難以判讀<br />
                        <span style={{ fontSize: '8pt', color: '#444' }}>
                          原因：
                          [ {c?.quality_reasons?.includes('Q1') ? '✓' : ' '} ] 1.鱗狀細胞少　
                          [ {c?.quality_reasons?.includes('Q2') ? '✓' : ' '} ] 2.無內管/轉化區　
                          [ {c?.quality_reasons?.includes('Q3') ? '✓' : ' '} ] 3.血液遮蓋　
                          [ {c?.quality_reasons?.includes('Q4') ? '✓' : ' '} ] 4.發炎遮蓋　
                          [ {c?.quality_reasons?.includes('Q5') ? '✓' : ' '} ] 5.固定不良　
                          [ {c?.quality_reasons?.includes('Q6') ? '✓' : ' '} ] 6.過厚重疊　
                          [ {c?.quality_reasons?.includes('Q7') ? '✓' : ' '} ] 7.其他
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>3. 感染病原體：</strong>
                        [ {c?.infections?.includes('1') ? '✓' : ' '} ] 1.念珠菌感染　
                        [ {c?.infections?.includes('2') ? '✓' : ' '} ] 2.陰道滴蟲　
                        [ {c?.infections?.includes('3') ? '✓' : ' '} ] 3.疱疹病毒　
                        [ {c?.infections?.includes('7') ? '✓' : ' '} ] 7.陰道桿菌菌群改變　
                        [ {c?.infections?.includes('8') ? '✓' : ' '} ] 8.放射線菌　
                        [ {c?.infections?.includes('6') ? '✓' : ' '} ] 6.其他病原體
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>4. 抹片細胞學診斷（The Bethesda System 2014）：</strong>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginTop: '4px', fontSize: '8pt' }}>
                          <div>[ {c?.cytology_diagnosis === '1' || !c?.cytology_diagnosis ? '✓' : ' '} ] <strong>① 正常或良性反應 (WNL)</strong></div>
                          <div>[ {c?.cytology_diagnosis === '2' ? '✓' : ' '} ] ② 反應性細胞變化 (Reactive)</div>
                          <div>[ {c?.cytology_diagnosis === '3' ? '✓' : ' '} ] ③ 萎縮性變化 (Atrophy)</div>
                          <div>[ {c?.cytology_diagnosis === '4' ? '✓' : ' '} ] <strong>④ ASC-US (意義未明)</strong></div>
                          <div>[ {c?.cytology_diagnosis === '16' ? '✓' : ' '} ] <strong>⑯ ASC-H (無法排除高度)</strong></div>
                          <div>[ {c?.cytology_diagnosis === '6' ? '✓' : ' '} ] <strong>⑥ LSIL (CIN1含koilocyte)</strong></div>
                          <div>[ {c?.cytology_diagnosis === '7' ? '✓' : ' '} ] <strong>⑦ LSIL (CIN1無koilocyte)</strong></div>
                          <div>[ {c?.cytology_diagnosis === '8' ? '✓' : ' '} ] <strong>⑧ HSIL (CIN2)</strong></div>
                          <div>[ {c?.cytology_diagnosis === '9' ? '✓' : ' '} ] <strong>⑨ HSIL (CIN3)</strong></div>
                          <div>[ {c?.cytology_diagnosis === '10' ? '✓' : ' '} ] <strong>⑩ 原位癌 (CIS)</strong></div>
                          <div>[ {c?.cytology_diagnosis === '11' ? '✓' : ' '} ] <strong>⑪ 鱗狀細胞癌 (SCC)</strong></div>
                          <div>[ {c?.cytology_diagnosis === '17' ? '✓' : ' '} ] <strong>⑰ Dysplasia cannot exclude HSIL</strong></div>
                          <div>[ {c?.cytology_diagnosis === '5' ? '✓' : ' '} ] <strong>⑤ AGC-NOS (非典型腺體)</strong></div>
                          <div>[ {c?.cytology_diagnosis === '15' ? '✓' : ' '} ] <strong>⑮ AGC favor neoplasm</strong></div>
                          <div>[ {c?.cytology_diagnosis === '18' ? '✓' : ' '} ] <strong>⑱ 原位腺癌 (AIS)</strong></div>
                          <div>[ {c?.cytology_diagnosis === '12' ? '✓' : ' '} ] <strong>⑫ 侵襲性腺癌 (Adeno.)</strong></div>
                          <div>[ {c?.cytology_diagnosis === '13' ? '✓' : ' '} ] <strong>⑬ 其他惡性腫瘤</strong></div>
                          <div>[ {c?.cytology_diagnosis === '14' ? '✓' : ' '} ] ⑭ 其他細胞學變化</div>
                        </div>
                        <div style={{ marginTop: '4px', fontSize: '8pt', color: '#555' }}>
                          40歲以上檢出良性子宮內膜細胞：
                          [ {c?.endometrial_cells_over_40 ? '✓' : ' '} ] 1.是　
                          [ {!c?.endometrial_cells_over_40 ? '✓' : ' '} ] 2.否
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} style={{ border: '1px solid black', padding: '4px 6px' }}>
                        <strong>5. 建議處置：</strong>
                        [ {c?.recommendations?.includes('REDO_DIFFICULT') ? '✓' : ' '} ] 1.抹片難以判讀，請重做抹片　
                        [ {c?.recommendations?.includes('TREAT_INFLAMMATION') ? '✓' : ' '} ] 2.請治療發炎，治療後三個月重做抹片　
                        [ {c?.recommendations?.includes('FURTHER_CHECK') ? '✓' : ' '} ] 3.抹片異常，請至醫療院所進一步檢查（陰道鏡/切片）　
                        [ {c?.recommendations?.includes('OTHER_REC') ? '✓' : ' '} ] 4.其他建議 {c?.recommendation_other ? `(${c.recommendation_other})` : ''}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ border: '1px solid black', padding: '6px' }}>
                        <div>細胞醫檢師簽章：<strong>{c?.cytotechnologist_name || '李雅婷 (CT0418)'}</strong></div>
                        <div style={{ marginTop: '4px' }}>病理專科醫師簽章：<strong>{c?.cytopathologist_name || '陳建宏 (P1088)'}</strong></div>
                      </td>
                      <td colSpan={2} style={{ border: '1px solid black', padding: '6px' }}>
                        <div>報告確定日期：{getMinguoYear(c?.confirmed_date || q.screening_date)}</div>
                        <div style={{ marginTop: '4px' }}>
                          受檢者數位簽章：
                          {q.patient_signature_url ? (
                            <img src={q.patient_signature_url} alt="受檢者數位簽署" style={{ height: '28px', verticalAlign: 'middle', marginLeft: '6px' }} />
                          ) : (
                            <span style={{ color: '#047857', fontWeight: 'bold' }}>✓ 數位親簽完成</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Lung Cancer Screening (LDCT) - 附件一之三 & 附件一之四 */}
            {isLung && (
              <div>
                {/* 附件一之三：個案同意書 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', color: '#333' }}>
                  <span>本檢查由衛生福利部國民健康署運用菸品健康福利捐/公務預算補助</span>
                  <span style={{ fontWeight: 700 }}>【附件一之三】</span>
                </div>

                <div style={{ textAlign: 'center', margin: '6px 0 10px' }}>
                  <h2 style={{ fontSize: '13pt', fontWeight: '900', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>
                    國民健康署胸部低劑量電腦斷層檢查服務 個案同意書
                  </h2>
                </div>

                {/* 狀況檢核清單 */}
                <div style={{ fontSize: '8.5pt', lineHeight: '1.5', border: '1px solid black', padding: '6px 8px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>我是否有下列任一狀況：</div>
                  <div>[ {l?.consent?.screened_past_2years ? '✓' : ' '} ] 有；[ {!l?.consent?.screened_past_2years ? '✓' : ' '} ] 無　我過去 2 年內（2 次篩檢年份差距小於 2）是否曾接受過本檢查服務？</div>
                  <div>[ {l?.consent?.is_pregnant ? '✓' : ' '} ] 有；[ {!l?.consent?.is_pregnant ? '✓' : ' '} ] 無　我目前有無懷孕？</div>
                  <div>[ {l?.consent?.had_chest_ct_past_12months ? '✓' : ' '} ] 有；[ {!l?.consent?.had_chest_ct_past_12months ? '✓' : ' '} ] 無　我過去 12 個月內有無接受過胸部電腦斷層檢查(含低劑量電腦斷層檢查)？</div>
                  <div>[ {l?.consent?.had_lung_cancer ? '✓' : ' '} ] 有；[ {!l?.consent?.had_lung_cancer ? '✓' : ' '} ] 無　我是否得過肺癌？</div>
                  <div>[ {l?.consent?.cannot_hold_breath ? '✓' : ' '} ] 有；[ {!l?.consent?.cannot_hold_breath ? '✓' : ' '} ] 無　我是否有無法閉氣等無法完成檢查程序之情形？</div>
                  <div>[ {l?.consent?.hemoptysis_past_month ? '✓' : ' '} ] 有；[ {!l?.consent?.hemoptysis_past_month ? '✓' : ' '} ] 無　我過去 1 個月內是否有不明原因之咳血，或明顯可疑肺癌病灶？</div>
                  <div>[ {l?.consent?.weight_loss_past_year ? '✓' : ' '} ] 有；[ {!l?.consent?.weight_loss_past_year ? '✓' : ' '} ] 無　我過去 1 年內是否有不明原因體重減輕超過 6 公斤？</div>
                  <div style={{ marginTop: '2px', fontWeight: 600 }}>
                    若有醫療上的需要，我 [ {l?.consent?.accept_biopsy_or_surgery === 'YES' ? '✓' : ' '} ] 可以；[ {l?.consent?.accept_biopsy_or_surgery === 'NO' ? '✓' : ' '} ] 不可以 接受胸腔穿刺或手術。
                  </div>
                </div>

                {/* 知情同意聲明與衛教 */}
                <div style={{ fontSize: '8pt', lineHeight: '1.45', border: '1px solid black', padding: '6px 8px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                    本人於觀看衛教資訊後，在醫事人員的輔助及解說下，確認已經知道胸部低劑量電腦斷層檢查之優缺點及可能風險，並同意下列事項：
                  </div>
                  <div>■ 我知道胸部低劑量電腦斷層檢查，對於重度吸菸者，可降低肺癌死亡率達 20% 以上，但對於非高風險者，其效益證據尚不明確。</div>
                  <div>■ 我知道胸部低劑量電腦斷層檢查可發現早期肺癌，但仍有部分肺癌無法有效偵測，且有新發肺癌的可能性，所以即使檢查結果正常，在下次定期檢查前，如有發現異狀，仍應儘速就醫。</div>
                  <div>■ 我知道接受檢查後發現結節比例約 2/3，但多數(約 95%)為良性，將配合醫師持續定期追蹤。惟屬高風險結節，將由胸腔科醫師評估確診。</div>
                  <div>■ 我知道本檢查不能預防肺癌發生，吸菸者不應將肺癌篩檢做為戒菸的替代選擇，若我有吸菸情形同意接受戒菸衛教。</div>
                  <div>■ 我知道本檢查每 2 年 1 次，若 2 年內曾接受本檢查或不符資格，同意自費負擔篩檢費用。</div>
                  <div>■ 我同意檢查後如疑似異常回診看報告；無顯著異常或惰性結節採寄送方式。同意將歷次CT影像上傳供跨院查詢比對及依法保密運用。</div>
                  <div style={{ marginTop: '4px', borderTop: '1px dashed #666', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>醫院對民眾進行衛教及知情同意人員：<u>{l?.consent?.educator_name || '張雅筑 個管師'}</u></span>
                    <span>[ {l?.consent?.checked_system_no_duplicate ? '✓' : ' '} ] 已至管理系統查詢民眾無2年內接受胸部LDCT檢查</span>
                  </div>
                </div>

                {/* 分隔線 (附件一之四開始) */}
                <div style={{ borderTop: '2px solid black', margin: '8px 0 6px', paddingTop: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', color: '#333' }}>
                    <span>115 年 1 月 1 日版</span>
                    <span style={{ fontWeight: 700 }}>【附件一之四】</span>
                  </div>

                  <div style={{ textAlign: 'center', margin: '4px 0 8px' }}>
                    <h2 style={{ fontSize: '13pt', fontWeight: '900', letterSpacing: '0.05em', margin: '0' }}>
                      國民健康署胸部低劑量電腦斷層檢查服務 檢查紀錄結果表單
                    </h2>
                  </div>

                  <div style={{ fontSize: '8.5pt', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div>
                      支付方式：[ {q.payment_type === '預防保健' ? '✓' : ' '} ] 預防保健　[ {q.payment_type === '健保醫療給付' ? '✓' : ' '} ] 健保醫療給付　[ {q.payment_type === '其他公務預算補助' ? '✓' : ' '} ] 其他公務預算補助　[ {q.payment_type === '自費健康檢查' ? '✓' : ' '} ] 自費
                    </div>
                    <div>病歷號：<strong>{p.chart_no || '---'}</strong></div>
                  </div>
                </div>

                {/* 表格：個人基本資料 & 個案臨床資料 */}
                <table className="print-table" style={{ fontSize: '8pt', width: '100%' }}>
                  <tbody>
                    <tr>
                      <td colSpan={6} style={{ background: '#f1f5f9', fontWeight: 700, padding: '3px 6px' }}>
                        個人基本資料（受檢者填寫）
                      </td>
                    </tr>
                    <tr>
                      <td style={{ width: '12%', fontWeight: 700 }}>姓名</td>
                      <td style={{ width: '22%' }}><strong>{p.name}</strong></td>
                      <td style={{ width: '10%', fontWeight: 700 }}>性別</td>
                      <td style={{ width: '16%' }}>{p.gender === 'M' ? '男' : '女'}</td>
                      <td style={{ width: '18%', fontWeight: 700 }}>身分證/統一證號</td>
                      <td style={{ width: '22%' }}><strong>{p.id_card_no}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>出生日期</td>
                      <td>{getMinguoYear(p.birth_date)}</td>
                      <td style={{ fontWeight: 700 }}>聯絡資訊</td>
                      <td colSpan={3}>
                        電話：{p.phone || '無'}　手機：<strong>{p.mobile}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>現居住地址</td>
                      <td colSpan={5}>
                        {p.city}{p.district}{p.village}{p.road}{p.section_lane}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={6} style={{ background: '#f1f5f9', fontWeight: 700, padding: '3px 6px' }}>
                        個案臨床資料（建議由醫院詢問受檢者後填寫）
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>教育程度</td>
                      <td colSpan={2}>{p.education_level || '高中/高職'}</td>
                      <td style={{ fontWeight: 700 }}>體位資訊</td>
                      <td colSpan={2}>
                        身高：<strong>{l?.height_cm || '--'}</strong> 公分；體重：<strong>{l?.weight_kg || '--'}</strong> 公斤 (BMI: {l?.bmi || '--'} kg/m²)
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>肺部疾病史</td>
                      <td colSpan={5}>
                        [ {l?.pulmonary_disease_history?.copd ? '✓' : ' '} ] 肺阻塞(COPD)　
                        [ {l?.pulmonary_disease_history?.tb ? '✓' : ' '} ] 肺結核(TB)　
                        [ {l?.pulmonary_disease_history?.pneumonia ? '✓' : ' '} ] 肺炎　
                        [ {l?.pulmonary_disease_history?.chronic_bronchitis ? '✓' : ' '} ] 慢性支氣管炎　
                        [ {l?.pulmonary_disease_history?.pneumoconiosis ? '✓' : ' '} ] 塵肺症　
                        [ {l?.pulmonary_disease_history?.emphysema ? '✓' : ' '} ] 肺氣腫　
                        [ {l?.pulmonary_disease_history?.ipf ? '✓' : ' '} ] 特發性肺纖維化　
                        [ {l?.pulmonary_disease_history?.none ? '✓' : ' '} ] 無以上疾病
                        {l?.pulmonary_disease_history?.exception_declared && (
                          <div style={{ color: '#be123c', marginTop: '2px' }}>
                            ✓ 具疑似肺癌排除狀況，但已檢附專科醫師診斷評估結果並簽具聲明書【附件一之七】。
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>家族史</td>
                      <td colSpan={5}>
                        父母、子女或兄弟姊妹肺癌病史：
                        [ {!l?.family_history?.has_family_history ? '✓' : ' '} ] 無　
                        [ {l?.family_history?.has_family_history ? '✓' : ' '} ] 有 (共 <u>{l?.family_history?.total_affected_count || 0}</u> 人)
                        {l?.family_history?.has_family_history && (
                          <div style={{ marginTop: '3px' }}>
                            父親: {l?.family_history?.details?.father?.affectedCount || 0}人 ({l?.family_history?.details?.father?.diagnosedAgeMin ? `${l.family_history.details.father.diagnosedAgeMin}歲` : '-'}) | 
                            母親: {l?.family_history?.details?.mother?.affectedCount || 0}人 ({l?.family_history?.details?.mother?.diagnosedAgeMin ? `${l.family_history.details.mother.diagnosedAgeMin}歲` : '-'}) | 
                            兄弟: {l?.family_history?.details?.brother?.affectedCount || 0}人 | 
                            姊妹: {l?.family_history?.details?.sister?.affectedCount || 0}人
                            <br />
                            聲明或證明家屬姓名：<u>{l?.family_history?.proof_relative_name || '---'}</u>，出生：<u>{l?.family_history?.proof_relative_birth || '---'}</u>，身分證字號：<u>{l?.family_history?.proof_relative_id || '---'}</u>
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>吸菸史及二手菸</td>
                      <td colSpan={5}>
                        一氧化碳檢測值：<strong>{l?.smoking_history?.co_reading_ppm ?? '--'}</strong> ppm　
                        [ {l?.smoking_history?.has_smoking_history ? '✓' : ' '} ] 有吸菸史：每天抽 <u>{l?.smoking_history?.packs_per_day || 0}</u> 包 × 抽菸 <u>{l?.smoking_history?.smoking_years || 0}</u> 年 ＝ <strong>{l?.smoking_history?.pack_years || 0}</strong> 包-年
                        <br />
                        是否已戒菸：[ {l?.smoking_history?.is_quit ? '✓' : ' '} ] 已戒菸 (自民國 <u>{l?.smoking_history?.quit_year_minguo || '--'}</u> 年)　[ {!l?.smoking_history?.is_quit && l?.smoking_history?.has_smoking_history ? '✓' : ' '} ] 否，目前仍吸菸
                        <br />
                        [ {l?.smoking_history?.secondhand_smoke_exposure ? '✓' : ' '} ] 有二手菸暴露 (每週至少1天吸入菸霧15分以上)　
                        [ {l?.smoking_history?.no_smoke_and_no_secondhand ? '✓' : ' '} ] 無吸菸也無二手菸暴露
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>油煙與職業</td>
                      <td colSpan={5}>
                        油煙：煮食 <u>{l?.oil_smoke?.cooking_years || 0}</u> 年 (每週煎: {l?.oil_smoke?.fried_days_per_week || 0}天, 炒: {l?.oil_smoke?.stir_fry_days_per_week || 0}天, 炸: {l?.oil_smoke?.deep_fry_days_per_week || 0}天, 排油煙機: {l?.oil_smoke?.use_range_hood ? '有' : '無'})
                        <br />
                        職業暴露：
                        [ {l?.occupational_exposure?.asbestos ? '✓' : ' '} ] 石綿　
                        [ {l?.occupational_exposure?.heavy_metals_coal ? '✓' : ' '} ] 重金屬/煤/焊接　
                        [ {l?.occupational_exposure?.dust_cotton ? '✓' : ' '} ] 粉塵棉絮　
                        [ {l?.occupational_exposure?.radiation_environment ? '✓' : ' '} ] 放射環境　
                        [ {l?.occupational_exposure?.temple_incense ? '✓' : ' '} ] 廟宇燒香　
                        [ {l?.occupational_exposure?.none ? '✓' : ' '} ] 無
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={6} style={{ background: '#f1f5f9', fontWeight: 700, padding: '3px 6px' }}>
                        檢查結果（攝影醫院/放射科與胸腔專科醫師填寫）
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>攝影醫院與儀器</td>
                      <td colSpan={3}>
                        醫院：{l?.result?.imaging_hospital_name || '竹山秀傳醫院'}　設備：{l?.result?.ct_machine_register_no || 'GE Revolution 128切'}
                      </td>
                      <td style={{ fontWeight: 700 }}>放射師/攝影日</td>
                      <td>
                        {l?.result?.radiologic_technologist || '王銘憲 (RT0298)'} / {getMinguoYear(l?.result?.scan_date || q.screening_date)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>品質與劑量</td>
                      <td colSpan={5}>
                        LDCT Quality: <strong>{l?.result?.ldct_quality || 'Good'}</strong>　
                        CTDIvol: <strong>{l?.result?.ctdivol_mgy || '2.1'}</strong> mGy (≤ 3mGy)　
                        Total DLP: <strong>{l?.result?.total_dlp_mgy_cm || '75.6'}</strong> mGy*cm　
                        前片比對：{l?.result?.prior_ct_comparison === 'HAS_PRIOR' ? `有 (前片日: ${l.result.prior_ct_date})` : 'No prior CT available'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>肺結節發現</td>
                      <td colSpan={5}>
                        [ {l?.result?.has_no_lung_nodule ? '✓' : ' '} ] No lung nodule　
                        [ {l?.result?.has_benign_features ? '✓' : ' '} ] Nodule with benign features　
                        [ {l?.result?.lung_nodules_under_6mm ? '✓' : ' '} ] &lt;6mm 結節　
                        [ {l?.result?.juxtapleural_nodule ? '✓' : ' '} ] 肋膜旁結節　
                        [ {l?.result?.lung_nodules_over_6mm ? '✓' : ' '} ] <strong>≥6mm 結節 (共 {l?.result?.over_6mm_total_number || '1'} 顆)</strong>
                        {l?.result?.nodule_1 && (
                          <div style={{ marginTop: '2px', background: '#fff', border: '1px solid #cbd5e1', padding: '3px 6px', borderRadius: '4px' }}>
                            <strong>結節 1:</strong> 大小 <strong>{l.result.nodule_1.entire_size_mm} mm</strong>，質地: {l.result.nodule_1.density} (實質成分: {l.result.nodule_1.solid_part_size_mm || '-'} mm)，部位: <strong>{l.result.nodule_1.lobe}</strong> (SE:{l.result.nodule_1.se}, IM:{l.result.nodule_1.im})，比對: {l.result.nodule_1.comparison}
                          </div>
                        )}
                        <div style={{ marginTop: '2px', fontSize: '7.5pt', color: '#475569' }}>
                          其他胸部發現：
                          [ {l?.result?.other_lung_findings?.emphysema ? '✓' : ' '} ] 肺氣腫　
                          [ {l?.result?.other_findings?.coronary_artery_calcification ? '✓' : ' '} ] 冠狀動脈鈣化　
                          [ {l?.result?.other_findings?.enlarged_lymph_nodes ? '✓' : ' '} ] 淋巴腫大
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, background: '#fef2f2' }}>總體分級與處置</td>
                      <td colSpan={5} style={{ background: '#fef2f2' }}>
                        <div style={{ fontSize: '9pt', fontWeight: 800, color: ['4A', '4B', '4X'].includes(l?.result?.lung_rads_category || '') ? '#dc2626' : '#0369a1' }}>
                          Lung-RADS v2022 分級：Category {l?.result?.lung_rads_category || '1'}
                          {l?.result?.modifier_s ? ' (Modifier S: 具有臨床意義之肺癌無關發現)' : ''}
                        </div>
                        <div style={{ marginTop: '2px', fontSize: '8pt' }}>
                          臨床建議：<strong>{l?.result?.referral_needed ? '【需轉介 / 請至胸腔科門診確診】' : '常規追蹤'}</strong> - {l?.result?.notes || '無特殊備註'}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ border: '1px solid black', padding: '6px' }}>
                        <div>判讀專科醫師：<strong>{l?.result?.interpretation_doctor || '林博仁 醫師 (胸腔專科 R0388)'}</strong></div>
                        <div style={{ marginTop: '4px' }}>判讀確定日期：{getMinguoYear(l?.result?.interpretation_date || q.screening_date)}</div>
                      </td>
                      <td colSpan={3} style={{ border: '1px solid black', padding: '6px' }}>
                        <div>
                          受檢者親筆簽章：
                          {q.patient_signature_url ? (
                            <img src={q.patient_signature_url} alt="受檢者數位簽署" style={{ height: '32px', verticalAlign: 'middle', marginLeft: '6px' }} />
                          ) : (
                            <span style={{ color: '#047857', fontWeight: 'bold' }}>✓ 數位親簽完成</span>
                          )}
                        </div>
                        <div style={{ marginTop: '4px' }}>簽署日期：{getMinguoYear(q.screening_date)}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. BREAST CANCER SCREENING A4公版: 附表四之四 (114年1月修訂) */}
            {isBreast && (
              <div>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11pt', fontWeight: 'bold', letterSpacing: '1px' }}>
                    衛生福利部國民健康署　婦女乳房 X 光攝影檢查服務檢查紀錄結果表單
                  </div>
                  <div style={{ fontSize: '8pt', color: '#475569', marginTop: '2px' }}>
                    【附表四之四】(114年1月修訂) ‧ 竹山秀傳醫院公費篩檢專用
                  </div>
                </div>

                {/* Main Table */}
                <table className="a4-table" style={{ width: '100%', fontSize: '8pt', borderCollapse: 'collapse', border: '1.5px solid black' }}>
                  <tbody>
                    {/* Row 1: Hospital & Van Info */}
                    <tr style={{ background: '#f8fafc' }}>
                      <td style={{ width: '14%', fontWeight: 700 }}>醫療院所代號</td>
                      <td style={{ width: '20%' }}>{b?.sampling_unit_code || '0938040012'}</td>
                      <td style={{ width: '14%', fontWeight: 700 }}>院所名稱</td>
                      <td style={{ width: '22%' }}>{b?.sampling_unit || '竹山秀傳醫療社團法人竹山秀傳醫院'}</td>
                      <td style={{ width: '14%', fontWeight: 700 }}>檢查日期/巡迴車</td>
                      <td style={{ width: '16%' }}>
                        {getMinguoYear(b?.clinic_date || q.screening_date)}<br />
                        {b?.screening_van ? `巡迴車: ${b.van_plate_number || '有'}` : '院內檢查'}
                      </td>
                    </tr>

                    {/* Row 2: Patient Info */}
                    <tr>
                      <td style={{ fontWeight: 700 }}>受檢者姓名</td>
                      <td><strong>{p.name}</strong></td>
                      <td style={{ fontWeight: 700 }}>身分證字號</td>
                      <td><strong>{p.id_card_no}</strong></td>
                      <td style={{ fontWeight: 700 }}>出生日期/年齡</td>
                      <td>{getMinguoYear(p.birth_date)} (女)</td>
                    </tr>

                    {/* Row 3: Contacts & Address */}
                    <tr>
                      <td style={{ fontWeight: 700 }}>聯絡電話</td>
                      <td>{p.mobile || p.phone}</td>
                      <td style={{ fontWeight: 700 }}>戶籍/通訊地址</td>
                      <td colSpan={3}>
                        ({p.zip_code}) {p.city}{p.district}{p.village}{p.road}{p.section_lane}
                      </td>
                    </tr>

                    {/* Section 1: Disease History & Family History */}
                    <tr>
                      <td style={{ fontWeight: 700, background: '#f1f5f9' }}>個人疾病史</td>
                      <td colSpan={2}>
                        乳癌史：{b?.disease_history?.breast_cancer ? `有 (右:${b.disease_history.breast_cancer_right ? '✓' : 'x'} 左:${b.disease_history.breast_cancer_left ? '✓' : 'x'})` : '無'}<br />
                        其他癌症：{b?.disease_history?.other_cancer ? `有 (${b.disease_history.other_cancer_detail || '註記'})` : '無'}<br />
                        良性乳房病史：{b?.disease_history?.breast_benign_disease ? (
                          [
                            b.disease_history.benign_fibroadenoma && '纖維腺瘤',
                            b.disease_history.benign_fibrocystic && '纖維囊腫',
                            b.disease_history.benign_hyperplasia && '上皮增生',
                            b.disease_history.benign_other && `其他(${b.disease_history.benign_other_detail || ''})`,
                            b.disease_history.benign_unknown && '不知道'
                          ].filter(Boolean).join('、') || '有'
                        ) : '無'}
                      </td>
                      <td style={{ fontWeight: 700, background: '#f1f5f9' }}>血親乳癌家族史</td>
                      <td colSpan={2}>
                        {b?.family_history?.has_breast_cancer ? (
                          <div>
                            {b.family_history.mother && <div>‧ 母親 (罹患年齡: {b.family_history.mother_diagnosed_age || '-'}歲)</div>}
                            {b.family_history.sister && <div>‧ 姊妹 (罹患年齡: {b.family_history.sister_diagnosed_age || '-'}歲)</div>}
                            {b.family_history.daughter && <div>‧ 女兒 (罹患年齡: {b.family_history.daughter_diagnosed_age || '-'}歲)</div>}
                            {b.family_history.grandmother && <div>‧ 祖母 (罹患年齡: {b.family_history.grandmother_diagnosed_age || '-'}歲)</div>}
                            {b.family_history.maternal_grandmother && <div>‧ 外祖母 (罹患年齡: {b.family_history.maternal_grandmother_diagnosed_age || '-'}歲)</div>}
                            {b.family_history.other_relative && <div>‧ {b.family_history.other_relative_relation || '其他血親'} ({b.family_history.other_relative_diagnosed_age || '-'}歲)</div>}
                          </div>
                        ) : '無血親乳癌家族史'}
                      </td>
                    </tr>

                    {/* Section 2: Menstruation & Reproductive */}
                    <tr>
                      <td style={{ fontWeight: 700, background: '#f1f5f9' }}>月經與生育史</td>
                      <td colSpan={2}>
                        初經年齡：{b?.menstruation_history?.menarche_age ? `${b.menstruation_history.menarche_age} 歲` : '未詳'}<br />
                        停經狀態：{b?.menstruation_history?.menopause_status || '自然停經'}
                        {b?.menstruation_history?.menopause_age ? ` (停經年齡: ${b.menstruation_history.menopause_age}歲)` : ''}
                        {b?.menstruation_history?.last_menstrual_period_date ? ` (LMP: ${b.menstruation_history.last_menstrual_period_date})` : ''}<br />
                        生產史：{b?.reproductive_history?.has_given_birth ? `有 (首胎: ${b.reproductive_history.first_birth_age || '-'}歲)` : '無'}<br />
                        母乳哺育：{b?.reproductive_history?.has_breastfed ? `有 (${b.reproductive_history.breastfeeding_duration_months || '-'}個月)` : '無'}
                      </td>
                      <td style={{ fontWeight: 700, background: '#f1f5f9' }}>用藥與手術史</td>
                      <td colSpan={2}>
                        荷爾蒙補充：{b?.medication_history?.has_used_hormone_replacement ? `曾使用 (${b.medication_history.hormone_duration_months || '-'}月${b.medication_history.is_currently_using_hormone ? '，目前仍使用' : ''})` : '否'}<br />
                        口服避孕藥：{b?.medication_history?.has_used_oral_contraceptives ? `曾使用 (${b.medication_history.contraceptive_duration_months || '-'}月)` : '否'}<br />
                        手術史：{b?.surgery_history?.has_surgery ? (
                          [
                            (b.surgery_history.biopsy_right || b.surgery_history.biopsy_left) && `切片(${b.surgery_history.biopsy_year || ''})`,
                            (b.surgery_history.lumpectomy_right || b.surgery_history.lumpectomy_left) && `局部切除(${b.surgery_history.lumpectomy_year || ''})`,
                            (b.surgery_history.mastectomy_right || b.surgery_history.mastectomy_left) && `全切除(${b.surgery_history.mastectomy_year || ''})`,
                            (b.surgery_history.reconstruction_right || b.surgery_history.reconstruction_left) && `重建(${b.surgery_history.reconstruction_year || ''})`,
                            (b.surgery_history.augmentation_right || b.surgery_history.augmentation_left) && `隆乳(${b.surgery_history.augmentation_year || ''})`
                          ].filter(Boolean).join('、') || '有手術史'
                        ) : '無手術史'}
                      </td>
                    </tr>

                    {/* Section 3: Self-reported Symptoms & Anatomy Quadrants */}
                    <tr>
                      <td style={{ fontWeight: 700, background: '#fff1f2' }}>自覺症狀與部位</td>
                      <td colSpan={5}>
                        自覺症狀：{b?.breast_symptoms?.has_symptoms ? (
                          <span>
                            {b.breast_symptoms.mass_tender_right && '【右乳硬塊/壓痛】 '}
                            {b.breast_symptoms.mass_tender_left && '【左乳硬塊/壓痛】 '}
                            {b.breast_symptoms.nipple_discharge_right && '【右乳頭分泌物】 '}
                            {b.breast_symptoms.nipple_discharge_left && '【左乳頭分泌物】 '}
                            {b.breast_symptoms.other_symptom && `【其他: ${b.breast_symptoms.other_symptom_detail || ''}】 `}
                          </span>
                        ) : '無自覺異常症狀'}
                        <div style={{ marginTop: '3px', fontSize: '7.5pt', color: '#475569' }}>
                          解剖象限標記：
                          右乳 [
                            {b?.breast_symptoms?.lesion_location?.right_outer_upper ? ' 外上(UO) ' : ''}
                            {b?.breast_symptoms?.lesion_location?.right_inner_upper ? ' 內上(UI) ' : ''}
                            {b?.breast_symptoms?.lesion_location?.right_outer_lower ? ' 外下(LO) ' : ''}
                            {b?.breast_symptoms?.lesion_location?.right_inner_lower ? ' 內下(LI) ' : ''}
                            {b?.breast_symptoms?.lesion_location?.right_areola ? ' 乳暈 ' : ''}
                            {!Object.values(b?.breast_symptoms?.lesion_location || {}).some(Boolean) ? ' 無標記 ' : ''}
                          ] ； 左乳 [
                            {b?.breast_symptoms?.lesion_location?.left_outer_upper ? ' 外上(UO) ' : ''}
                            {b?.breast_symptoms?.lesion_location?.left_inner_upper ? ' 內上(UI) ' : ''}
                            {b?.breast_symptoms?.lesion_location?.left_outer_lower ? ' 外下(LO) ' : ''}
                            {b?.breast_symptoms?.lesion_location?.left_inner_lower ? ' 內下(LI) ' : ''}
                            {b?.breast_symptoms?.lesion_location?.left_areola ? ' 乳暈 ' : ''}
                            {!Object.values(b?.breast_symptoms?.lesion_location || {}).some(Boolean) ? ' 無標記 ' : ''}
                          ]
                        </div>
                      </td>
                    </tr>

                    {/* Section 4: Radiology Quality & Findings */}
                    <tr>
                      <td style={{ fontWeight: 700, background: '#f8fafc' }}>攝影與觸診</td>
                      <td colSpan={2}>
                        機型種類：<strong>{b?.result?.machine_type || 'DR'}</strong>　
                        舊片比對：{b?.result?.prior_film_comparison || '無舊片可比對'}
                      </td>
                      <td style={{ fontWeight: 700, background: '#f8fafc' }}>乳腺組成與觸診</td>
                      <td colSpan={2}>
                        乳腺密度：<strong>Type {b?.result?.breast_density || 'c'}</strong> ({
                          b?.result?.breast_density === 'a' ? '脂肪型 <25%' :
                          b?.result?.breast_density === 'b' ? '散在纖維 25-50%' :
                          b?.result?.breast_density === 'c' ? '不均勻緻密 51-75%' : '極度緻密 >75%'
                        })<br />
                        門診觸診：{b?.result?.palpation_result || '未觸摸到硬塊'}
                      </td>
                    </tr>

                    {/* Section 5: BI-RADS & Final Assessment */}
                    <tr>
                      <td style={{ fontWeight: 700, background: '#fdf2f8' }}>總評估與處置</td>
                      <td colSpan={5} style={{ background: '#fdf2f8' }}>
                        <div style={{ fontSize: '9pt', fontWeight: 800, color: ['0', '3', '4', '4A', '4B', '4C', '5'].includes(b?.result?.birads_category || '') ? '#be123c' : '#059669' }}>
                          BI-RADS 評級結果：Category {b?.result?.birads_category || '1'}
                          {b?.result?.referral_needed ? ' 【需轉介 / 列入陽性追蹤】' : ' (常規篩檢)'}
                        </div>
                        <div style={{ marginTop: '2px', fontSize: '8pt' }}>
                          影像發現：{b?.result?.assessment_finding || '兩側乳房乳腺實質對稱，無顯著腫塊、微小鈣化或結構扭曲'}<br />
                          處置建議：<strong>{b?.result?.recommendation || '定期每2年接受一次乳房X光攝影檢查'}</strong>
                        </div>
                      </td>
                    </tr>

                    {/* Section 6: Staff & Patient Signatures */}
                    <tr>
                      <td colSpan={3} style={{ border: '1px solid black', padding: '6px' }}>
                        <div>判讀專科醫師：<strong>{b?.result?.radiology_physician || '王立德 醫師 (放射診斷專科 #4128)'}</strong></div>
                        <div style={{ marginTop: '2px' }}>醫事放射師：{b?.result?.radiologic_technologist || '張慈芬 醫事放射師 (#2091)'}</div>
                        <div style={{ marginTop: '2px' }}>報告完成日期：{getMinguoYear(b?.result?.report_date || q.screening_date)}</div>
                      </td>
                      <td colSpan={3} style={{ border: '1px solid black', padding: '6px' }}>
                        <div>
                          受檢婦女親筆簽章：
                          {q.patient_signature_url ? (
                            <img src={q.patient_signature_url} alt="受檢者數位簽署" style={{ height: '32px', verticalAlign: 'middle', marginLeft: '6px' }} />
                          ) : (
                            <span style={{ color: '#059669', fontWeight: 'bold' }}>✓ 數位親簽完成</span>
                          )}
                        </div>
                        <div style={{ marginTop: '4px' }}>簽署日期：{getMinguoYear(q.screening_date)}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '8pt', color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: '6px' }}>
              <span>表單系統識別號：#{q.questionnaire_id}</span>
              <span>SHA-256 數位簽章防偽認證已封存</span>
              <span>第 1 頁 / 共 1 頁</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
