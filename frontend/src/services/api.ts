import type { Questionnaire, DashboardStats, AuditLog } from '../types';

const API_BASE = '/api/v1';

export async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE.replace('/v1', '')}/stats`);
  if (!res.ok) throw new Error('無法取得儀表板統計資料');
  const json = await res.json();
  return json.stats;
}

export async function fetchQuestionnaires(params: {
  page?: number;
  pageSize?: number;
  formType?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  resultFilter?: string;
  search?: string;
  includeDeleted?: boolean;
}): Promise<{ data: Questionnaire[]; total: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  if (params.formType && params.formType !== 'ALL') query.set('formType', params.formType);
  if (params.startDate) query.set('startDate', params.startDate);
  if (params.endDate) query.set('endDate', params.endDate);
  if (params.status && params.status !== 'ALL') query.set('status', params.status);
  if (params.resultFilter && params.resultFilter !== 'ALL') query.set('resultFilter', params.resultFilter);
  if (params.search) query.set('search', params.search);
  if (params.includeDeleted) query.set('includeDeleted', 'true');

  const res = await fetch(`${API_BASE}/admin/questionnaires?${query.toString()}`);
  if (!res.ok) throw new Error('查詢問卷列表失敗');
  return res.json();
}

export async function fetchQuestionnaireDetail(id: number): Promise<Questionnaire> {
  const res = await fetch(`${API_BASE}/admin/questionnaires/${id}`);
  if (!res.ok) throw new Error('讀取問卷詳情失敗');
  const json = await res.json();
  return json.data;
}

export async function submitGastricForm(payload: {
  patient: any;
  screening: any;
  signature: { base64Png: string; signedAt: string };
}): Promise<{ questionnaireId: number; dataHash: string }> {
  const res = await fetch(`${API_BASE}/questionnaires/gastric`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '送出胃癌問卷失敗');
  }
  const json = await res.json();
  return json.data;
}

export async function submitOralForm(payload: {
  patient: any;
  oral: any;
  patientSignature: { base64Png: string; signedAt: string };
  doctorSignature?: { base64Png: string; signedAt: string };
}): Promise<{ questionnaireId: number; dataHash: string }> {
  const res = await fetch(`${API_BASE}/questionnaires/oral`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '送出口腔檢查問卷失敗');
  }
  const json = await res.json();
  return json.data;
}

export async function submitFecalForm(payload: {
  patient: any;
  fecal: any;
  signature: { base64Png: string; signedAt: string };
}): Promise<{ questionnaireId: number; dataHash: string }> {
  const res = await fetch(`${API_BASE}/questionnaires/fecal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '送出糞便潛血問卷失敗');
  }
  const json = await res.json();
  return json.data;
}

export async function submitFecalResult(
  id: number,
  payload: any
): Promise<Questionnaire> {
  const res = await fetch(`${API_BASE}/questionnaires/${id}/fecal-result`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '儲存檢驗或確診結果失敗');
  }
  const json = await res.json();
  return json.data;
}

export async function submitCervicalForm(payload: {
  patient: any;
  cervical: any;
  signature: { base64Png: string; signedAt: string };
}): Promise<{ questionnaireId: number; dataHash: string }> {
  const res = await fetch(`${API_BASE}/questionnaires/cervical`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '送出子宮頸抹片問卷失敗');
  }
  const json = await res.json();
  return json.data;
}

export async function submitCervicalResult(
  id: number,
  payload: any
): Promise<Questionnaire> {
  const res = await fetch(`${API_BASE}/questionnaires/${id}/cervical-result`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '儲存子宮頸抹片判讀結果失敗');
  }
  const json = await res.json();
  return json.data;
}

export async function submitLungForm(payload: {
  patient: any;
  lung: any;
  signature: { base64Png: string; signedAt: string };
}): Promise<{ questionnaireId: number; dataHash: string }> {
  const res = await fetch(`${API_BASE}/questionnaires/lung`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '送出肺癌篩檢問卷失敗');
  }
  const json = await res.json();
  return json.data;
}

export async function submitLungResult(
  id: number,
  payload: any
): Promise<Questionnaire> {
  const res = await fetch(`${API_BASE}/questionnaires/${id}/lung-result`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '儲存胸部低劑量電腦斷層檢查判讀結果失敗');
  }
  const json = await res.json();
  return json.data;
}

export async function submitBreastForm(payload: {
  patient: any;
  breast: any;
  signature: { base64Png: string; signedAt: string };
}): Promise<{ questionnaireId: number; dataHash: string }> {
  const res = await fetch(`${API_BASE}/questionnaires/breast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '送出乳房X光攝影檢查問卷失敗');
  }
  const json = await res.json();
  return json.data;
}

export async function submitBreastResult(
  id: number,
  payload: any
): Promise<Questionnaire> {
  const res = await fetch(`${API_BASE}/questionnaires/${id}/breast-result`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '儲存乳房X光攝影檢查結果失敗');
  }
  const json = await res.json();
  return json.data;
}

export async function submitDoctorInspection(
  id: number,
  payload: any
): Promise<Questionnaire> {
  const res = await fetch(`${API_BASE}/questionnaires/${id}/doctor-inspection`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '儲存醫師初檢診斷失敗');
  }
  const json = await res.json();
  return json.data;
}

export async function softDeleteQuestionnaire(
  id: number,
  data: { voidReasonCode: string; voidReasonRemark: string; authPassword?: string }
): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/questionnaires/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '作廢失敗');
  }
  return res.json();
}

export async function fetchAuditLogs(id: number): Promise<AuditLog[]> {
  const res = await fetch(`${API_BASE}/admin/questionnaires/${id}/audit-logs`);
  if (!res.ok) throw new Error('讀取稽核軌跡失敗');
  const json = await res.json();
  return json.data;
}

export async function recordPrintAudit(id: number): Promise<void> {
  await fetch(`${API_BASE}/admin/questionnaires/${id}/audit-print`, {
    method: 'POST'
  }).catch(() => {});
}
