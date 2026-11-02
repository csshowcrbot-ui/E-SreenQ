# 癌症篩檢問卷系統 系統架構與開發規格文件

**文件版本：** v1.0.0  
**適用系統：** 胃幽門螺旋桿菌篩檢問卷、口腔黏膜檢查問卷、個案管理後台與數位簽章模組  
**對象：** 全端工程師、系統架構師、DBA、QA 團隊  

---

## 1. 系統架構與技術選型 (System Architecture & Tech Stack)

本系統採 **前後端分離架構 (SPA + RESTful API)**，具備跨裝置（平板填寫、醫師診間、管理師後台 PC）的相容性與醫療資安防護。

```
[前端 Presentation Layer]
  ├─ 個案填寫端 (Tablet/Kiosk) : Vue 3 / React + Tailwind CSS + SignaturePad
  ├─ 醫師填報端 (PC/Tablet)     : 互動式 SVG/Canvas 口腔病灶標記元件
  └─ 管理師後台 (Desktop Web)   : TanStack Table / DataGrid + 批次列印引擎
             │ (HTTPS / JWT / TLS 1.3)
[後端 Application Layer]
  └─ ASP.NET Core 8 Web API / Node.js (NestJS)
       ├─ Auth / RBAC Middleware (角色權限校驗)
       ├─ Questionnaire Engine (動態驗證、邏輯跳題、資料雜湊)
       ├─ Audit & Version Control (版本快照與審計軌跡)
       └─ PDF Reporting Service (QuestPDF / Puppeteer 向量套印)
             │
[資料與儲存層 Data & Storage Layer]
  ├─ RDBMS (PostgreSQL 15+ / SQL Server 2022) : 結構化病歷與問卷資料
  ├─ Object Storage (MinIO / S3 相容)         : 簽名檔 (WebP/PNG)、歸檔 PDF
  └─ Cache (Redis 7.x)                        : 分布式 Session、填寫中暫存 (Draft)
```

### 1.1 技術選型明細表

| 項目 | 推薦技術 | 選型原因 |
| :--- | :--- | :--- |
| **前端框架** | Vue 3 (Composition API) / React 18 (TypeScript) | 高響應式、行動端輕量、生態系豐富。 |
| **樣式庫** | Tailwind CSS + Headless UI / Shadcn UI | 高度客製化、易於調整無障礙高對比色彩與大字體。 |
| **數位簽名** | `signature_pad` + Bezier Curve 平滑化 | 向量平滑、支援高解析觸控筆與防手掌誤觸。 |
| **後端核心** | .NET 8 Web API (C#) 或 NestJS (TypeScript) | 醫療資訊系統常見規格，型別安全且效能卓越。 |
| **資料庫** | PostgreSQL 16 或 MS SQL Server 2022 | 原生支援 JSONB 欄位，方便彈性儲存問卷動態結構。 |
| **PDF 引擎** | **QuestPDF** (.NET) 或 **Puppeteer** (Node.js) | 精確以點（Point）定位輸出 A4，支援批次套印。 |

---

## 2. 資料庫綱要設計 (Database Schema Design)

資料庫針對「**不可抹除性**」、「**版本回溯性**」與「**數位簽章防偽**」進行正規化與雜湊欄位設計。

### 2.1 實體關聯圖 (ERD Conceptual Diagram)

```
[Patients] 1 ──── N [Questionnaires] 1 ──── 1 [Questionnaire_Gastric]
                           │        1 ──── 1 [Questionnaire_Oral]
                           │        1 ──── N [QuestionnaireAuditLogs]
                           └──────── 1 ──── N [QuestionnaireSnapshots]
```

### 2.2 DDL 結構綱要 (以 PostgreSQL 為例)

```sql
-- 1. 病患/受檢者基本資料表
CREATE TABLE patients (
    patient_id BIGSERIAL PRIMARY KEY,
    chart_no VARCHAR(20),                     -- 病歷號碼
    id_card_no VARCHAR(10) NOT NULL UNIQUE,   -- 身分證/居留證字號
    name VARCHAR(50) NOT NULL,
    gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
    birth_date DATE NOT NULL,
    is_indigenous BOOLEAN DEFAULT FALSE,      -- 是否原住民
    phone VARCHAR(20),
    mobile VARCHAR(20) NOT NULL,
    zip_code VARCHAR(10),
    address VARCHAR(255),
    education_level VARCHAR(20),             -- 無/國小/國中/高中職/專科大學/研究所以上/拒答
    marriage_status VARCHAR(20),             -- 未婚/已婚/其他
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_idcard ON patients(id_card_no);
CREATE INDEX idx_patients_chartno ON patients(chart_no);

-- 2. 問卷總表 (核心表頭與狀態控管)
CREATE TABLE questionnaires (
    questionnaire_id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(patient_id),
    form_type VARCHAR(20) NOT NULL CHECK (form_type IN ('GASTRIC', 'ORAL')), 
    payment_type VARCHAR(50) NOT NULL,        -- 預防保健/健保醫療/自費/公務補助等
    screening_date DATE NOT NULL,             -- 門診/採檢日期
    status VARCHAR(20) DEFAULT 'COMPLETED',   -- DRAFT(草稿), COMPLETED(已完成), VOIDED(已作廢)
    
    -- 數位簽名與安全防偽資訊
    patient_signature_url TEXT NOT NULL,      -- 患者簽名儲存路徑
    patient_signed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    patient_sign_ip VARCHAR(45),
    doctor_signature_url TEXT,                -- 醫師簽章 (口篩適用)
    doctor_signed_at TIMESTAMP WITH TIME ZONE,
    data_hash CHAR(64) NOT NULL,              -- 欄位資料 SHA-256 雜湊值 (防竄改)
    
    -- 軟刪除 (Soft-Delete) 與作廢機制
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(50),                   -- 作廢操作管理師工號
    void_reason_code VARCHAR(30),             -- 作廢代碼: DUPLICATE, SPECIMEN_FAIL, DATA_ERROR, OTHER
    void_reason_remark TEXT,                  -- 作廢備註
    
    version INT DEFAULT 1,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_q_search ON questionnaires(form_type, screening_date, is_deleted);

-- 3. 胃癌幽門桿菌問卷明細表 (附表八之四)
CREATE TABLE questionnaire_gastric (
    questionnaire_id BIGINT PRIMARY KEY REFERENCES questionnaires(questionnaire_id),
    sampling_unit VARCHAR(100),               -- 採檢單位代碼/名稱
    second_clinic_date DATE,                  -- 檢測失效第二次門診日
    religion VARCHAR(30),                     -- 宗教信仰
    occupation_status VARCHAR(50),            -- 職業狀況
    
    -- 個人病史 (以 JSONB 彈性儲存複選項目)
    -- 例: {"gastritis": true, "ulcer": true, "cancer": false, "none": false}
    personal_history JSONB NOT NULL,
    hp_eradication BOOLEAN,                   -- 曾接受幽門桿菌除菌治療
    gastroscopy_history BOOLEAN,              -- 曾接受胃鏡檢查
    gastroscopy_year INT,                     -- 接受胃鏡民國年份
    anti_ulcer_drugs_recent_month BOOLEAN,    -- 近一個月使用特效藥(一日一顆)
    drug_allergy_detail VARCHAR(100),         -- 藥物過敏說明
    
    -- 家族史 (幽門桿菌、消化性潰瘍、胃癌)
    family_hp_history JSONB,                  -- 例: {"has": true, "parents": true, "siblings_count": 2}
    family_ulcer_history JSONB,
    family_gastric_cancer_history JSONB,
    
    -- 用藥史 (最近三個月特定藥物)
    medication_history JSONB,                 -- 止痛藥、類固醇、抗血小板、抗凝血劑、糖尿病、鐵劑
    
    -- 生活型態
    smoking_habit INT,                        -- 0:從不, 1:已戒, 2:目前有, 3:其他
    drinking_habit INT,
    betel_nut_habit INT,
    diet_pickled_freq BOOLEAN,                -- 常吃醃漬品 (每週>=3次)
    diet_smoked_freq BOOLEAN,                 -- 常吃煙燻燒烤
    diet_raw_freq BOOLEAN                     -- 常吃生食
);

-- 4. 口腔黏膜檢查問卷明細表
CREATE TABLE questionnaire_oral (
    questionnaire_id BIGINT PRIMARY KEY REFERENCES questionnaires(questionnaire_id),
    screening_location VARCHAR(50),           -- 醫療院所 / 社區設站
    doctor_specialty VARCHAR(50),             -- 牙科 / 耳鼻喉科 / 其他核可專科
    doctor_license_no VARCHAR(50),            -- 醫師執業執照號碼
    
    -- 菸檳習慣分級 (國健署統計階梯)
    betel_nut_tier INT,                       -- 0:無, 1:已戒, 2:<10年(<20顆), 3:<10年(>=20顆), 4:>10年(<20顆), 5:>10年(>=20顆)
    smoking_tier INT,                         -- 0:無, 1:已戒, 2:<10年(<20支), 3:<10年(>=20支), 4:>10年(<20支), 5:>10年(>=20支)
    self_reported_symptoms BOOLEAN,           -- 自覺黏膜異常症狀
    
    -- 醫師初檢結果
    inspection_result VARCHAR(20) NOT NULL,   -- NORMAL(未發現需轉介異常), REFERRAL(需轉介)
    referral_reason_code VARCHAR(10),         -- 轉介原因代碼 (01~11, 多個時勾編碼較小者)
    
    -- 解剖病灶位置標記 (可記錄多個標記點與對應病灶)
    -- 例: [{"loc": "BR", "code": "03"}, {"loc": "FR", "code": "01"}]
    lesion_locations JSONB,
    
    -- 確診追蹤 (個管師後續補登)
    referral_hospital VARCHAR(100),           -- 確診醫院名稱
    recheck_status VARCHAR(30),               -- 2個月內接受確診: YES, NO
    unrechecked_reason VARCHAR(50),           -- 未受檢理由
    pathology_biopsy BOOLEAN,                 -- 是否進行病理切片
    final_diagnosis_code VARCHAR(50),         -- 確診診斷代碼
    treatment_type VARCHAR(50)                -- 衛教追蹤 / 手術化放療 / 拒絕治療
);

-- 5. 稽核日誌與安全軌跡表 (Audit Trail)
CREATE TABLE questionnaire_audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    questionnaire_id BIGINT NOT NULL,
    action_type VARCHAR(20) NOT NULL,         -- CREATE, VIEW, PRINT, SOFT_DELETE, EXPORT
    operator_id VARCHAR(50) NOT NULL,         -- 管理師/操作人員工號
    client_ip VARCHAR(45) NOT NULL,
    user_agent TEXT,
    memo TEXT,                                -- 操作備註 (例如作廢原因)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_qid ON questionnaire_audit_logs(questionnaire_id);

-- 6. 問卷歷史版本快照 (資料封存與變更回溯)
CREATE TABLE questionnaire_snapshots (
    snapshot_id BIGSERIAL PRIMARY KEY,
    questionnaire_id BIGINT NOT NULL REFERENCES questionnaires(questionnaire_id),
    version INT NOT NULL,
    full_data_json JSONB NOT NULL,            -- 當前版本的完整資料鏡像
    content_hash CHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. RESTful API 規格規範

所有 API 統一受 `Authorization: Bearer <JWT>` 保護，要求傳輸層全面實施 TLS 1.3。

### 3.1 API 列表總覽

| 端點 (Endpoint) | HTTP Method | 角色權限 | 說明 |
| :--- | :--- | :--- | :--- |
| `/api/v1/questionnaires/gastric` | `POST` | 患者端 / 護理師 | 送出胃癌問卷並封存簽名 |
| `/api/v1/questionnaires/oral` | `POST` | 醫師 / 護理師 | 送出口腔黏膜檢查問卷 |
| `/api/v1/admin/questionnaires` | `GET` | 管理師 / 系統管理 | 條件查詢問卷列表（含分頁） |
| `/api/v1/admin/questionnaires/{id}` | `GET` | 管理師 / 醫師 | 取得單份問卷詳情與簽名快照 |
| `/api/v1/admin/questionnaires/{id}` | `DELETE` | 管理師 | **軟刪除（作廢）問卷**，需附原因 |
| `/api/v1/admin/questionnaires/{id}/pdf` | `GET` | 管理師 | 產出標準 A4 套印 PDF 流 |
| `/api/v1/admin/questionnaires/batch-pdf`| `POST` | 管理師 | 批次打包下載/列印多份問卷 PDF |

---

### 3.2 關鍵 API 規格定義

#### [POST] `/api/v1/questionnaires/gastric` (送出胃癌問卷)

* **請求範例 (Request Payload)：**

```json
{
  "patient": {
    "idCardNo": "A123456789",
    "chartNo": "00984120",
    "name": "王大明",
    "gender": "M",
    "birthDate": "1965-08-15",
    "isIndigenous": false,
    "phone": "049-2658977",
    "mobile": "0912345678",
    "zipCode": "557",
    "address": "南投縣竹山鎮集山路三段480號",
    "educationLevel": "高中(職)",
    "marriageStatus": "已婚"
  },
  "screening": {
    "formType": "GASTRIC",
    "paymentType": "預防保健",
    "screeningDate": "2026-10-21",
    "samplingUnit": "竹山秀傳醫院",
    "religion": "佛教",
    "occupationStatus": "有，製造業",
    "personalHistory": {
      "gastritis": true,
      "ulcer": true,
      "reflux": false,
      "hpInfection": false,
      "cancer": false,
      "none": false
    },
    "hpEradication": false,
    "gastroscopyHistory": true,
    "gastroscopyYear": 110,
    "antiUlcerDrugsRecentMonth": false,
    "drugAllergyDetail": "無",
    "familyGastricCancerHistory": {
      "has": false,
      "unknown": false
    },
    "smokingHabit": 1,
    "drinkingHabit": 0,
    "betelNutHabit": 0,
    "dietPickledFreq": true,
    "dietSmokedFreq": false,
    "dietRawFreq": false
  },
  "signature": {
    "base64Png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "signedAt": "2026-10-21T15:30:12+08:00"
  }
}
```

* **回應範例 (Response 201 Created)：**

```json
{
  "success": true,
  "code": 201,
  "message": "問卷簽署完成並成功封存",
  "data": {
    "questionnaireId": 10245,
    "dataHash": "a8f5c2d398e281... (SHA-256)",
    "pdfDownloadUrl": "/api/v1/admin/questionnaires/10245/pdf",
    "createdAt": "2026-10-21T15:30:13.250Z"
  }
}
```

---

#### [DELETE] `/api/v1/admin/questionnaires/{id}` (管理師軟刪除/作廢)

* **請求範例 (Request Payload)：**

```json
{
  "voidReasonCode": "DUPLICATE",
  "voidReasonRemark": "同位患者重覆填報，此筆為誤填資料作廢處理。",
  "authPassword": "UserSecretPassword123"
}
```

* **核心業務邏輯：**
  1. 檢驗管理師密碼或權限 Token。
  2. 檢查目前問卷狀態；若已是 `is_deleted = TRUE` 則回傳 400。
  3. 更新 `is_deleted = TRUE`、`deleted_at = NOW()`、`deleted_by = CurrentUser`。
  4. 寫入 `questionnaire_audit_logs` 記錄作廢細節與當前 IP。
  5. **保留原始所有關聯明細表與簽名圖檔，不可執行 SQL `DELETE`。**

* **回應範例 (Response 200 OK)：**

```json
{
  "success": true,
  "code": 200,
  "message": "問卷已成功作廢，系統已寫入永久稽核紀錄",
  "data": {
    "questionnaireId": 10245,
    "status": "VOIDED",
    "isDeleted": true,
    "deletedAt": "2026-10-21T15:35:00.120Z"
  }
}
```

---

## 4. 關鍵功能實作細節

### 4.1 數位簽名（Signature Pad）平滑處理與前端資料傳遞

前端採用 HTML5 Canvas 搭配 Bezier 曲線優化筆觸，並在送出時進行**空筆跡檢驗**與**留白裁切（Crop Bounding Box）**。

```typescript
// signature-service.ts
import SignaturePad from 'signature_pad';

export class QuestionnaireSignatureService {
  private pad: SignaturePad;

  constructor(canvasElement: HTMLCanvasElement) {
    this.pad = new SignaturePad(canvasElement, {
      minWidth: 1.5,
      maxWidth: 3.5,
      penColor: '#000000',
      backgroundColor: 'rgba(255, 255, 255, 0)' // 透明背景便於套印
    });
  }

  // 驗證是否有效簽名 (筆劃點數 > 10，避免只點一點)
  public isValidSignature(): boolean {
    if (this.pad.isEmpty()) return false;
    const strokes = this.pad.toData();
    let totalPoints = 0;
    strokes.forEach(s => totalPoints += s.points.length);
    return totalPoints > 10;
  }

  // 自動裁切多餘空白邊界，取得緊湊的高解析 Base64 圖檔
  public getCroppedSignature(): string | null {
    if (!this.isValidSignature()) return null;
    return this.pad.toDataURL('image/png');
  }

  public clear(): void {
    this.pad.clear();
  }
}
```

### 4.2 後端防竄改雜湊運算 (Data Integrity Hash)

為防範資料庫資料遭未授權就地竄改，在問卷建立或修訂時，後端即時計算全欄位 SHA-256 簽署值：

```csharp
// HashService.cs (C# 範例)
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

public class SecurityIntegrityService
{
    public static string GenerateQuestionnaireHash(object contentPayload, string base64Signature)
    {
        // 1. 序列化結構內容並排除空值與非確定屬性
        string canonicalJson = JsonSerializer.Serialize(contentPayload);
        
        // 2. 結合內容與簽名字串
        string rawSignaturePayload = $"{canonicalJson}|SIG:{base64Signature}";
        
        // 3. 計算 SHA-256 雜湊
        using var sha256 = SHA256.Create();
        byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawSignaturePayload));
        
        return Convert.ToHexString(bytes).ToLower();
    }
}
```

### 4.3 國健署公版 A4 精確套印與 PDF 產生 (以 QuestPDF 為例)

透過 C# 的 `QuestPDF` 引擎將欄位資料及 Base64 簽名檔直接渲染為向量 PDF，可嚴格符合國健署版面規格：

```csharp
// GastricReportDocument.cs
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

public class GastricReportDocument : IDocument
{
    private readonly QuestionnaireGastricDto _model;
    private readonly byte[] _signatureBytes;

    public GastricReportDocument(QuestionnaireGastricDto model, byte[] signatureBytes)
    {
        _model = model;
        _signatureBytes = signatureBytes;
    }

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(15, Unit.Millimetre);
            page.DefaultTextStyle(x => x.FontFamily("Noto Sans TC").FontSize(10));

            page.Header().Text("附表八之四 - 健康署「糞便抗原檢測胃幽門螺旋桿菌服務」管理紀錄表")
                         .FontSize(14).Bold().AlignCenter();

            page.Content().Column(col =>
            {
                col.Spacing(5);
                // 1. 基本資訊表格
                col.Item().Table(table =>
                {
                    table.ColumnsDefinition(cols =>
                    {
                        cols.RelativeColumn(3);
                        cols.RelativeColumn(3);
                        cols.RelativeColumn(4);
                    });
                    
                    table.Cell().Border(0.5f).Padding(3).Text($"姓名: {_model.PatientName}");
                    table.Cell().Border(0.5f).Padding(3).Text($"身分證: {_model.IdCardNo}");
                    table.Cell().Border(0.5f).Padding(3).Text($"門診日期: {_model.ScreeningDate:yyyy/MM/dd}");
                });

                // 2. 勾選問卷內容還原 (以 Checkbox 記號呈現)
                col.Item().PaddingTop(5).Text($"個人病史：[ {(_model.HasGastritis ? "✓" : " ")} ] 胃炎  [ {(_model.HasUlcer ? "✓" : " ")} ] 胃潰瘍  [ {(_model.HasCancer ? "✓" : " ")} ] 胃癌");

                // 3. 簽名區域 (精準嵌入病患簽名)
                col.Item().PaddingTop(15).Row(row =>
                {
                    row.RelativeItem(7).Text("本人同意接受以糞便抗原檢測胃幽門螺旋桿菌檢查...\n確認以上資料正確無誤：").FontSize(9);
                    if (_signatureBytes != null)
                    {
                        row.RelativeItem(3).Height(40).Image(_signatureBytes);
                    }
                });
            });

            page.Footer().AlignCenter().Text(x =>
            {
                x.Span("第 ");
                x.CurrentPageNumber();
                x.Span(" 頁 / 共 ");
                x.TotalPages();
                x.Span(" 頁 (本表單由系統自動存檔匯出)");
            });
        });
    }
}
```

---

## 5. 安全性、醫療隱私與合規設計 (Security & Compliance)

### 5.1 個人資料保護與傳輸加密
1. **身分證號遮蔽 (Masking)：** 在列表介面（非檢視細節時），受檢者身分證統一編號預設遮蔽中 4 碼（例如：`A123***789`）。
2. **靜態資料加密 (Data at Rest Encryption)：** 資料庫啟用透明資料加密 (TDE)；病患個資欄位（地址、電話）與簽名圖檔在 Storage 儲存時採用 AES-256 加密。
3. **平板沙盒隔離：** 供民眾填寫之平板鎖定單一瀏覽器畫面（Kiosk 模式），問卷送出或逾時 90 秒未操作時，自動清空表單並轉向歡迎頁，杜絕下一位受檢者窺探前筆資料。

### 5.2 軟刪除與永久性稽核日誌 (Audit Trail)
1. **嚴禁實體刪除（Hard Delete）：** 系統程式碼層級全面移除 `DELETE FROM questionnaires` 操作，全數改為 `UPDATE is_deleted = true`。
2. **日誌不可篡改（Write-Once Audit）：** `questionnaire_audit_logs` 僅開放 `INSERT` 權限，後端連線帳號不得具備該表的 `UPDATE` 或 `DELETE` 權限，以供主管機關備查。
3. **作廢浮水印機制：** 當調閱或列印已軟刪除的問卷時，PDF 與 Web 檢視畫面底層強制加入半透明紅色浮水印文字：「**已作廢 VOID - 作廢人員 [工號] [日期]**」。

---

## 6. 專案目錄結構規劃

```
cancer-screening-system/
├── frontend/                     # 前端工程 (SPA)
│   ├── src/
│   │   ├── assets/               # 解剖圖 SVG、Logo 圖檔
│   │   ├── components/
│   │   │   ├── signature/        # 數位簽名 Canvas 元件
│   │   │   ├── anatomy-map/      # 口腔解剖位置互動選取器
│   │   │   └── common/           # 卡片按鈕、表單輸入元件
│   │   ├── views/
│   │   │   ├── questionnaire/    # 患者/現場問卷填報頁
│   │   │   ├── doctor/           # 醫師初檢診斷填寫頁
│   │   │   └── admin/            # 管理師問卷列表、列印與作廢
│   │   └── services/             # Axios API 封裝
├── backend/                      # 後端 Web API 工程
│   ├── Controllers/              # API 端點 (Questionnaire, Admin)
│   ├── Services/
│   │   ├── PdfReportService/     # A4 套印與 PDF 匯出模組
│   │   ├── SignatureService/     # 簽名圖檔轉存與雜湊演算
│   │   └── AuditService/         # 審計與快照記錄
│   ├── Models/
│   │   ├── Entities/             # ORM Entity 資料表模型
│   │   └── DTOs/                 # 請求與回應資料傳輸物件
│   └── Migrations/               # DB 綱要版本版控腳本
└── docker-compose.yml            # 本地與測試環境部署容器配置
```