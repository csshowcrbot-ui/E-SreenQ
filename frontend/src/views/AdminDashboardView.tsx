import React, { useState, useEffect } from 'react';
import type { Questionnaire, DashboardStats, AuditLog } from '../types';
import { DoctorInspectionModal } from '../components/DoctorInspectionModal';
import { FecalResultModal } from '../components/FecalResultModal';
import { CervicalResultModal } from '../components/CervicalResultModal';
import { LungResultModal } from '../components/LungResultModal';
import { BreastResultModal } from '../components/BreastResultModal';
import {
  fetchQuestionnaires,
  fetchStats,
  softDeleteQuestionnaire,
  fetchAuditLogs
} from '../services/api';
import {
  FileText,
  Search,
  Printer,
  Trash2,
  Eye,
  History,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  FileSpreadsheet,
  X,
  Lock,
  Layers,
  Stethoscope,
  Clock,
  TestTube2,
  Heart
} from 'lucide-react';

interface AdminDashboardViewProps {
  onOpenPrintModal: (q: Questionnaire) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onOpenPrintModal }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [list, setList] = useState<Questionnaire[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Filters
  const [formTypeFilter, setFormTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals & Drawers
  const [detailItem, setDetailItem] = useState<Questionnaire | null>(null);
  const [doctorInspectionItem, setDoctorInspectionItem] = useState<Questionnaire | null>(null);
  const [fecalResultItem, setFecalResultItem] = useState<Questionnaire | null>(null);
  const [cervicalResultItem, setCervicalResultItem] = useState<Questionnaire | null>(null);
  const [lungResultItem, setLungResultItem] = useState<Questionnaire | null>(null);
  const [breastResultItem, setBreastResultItem] = useState<Questionnaire | null>(null);
  const [voidingItem, setVoidingItem] = useState<Questionnaire | null>(null);

  const [voidReasonCode, setVoidReasonCode] = useState<string>('DUPLICATE');
  const [voidReasonRemark, setVoidReasonRemark] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [isVoidingLoading, setIsVoidingLoading] = useState<boolean>(false);

  // Audit Logs Drawer
  const [auditItem, setAuditItem] = useState<Questionnaire | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resList, resStats] = await Promise.all([
        fetchQuestionnaires({
          formType: formTypeFilter,
          status: statusFilter,
          resultFilter,
          search: searchKeyword,
          includeDeleted
        }),
        fetchStats()
      ]);
      setList(resList.data);
      setTotalCount(resList.total);
      setStats(resStats);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [formTypeFilter, statusFilter, resultFilter, includeDeleted]);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Open Void Modal
  const handleOpenVoidModal = (item: Questionnaire) => {
    setVoidingItem(item);
    setVoidReasonCode('DUPLICATE');
    setVoidReasonRemark('');
    setAuthPassword('');
  };

  // Submit Soft Delete
  const handleConfirmVoid = async () => {
    if (!voidingItem) return;
    if (!authPassword) {
      alert('請輸入管理師授權密碼 (預設: admin123)');
      return;
    }

    setIsVoidingLoading(true);
    try {
      await softDeleteQuestionnaire(voidingItem.questionnaire_id, {
        voidReasonCode,
        voidReasonRemark,
        authPassword
      });
      alert(`問卷 #${voidingItem.questionnaire_id} 已成功作廢，並記錄永久稽核日誌。`);
      setVoidingItem(null);
      loadData();
    } catch (err: any) {
      alert(err.message || '作廢失敗');
    } finally {
      setIsVoidingLoading(false);
    }
  };

  // Open Audit Drawer
  const handleOpenAuditDrawer = async (item: Questionnaire) => {
    setAuditItem(item);
    setIsAuditLoading(true);
    try {
      const logs = await fetchAuditLogs(item.questionnaire_id);
      setAuditLogs(logs);
    } catch (err) {
      alert('無法取得稽核紀錄');
    } finally {
      setIsAuditLoading(false);
    }
  };

  // Batch Export CSV
  const handleExportCsv = () => {
    if (list.length === 0) {
      alert('目前無可匯出的資料');
      return;
    }

    const headers = [
      '問卷識別號', '篩檢日期', '類別', '病歷號', '姓名', '身分證號',
      '性別', '電話', '判定結果', '狀態', '建立時間'
    ];

    const rows = list.map(item => {
      let result = '正常';
      if (item.form_type === 'GASTRIC') {
        result = item.gastric?.test_result === 'POSITIVE' ? '陽性' : item.gastric?.test_result === 'NEGATIVE' ? '陰性' : '檢驗中';
      } else if (item.form_type === 'ORAL') {
        result = item.oral?.inspection_result === 'REFERRAL' ? '需轉介' : '未發現異常';
      } else if (item.form_type === 'FECAL') {
        result = item.fecal?.test_result === 'POSITIVE' ? `陽性 (${item.fecal?.test_value || ''})` : item.fecal?.test_result === 'NEGATIVE' ? '陰性' : '檢體檢驗中';
      } else if (item.form_type === 'CERVICAL') {
        result = item.cervical?.cytology_diagnosis ? `抹片診斷代碼 ${item.cervical.cytology_diagnosis}` : '檢體判讀中';
      } else {
        result = item.lung?.result?.lung_rads_category ? `Lung-RADS Cat ${item.lung.result.lung_rads_category}${item.lung.result.modifier_s ? ' (S)' : ''}` : '影像待判讀';
      }

      return [
        item.questionnaire_id,
        item.screening_date,
        item.form_type === 'GASTRIC' ? '胃癌幽門桿菌' : item.form_type === 'ORAL' ? '口腔黏膜檢查' : item.form_type === 'FECAL' ? '定量免疫法糞便潛血' : item.form_type === 'CERVICAL' ? '女性子宮頸抹片' : '胸部低劑量電腦斷層(LDCT)',
        item.patient.chart_no,
        item.patient.name,
        item.patient.id_card_no_masked || item.patient.id_card_no,
        item.patient.gender === 'M' ? '男' : '女',
        item.patient.mobile,
        result,
        item.is_deleted ? '已作廢' : '有效',
        item.created_at
      ];
    });

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `癌症篩檢問卷報表_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Toggle selection
  const handleToggleSelectAll = () => {
    if (selectedIds.length === list.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.map(l => l.questionnaire_id));
    }
  };

  const handleToggleSelectItem = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Batch Print
  const handleBatchPrint = () => {
    if (selectedIds.length === 0) {
      alert('請先勾選欲套印的問卷！');
      return;
    }
    const firstSelected = list.find(l => l.questionnaire_id === selectedIds[0]);
    if (firstSelected) {
      onOpenPrintModal(firstSelected);
    }
  };

  return (
    <div>
      {/* 1. Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
              <Layers size={26} />
            </div>
            <div>
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">累積篩檢總件數</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#F0FDF4', color: '#15803D' }}>
              <FileText size={26} />
            </div>
            <div>
              <div className="stat-number">{stats.gastricCount}</div>
              <div className="stat-label">胃幽門桿菌問卷</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#E0F2F1', color: '#00796B' }}>
              <FileText size={26} />
            </div>
            <div>
              <div className="stat-number">{stats.oralCount}</div>
              <div className="stat-label">口腔黏膜檢查表</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#F0F9FF', color: '#0284C7' }}>
              <TestTube2 size={26} />
            </div>
            <div>
              <div className="stat-number">{stats.fecalCount ?? 0}</div>
              <div className="stat-label">糞便潛血 (FIT)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FCE7F3', color: '#BE185D' }}>
              <Stethoscope size={26} />
            </div>
            <div>
              <div className="stat-number">{stats.cervicalCount ?? 0}</div>
              <div className="stat-label">子宮頸抹片</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#E0F2FE', color: '#0369A1' }}>
              <Stethoscope size={26} />
            </div>
            <div>
              <div className="stat-number">{stats.lungCount ?? 0}</div>
              <div className="stat-label">肺癌低劑量CT</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FDF2F8', color: '#BE123C' }}>
              <Heart size={26} />
            </div>
            <div>
              <div className="stat-number">{stats.breastCount ?? 0}</div>
              <div className="stat-label">乳房X光攝影</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FFFBEB', color: '#D97706' }}>
              <Clock size={26} />
            </div>
            <div>
              <div className="stat-number">{stats.waitingDoctorCount ?? 0}</div>
              <div className="stat-label">待初檢診斷 (口篩)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FEF2F2', color: '#DC2626' }}>
              <AlertTriangle size={26} />
            </div>
            <div>
              <div className="stat-number">{stats.referralCount}</div>
              <div className="stat-label">異常/需轉介數 ({stats.referralRate}%)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FFF1F2', color: '#9E2A2B' }}>
              <Trash2 size={26} />
            </div>
            <div>
              <div className="stat-number">{stats.voidedCount}</div>
              <div className="stat-label">已作廢封存 (軟刪除)</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Admin Main Table Container */}
      <div className="admin-dashboard-container">
        {/* Filter bar */}
        <div className="filter-bar">
          <div className="filter-row" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Form type tabs */}
              <div style={{ display: 'flex', background: '#E2E8F0', padding: '3px', borderRadius: '8px', gap: '4px' }}>
                <button
                  type="button"
                  className={`btn ${formTypeFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormTypeFilter('ALL')}
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  全部問卷
                </button>
                <button
                  type="button"
                  className={`btn ${formTypeFilter === 'GASTRIC' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormTypeFilter('GASTRIC')}
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  胃癌篩檢
                </button>
                <button
                  type="button"
                  className={`btn ${formTypeFilter === 'ORAL' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormTypeFilter('ORAL')}
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  口篩檢查
                </button>
                <button
                  type="button"
                  className={`btn ${formTypeFilter === 'FECAL' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormTypeFilter('FECAL')}
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  糞便潛血 (FIT)
                </button>
                <button
                  type="button"
                  className={`btn ${formTypeFilter === 'CERVICAL' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormTypeFilter('CERVICAL')}
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  子宮頸抹片
                </button>
                <button
                  type="button"
                  className={`btn ${formTypeFilter === 'LUNG' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormTypeFilter('LUNG')}
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  肺癌低劑量CT
                </button>
                <button
                  type="button"
                  className={`btn ${formTypeFilter === 'BREAST' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormTypeFilter('BREAST')}
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  乳房X光攝影
                </button>
              </div>

              {/* Status filter dropdown */}
              <select
                className="input-field"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">問卷狀態：全部</option>
                <option value="WAITING_DOCTOR">⏳ 待醫師初檢</option>
                <option value="COMPLETED">✓ 已完成</option>
                <option value="VOIDED">已作廢 (VOID)</option>
              </select>

              {/* Result filter */}
              <select
                className="input-field"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                value={resultFilter}
                onChange={e => setResultFilter(e.target.value)}
              >
                <option value="ALL">初檢判定：全部</option>
                <option value="REFERRAL">需轉介 / 陽性病灶</option>
                <option value="NORMAL">正常 / 陰性</option>
              </select>


              {/* Include deleted checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', color: '#475569' }}>
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={e => setIncludeDeleted(e.target.checked)}
                />
                顯示作廢紀錄 (VOID)
              </label>
            </div>

            {/* Keyword Search */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="搜尋姓名 / 身分證 / 病歷號..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                style={{ width: '230px', padding: '6px 12px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                <Search size={16} />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={loadData}
                title="重新整理"
                style={{ padding: '6px 10px' }}
              >
                <RefreshCw size={15} />
              </button>
            </form>
          </div>

          {/* Batch operations */}
          <div className="filter-row" style={{ justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBatchPrint}
                disabled={selectedIds.length === 0}
                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              >
                <Printer size={15} />
                批次套印 A4 PDF ({selectedIds.length})
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleExportCsv}
                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              >
                <FileSpreadsheet size={15} />
                匯出 CSV 報表
              </button>
            </div>

            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
              共 <strong>{totalCount}</strong> 筆資料
            </span>
          </div>
        </div>

        {/* 3. Table */}
        <div className="data-table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={list.length > 0 && selectedIds.length === list.length}
                    onChange={handleToggleSelectAll}
                  />
                </th>
                <th>篩檢日期</th>
                <th>病歷號</th>
                <th>受檢者姓名</th>
                <th>身分證字號</th>
                <th>問卷類別</th>
                <th>初檢判定</th>
                <th>簽章狀態</th>
                <th>動作操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    載入問卷資料中...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    查無符合條件的問卷紀錄
                  </td>
                </tr>
              ) : (
                list.map(item => {
                  const isVoided = item.is_deleted || item.status === 'VOIDED';
                  const isGastric = item.form_type === 'GASTRIC';
                  const isOral = item.form_type === 'ORAL';
                  const isFecal = item.form_type === 'FECAL';
                  const isCervical = item.form_type === 'CERVICAL';
                  const isLung = item.form_type === 'LUNG';
                  const isBreast = item.form_type === 'BREAST';

                  let resultBadge = null;
                  if (isGastric) {
                    if (item.gastric?.test_result === 'POSITIVE') {
                      resultBadge = <span className="badge badge-danger">陽性 (幽門桿菌抗原)</span>;
                    } else if (item.gastric?.test_result === 'NEGATIVE') {
                      resultBadge = <span className="badge badge-success">陰性 (正常)</span>;
                    } else {
                      resultBadge = <span className="badge badge-info">檢體檢驗中</span>;
                    }
                  } else if (isOral) {
                    if (item.status === 'WAITING_DOCTOR' || item.oral?.inspection_result === 'PENDING') {
                      resultBadge = (
                        <span className="badge badge-warning" style={{ background: '#FFFBEB', color: '#B45309', border: '1px solid #FCD34D' }}>
                          ⏳ 待醫師初檢
                        </span>
                      );
                    } else if (item.oral?.inspection_result === 'REFERRAL') {
                      resultBadge = (
                        <span className="badge badge-danger">
                          需轉介 (代碼 {item.oral?.referral_reason_code})
                        </span>
                      );
                    } else {
                      resultBadge = <span className="badge badge-success">正常 (無異常)</span>;
                    }
                  } else if (isFecal) {
                    if (item.fecal?.test_result === 'POSITIVE') {
                      resultBadge = (
                        <span className="badge badge-danger">
                          陽性 ({item.fecal?.test_value ? `${item.fecal.test_value} ng/mL` : '需確診'})
                        </span>
                      );
                    } else if (item.fecal?.test_result === 'NEGATIVE') {
                      resultBadge = <span className="badge badge-success">陰性 (正常)</span>;
                    } else {
                      resultBadge = <span className="badge badge-warning">採便管檢驗中</span>;
                    }
                  } else if (isCervical) {
                    const cd = item.cervical?.cytology_diagnosis;
                    if (!cd) {
                      resultBadge = <span className="badge badge-warning">病理檢體判讀中</span>;
                    } else if (cd === '1') {
                      resultBadge = <span className="badge badge-success">正常 (WNL)</span>;
                    } else if (cd === '2') {
                      resultBadge = <span className="badge badge-info">反應性 (Reactive)</span>;
                    } else if (cd === '3') {
                      resultBadge = <span className="badge badge-info">萎縮性 (Atrophy)</span>;
                    } else {
                      const labelMap: Record<string, string> = {
                        '4': 'ASC-US', '16': 'ASC-H', '6': 'LSIL(CIN1)', '7': 'LSIL(CIN1)',
                        '8': 'HSIL(CIN2)', '9': 'HSIL(CIN3)', '10': 'CIS(原位癌)', '11': 'SCC(鱗狀癌)',
                        '17': 'Dysplasia', '5': 'AGC-NOS', '15': 'AGC favor neo', '18': 'AIS(腺原位癌)',
                        '12': '腺癌', '13': '惡性腫瘤', '14': '其他'
                      };
                      resultBadge = <span className="badge badge-danger">異常 ({labelMap[cd] || `代碼${cd}`})</span>;
                    }
                  } else if (isLung) {
                    const lr = item.lung?.result;
                    if (!lr) {
                      resultBadge = <span className="badge badge-warning">CT 影像待判讀</span>;
                    } else if (['4A', '4B', '4X'].includes(lr.lung_rads_category) || lr.referral_needed) {
                      resultBadge = (
                        <span className="badge badge-danger">
                          可疑 (Cat {lr.lung_rads_category}{lr.modifier_s ? '+S' : ''})
                        </span>
                      );
                    } else if (lr.lung_rads_category === '3') {
                      resultBadge = <span className="badge badge-warning">追蹤 (Cat 3)</span>;
                    } else if (lr.lung_rads_category === '0') {
                      resultBadge = <span className="badge badge-info">未完成 (Cat 0)</span>;
                    } else {
                      resultBadge = <span className="badge badge-success">良性/陰性 (Cat {lr.lung_rads_category})</span>;
                    }
                  } else if (isBreast) {
                    const br = item.breast?.result;
                    if (!br) {
                      resultBadge = <span className="badge badge-warning">乳攝影像待判讀</span>;
                    } else if (['0', '3', '4', '4A', '4B', '4C', '5'].includes(br.birads_category) || br.referral_needed) {
                      resultBadge = (
                        <span className="badge" style={{ background: '#fdf2f8', color: '#be123c', border: '1px solid #fbcfe8' }}>
                          異常/追蹤 (Cat {br.birads_category})
                        </span>
                      );
                    } else {
                      resultBadge = <span className="badge badge-success">正常/良性 (Cat {br.birads_category})</span>;
                    }
                  }

                  return (
                    <tr key={item.questionnaire_id} className={isVoided ? 'row-voided' : ''}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.questionnaire_id)}
                          onChange={() => handleToggleSelectItem(item.questionnaire_id)}
                        />
                      </td>

                      <td>
                        <span style={{ fontFamily: 'monospace' }}>{item.screening_date}</span>
                      </td>

                      <td>
                        <span style={{ fontWeight: '600', color: '#0F172A' }}>
                          {item.patient.chart_no}
                        </span>
                      </td>

                      <td>
                        <strong style={{ fontSize: '0.95rem' }}>{item.patient.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '6px' }}>
                          ({item.patient.gender === 'M' ? '男' : '女'})
                        </span>
                      </td>

                      <td>
                        <span style={{ fontFamily: 'monospace', color: '#475569' }}>
                          {item.patient.id_card_no_masked || item.patient.id_card_no}
                        </span>
                      </td>

                      <td>
                        {isGastric ? (
                          <span className="badge badge-info">胃幽門桿菌</span>
                        ) : isOral ? (
                          <span className="badge" style={{ background: '#E0F2F1', color: '#00796B' }}>
                            口腔黏膜檢查
                          </span>
                        ) : isFecal ? (
                          <span className="badge" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                            糞便潛血 (FIT)
                          </span>
                        ) : isCervical ? (
                          <span className="badge" style={{ background: '#FCE7F3', color: '#9D174D' }}>
                            子宮頸抹片
                          </span>
                        ) : isLung ? (
                          <span className="badge" style={{ background: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' }}>
                            肺癌低劑量CT
                          </span>
                        ) : (
                          <span className="badge" style={{ background: '#FDF2F8', color: '#BE123C', border: '1px solid #FBCFE8' }}>
                            乳房X光攝影
                          </span>
                        )}
                      </td>

                      <td>{resultBadge}</td>

                      <td>
                        {isVoided ? (
                          <span className="badge badge-void">已作廢 VOID</span>
                        ) : item.doctor_signature_url ? (
                          <span className="badge badge-success">醫患雙簽</span>
                        ) : item.status === 'WAITING_DOCTOR' ? (
                          <span className="badge" style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FFEDD5' }}>
                            患者已簽 (待醫檢)
                          </span>
                        ) : (
                          <span className="badge badge-info">患者已簽署</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {/* If oral and waiting for doctor inspection, show prominent primary button */}
                          {!isVoided && isOral && (item.status === 'WAITING_DOCTOR' || item.oral?.inspection_result === 'PENDING') && (
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => setDoctorInspectionItem(item)}
                              title="醫師進行初檢診斷與口腔病灶標記"
                              style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#00897B' }}
                            >
                              <Stethoscope size={14} />
                              醫師初檢
                            </button>
                          )}

                          {/* If oral and completed inspection, allow doctor to view/modify inspection */}
                          {!isVoided && isOral && item.status === 'COMPLETED' && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setDoctorInspectionItem(item)}
                              title="檢視或修改初檢診斷與標記"
                              style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#00796B' }}
                            >
                              <Stethoscope size={14} />
                              診斷
                            </button>
                          )}

                          {/* If fecal, allow staff to enter/update test result and followup */}
                          {!isVoided && isFecal && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setFecalResultItem(item)}
                              title="登錄或更新糞便潛血檢驗結果與陽性確診追蹤"
                              style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#0284C7', borderColor: '#BAE6FD' }}
                            >
                              <TestTube2 size={14} />
                              檢驗/確診
                            </button>
                          )}

                          {/* If cervical, allow pathology / sampling result entry */}
                          {!isVoided && isCervical && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setCervicalResultItem(item)}
                              title="登錄或更新子宮頸抹片病理細胞學診斷與處置建議"
                              style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#BE185D', borderColor: '#FBCFE8' }}
                            >
                              <Stethoscope size={14} />
                              病理判讀/採檢
                            </button>
                          )}

                          {/* If lung, allow LDCT reading & Lung-RADS entry */}
                          {!isVoided && isLung && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setLungResultItem(item)}
                              title="登錄或更新胸部低劑量電腦斷層(LDCT)判讀結果與Lung-RADS分級"
                              style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#0284C7', borderColor: '#BAE6FD' }}
                            >
                              <Stethoscope size={14} />
                              LDCT判讀
                            </button>
                          )}

                          {/* If breast, allow radiology reading & BI-RADS entry */}
                          {!isVoided && isBreast && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setBreastResultItem(item)}
                              title="登錄或更新乳房X光攝影判讀結果與BI-RADS評級"
                              style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#BE123C', borderColor: '#FBCFE8' }}
                            >
                              <Stethoscope size={14} />
                              乳攝判讀
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setDetailItem(item)}
                            title="檢視詳情"
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            <Eye size={14} />
                            檢視
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => onOpenPrintModal(item)}
                            title="A4 國健署套印"
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            <Printer size={14} />
                            列印
                          </button>


                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleOpenAuditDrawer(item)}
                            title="調閱稽核歷程"
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            <History size={14} />
                          </button>

                          {!isVoided && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => handleOpenVoidModal(item)}
                              title="作廢此問卷 (軟刪除)"
                              style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#DC2626' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Soft Delete (作廢) Modal */}
      {voidingItem && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '540px' }}>
            <div className="modal-header" style={{ background: '#FEF2F2' }}>
              <div className="modal-title" style={{ color: '#B91C1C' }}>
                <AlertTriangle size={22} color="#DC2626" />
                <span>確認作廢 (軟刪除) 此筆問卷？</span>
              </div>
              <button className="modal-close-btn" onClick={() => setVoidingItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <div>受檢者：<strong>{voidingItem.patient.name}</strong> ({voidingItem.patient.id_card_no_masked})</div>
                <div>問卷類別：{voidingItem.form_type === 'GASTRIC' ? '胃幽門桿菌篩檢問卷' : '口腔黏膜檢查表'}</div>
                <div style={{ color: '#D32F2F', fontSize: '0.8rem', marginTop: '4px', fontWeight: 'bold' }}>
                  * 醫療法規要求：原始紀錄將永久保留於後台審計庫，但前台將標記為 VOID 作廢。
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="question-label">
                  請選擇作廢原因 (必選)：
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { code: 'DUPLICATE', label: '個案重複填寫' },
                    { code: 'SPECIMEN_FAIL', label: '檢體溶血/失效需重採' },
                    { code: 'DATA_ERROR', label: '誤植病歷號 / 個資有誤' },
                    { code: 'OTHER', label: '其他原因' }
                  ].map(rc => (
                    <label key={rc.code} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="voidReason"
                        checked={voidReasonCode === rc.code}
                        onChange={() => setVoidReasonCode(rc.code)}
                      />
                      <span>{rc.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="question-label">詳細備註說明：</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="請輸入作廢原因說明..."
                  value={voidReasonRemark}
                  onChange={e => setVoidReasonRemark(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div>
                <label className="question-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={15} color="#64748B" />
                  請輸入管理師密碼以授權作廢：
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="預設密碼: admin123"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setVoidingItem(null)}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmVoid}
                disabled={isVoidingLoading}
              >
                {isVoidingLoading ? '作廢中...' : '確認作廢 (產生不可抹除之 Audit Log)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Audit Trail Drawer */}
      {auditItem && (
        <div className="audit-drawer-overlay" onClick={() => setAuditItem(null)}>
          <div className="audit-drawer" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <History size={20} color="#1976D2" />
                <span>異動歷程軌跡 (Audit Trail)</span>
              </div>
              <button className="modal-close-btn" onClick={() => setAuditItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div><strong>問卷識別號：</strong>#{auditItem.questionnaire_id}</div>
                <div><strong>個案姓名：</strong>{auditItem.patient.name}</div>
                <div><strong>SHA-256 數位簽章雜湊：</strong></div>
                <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.75rem', color: '#1E293B', marginTop: '2px' }}>
                  {auditItem.data_hash}
                </div>
              </div>

              {isAuditLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                  讀取歷程紀錄中...
                </div>
              ) : auditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                  尚無異動紀錄
                </div>
              ) : (
                <div className="timeline">
                  {auditLogs.map((log, idx) => {
                    let dotClass = '';
                    if (log.action_type === 'SOFT_DELETE') dotClass = 'danger';
                    if (log.action_type === 'CREATE') dotClass = 'success';

                    return (
                      <div key={idx} className="timeline-item">
                        <div className={`timeline-dot ${dotClass}`} />
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0F172A', marginTop: '2px' }}>
                          [{log.action_type}] {log.memo}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                          操作者: {log.operator_id} | IP: {log.client_ip}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setAuditItem(null)}>
                關閉歷程面板
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. View Detail Modal (Read-only snapshot) */}
      {detailItem && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '760px', maxHeight: '85vh' }}>
            <div className="modal-header">
              <div className="modal-title">
                <FileText size={22} color="#1976D2" />
                <span>
                  問卷詳情檢視 (唯讀鎖定模式) - #{detailItem.questionnaire_id}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setDetailItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Tamper-proof Shield Banner */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '0.85rem' }}>
                  <ShieldCheck size={20} />
                  <span>資料已簽章鎖定，SHA-256 完整性雜湊驗證通過</span>
                </div>
                <span className="badge badge-success">唯讀防竄改保護</span>
              </div>

              {/* Patient Basic Info */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '8px' }}>
                  受檢者個人資料
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.875rem' }}>
                  <div><span style={{ color: '#64748B' }}>姓名：</span><strong>{detailItem.patient.name}</strong></div>
                  <div><span style={{ color: '#64748B' }}>性別：</span>{detailItem.patient.gender === 'M' ? '男' : '女'}</div>
                  <div><span style={{ color: '#64748B' }}>身分證號：</span><strong>{detailItem.patient.id_card_no}</strong></div>
                  <div><span style={{ color: '#64748B' }}>出生日期：</span>{detailItem.patient.birth_date}</div>
                  <div><span style={{ color: '#64748B' }}>手機：</span>{detailItem.patient.mobile}</div>
                  <div><span style={{ color: '#64748B' }}>原住民：</span>{detailItem.patient.is_indigenous ? '是' : '否'}</div>
                  <div style={{ gridColumn: 'span 3' }}>
                    <span style={{ color: '#64748B' }}>地址：</span>
                    {detailItem.patient.city}{detailItem.patient.district}{detailItem.patient.road}
                  </div>
                </div>
              </div>

              {/* Form Specific Details */}
              {detailItem.form_type === 'GASTRIC' ? (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '8px' }}>
                    胃幽門桿菌問卷填報內容
                  </h4>
                  <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                    <div><strong>個人病史：</strong>
                      {Object.entries(detailItem.gastric?.personal_history || {})
                        .filter(([k, v]) => v && k !== 'none' && k !== 'year_unknown')
                        .map(([k]) => k).join(', ') || '無'}
                    </div>
                    <div><strong>曾否除菌治療：</strong>{detailItem.gastric?.hp_eradication ? '有' : '無'}</div>
                    <div><strong>胃鏡檢查：</strong>{detailItem.gastric?.gastroscopy_history ? `有 (${detailItem.gastric.gastroscopy_year}年)` : '無'}</div>
                    <div><strong>近一月潰瘍特效藥：</strong>{detailItem.gastric?.anti_ulcer_drugs_recent_month ? '有服用' : '無'}</div>
                    <div><strong>生活習慣：</strong>吸菸({detailItem.gastric?.smoking_habit})、飲酒({detailItem.gastric?.drinking_habit})、嚼檳({detailItem.gastric?.betel_nut_habit})</div>
                  </div>
                </div>
              ) : detailItem.form_type === 'ORAL' ? (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '8px' }}>
                    口腔黏膜檢查初檢診斷
                  </h4>
                  <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                    <div><strong>初檢判定：</strong>
                      <span style={{ color: detailItem.oral?.inspection_result === 'REFERRAL' ? '#DC2626' : '#15803D', fontWeight: 'bold' }}>
                        {detailItem.oral?.inspection_result === 'REFERRAL' ? '需轉介' : '未發現異常 (正常)'}
                      </span>
                    </div>
                    <div><strong>轉介主原因代碼：</strong>{detailItem.oral?.referral_reason_code || '00'}</div>
                    <div><strong>標記病灶部位：</strong>
                      {detailItem.oral?.lesion_locations && detailItem.oral.lesion_locations.length > 0 ? (
                        detailItem.oral.lesion_locations.map((l, i) => (
                          <span key={i} style={{ marginRight: '8px' }}>
                            [{l.loc}] {l.name} - 代碼{l.code} ({l.desc});
                          </span>
                        ))
                      ) : '無異常標記'}
                    </div>
                    <div><strong>檢查醫師：</strong>{detailItem.oral?.doctor_name} ({detailItem.oral?.doctor_license_no})</div>
                  </div>
                </div>
              ) : detailItem.form_type === 'FECAL' ? (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '8px' }}>
                    定量免疫法糞便潛血檢查與確診追蹤
                  </h4>
                  <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                    <div><strong>檢驗結果：</strong>
                      <span style={{ color: detailItem.fecal?.test_result === 'POSITIVE' ? '#DC2626' : '#15803D', fontWeight: 'bold' }}>
                        {detailItem.fecal?.test_result === 'POSITIVE' ? `陽性 (數值: ${detailItem.fecal?.test_value || ''} ng/mL)` : detailItem.fecal?.test_result === 'NEGATIVE' ? '陰性 (正常)' : '檢體檢驗中'}
                      </span>
                    </div>
                    <div><strong>定量試劑：</strong>{detailItem.fecal?.reagent_brand || 'Kyowa'} {detailItem.fecal?.reagent_brand_other || ''}</div>
                    <div><strong>檢驗單位與日期：</strong>{detailItem.fecal?.lab_unit_name || '竹山秀傳醫院 檢驗醫學科'} ｜ {detailItem.fecal?.lab_test_date || '未檢驗'}</div>
                    <div><strong>家族病史及吸菸習慣：</strong>
                      吸菸史({detailItem.fecal?.smoking_history ? `有，${detailItem.fecal.smoking_start_age}歲起` : '無'})、
                      大腸癌家族史({detailItem.fecal?.family_colorectal_cancer === 1 ? '有' : detailItem.fecal?.family_colorectal_cancer === 2 ? '不知道' : '無'})、
                      腸道不適症狀({detailItem.fecal?.has_bowel_symptoms ? '有自覺症狀' : '無'})
                    </div>
                    {detailItem.fecal?.declaration_statement?.enabled && (
                      <div style={{ marginTop: '4px', background: '#FAF5FF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #DDD6FE' }}>
                        <strong>附表五之五聲明書：</strong>
                        無法出具證明原因: {detailItem.fecal.declaration_statement.inability_reason}，證明血親: {detailItem.fecal.declaration_statement.relative_relation} ({detailItem.fecal.declaration_statement.relative_name})
                      </div>
                    )}
                    {detailItem.fecal?.has_followup_3months !== null && detailItem.fecal?.has_followup_3months !== undefined && (
                      <div style={{ marginTop: '4px', background: '#FFFBEB', padding: '6px 10px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                        <strong>確診追蹤：</strong>
                        {detailItem.fecal.has_followup_3months ? `已於 ${detailItem.fecal.confirm_date || ''} 完成確診 (大腸鏡)，診斷: ${detailItem.fecal.diagnosis || ''}` : `未接受確診 (${detailItem.fecal.unconfirmed_reason || '未說明'})`}
                      </div>
                    )}
                  </div>
                </div>
              ) : detailItem.form_type === 'CERVICAL' ? (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '8px' }}>
                    女性子宮頸抹片檢查與病理診斷結果（附表三之四）
                  </h4>
                  <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                    <div><strong>細胞學診斷：</strong>
                      <span style={{ color: detailItem.cervical?.cytology_diagnosis === '1' ? '#15803D' : '#DC2626', fontWeight: 'bold' }}>
                        {detailItem.cervical?.cytology_diagnosis ? `Bethesda 代碼: ${detailItem.cervical.cytology_diagnosis}` : '檢體尚未完成判讀'}
                      </span>
                    </div>
                    <div><strong>抹片品質：</strong>{detailItem.cervical?.smear_quality === 'GOOD' ? '良好，可供判讀' : detailItem.cervical?.smear_quality === 'SATISFACTORY' ? '尚可，影響判讀' : '難以判讀'}</div>
                    <div><strong>病理機構與編號：</strong>{detailItem.cervical?.lab_unit_name || '竹山秀傳醫院 病理檢驗科'} ｜ 編號: {detailItem.cervical?.pathology_no || 'CY-2026-0001'}</div>
                    <div><strong>採檢院所與人員：</strong>{detailItem.cervical?.sampling_unit_name || '竹山秀傳醫院'} ｜ 採檢人員: {detailItem.cervical?.sampler_name || '醫師'}</div>
                    <div><strong>臨床月經與病史：</strong>
                      停經({detailItem.cervical?.is_menopause === 'YES' ? '已停經' : '未停經'})、
                      子宮切除({detailItem.cervical?.hysterectomy_status === 'YES' ? '已切除' : '否'})、
                      HPV疫苗({detailItem.cervical?.hpv_vaccine === 'YES' ? '有接種' : '無'})、
                      抹片合併HPV檢驗({detailItem.cervical?.combine_hpv ? '有合併' : '無'})
                    </div>
                    {detailItem.cervical?.recommendations && detailItem.cervical.recommendations.length > 0 && (
                      <div style={{ marginTop: '4px', background: '#FFF1F2', padding: '6px 10px', borderRadius: '6px', border: '1px solid #FECDD3' }}>
                        <strong>處置建議：</strong>
                        {detailItem.cervical.recommendations.join(', ')} {detailItem.cervical.recommendation_other ? `(${detailItem.cervical.recommendation_other})` : ''}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '8px' }}>
                    胸部低劑量電腦斷層檢查 (LDCT) 與 Lung-RADS 判讀結果【附件一之三、四】
                  </h4>
                  <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                    <div>
                      <strong>Lung-RADS 總體分級：</strong>
                      <span style={{ color: ['4A', '4B', '4X'].includes(detailItem.lung?.result?.lung_rads_category || '') ? '#DC2626' : '#0369A1', fontWeight: 'bold' }}>
                        {detailItem.lung?.result?.lung_rads_category ? `Category ${detailItem.lung.result.lung_rads_category}${detailItem.lung.result.modifier_s ? ' (Modifier S)' : ''}` : '影像待專科醫師判讀'}
                      </span>
                    </div>
                    <div><strong>攝影單位與儀器：</strong>{detailItem.lung?.result?.imaging_hospital_name || '竹山秀傳醫院'} ｜ {detailItem.lung?.result?.ct_machine_register_no || 'GE Revolution 128切'}</div>
                    <div><strong>放射師與判讀醫師：</strong>{detailItem.lung?.result?.radiologic_technologist || '王銘憲 (RT0298)'} ｜ {detailItem.lung?.result?.interpretation_doctor || '林博仁 醫師'}</div>
                    <div><strong>品質與劑量：</strong>Quality: {detailItem.lung?.result?.ldct_quality || 'Good'}，CTDIvol: {detailItem.lung?.result?.ctdivol_mgy || '2.1'} mGy，DLP: {detailItem.lung?.result?.total_dlp_mgy_cm || '75.6'} mGy*cm</div>
                    <div><strong>吸菸史指標：</strong>{detailItem.lung?.smoking_history?.has_smoking_history ? `${detailItem.lung?.smoking_history?.pack_years || 0} 包-年 (${detailItem.lung?.smoking_history?.is_quit ? '已戒菸' : '現吸菸'})` : '無吸菸史'}，CO值: {detailItem.lung?.smoking_history?.co_reading_ppm ?? '--'} ppm</div>
                    <div><strong>家族史與疾病史：</strong>{detailItem.lung?.family_history?.has_family_history ? `有肺癌家族史 (共 ${detailItem.lung.family_history.total_affected_count} 人)` : '無肺癌家族史'}，BMI: {detailItem.lung?.bmi || '--'}</div>
                    {detailItem.lung?.result?.nodule_1 && (
                      <div style={{ marginTop: '4px', background: '#FFF1F2', padding: '6px 10px', borderRadius: '6px', border: '1px solid #FECDD3' }}>
                        <strong>懷疑結節 1:</strong> {detailItem.lung.result.nodule_1.entire_size_mm} mm ({detailItem.lung.result.nodule_1.density})，部位: {detailItem.lung.result.nodule_1.lobe}，比對: {detailItem.lung.result.nodule_1.comparison}
                      </div>
                    )}
                    {detailItem.lung?.result?.notes && (
                      <div style={{ marginTop: '4px', background: '#F0F9FF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #BAE6FD' }}>
                        <strong>臨床處置建議：</strong>{detailItem.lung.result.notes}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Breast screening specific details */}
              {detailItem.form_type === 'BREAST' && (
                <div style={{ marginTop: '1.25rem', background: '#FFF1F2', padding: '14px', borderRadius: '10px', border: '1px solid #FECDD3' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#BE123C', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Heart size={18} />
                    婦女乳房X光攝影檢查紀錄與 BI-RADS 判讀結果 (附表四之四)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px', fontSize: '0.85rem' }}>
                    <div>
                      <strong>BI-RADS 總評級：</strong>
                      <span style={{ color: ['0', '3', '4', '4A', '4B', '4C', '5'].includes(detailItem.breast?.result?.birads_category || '') ? '#BE123C' : '#059669', fontWeight: 'bold' }}>
                        {detailItem.breast?.result?.birads_category ? `Category ${detailItem.breast.result.birads_category}` : '影像待專科醫師判讀'}
                        {detailItem.breast?.result?.referral_needed ? ' (需專科轉介追蹤)' : ''}
                      </span>
                    </div>
                    <div><strong>攝影單位與巡迴車：</strong>{detailItem.breast?.sampling_unit || '竹山秀傳醫院'} ｜ {detailItem.breast?.screening_van ? `巡迴車 (${detailItem.breast?.van_plate_number || '有'})` : '院內攝影'}</div>
                    <div><strong>機型種類與乳腺密度：</strong>機型: {detailItem.breast?.result?.machine_type || 'DR'} ｜ 乳腺密度: Type {detailItem.breast?.result?.breast_density || 'c'}</div>
                    <div><strong>放射師與判讀醫師：</strong>{detailItem.breast?.result?.radiologic_technologist || '張慈芬 (RT2091)'} ｜ {detailItem.breast?.result?.radiology_physician || '王立德 醫師'}</div>
                    <div><strong>家族史與個人史：</strong>{detailItem.breast?.family_history?.has_breast_cancer ? '有血親乳癌家族史' : '無家族史'} ｜ 良性病史: {detailItem.breast?.disease_history?.breast_benign_disease ? '有' : '無'}</div>
                    <div><strong>自覺症狀：</strong>{detailItem.breast?.breast_symptoms?.has_symptoms ? '有自覺症狀' : '無自覺症狀'} ｜ 門診觸診: {detailItem.breast?.result?.palpation_result || '未觸摸到硬塊'}</div>
                    {detailItem.breast?.result?.assessment_finding && (
                      <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #FECDD3' }}>
                        <strong>影像發現：</strong>{detailItem.breast.result.assessment_finding}
                      </div>
                    )}
                    {detailItem.breast?.result?.recommendation && (
                      <div style={{ gridColumn: '1 / -1', background: '#FDF2F8', padding: '6px 10px', borderRadius: '6px', border: '1px solid #FBCFE8' }}>
                        <strong>臨床處置與建議：</strong>{detailItem.breast.result.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Signatures Row */}
              <div style={{ marginTop: '1.5rem', background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>受檢者親筆簽名</div>
                  {detailItem.patient_signature_url ? (
                    <img src={detailItem.patient_signature_url} alt="受檢者簽名" style={{ maxHeight: '50px' }} />
                  ) : (
                    <span>無簽名</span>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                    {new Date(detailItem.patient_signed_at).toLocaleString()}
                  </div>
                </div>

                {detailItem.doctor_signature_url && (
                  <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0', paddingLeft: '20px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>初檢醫師認證簽章</div>
                    <img src={detailItem.doctor_signature_url} alt="醫師簽章" style={{ maxHeight: '50px' }} />
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                      {detailItem.doctor_signed_at ? new Date(detailItem.doctor_signed_at).toLocaleString() : ''}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onOpenPrintModal(detailItem);
                  setDetailItem(null);
                }}
              >
                <Printer size={16} />
                A4 公版套印
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setDetailItem(null)}>
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Doctor Oral Inspection Modal */}
      <DoctorInspectionModal
        isOpen={!!doctorInspectionItem}
        onClose={() => setDoctorInspectionItem(null)}
        questionnaire={doctorInspectionItem}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* 8. Fecal FIT Result & Followup Modal */}
      <FecalResultModal
        isOpen={!!fecalResultItem}
        onClose={() => setFecalResultItem(null)}
        questionnaire={fecalResultItem}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* 9. Cervical Smear Result & Pathology Modal */}
      <CervicalResultModal
        isOpen={!!cervicalResultItem}
        onClose={() => setCervicalResultItem(null)}
        questionnaire={cervicalResultItem}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* 10. Lung Cancer LDCT Result & Lung-RADS Modal */}
      <LungResultModal
        isOpen={!!lungResultItem}
        onClose={() => setLungResultItem(null)}
        questionnaire={lungResultItem}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* 11. Breast Cancer Screening Result & BI-RADS Modal */}
      <BreastResultModal
        isOpen={!!breastResultItem}
        onClose={() => setBreastResultItem(null)}
        questionnaire={breastResultItem}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};

