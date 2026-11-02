export type FormType = 'GASTRIC' | 'ORAL' | 'FECAL' | 'CERVICAL' | 'LUNG' | 'BREAST';

export interface Patient {
  chart_no?: string;
  chartNo?: string;
  id_card_no: string;
  idCardNo?: string;
  id_card_no_masked?: string;
  name: string;
  gender: 'M' | 'F';
  birth_date: string;
  birthDate?: string;
  is_indigenous: boolean;
  isIndigenous?: boolean;
  indigenous_tribe?: string;
  indigenousTribe?: string;
  phone?: string;
  mobile: string;
  zip_code?: string;
  zipCode?: string;
  city?: string;
  district?: string;
  village?: string;
  road?: string;
  section_lane?: string;
  sectionLane?: string;
  education_level?: string;
  educationLevel?: string;
  occupation_status?: string;
  occupationStatus?: string;
  marriage_status?: string;
  marriageStatus?: string;
}

export interface GastricScreening {
  sampling_unit?: string;
  sampling_unit_code?: string;
  second_clinic_date?: string;
  religion?: string;
  personal_history: {
    gastritis?: boolean;
    ulcer?: boolean;
    duodenal_ulcer?: boolean;
    reflux?: boolean;
    tumor?: boolean;
    cancer?: boolean;
    hp_infection?: boolean;
    other?: boolean;
    other_text?: string;
    year_minguo?: string;
    year_unknown?: boolean;
    none?: boolean;
  };
  hp_eradication?: boolean;
  gastroscopy_history?: boolean;
  gastroscopy_year?: number | null;
  gastroscopy_year_unknown?: boolean;
  anti_ulcer_drugs_recent_month?: boolean;
  drug_allergy?: boolean;
  drug_allergy_detail?: string;
  family_hp_history?: {
    unknown?: boolean;
    none?: boolean;
    has?: boolean;
    father?: boolean;
    mother?: boolean;
    spouse?: boolean;
    siblings?: boolean;
    siblings_count?: number;
    children?: boolean;
    children_count?: number;
    other?: boolean;
    other_text?: string;
    other_count?: number;
  };
  family_ulcer_history?: {
    unknown?: boolean;
    none?: boolean;
    has?: boolean;
    father?: boolean;
    mother?: boolean;
    spouse?: boolean;
    siblings?: boolean;
    siblings_count?: number;
    children?: boolean;
    children_count?: number;
    other?: boolean;
    other_text?: string;
    other_count?: number;
  };
  family_gastric_cancer_history?: {
    unknown?: boolean;
    none?: boolean;
    has?: boolean;
    father?: boolean;
    mother?: boolean;
    spouse?: boolean;
    siblings?: boolean;
    siblings_count?: number;
    children?: boolean;
    children_count?: number;
    other?: boolean;
    other_text?: string;
    other_count?: number;
  };
  medication_history?: {
    has?: boolean;
    painkiller?: boolean;
    steroid?: boolean;
    antiplatelet?: boolean;
    antiplatelet_aspirin?: boolean;
    antiplatelet_plavix?: boolean;
    antiplatelet_other?: string;
    anticoagulant?: boolean;
    anticoagulant_coumadin?: boolean;
    anticoagulant_other?: string;
    diabetes?: boolean;
    diabetes_oral?: boolean;
    diabetes_insulin?: boolean;
    iron_supplement?: boolean;
  };
  smoking_habit: number;
  drinking_habit: number;
  betel_nut_habit: number;
  diet_pickled_freq: boolean;
  diet_smoked_freq: boolean;
  diet_raw_freq: boolean;
  test_result?: 'NEGATIVE' | 'POSITIVE' | 'WAITING' | 'INVALID';
}

export interface LesionLocation {
  loc: string;
  name: string;
  code: string;
  desc?: string;
}

export interface OralScreening {
  screening_location?: string;
  payment_type?: string;
  doctor_dept?: string;
  screening_unit?: string;
  screening_unit_code?: string;
  doctor_name?: string;
  doctor_license_no?: string;
  betel_nut_tier: number;
  smoking_tier: number;
  self_reported_symptoms: boolean;
  inspection_result?: 'NORMAL' | 'REFERRAL' | 'PENDING';
  referral_reason_code?: string;
  referral_reasons_selected?: string[];
  other_reason_text?: string;
  lesion_locations: LesionLocation[];
  referral_hospital?: string;
  referral_doctor?: string;
  referral_phone?: string;
  followup?: {
    recheck_within_2months?: boolean;
    unrechecked_reason?: string;
    recheck_hospital?: string;
    recheck_date?: string;
    biopsy_performed?: boolean;
    clinical_diagnosis?: string;
    pathology_diagnosis?: string;
    treatment_status?: string;
  } | null;
}

export interface FecalDeclaration {
  enabled: boolean;
  inability_reason?: string;
  relative_relation?: '父親' | '母親' | '兄弟姐妹' | '子女' | '';
  relative_name?: string;
  relative_id_card?: string;
  is_relative_deceased?: boolean;
  declaration_signed_at?: string;
}

export interface FecalScreening {
  payment_type?: string;
  screening_location?: string;
  hospital_name?: string;
  hospital_code?: string;
  clinic_date?: string;
  // 家族病史及吸菸習慣
  smoking_history: boolean;
  smoking_start_age?: number | null;
  family_colorectal_cancer: number; // 0: 無, 1: 有, 2: 不知道
  family_other_cancer: number; // 0: 無, 1: 有, 2: 不知道
  // 有無症狀
  has_bowel_symptoms: boolean; // 0: 無, 1: 有
  // 附表五之五：40-44歲二親等血親大腸癌聲明書
  declaration_statement?: FecalDeclaration;
  // 糞便潛血檢查結果 (醫事檢驗機構填寫)
  lab_unit_name?: string;
  lab_test_date?: string;
  test_result?: 'NEGATIVE' | 'POSITIVE' | 'PENDING';
  test_value?: string;
  reagent_brand?: 'Eiken' | 'Kyowa' | 'OTHER';
  reagent_brand_other?: string;
  // 個案確診結果 (陽性追蹤)
  has_followup_3months?: boolean | null;
  unconfirmed_reason?: string;
  unconfirmed_reason_other?: string;
  confirm_hospital?: string;
  confirm_date?: string;
  confirm_method?: 'COLONOSCOPY' | 'OTHER';
  confirm_method_other?: string;
  diagnosis?: 'NORMAL' | 'HEMORRHOIDS' | 'COLITIS' | 'POLYP' | 'COLORECTAL_CANCER' | 'OTHER';
  diagnosis_other?: string;
  polyp_removal_status?: 'NOT_REMOVED' | 'COMPLETELY_REMOVED' | 'INCOMPLETELY_REMOVED';
}

export interface CervicalScreening {
  // 表頭
  service_type?: 'NO' | 'SMIR_BUS' | 'COMMUNITY'; // 1.否 2.抹片車 3.社區巡迴服務篩檢
  payment_type?: string; // 1.預防保健 2.健保給付 3.其他公務預算 4.其他 6.自費
  is_recheck?: boolean; // 難判重做? 1.是 2.否
  timing_code?: string; // 時程代碼

  // 二、個案臨床資料 (個案自填)
  last_smear_time?: 'WITHIN_1Y' | '1_TO_2Y' | '2_TO_3Y' | 'OVER_3Y' | 'NEVER';
  is_menopause?: 'YES' | 'NO' | 'UNKNOWN';
  last_menstrual_date?: string;
  is_pregnant?: 'YES' | 'NO' | 'UNKNOWN';
  hysterectomy_status?: 'YES' | 'NO' | 'UNKNOWN'; // 子宮切除
  radiation_therapy?: 'YES' | 'NO' | 'UNKNOWN'; // 放射治療
  hpv_vaccine?: 'YES' | 'NO' | 'UNKNOWN';
  hpv_vaccine_year?: string;

  // 三之一、抹片資料 (採檢機構填寫)
  chart_no?: string;
  double_cervix?: boolean;
  sampling_date?: string;
  sampling_unit_name?: string;
  sampling_unit_code?: string;
  sampler_name?: string;
  sampler_role?: 'OBGYN_DOC' | 'FM_DOC' | 'MIDWIFE' | 'HEALTH_NURSE' | 'HEALTH_DOC';
  combine_hpv?: boolean;
  smear_purpose?: 'SCREENING' | 'SUSPECT_CANCER' | 'FOLLOWUP' | 'PREV_DIFFICULT' | 'OTHER';
  clinical_findings?: string;

  // 三之二、抹片資料 (病理機構填寫)
  pathology_no?: string;
  lab_unit_name?: string;
  lab_unit_code?: string;
  received_date?: string;
  specimen_type?: 'CONVENTIONAL' | 'LBC';

  // 四、抹片判讀結果 (病理機構填寫)
  reading_method?: 'MANUAL' | 'AUTO' | 'MANUAL_AUTO';
  smear_quality?: 'GOOD' | 'SATISFACTORY' | 'UNSATISFACTORY';
  quality_reasons?: string[];
  quality_reason_other?: string;
  infections?: string[];
  infection_other?: string;
  cytology_diagnosis?: string; // 1~18
  endometrial_cells_over_40?: boolean;
  recommendations?: string[];
  recommendation_other?: string;
  cytotechnologist_name?: string;
  cytotechnologist_code?: string;
  cytopathologist_name?: string;
  cytopathologist_code?: string;
  confirmed_date?: string;
}

export interface LungConsent {
  screened_past_2years: boolean; // 過去2年內曾接受過本檢查服務
  is_pregnant: boolean; // 目前有無懷孕
  had_chest_ct_past_12months: boolean; // 過去12個月內有無接受過胸部CT(含LDCT)
  had_lung_cancer: boolean; // 是否得過肺癌
  cannot_hold_breath: boolean; // 是否有無法閉氣等無法完成檢查程序之情形
  hemoptysis_past_month: boolean; // 過去1個月內是否有不明原因之咳血，或明顯可疑肺癌病灶
  weight_loss_past_year: boolean; // 過去1年內是否有不明原因體重減輕超過6公斤
  accept_biopsy_or_surgery: 'YES' | 'NO'; // 若有醫療上的需要，可以/不可以接受胸腔穿刺或手術
  agreed_items: {
    reduced_mortality_informed: boolean;
    early_detection_limitation_informed: boolean;
    nodule_ratio_and_followup_informed: boolean;
    not_cancer_prevention_informed: boolean;
    biennial_screening_fee_liability_informed: boolean;
    followup_clinic_or_mail_informed: boolean;
    image_upload_and_cross_query_agreed: boolean;
    data_linkage_privacy_agreed: boolean;
  };
  educator_name: string; // 醫院對民眾進行衛教及知情同意人員
  checked_system_no_duplicate: boolean; // 已至「肺癌早期偵測計畫追蹤管理系統」查詢民眾無2年內接受胸部LDCT之情形
}

export interface LungFamilyHistory {
  has_family_history: boolean;
  total_affected_count: number;
  details: {
    father: { affectedCount: number; diagnosedAgeMin: number | null };
    mother: { affectedCount: number; diagnosedAgeMin: number | null };
    brother: { affectedCount: number; diagnosedAgeMin: number | null };
    sister: { affectedCount: number; diagnosedAgeMin: number | null };
    son: { affectedCount: number; diagnosedAgeMin: number | null };
    daughter: { affectedCount: number; diagnosedAgeMin: number | null };
  };
  proof_relative_name: string; // 診斷證明或聲明書所列家屬姓名
  proof_relative_birth: string; // 民國出生年月日
  proof_relative_id: string; // 身分證字號
}

export interface LungSmokingHistory {
  co_reading_ppm?: number | null; // 一氧化碳檢測值 (ppm)
  has_smoking_history: boolean; // 有吸菸史
  packs_per_day: number | null; // 每天抽幾包 (20支/包)
  smoking_years: number | null; // 抽菸幾年
  pack_years: number | null; // 包-年 (自動計算)
  is_quit: boolean; // 是否已戒菸
  quit_year_minguo: number | null; // 自民國幾年成功戒菸
  smoking_cessation_service: 'OFFERED' | 'IN_TREATMENT' | 'NONE'; // 戒菸服務
  secondhand_smoke_exposure: boolean; // 二手菸暴露 (每週至少1天吸入菸草煙霧15分鐘以上)
  no_smoke_and_no_secondhand: boolean; // 無吸菸也無二手菸暴露
}

export interface LungCookingOilSmoke {
  cooking_years: number | null; // 煮食經歷年
  fried_days_per_week: number | null; // 煎天數
  stir_fry_days_per_week: number | null; // 炒天數
  deep_fry_days_per_week: number | null; // 炸天數
  use_range_hood: boolean; // 使用排油煙機情形
}

export interface LungOccupationalExposure {
  asbestos: boolean; // 接觸石綿如石綿製造、造/拆船、鍋爐管線保養業等
  heavy_metals_coal: boolean; // 接觸重金屬、煤、瀝青等如冶煉工廠、金屬製造業、焊接、礦業等
  dust_cotton: boolean; // 暴露於粉塵、棉絮
  radiation_environment: boolean; // 放射環境
  temple_incense: boolean; // 廟宇工作(燒香)
  none: boolean; // 無
}

export interface LungNoduleDetail {
  entire_size_mm: number | null;
  density: 'non-solid' | 'part-solid' | 'solid';
  solid_part_size_mm?: number | null;
  lobe: 'RUL' | 'RML' | 'RLL' | 'LUL' | 'LLL';
  se?: string;
  im?: string;
  comparison: 'unchanged' | 'enlarging' | 'newly_found' | 'no_prior';
}

export interface LungScreening {
  payment_type: '預防保健' | '健保醫療給付' | '其他公務預算補助' | '自費健康檢查' | '其他';
  hospital_name: string;
  hospital_code: string;
  clinic_date: string;
  consent: LungConsent;
  height_cm: number | null;
  weight_kg: number | null;
  bmi?: number | null;
  pulmonary_disease_history: {
    copd: boolean;
    tb: boolean;
    pneumonia: boolean;
    chronic_bronchitis: boolean;
    pneumoconiosis: boolean;
    emphysema: boolean;
    ipf: boolean;
    systemic_sclerosis: boolean;
    none: boolean;
    exception_declared: boolean;
  };
  family_history: LungFamilyHistory;
  smoking_history: LungSmokingHistory;
  oil_smoke: LungCookingOilSmoke;
  occupational_exposure: LungOccupationalExposure;
  declarations?: {
    family_relative_declaration?: boolean; // 附件一之五: 具血緣關係聲明書
    heavy_smoker_declaration?: boolean; // 附件一之六: 具重度吸菸史聲明書
    exclusion_exception_declaration?: boolean; // 附件一之七: 具排除狀況聲明書
    family_declaration_reason?: string;
    heavy_smoker_declaration_text?: string;
    exclusion_exception_doctor?: string;
    exclusion_exception_hospital?: string;
  };
  result?: {
    imaging_hospital_name: string;
    ct_machine_register_no: string;
    scan_date: string;
    radiologic_technologist: string;
    interpretation_date: string;
    interpretation_doctor: string;
    ldct_quality: 'Good' | 'Acceptable' | 'Not Acceptable';
    ctdivol_mgy?: number | null;
    total_dlp_mgy_cm?: number | null;
    prior_ct_comparison: 'NO_PRIOR' | 'HAS_PRIOR';
    prior_ct_date?: string;
    has_no_lung_nodule: boolean;
    has_benign_features: boolean;
    lung_nodules_under_6mm: boolean;
    under_6mm_se?: string;
    under_6mm_im?: string;
    juxtapleural_nodule: boolean;
    lung_nodules_over_6mm: boolean;
    over_6mm_total_number?: '1' | '2' | '3' | '>=4';
    nodule_1?: LungNoduleDetail;
    nodule_2?: LungNoduleDetail;
    nodule_3?: LungNoduleDetail;
    lung_nodules_else_lobes?: ('RUL' | 'RML' | 'RLL' | 'LUL' | 'LLL')[];
    lung_nodules_else_se?: string;
    lung_nodules_else_im?: string;
    airway_nodule?: {
      present: boolean;
      subsegmental?: boolean;
      segmental_proximal?: boolean;
      favors_secretions?: boolean;
      at_baseline?: boolean;
      stable_or_growing?: boolean;
    };
    atypical_pulmonary_cyst?: {
      present: boolean;
      category?: '3' | '4A' | '4B';
      lobe?: 'RUL' | 'RML' | 'RLL' | 'LUL' | 'LLL';
      se?: string;
      im?: string;
    };
    higher_probability_of_metastases?: boolean;
    other_lung_findings?: {
      emphysema: boolean;
      bronchiectasis: boolean;
      bronchitis_bronchiolitis: boolean;
      tree_in_bud: boolean;
      centrilobular_nodules: boolean;
      old_tb: boolean;
      ild: boolean;
      other: boolean;
      other_text?: string;
    };
    other_findings?: {
      enlarged_lymph_nodes: boolean;
      enlarged_lymph_nodes_location?: string;
      coronary_artery_calcification: boolean;
      other_chest_findings: boolean;
      other_chest_findings_text?: string;
      other_abdominal_or_neck_findings: boolean;
      other_abdominal_or_neck_findings_text?: string;
    };
    lung_rads_category: '0' | '1' | '2' | '3' | '4A' | '4B' | '4X';
    cat_0_reason?: 'prior_ct_located' | 'cannot_be_evaluated' | 'inflammatory_infectious';
    modifier_s: boolean;
    referral_needed: boolean;
    notes?: string;
  };
}

export interface BreastFamilyHistory {
  has_breast_cancer: boolean;
  mother: boolean;
  mother_diagnosed_age: string;
  sister: boolean;
  sister_diagnosed_age: string;
  daughter: boolean;
  daughter_diagnosed_age: string;
  grandmother: boolean;
  grandmother_diagnosed_age: string;
  maternal_grandmother: boolean;
  maternal_grandmother_diagnosed_age: string;
  other_relative: boolean;
  other_relative_relation: string;
  other_relative_diagnosed_age: string;
}

export interface BreastLesionLocation {
  right_outer_upper: boolean;
  right_inner_upper: boolean;
  right_outer_lower: boolean;
  right_inner_lower: boolean;
  right_areola: boolean;
  left_outer_upper: boolean;
  left_inner_upper: boolean;
  left_outer_lower: boolean;
  left_inner_lower: boolean;
  left_areola: boolean;
}

export interface BreastScreening {
  sampling_unit?: string;
  sampling_unit_code?: string;
  clinic_date?: string;
  payment_type?: string;
  screening_van?: boolean;
  van_plate_number?: string;

  disease_history: {
    breast_cancer: boolean;
    breast_cancer_left: boolean;
    breast_cancer_right: boolean;
    other_cancer: boolean;
    other_cancer_detail: string;
    breast_benign_disease: boolean;
    benign_fibroadenoma: boolean;
    benign_fibrocystic: boolean;
    benign_hyperplasia: boolean;
    benign_other: boolean;
    benign_other_detail: string;
    benign_unknown: boolean;
  };

  family_history: BreastFamilyHistory;

  menstruation_history: {
    menarche_age: string;
    menopause_status: string;
    menopause_age: string;
    hysterectomy_left_ovary_retained: boolean;
    hysterectomy_right_ovary_retained: boolean;
    hysterectomy_both_ovaries_removed: boolean;
    chemo_radiation_menopause: boolean;
    last_menstrual_period_date: string;
  };

  reproductive_history: {
    has_given_birth: boolean;
    first_birth_age: string;
    has_breastfed: boolean;
    breastfeeding_duration_months: string;
  };

  medication_history: {
    has_used_hormone_replacement: boolean;
    hormone_duration_months: string;
    is_currently_using_hormone: boolean;
    has_used_oral_contraceptives: boolean;
    contraceptive_duration_months: string;
  };

  breast_symptoms: {
    has_symptoms: boolean;
    mass_tender_right: boolean;
    mass_tender_left: boolean;
    nipple_discharge_right: boolean;
    nipple_discharge_left: boolean;
    other_symptom: boolean;
    other_symptom_detail: string;
    lesion_location: BreastLesionLocation;
  };

  surgery_history: {
    has_surgery: boolean;
    biopsy_right: boolean;
    biopsy_left: boolean;
    biopsy_year: string;
    lumpectomy_right: boolean;
    lumpectomy_left: boolean;
    lumpectomy_year: string;
    mastectomy_right: boolean;
    mastectomy_left: boolean;
    mastectomy_year: string;
    reconstruction_right: boolean;
    reconstruction_left: boolean;
    reconstruction_year: string;
    augmentation_right: boolean;
    augmentation_left: boolean;
    augmentation_year: string;
  };

  result?: {
    machine_type: 'CR' | 'DR' | 'Tomo';
    palpation_result: string;
    palpation_remark?: string;
    breast_density: 'a' | 'b' | 'c' | 'd';
    prior_film_comparison: string;
    prior_film_date?: string;
    birads_category: '0' | '1' | '2' | '3' | '4' | '4A' | '4B' | '4C' | '5';
    assessment_finding: string;
    recommendation: string;
    referral_needed: boolean;
    radiology_physician: string;
    radiologic_technologist: string;
    report_date: string;
  };
}

export interface Questionnaire {
  questionnaire_id: number;
  patient_id: number;
  form_type: FormType;
  payment_type: string;
  screening_date: string;
  status: 'COMPLETED' | 'VOIDED' | 'DRAFT' | 'WAITING_DOCTOR';
  patient: Patient;
  gastric?: GastricScreening;
  oral?: OralScreening;
  fecal?: FecalScreening;
  cervical?: CervicalScreening;
  lung?: LungScreening;
  breast?: BreastScreening;
  patient_signature_url: string;
  patient_signed_at: string;
  patient_sign_ip?: string;
  doctor_signature_url?: string | null;
  doctor_signed_at?: string | null;
  data_hash: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;
  void_reason_code?: string | null;
  void_reason_remark?: string | null;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  log_id: number;
  questionnaire_id: number;
  action_type: 'CREATE' | 'VIEW' | 'PRINT' | 'SOFT_DELETE' | 'EXPORT' | 'DOCTOR_INSPECT' | 'TEST_RESULT';
  operator_id: string;
  client_ip: string;
  user_agent?: string;
  memo: string;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  activeCount: number;
  voidedCount: number;
  gastricCount: number;
  oralCount: number;
  fecalCount?: number;
  cervicalCount?: number;
  lungCount?: number;
  breastCount?: number;
  waitingDoctorCount?: number;
  referralCount: number;
  referralRate: string;
  todayCount: number;
}

