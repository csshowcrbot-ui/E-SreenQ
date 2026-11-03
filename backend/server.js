import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'screening_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to compute SHA-256 data hash for tamper resistance
function calculateDataHash(payload, signature) {
  const canonical = JSON.stringify(payload);
  const raw = `${canonical}|SIG:${signature || 'NO_SIG'}`;
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}

// Initial mock database generator
function getInitialData() {
  const dummySignaturePatient = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='80'><path d='M20,50 Q45,15 70,48 T120,35 Q150,60 180,30 T220,55' fill='none' stroke='%230f172a' stroke-width='3' stroke-linecap='round'/></svg>";
  const dummySignatureDoctor = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='80'><path d='M15,40 Q50,5 90,45 T140,20 Q170,55 210,35' fill='none' stroke='%231e3a8a' stroke-width='3' stroke-linecap='round'/><circle cx='180' cy='30' r='12' fill='none' stroke='%23dc2626' stroke-width='1.5'/><text x='173' y='34' font-size='10' fill='%23dc2626'>李</text></svg>";

  const q1 = {
    questionnaire_id: 10241,
    patient_id: 101,
    form_type: 'GASTRIC',
    payment_type: '預防保健',
    screening_date: '2026-10-21',
    status: 'COMPLETED',
    patient: {
      chart_no: '00984120',
      id_card_no: 'A123456789',
      name: '王大明',
      gender: 'M',
      birth_date: '1965-08-15',
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '049-2658977',
      mobile: '0912345678',
      zip_code: '557',
      city: '南投縣',
      district: '竹山鎮',
      village: '雲林里',
      road: '集山路三段',
      section_lane: '480號',
      education_level: '高中(職)',
      occupation_status: '有，製造業',
      marriage_status: '已婚'
    },
    gastric: {
      sampling_unit: '竹山秀傳醫療社團法人竹山秀傳醫院',
      sampling_unit_code: '0938040012',
      second_clinic_date: '',
      religion: '佛教',
      personal_history: {
        gastritis: true,
        ulcer: true,
        duodenal_ulcer: false,
        reflux: false,
        tumor: false,
        cancer: false,
        hp_infection: false,
        other: false,
        other_text: '',
        year_minguo: '108',
        year_unknown: false,
        none: false
      },
      hp_eradication: false,
      gastroscopy_history: true,
      gastroscopy_year: 110,
      gastroscopy_year_unknown: false,
      anti_ulcer_drugs_recent_month: true,
      drug_allergy: false,
      drug_allergy_detail: '',
      family_hp_history: { unknown: false, none: true, has: false },
      family_ulcer_history: {
        unknown: false, none: false, has: true,
        father: true, mother: false, spouse: false, siblings: false, siblings_count: 0,
        children: false, children_count: 0, other: false, other_text: '', other_count: 0
      },
      family_gastric_cancer_history: {
        unknown: false, none: false, has: true,
        father: true, mother: false, spouse: false, siblings: false, siblings_count: 0,
        children: false, children_count: 0, other: false, other_text: '', other_count: 0
      },
      medication_history: {
        has: true,
        painkiller: true,
        steroid: false,
        antiplatelet: true,
        antiplatelet_aspirin: true,
        antiplatelet_plavix: false,
        antiplatelet_other: '',
        anticoagulant: false,
        anticoagulant_coumadin: false,
        anticoagulant_other: '',
        diabetes: false,
        diabetes_oral: false,
        diabetes_insulin: false,
        iron_supplement: false
      },
      smoking_habit: 1, // 已戒
      drinking_habit: 0, // 從不
      betel_nut_habit: 0, // 從不
      diet_pickled_freq: true,
      diet_smoked_freq: true,
      diet_raw_freq: false,
      test_result: 'POSITIVE' // 陽性(抗原)
    },
    patient_signature_url: dummySignaturePatient,
    patient_signed_at: '2026-10-21T09:15:30.000Z',
    patient_sign_ip: '192.168.10.45',
    doctor_signature_url: null,
    doctor_signed_at: null,
    data_hash: '3f7c460a1d94f26b52780e55cb47a9ec891bca72e36495dbbf41e06fa5920d82',
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
    void_reason_code: null,
    void_reason_remark: null,
    version: 1,
    created_by: '患者本人(平板填報)',
    created_at: '2026-10-21T09:15:30.000Z',
    updated_at: '2026-10-21T09:15:30.000Z'
  };

  const q2 = {
    questionnaire_id: 10242,
    patient_id: 102,
    form_type: 'ORAL',
    payment_type: '預防保健',
    screening_date: '2026-10-21',
    status: 'COMPLETED',
    patient: {
      chart_no: '00389144',
      id_card_no: 'B120987654',
      name: '陳小華',
      gender: 'M',
      birth_date: '1978-04-12',
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '04-23592525',
      mobile: '0922888999',
      zip_code: '557',
      city: '南投縣',
      district: '竹山鎮',
      village: '延平里',
      road: '集山路二段',
      section_lane: '12號',
      education_level: '專科、大學',
      occupation_status: '有，交通運輸',
      marriage_status: '已婚'
    },
    oral: {
      screening_location: '醫療院所',
      doctor_dept: '耳鼻喉科',
      screening_unit: '竹山秀傳醫療社團法人竹山秀傳醫院',
      screening_unit_code: '0938040012',
      doctor_name: '李宗霖',
      doctor_license_no: '醫字第041892號',
      betel_nut_tier: 1, // 已戒
      smoking_tier: 5, // 嚼/吸超過10年, 每天20支及以上
      self_reported_symptoms: true,
      inspection_result: 'REFERRAL', // 需轉介
      referral_reason_code: '01', // 疑似口腔癌 (編碼較小者)
      referral_reasons_selected: ['01', '72'],
      other_reason_text: '',
      lesion_locations: [
        { loc: 'BR', name: '右頰黏膜', code: '72', desc: '均質性厚白斑' },
        { loc: 'FR', name: '舌(右側舌緣)', code: '01', desc: '疑似口腔癌 (質硬潰瘍邊緣隆起)' }
      ],
      referral_hospital: '彰化基督教醫院',
      referral_doctor: '李宗霖',
      referral_phone: '049-2658977 分機218',
      followup: {
        recheck_within_2months: true,
        recheck_hospital: '彰化基督教醫院',
        recheck_date: '2026-10-28',
        biopsy_performed: true,
        clinical_diagnosis: '疑似口腔癌',
        pathology_diagnosis: '上皮變異(中度)',
        treatment_status: '手術切除邊緣病灶'
      }
    },
    patient_signature_url: dummySignaturePatient,
    patient_signed_at: '2026-10-21T10:02:11.000Z',
    patient_sign_ip: '192.168.10.46',
    doctor_signature_url: dummySignatureDoctor,
    doctor_signed_at: '2026-10-21T10:20:45.000Z',
    data_hash: '9a8d27e4f16b3491c5210baef38411d670f5e1c9a418512eacde83091176b6ef',
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
    void_reason_code: null,
    void_reason_remark: null,
    version: 1,
    created_by: '李宗霖 醫師 (診間)',
    created_at: '2026-10-21T10:20:45.000Z',
    updated_at: '2026-10-21T10:20:45.000Z'
  };

  const q3 = {
    questionnaire_id: 10243,
    patient_id: 103,
    form_type: 'GASTRIC',
    payment_type: '預防保健',
    screening_date: '2026-10-20',
    status: 'COMPLETED',
    patient: {
      chart_no: '00477121',
      id_card_no: 'L223344556',
      name: '張玉琴',
      gender: 'F',
      birth_date: '1972-11-05',
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '049-2641122',
      mobile: '0933555777',
      zip_code: '557',
      city: '南投縣',
      district: '竹山鎮',
      village: '中和里',
      road: '頂林路',
      section_lane: '88號',
      education_level: '國(初)中',
      occupation_status: '無',
      marriage_status: '已婚'
    },
    gastric: {
      sampling_unit: '竹山秀傳醫療社團法人竹山秀傳醫院',
      sampling_unit_code: '0938040012',
      second_clinic_date: '',
      religion: '道教',
      personal_history: {
        gastritis: false,
        ulcer: false,
        duodenal_ulcer: false,
        reflux: true,
        tumor: false,
        cancer: false,
        hp_infection: false,
        other: false,
        other_text: '',
        year_minguo: '',
        year_unknown: false,
        none: false
      },
      hp_eradication: false,
      gastroscopy_history: false,
      gastroscopy_year: null,
      anti_ulcer_drugs_recent_month: false,
      drug_allergy: false,
      drug_allergy_detail: '',
      family_hp_history: { unknown: false, none: true, has: false },
      family_ulcer_history: { unknown: false, none: true, has: false },
      family_gastric_cancer_history: { unknown: false, none: true, has: false },
      medication_history: { has: false },
      smoking_habit: 0,
      drinking_habit: 0,
      betel_nut_habit: 0,
      diet_pickled_freq: false,
      diet_smoked_freq: false,
      diet_raw_freq: false,
      test_result: 'NEGATIVE' // 陰性
    },
    patient_signature_url: dummySignaturePatient,
    patient_signed_at: '2026-10-20T14:20:10.000Z',
    patient_sign_ip: '192.168.10.42',
    doctor_signature_url: null,
    doctor_signed_at: null,
    data_hash: '5d8f33190ab7a28e932155bcdef19827419e078a9c8e17812547bdae49129532',
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
    void_reason_code: null,
    void_reason_remark: null,
    version: 1,
    created_by: '患者本人(平板填報)',
    created_at: '2026-10-20T14:20:10.000Z',
    updated_at: '2026-10-20T14:20:10.000Z'
  };

  const q4 = {
    questionnaire_id: 10244,
    patient_id: 104,
    form_type: 'ORAL',
    payment_type: '預防保健',
    screening_date: '2026-10-19',
    status: 'COMPLETED',
    patient: {
      chart_no: '00129844',
      id_card_no: 'N121122334',
      name: '劉志明',
      gender: 'M',
      birth_date: '1981-06-20',
      is_indigenous: true,
      indigenous_tribe: '泰雅族',
      phone: '049-2771122',
      mobile: '0955112233',
      zip_code: '556',
      city: '南投縣',
      district: '信義鄉',
      village: '羅娜村',
      road: '信筆巷',
      section_lane: '5號',
      education_level: '高中(職)',
      occupation_status: '有，農業',
      marriage_status: '已婚'
    },
    oral: {
      screening_location: '社區或職場設站篩檢',
      doctor_dept: '牙科',
      screening_unit: '竹山秀傳醫療社團法人竹山秀傳醫院',
      screening_unit_code: '0938040012',
      doctor_name: '何家豪',
      doctor_license_no: '牙字第012950號',
      betel_nut_tier: 2, // 10年以下，少於20顆
      smoking_tier: 2, // 10年以下，少於20支
      self_reported_symptoms: false,
      inspection_result: 'NORMAL', // 未發現需轉介異常
      referral_reason_code: '00',
      referral_reasons_selected: [],
      other_reason_text: '',
      lesion_locations: [],
      referral_hospital: '',
      referral_doctor: '',
      referral_phone: '',
      followup: null
    },
    patient_signature_url: dummySignaturePatient,
    patient_signed_at: '2026-10-19T11:10:00.000Z',
    patient_sign_ip: '192.168.20.15',
    doctor_signature_url: dummySignatureDoctor,
    doctor_signed_at: '2026-10-19T11:25:30.000Z',
    data_hash: '2b4c6e8f1903429aefb9087e512cb84910ef6731ba5049381745abdf987623a1',
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
    void_reason_code: null,
    void_reason_remark: null,
    version: 1,
    created_by: '何家豪 醫師 (巡迴醫療)',
    created_at: '2026-10-19T11:25:30.000Z',
    updated_at: '2026-10-19T11:25:30.000Z'
  };

  const q5 = {
    questionnaire_id: 10245,
    patient_id: 105,
    form_type: 'LUNG',
    payment_type: '預防保健',
    screening_date: '2026-10-22',
    status: 'COMPLETED',
    patient: {
      chart_no: '00552199',
      id_card_no: 'M120334455',
      name: '黃志偉',
      gender: 'M',
      birth_date: '1970-03-15',
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '049-2642123',
      mobile: '0933887766',
      zip_code: '557',
      city: '南投縣',
      district: '竹山鎮',
      village: '中正里',
      road: '中正巷',
      section_lane: '18號',
      education_level: '高中/高職',
      occupation_status: '有，製造業',
      marriage_status: '已婚'
    },
    lung: {
      payment_type: '預防保健',
      hospital_name: '竹山秀傳醫療社團法人竹山秀傳醫院',
      hospital_code: '0938040012',
      clinic_date: '2026-10-22',
      consent: {
        screened_past_2years: false,
        is_pregnant: false,
        had_chest_ct_past_12months: false,
        had_lung_cancer: false,
        cannot_hold_breath: false,
        hemoptysis_past_month: false,
        weight_loss_past_year: false,
        accept_biopsy_or_surgery: 'YES',
        agreed_items: {
          reduced_mortality_informed: true,
          early_detection_limitation_informed: true,
          nodule_ratio_and_followup_informed: true,
          not_cancer_prevention_informed: true,
          biennial_screening_fee_liability_informed: true,
          followup_clinic_or_mail_informed: true,
          image_upload_and_cross_query_agreed: true,
          data_linkage_privacy_agreed: true
        },
        educator_name: '張雅筑 個管師',
        checked_system_no_duplicate: true
      },
      height_cm: 172,
      weight_kg: 68,
      bmi: 23.0,
      pulmonary_disease_history: {
        copd: true,
        tb: false,
        pneumonia: false,
        chronic_bronchitis: false,
        pneumoconiosis: false,
        emphysema: false,
        ipf: false,
        systemic_sclerosis: false,
        none: false,
        exception_declared: false
      },
      family_history: {
        has_family_history: true,
        total_affected_count: 1,
        details: {
          father: { affectedCount: 1, diagnosedAgeMin: 65 },
          mother: { affectedCount: 0, diagnosedAgeMin: null },
          brother: { affectedCount: 0, diagnosedAgeMin: null },
          sister: { affectedCount: 0, diagnosedAgeMin: null },
          son: { affectedCount: 0, diagnosedAgeMin: null },
          daughter: { affectedCount: 0, diagnosedAgeMin: null }
        },
        proof_relative_name: '黃天成',
        proof_relative_birth: '35年08月10日',
        proof_relative_id: 'M100112233'
      },
      smoking_history: {
        co_reading_ppm: 14,
        has_smoking_history: true,
        packs_per_day: 1,
        smoking_years: 32,
        pack_years: 32,
        is_quit: false,
        quit_year_minguo: null,
        smoking_cessation_service: 'OFFERED',
        secondhand_smoke_exposure: false,
        no_smoke_and_no_secondhand: false
      },
      oil_smoke: {
        cooking_years: 5,
        fried_days_per_week: 1,
        stir_fry_days_per_week: 2,
        deep_fry_days_per_week: 0,
        use_range_hood: true
      },
      occupational_exposure: {
        asbestos: false,
        heavy_metals_coal: true,
        dust_cotton: false,
        radiation_environment: false,
        temple_incense: false,
        none: false
      },
      declarations: {
        family_relative_declaration: true,
        heavy_smoker_declaration: true,
        exclusion_exception_declaration: false,
        family_declaration_reason: '長輩早期就診診斷書已佚失，特此簽立血親肺癌聲明書',
        heavy_smoker_declaration_text: '本人菸齡32年每日1包，達32包-年，符合公費LDCT條件'
      },
      result: {
        imaging_hospital_name: '竹山秀傳醫療社團法人竹山秀傳醫院',
        ct_machine_register_no: '衛部醫器製字第004128號 (GE Revolution 128切)',
        scan_date: '2026-10-22',
        radiologic_technologist: '王銘憲 (放射師 RT0298)',
        interpretation_date: '2026-10-23',
        interpretation_doctor: '林博仁 醫師 (胸腔專科 R0388)',
        ldct_quality: 'Good',
        ctdivol_mgy: 2.1,
        total_dlp_mgy_cm: 75.6,
        prior_ct_comparison: 'NO_PRIOR',
        has_no_lung_nodule: false,
        has_benign_features: false,
        lung_nodules_under_6mm: false,
        juxtapleural_nodule: false,
        lung_nodules_over_6mm: true,
        over_6mm_total_number: '1',
        nodule_1: {
          entire_size_mm: 7.2,
          density: 'part-solid',
          solid_part_size_mm: 3.5,
          lobe: 'RUL',
          se: '2',
          im: '48',
          comparison: 'no_prior'
        },
        airway_nodule: { present: false },
        atypical_pulmonary_cyst: { present: false },
        higher_probability_of_metastases: false,
        other_lung_findings: {
          emphysema: true,
          bronchiectasis: false,
          bronchitis_bronchiolitis: false,
          tree_in_bud: false,
          centrilobular_nodules: false,
          old_tb: false,
          ild: false,
          other: false
        },
        other_findings: {
          enlarged_lymph_nodes: false,
          coronary_artery_calcification: true,
          other_chest_findings: false,
          other_abdominal_or_neck_findings: false
        },
        lung_rads_category: '4A',
        modifier_s: true,
        referral_needed: true,
        notes: '右肺上葉 (RUL) 發現 7.2mm 部份實質結節 (solid part 3.5mm)，Lung-RADS 4A，建議 3 個月後以低劑量電腦斷層複查或轉介胸腔內科門診進一步確診。'
      }
    },
    patient_signature_url: dummySignaturePatient,
    patient_signed_at: '2026-10-22T10:15:00.000Z',
    patient_sign_ip: '192.168.10.48',
    doctor_signature_url: dummySignatureDoctor,
    doctor_signed_at: '2026-10-23T14:30:00.000Z',
    data_hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
    void_reason_code: null,
    void_reason_remark: null,
    version: 1,
    created_by: '患者本人(平板填報)',
    created_at: '2026-10-22T10:15:00.000Z',
    updated_at: '2026-10-23T14:30:00.000Z'
  };

  const q6 = {
    questionnaire_id: 10246,
    patient_id: 106,
    form_type: 'BREAST',
    payment_type: '預防保健',
    screening_date: '2026-10-23',
    status: 'COMPLETED',
    patient: {
      chart_no: '00683921',
      id_card_no: 'N221889900',
      name: '林淑芬',
      gender: 'F',
      birth_date: '1977-09-12',
      is_indigenous: false,
      indigenous_tribe: '',
      phone: '049-2651234',
      mobile: '0918-667788',
      zip_code: '557',
      city: '南投縣',
      district: '竹山鎮',
      village: '延平里',
      road: '集山路三段',
      section_lane: '480號',
      education_level: '專科、大學',
      occupation_status: '有',
      marriage_status: '已婚'
    },
    breast: {
      sampling_unit: '竹山秀傳醫療社團法人竹山秀傳醫院',
      sampling_unit_code: '0938040012',
      clinic_date: '2026-10-23',
      payment_type: '預防保健',
      screening_van: true,
      van_plate_number: '88-XY',
      disease_history: {
        breast_cancer: false,
        breast_cancer_left: false,
        breast_cancer_right: false,
        other_cancer: false,
        other_cancer_detail: '',
        breast_benign_disease: false,
        benign_fibroadenoma: false,
        benign_fibrocystic: false,
        benign_hyperplasia: false,
        benign_other: false,
        benign_other_detail: '',
        benign_unknown: false
      },
      family_history: {
        has_breast_cancer: true,
        mother: true,
        mother_diagnosed_age: '52',
        sister: false,
        sister_diagnosed_age: '',
        daughter: false,
        daughter_diagnosed_age: '',
        grandmother: false,
        grandmother_diagnosed_age: '',
        maternal_grandmother: false,
        maternal_grandmother_diagnosed_age: '',
        other_relative: false,
        other_relative_relation: '',
        other_relative_diagnosed_age: ''
      },
      menstruation_history: {
        menarche_age: '13',
        menopause_status: '尚未停經',
        menopause_age: '',
        hysterectomy_left_ovary_retained: false,
        hysterectomy_right_ovary_retained: false,
        hysterectomy_both_ovaries_removed: false,
        chemo_radiation_menopause: false,
        last_menstrual_period_date: '2026-10-10'
      },
      reproductive_history: {
        has_given_birth: true,
        first_birth_age: '28',
        has_breastfed: true,
        breastfeeding_duration_months: '12'
      },
      medication_history: {
        has_used_hormone_replacement: false,
        hormone_duration_months: '',
        is_currently_using_hormone: false,
        has_used_oral_contraceptives: false,
        contraceptive_duration_months: ''
      },
      breast_symptoms: {
        has_symptoms: true,
        mass_tender_right: true,
        mass_tender_left: false,
        nipple_discharge_right: false,
        nipple_discharge_left: false,
        other_symptom: false,
        other_symptom_detail: '',
        lesion_location: {
          right_outer_upper: true,
          right_inner_upper: false,
          right_outer_lower: false,
          right_inner_lower: false,
          right_areola: false,
          left_outer_upper: false,
          left_inner_upper: false,
          left_outer_lower: false,
          left_inner_lower: false,
          left_areola: false
        }
      },
      surgery_history: {
        has_surgery: false,
        biopsy_right: false,
        biopsy_left: false,
        biopsy_year: '',
        lumpectomy_right: false,
        lumpectomy_left: false,
        lumpectomy_year: '',
        mastectomy_right: false,
        mastectomy_left: false,
        mastectomy_year: '',
        reconstruction_right: false,
        reconstruction_left: false,
        reconstruction_year: '',
        augmentation_right: false,
        augmentation_left: false,
        augmentation_year: ''
      },
      result: {
        machine_type: 'DR',
        palpation_result: '觸摸到硬塊',
        palpation_remark: '右乳外上象限觸摸到約 1.2cm 質地硬且邊緣稍不規則病灶',
        breast_density: 'c',
        prior_film_comparison: '無舊片可比對',
        prior_film_date: '',
        birads_category: '4B',
        assessment_finding: '右乳外上象限 (Right UO) 可見一群簇狀多形性微小鈣化合併局部不對稱緻密陰影，BI-RADS Category 4B (中度懷疑惡性)。',
        recommendation: '建議轉介至乳房外科門診，安排乳房超音波輔助定位粗針切片檢查 (Core Biopsy) 確診。',
        referral_needed: true,
        radiology_physician: '陳智賢 醫師 (放射診斷專科 R0412)',
        radiologic_technologist: '許美玲 (醫事放射師 RT0188)',
        report_date: '2026-10-24'
      }
    },
    patient_signature_url: dummySignaturePatient,
    patient_signed_at: '2026-10-23T09:40:00.000Z',
    patient_sign_ip: '192.168.10.50',
    doctor_signature_url: dummySignatureDoctor,
    doctor_signed_at: '2026-10-24T11:20:00.000Z',
    data_hash: 'a1b2c3d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef01',
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
    void_reason_code: null,
    void_reason_remark: null,
    version: 1,
    created_by: '受檢者自填(平板填報)',
    created_at: '2026-10-23T09:40:00.000Z',
    updated_at: '2026-10-24T11:20:00.000Z'
  };

  const initialLogs = [
    {
      log_id: 1,
      questionnaire_id: 10241,
      action_type: 'CREATE',
      operator_id: 'PATIENT_KIOSK',
      client_ip: '192.168.10.45',
      user_agent: 'iPadOS / Safari Tablet Kiosk',
      memo: '患者完成胃幽門螺旋桿菌篩檢問卷線上簽署封存',
      created_at: '2026-10-21T09:15:30.000Z'
    },
    {
      log_id: 2,
      questionnaire_id: 10242,
      action_type: 'CREATE',
      operator_id: 'DR_LEE_041892',
      client_ip: '192.168.10.46',
      user_agent: 'Windows 11 / Chrome Workstation',
      memo: '醫師完成口腔黏膜初檢送出，標註病灶2處(BR, FR)，判定需轉介',
      created_at: '2026-10-21T10:20:45.000Z'
    },
    {
      log_id: 3,
      questionnaire_id: 10243,
      action_type: 'CREATE',
      operator_id: 'PATIENT_KIOSK',
      client_ip: '192.168.10.42',
      user_agent: 'iPadOS / Safari Tablet Kiosk',
      memo: '患者完成胃幽門螺旋桿菌問卷填報',
      created_at: '2026-10-20T14:20:10.000Z'
    },
    {
      log_id: 4,
      questionnaire_id: 10244,
      action_type: 'CREATE',
      operator_id: 'DR_HO_012950',
      client_ip: '192.168.20.15',
      user_agent: 'Android Tablet / Chrome Mobile',
      memo: '巡迴篩檢站口篩初檢正常送出',
      created_at: '2026-10-19T11:25:30.000Z'
    }
  ];

  return {
    nextQuestionnaireId: 10247,
    nextLogId: 6,
    questionnaires: [q1, q2, q3, q4, q5, q6],
    auditLogs: initialLogs
  };
}

// Read database
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading DB, falling back to initial seed:', err);
  }
  const init = getInitialData();
  saveDb(init);
  return init;
}

// Save database
function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// Mask ID Card number for privacy: A123456789 -> A123***789
function maskIdCard(id) {
  if (!id || id.length < 8) return id;
  return id.substring(0, 4) + '***' + id.substring(id.length - 3);
}

// Log audit action
function recordAuditLog(db, { questionnaireId, actionType, operatorId, clientIp, userAgent, memo }) {
  const newLog = {
    log_id: db.nextLogId++,
    questionnaire_id: questionnaireId,
    action_type: actionType,
    operator_id: operatorId || 'SYSTEM',
    client_ip: clientIp || '127.0.0.1',
    user_agent: userAgent || 'Unknown Client',
    memo: memo || '',
    created_at: new Date().toISOString()
  };
  db.auditLogs.push(newLog);
  return newLog;
}

// ==================== RESTful API Endpoints ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Cancer Screening System API', time: new Date() });
});

// 1. POST /api/v1/questionnaires/gastric - Submit Gastric Cancer Questionnaire
app.post('/api/v1/questionnaires/gastric', (req, res) => {
  try {
    const { patient, screening, signature } = req.body;
    if (!patient || !screening || !signature) {
      return res.status(400).json({ success: false, message: '缺少病患、問卷或簽名資訊' });
    }

    const db = loadDb();
    const qId = db.nextQuestionnaireId++;
    const now = new Date().toISOString();

    const dataHash = calculateDataHash({ patient, screening }, signature.base64Png);

    const newQuestionnaire = {
      questionnaire_id: qId,
      patient_id: Math.floor(100 + Math.random() * 900),
      form_type: 'GASTRIC',
      payment_type: screening.paymentType || '預防保健',
      screening_date: screening.screeningDate || now.split('T')[0],
      status: 'COMPLETED',
      patient: {
        chart_no: patient.chartNo || `00${Math.floor(100000 + Math.random() * 900000)}`,
        id_card_no: patient.idCardNo,
        name: patient.name,
        gender: patient.gender,
        birth_date: patient.birthDate,
        is_indigenous: !!patient.isIndigenous,
        indigenous_tribe: patient.indigenousTribe || '',
        phone: patient.phone || '',
        mobile: patient.mobile,
        zip_code: patient.zipCode || '',
        city: patient.city || '',
        district: patient.district || '',
        village: patient.village || '',
        road: patient.road || '',
        section_lane: patient.sectionLane || '',
        education_level: patient.educationLevel || '',
        occupation_status: patient.occupationStatus || '',
        marriage_status: patient.marriageStatus || ''
      },
      gastric: {
        sampling_unit: screening.samplingUnit || '竹山秀傳醫療社團法人竹山秀傳醫院',
        sampling_unit_code: screening.samplingUnitCode || '0938040012',
        second_clinic_date: screening.secondClinicDate || '',
        religion: screening.religion || '',
        personal_history: screening.personalHistory || {},
        hp_eradication: !!screening.hpEradication,
        gastroscopy_history: !!screening.gastroscopyHistory,
        gastroscopy_year: screening.gastroscopyYear || null,
        gastroscopy_year_unknown: !!screening.gastroscopyYearUnknown,
        anti_ulcer_drugs_recent_month: !!screening.antiUlcerDrugsRecentMonth,
        drug_allergy: !!screening.drugAllergy,
        drug_allergy_detail: screening.drugAllergyDetail || '',
        family_hp_history: screening.familyHpHistory || {},
        family_ulcer_history: screening.familyUlcerHistory || {},
        family_gastric_cancer_history: screening.familyGastricCancerHistory || {},
        medication_history: screening.medicationHistory || {},
        smoking_habit: Number(screening.smokingHabit ?? 0),
        drinking_habit: Number(screening.drinkingHabit ?? 0),
        betel_nut_habit: Number(screening.betelNutHabit ?? 0),
        diet_pickled_freq: !!screening.dietPickledFreq,
        diet_smoked_freq: !!screening.dietSmokedFreq,
        diet_raw_freq: !!screening.dietRawFreq,
        test_result: screening.testResult || 'WAITING'
      },
      patient_signature_url: signature.base64Png,
      patient_signed_at: signature.signedAt || now,
      patient_sign_ip: req.ip || '127.0.0.1',
      doctor_signature_url: null,
      doctor_signed_at: null,
      data_hash: dataHash,
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      void_reason_code: null,
      void_reason_remark: null,
      version: 1,
      created_by: '患者/民眾線上填報',
      created_at: now,
      updated_at: now
    };

    db.questionnaires.unshift(newQuestionnaire);

    recordAuditLog(db, {
      questionnaireId: qId,
      actionType: 'CREATE',
      operatorId: 'PATIENT_APP',
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      memo: `成功簽署並建立胃幽門桿菌問卷 (${patient.name})`
    });

    saveDb(db);

    return res.status(201).json({
      success: true,
      code: 201,
      message: '問卷簽署完成並成功封存',
      data: {
        questionnaireId: qId,
        dataHash,
        pdfDownloadUrl: `/api/v1/admin/questionnaires/${qId}/pdf`,
        createdAt: now
      }
    });
  } catch (err) {
    console.error('Error submitting gastric form:', err);
    res.status(500).json({ success: false, message: '伺服器內部錯誤: ' + err.message });
  }
});

// 2. POST /api/v1/questionnaires/oral - Submit Oral Mucosa Questionnaire
app.post('/api/v1/questionnaires/oral', (req, res) => {
  try {
    const { patient, oral, patientSignature, doctorSignature } = req.body;
    if (!patient || !oral || !patientSignature) {
      return res.status(400).json({ success: false, message: '缺少受檢者或檢查問卷資料' });
    }

    const db = loadDb();
    const qId = db.nextQuestionnaireId++;
    const now = new Date().toISOString();

    const dataHash = calculateDataHash({ patient, oral }, patientSignature.base64Png + (doctorSignature?.base64Png || ''));

    const hasDoctorSignature = !!doctorSignature?.base64Png;
    const initialStatus = hasDoctorSignature ? 'COMPLETED' : 'WAITING_DOCTOR';
    const initialInspectionResult = hasDoctorSignature ? (oral.inspectionResult || 'NORMAL') : 'PENDING';

    const newQuestionnaire = {
      questionnaire_id: qId,
      patient_id: Math.floor(100 + Math.random() * 900),
      form_type: 'ORAL',
      payment_type: oral.paymentType || '預防保健',
      screening_date: oral.screeningDate || now.split('T')[0],
      status: initialStatus,
      patient: {
        chart_no: patient.chartNo || patient.chart_no || `00${Math.floor(100000 + Math.random() * 900000)}`,
        id_card_no: patient.idCardNo || patient.id_card_no,
        name: patient.name,
        gender: patient.gender,
        birth_date: patient.birthDate || patient.birth_date,
        is_indigenous: !!(patient.isIndigenous || patient.is_indigenous),
        indigenous_tribe: patient.indigenousTribe || patient.indigenous_tribe || '',
        phone: patient.phone || '',
        mobile: patient.mobile,
        zip_code: patient.zipCode || patient.zip_code || '',
        city: patient.city || '',
        district: patient.district || '',
        village: patient.village || '',
        road: patient.road || '',
        section_lane: patient.sectionLane || patient.section_lane || '',
        education_level: patient.educationLevel || patient.education_level || '',
        occupation_status: patient.occupationStatus || patient.occupation_status || '',
        marriage_status: patient.marriageStatus || patient.marriage_status || ''
      },
      oral: {
        screening_location: oral.screeningLocation || '醫療院所',
        doctor_dept: oral.doctorDept || '耳鼻喉科',
        screening_unit: oral.screeningUnit || '竹山秀傳醫療社團法人竹山秀傳醫院',
        screening_unit_code: oral.screeningUnitCode || '0938040012',
        doctor_name: oral.doctorName || '',
        doctor_license_no: oral.doctorLicenseNo || '',
        betel_nut_tier: Number(oral.betelNutTier ?? 0),
        smoking_tier: Number(oral.smokingTier ?? 0),
        self_reported_symptoms: !!oral.selfReportedSymptoms,
        inspection_result: initialInspectionResult,
        referral_reason_code: oral.referralReasonCode || '00',
        referral_reasons_selected: oral.referralReasonsSelected || [],
        other_reason_text: oral.otherReasonText || '',
        lesion_locations: oral.lesionLocations || [],
        referral_hospital: oral.referralHospital || '',
        referral_doctor: oral.referralDoctor || '',
        referral_phone: oral.referralPhone || '',
        followup: oral.followup || null
      },
      patient_signature_url: patientSignature.base64Png,
      patient_signed_at: patientSignature.signedAt || now,
      patient_sign_ip: req.ip || '127.0.0.1',
      doctor_signature_url: doctorSignature?.base64Png || null,
      doctor_signed_at: doctorSignature?.signedAt || (doctorSignature ? now : null),
      data_hash: dataHash,
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      void_reason_code: null,
      void_reason_remark: null,
      version: 1,
      created_by: hasDoctorSignature ? `${oral.doctorName || '醫師'} (診間)` : '受檢者自填/現場登錄',
      created_at: now,
      updated_at: now
    };

    db.questionnaires.unshift(newQuestionnaire);

    recordAuditLog(db, {
      questionnaireId: qId,
      actionType: 'CREATE',
      operatorId: hasDoctorSignature ? (oral.doctorName || 'ORAL_DOCTOR') : 'PATIENT_KIOSK',
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      memo: hasDoctorSignature
        ? `建立口腔黏膜檢查問卷 (${patient.name})，初檢判定: ${oral.inspectionResult === 'REFERRAL' ? '需轉介' : '正常'}`
        : `受檢者 (${patient.name}) 完成基本資料與菸檳習慣線上填報，等待醫師初檢`
    });

    saveDb(db);

    return res.status(201).json({
      success: true,
      code: 201,
      message: hasDoctorSignature ? '口腔黏膜檢查問卷送出並封存成功' : '基本資料與菸檳習慣已成功送出，已轉入後台待醫師初檢',
      data: {
        questionnaireId: qId,
        status: initialStatus,
        dataHash,
        pdfDownloadUrl: `/api/v1/admin/questionnaires/${qId}/pdf`,
        createdAt: now
      }
    });
  } catch (err) {
    console.error('Error submitting oral form:', err);
    res.status(500).json({ success: false, message: '伺服器內部錯誤: ' + err.message });
  }
});

// 2.1 PUT /api/v1/questionnaires/:id/doctor-inspection - Doctor completes oral inspection diagnosis
app.put('/api/v1/questionnaires/:id/doctor-inspection', (req, res) => {
  try {
    const qId = parseInt(req.params.id);
    const db = loadDb();
    const item = db.questionnaires.find(q => q.questionnaire_id === qId);

    if (!item) {
      return res.status(404).json({ success: false, message: '找不到此問卷' });
    }

    if (item.form_type !== 'ORAL') {
      return res.status(400).json({ success: false, message: '此問卷非口腔黏膜檢查表' });
    }

    const {
      screeningUnit,
      screeningUnitCode,
      doctorDept,
      doctorName,
      doctorLicenseNo,
      inspectionResult,
      referralReasonCode,
      referralReasonsSelected,
      otherReasonText,
      lesionLocations,
      referralHospital,
      referralDoctor,
      referralPhone,
      doctorSignature,
      followup
    } = req.body;

    const now = new Date().toISOString();

    item.oral = {
      ...item.oral,
      screening_unit: screeningUnit || item.oral?.screening_unit || '竹山秀傳醫療社團法人竹山秀傳醫院',
      screening_unit_code: screeningUnitCode || item.oral?.screening_unit_code || '0938040012',
      doctor_dept: doctorDept || item.oral?.doctor_dept || '耳鼻喉科',
      doctor_name: doctorName || item.oral?.doctor_name || '',
      doctor_license_no: doctorLicenseNo || item.oral?.doctor_license_no || '',
      inspection_result: inspectionResult || 'NORMAL',
      referral_reason_code: referralReasonCode || (inspectionResult === 'NORMAL' ? '00' : '01'),
      referral_reasons_selected: referralReasonsSelected || [],
      other_reason_text: otherReasonText || '',
      lesion_locations: lesionLocations || [],
      referral_hospital: referralHospital || '',
      referral_doctor: referralDoctor || '',
      referral_phone: referralPhone || '',
      followup: followup !== undefined ? followup : item.oral?.followup
    };

    if (doctorSignature?.base64Png) {
      item.doctor_signature_url = doctorSignature.base64Png;
      item.doctor_signed_at = doctorSignature.signedAt || now;
    }

    item.status = 'COMPLETED';
    item.updated_at = now;

    // Recalculate SHA-256 data hash
    item.data_hash = calculateDataHash(
      { patient: item.patient, oral: item.oral },
      item.patient_signature_url + (item.doctor_signature_url || '')
    );

    recordAuditLog(db, {
      questionnaireId: qId,
      actionType: 'DOCTOR_INSPECT',
      operatorId: doctorName ? `${doctorName} 醫師` : 'ORAL_DOCTOR',
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      memo: `醫師完成口腔黏膜初檢診斷，判定: ${inspectionResult === 'REFERRAL' ? '需轉介' : '正常 (未發現異常)'}`
    });

    saveDb(db);

    return res.json({
      success: true,
      code: 200,
      message: '醫師初檢診斷已成功儲存並完成簽署封存',
      data: item
    });
  } catch (err) {
    console.error('Error saving doctor inspection:', err);
    res.status(500).json({ success: false, message: '醫師初檢診斷儲存失敗: ' + err.message });
  }
});

// 2.2 POST /api/v1/questionnaires/fecal - Submit Fecal Cancer Questionnaire (附表五之四)
app.post('/api/v1/questionnaires/fecal', (req, res) => {
  try {
    const { patient, fecal, signature } = req.body;
    if (!patient || !fecal || !signature) {
      return res.status(400).json({ success: false, message: '缺少受檢者、問卷或簽名資訊' });
    }

    const db = loadDb();
    const qId = db.nextQuestionnaireId++;
    const now = new Date().toISOString();

    const dataHash = calculateDataHash({ patient, fecal }, signature.base64Png);

    const newQuestionnaire = {
      questionnaire_id: qId,
      patient_id: Math.floor(100 + Math.random() * 900),
      form_type: 'FECAL',
      payment_type: fecal.payment_type || '預防保健',
      screening_date: fecal.clinic_date || now.split('T')[0],
      status: 'COMPLETED',
      patient: {
        chart_no: patient.chart_no || patient.chartNo || `00${Math.floor(100000 + Math.random() * 900000)}`,
        id_card_no: patient.id_card_no || patient.idCardNo,
        name: patient.name,
        gender: patient.gender,
        birth_date: patient.birth_date || patient.birthDate,
        is_indigenous: !!(patient.is_indigenous || patient.isIndigenous),
        indigenous_tribe: patient.indigenous_tribe || patient.indigenousTribe || '',
        phone: patient.phone || '',
        mobile: patient.mobile,
        zip_code: patient.zip_code || patient.zipCode || '5570',
        city: patient.city || '',
        district: patient.district || '',
        village: patient.village || '',
        road: patient.road || '',
        section_lane: patient.section_lane || patient.sectionLane || '',
        education_level: patient.education_level || patient.educationLevel || '',
        occupation_status: patient.occupation_status || patient.occupationStatus || '',
        marriage_status: patient.marriage_status || patient.marriageStatus || ''
      },
      fecal: {
        payment_type: fecal.payment_type || '預防保健',
        screening_location: fecal.screening_location || '門診',
        hospital_name: fecal.hospital_name || '竹山秀傳醫療社團法人竹山秀傳醫院',
        hospital_code: fecal.hospital_code || '0938040012',
        clinic_date: fecal.clinic_date || now.split('T')[0],
        smoking_history: !!fecal.smoking_history,
        smoking_start_age: fecal.smoking_start_age || null,
        family_colorectal_cancer: Number(fecal.family_colorectal_cancer ?? 0),
        family_other_cancer: Number(fecal.family_other_cancer ?? 0),
        has_bowel_symptoms: !!fecal.has_bowel_symptoms,
        declaration_statement: fecal.declaration_statement || null,
        lab_unit_name: fecal.lab_unit_name || '竹山秀傳醫療社團法人竹山秀傳醫院 檢驗醫學科 (0938040012)',
        lab_test_date: fecal.lab_test_date || '',
        test_result: fecal.test_result || 'PENDING',
        test_value: fecal.test_value || '',
        reagent_brand: fecal.reagent_brand || 'Kyowa',
        reagent_brand_other: fecal.reagent_brand_other || '',
        has_followup_3months: fecal.has_followup_3months || null,
        unconfirmed_reason: fecal.unconfirmed_reason || '',
        unconfirmed_reason_other: fecal.unconfirmed_reason_other || '',
        confirm_hospital: fecal.confirm_hospital || '',
        confirm_date: fecal.confirm_date || '',
        confirm_method: fecal.confirm_method || 'COLONOSCOPY',
        confirm_method_other: fecal.confirm_method_other || '',
        diagnosis: fecal.diagnosis || 'NORMAL',
        diagnosis_other: fecal.diagnosis_other || '',
        polyp_removal_status: fecal.polyp_removal_status || 'COMPLETELY_REMOVED'
      },
      patient_signature_url: signature.base64Png,
      patient_signed_at: signature.signedAt || now,
      patient_sign_ip: req.ip || '127.0.0.1',
      doctor_signature_url: null,
      doctor_signed_at: null,
      data_hash: dataHash,
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      void_reason_code: null,
      void_reason_remark: null,
      version: 1,
      created_by: '受檢者自填/採便管登錄',
      created_at: now,
      updated_at: now
    };

    db.questionnaires.unshift(newQuestionnaire);

    recordAuditLog(db, {
      questionnaireId: qId,
      actionType: 'CREATE',
      operatorId: 'PATIENT_KIOSK',
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      memo: `成功簽署並建立定量免疫法糞便潛血問卷 (${patient.name})`
    });

    saveDb(db);

    return res.status(201).json({
      success: true,
      code: 201,
      message: '定量免疫法糞便潛血問卷簽署完成並成功封存',
      data: {
        questionnaireId: qId,
        dataHash,
        pdfDownloadUrl: `/api/v1/admin/questionnaires/${qId}/pdf`,
        createdAt: now
      }
    });
  } catch (err) {
    console.error('Error submitting fecal form:', err);
    res.status(500).json({ success: false, message: '伺服器內部錯誤: ' + err.message });
  }
});

// 2.3 PUT /api/v1/questionnaires/:id/fecal-result - Update FIT Lab Result & Followup Diagnosis
app.put('/api/v1/questionnaires/:id/fecal-result', (req, res) => {
  try {
    const qId = parseInt(req.params.id);
    const db = loadDb();
    const item = db.questionnaires.find(q => q.questionnaire_id === qId);

    if (!item) {
      return res.status(404).json({ success: false, message: '找不到此問卷' });
    }

    if (item.form_type !== 'FECAL') {
      return res.status(400).json({ success: false, message: '此問卷非糞便潛血檢查表' });
    }

    const now = new Date().toISOString();

    item.fecal = {
      ...item.fecal,
      ...req.body
    };

    item.updated_at = now;

    // Recalculate hash
    item.data_hash = calculateDataHash(
      { patient: item.patient, fecal: item.fecal },
      item.patient_signature_url
    );

    recordAuditLog(db, {
      questionnaireId: qId,
      actionType: 'TEST_RESULT',
      operatorId: req.headers['x-user-id'] || '檢驗醫學科醫檢師',
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      memo: `登錄/更新糞便潛血檢驗結果與確診追蹤，判定: ${req.body.test_result === 'POSITIVE' ? '陽性' : '陰性'}`
    });

    saveDb(db);

    return res.json({
      success: true,
      code: 200,
      message: '糞便潛血檢驗結果已成功更新',
      data: item
    });
  } catch (err) {
    console.error('Error saving fecal result:', err);
    res.status(500).json({ success: false, message: '更新失敗: ' + err.message });
  }
});

// 2.4 POST /api/v1/questionnaires/cervical - Submit Cervical Screening Questionnaire
app.post('/api/v1/questionnaires/cervical', (req, res) => {
  try {
    const { patient, cervical, signature } = req.body;

    if (!patient || !patient.name || !patient.id_card_no) {
      return res.status(400).json({ success: false, message: '受檢者個人資料未填寫完整' });
    }

    if (!signature || !signature.base64Png) {
      return res.status(400).json({ success: false, message: '尚未完成受檢者數位親筆簽名' });
    }

    const db = loadDb();
    const qId = db.nextQuestionnaireId++;
    const now = new Date().toISOString();

    const dataHash = calculateDataHash({ patient, cervical }, signature.base64Png);

    const newQuestionnaire = {
      questionnaire_id: qId,
      patient_id: Math.floor(100 + Math.random() * 900),
      form_type: 'CERVICAL',
      payment_type: cervical.payment_type || '1',
      screening_date: cervical.sampling_date || now.split('T')[0],
      status: 'COMPLETED',
      patient: {
        chart_no: patient.chart_no || patient.chartNo || `00${Math.floor(100000 + Math.random() * 900000)}`,
        id_card_no: patient.id_card_no || patient.idCardNo,
        name: patient.name,
        gender: patient.gender || 'F',
        birth_date: patient.birth_date || patient.birthDate,
        is_indigenous: !!(patient.is_indigenous || patient.isIndigenous),
        indigenous_tribe: patient.indigenous_tribe || patient.indigenousTribe || '',
        phone: patient.phone || '',
        mobile: patient.mobile,
        zip_code: patient.zip_code || patient.zipCode || '5570',
        city: patient.city || '',
        district: patient.district || '',
        village: patient.village || '',
        road: patient.road || '',
        section_lane: patient.section_lane || patient.sectionLane || '',
        education_level: patient.education_level || patient.educationLevel || '',
        occupation_status: patient.occupation_status || patient.occupationStatus || '',
        marriage_status: patient.marriage_status || patient.marriageStatus || ''
      },
      cervical: {
        service_type: cervical.service_type || 'NO',
        payment_type: cervical.payment_type || '1',
        is_recheck: !!cervical.is_recheck,
        timing_code: cervical.timing_code || '',
        last_smear_time: cervical.last_smear_time || 'WITHIN_1Y',
        is_menopause: cervical.is_menopause || 'NO',
        last_menstrual_date: cervical.last_menstrual_date || '',
        is_pregnant: cervical.is_pregnant || 'NO',
        hysterectomy_status: cervical.hysterectomy_status || 'NO',
        radiation_therapy: cervical.radiation_therapy || 'NO',
        hpv_vaccine: cervical.hpv_vaccine || 'NO',
        hpv_vaccine_year: cervical.hpv_vaccine_year || '',
        chart_no: cervical.chart_no || patient.chart_no || '',
        double_cervix: !!cervical.double_cervix,
        sampling_date: cervical.sampling_date || now.split('T')[0],
        sampling_unit_name: cervical.sampling_unit_name || '竹山秀傳醫療社團法人竹山秀傳醫院',
        sampling_unit_code: cervical.sampling_unit_code || '0938040012',
        sampler_name: cervical.sampler_name || '',
        sampler_role: cervical.sampler_role || 'OBGYN_DOC',
        combine_hpv: !!cervical.combine_hpv,
        smear_purpose: cervical.smear_purpose || 'SCREENING',
        clinical_findings: cervical.clinical_findings || '',
        // Pathology initial defaults (to be filled by lab/pathologist)
        pathology_no: cervical.pathology_no || '',
        lab_unit_name: cervical.lab_unit_name || '竹山秀傳醫療社團法人竹山秀傳醫院 病理檢驗科 (0938040012)',
        lab_unit_code: cervical.lab_unit_code || '0938040012',
        received_date: cervical.received_date || '',
        specimen_type: cervical.specimen_type || 'CONVENTIONAL',
        reading_method: cervical.reading_method || 'MANUAL',
        smear_quality: cervical.smear_quality || 'GOOD',
        quality_reasons: cervical.quality_reasons || [],
        quality_reason_other: cervical.quality_reason_other || '',
        infections: cervical.infections || [],
        infection_other: cervical.infection_other || '',
        cytology_diagnosis: cervical.cytology_diagnosis || '',
        endometrial_cells_over_40: !!cervical.endometrial_cells_over_40,
        recommendations: cervical.recommendations || [],
        recommendation_other: cervical.recommendation_other || '',
        cytotechnologist_name: cervical.cytotechnologist_name || '',
        cytotechnologist_code: cervical.cytotechnologist_code || '',
        cytopathologist_name: cervical.cytopathologist_name || '',
        cytopathologist_code: cervical.cytopathologist_code || '',
        confirmed_date: cervical.confirmed_date || ''
      },
      patient_signature_url: signature.base64Png,
      patient_signed_at: signature.signedAt || now,
      patient_sign_ip: req.ip || '127.0.0.1',
      doctor_signature_url: null,
      doctor_signed_at: null,
      data_hash: dataHash,
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      void_reason_code: null,
      void_reason_remark: null,
      version: 1,
      created_by: '受檢者自填/抹片採檢站',
      created_at: now,
      updated_at: now
    };

    db.questionnaires.unshift(newQuestionnaire);

    recordAuditLog(db, {
      questionnaireId: qId,
      actionType: 'CREATE',
      operatorId: 'PATIENT_KIOSK',
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      memo: `成功簽署並建立女性子宮頸抹片檢查表單 (${patient.name})，採檢人員: ${cervical.sampler_name || '醫師'}`
    });

    saveDb(db);

    return res.status(201).json({
      success: true,
      code: 201,
      message: '女性子宮頸抹片檢查表單簽署完成並成功封存',
      data: {
        questionnaireId: qId,
        dataHash,
        pdfDownloadUrl: `/api/v1/admin/questionnaires/${qId}/pdf`,
        createdAt: now
      }
    });
  } catch (err) {
    console.error('Error submitting cervical form:', err);
    res.status(500).json({ success: false, message: '伺服器內部錯誤: ' + err.message });
  }
});

// 2.5 PUT /api/v1/questionnaires/:id/cervical-result - Update Cervical Pathology Reading & Recommendations
app.put('/api/v1/questionnaires/:id/cervical-result', (req, res) => {
  try {
    const qId = parseInt(req.params.id);
    const db = loadDb();
    const item = db.questionnaires.find(q => q.questionnaire_id === qId);

    if (!item) {
      return res.status(404).json({ success: false, message: '找不到此問卷' });
    }

    if (item.form_type !== 'CERVICAL') {
      return res.status(400).json({ success: false, message: '此問卷非子宮頸抹片檢查表' });
    }

    const now = new Date().toISOString();

    item.cervical = {
      ...item.cervical,
      ...req.body
    };

    item.updated_at = now;

    // Recalculate hash
    item.data_hash = calculateDataHash(
      { patient: item.patient, cervical: item.cervical },
      item.patient_signature_url
    );

    recordAuditLog(db, {
      questionnaireId: qId,
      actionType: 'TEST_RESULT',
      operatorId: req.headers['x-user-id'] || '病理檢驗科醫檢師/專科醫師',
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      memo: `登錄/更新子宮頸抹片病理細胞學診斷，Bethesda代碼: ${req.body.cytology_diagnosis || '未填'}，品質: ${req.body.smear_quality || '未填'}`
    });

    saveDb(db);

    return res.json({
      success: true,
      code: 200,
      message: '子宮頸抹片病理細胞學診斷與處置建議已成功更新入檔',
      data: item
    });
  } catch (err) {
    console.error('Error saving cervical result:', err);
    res.status(500).json({ success: false, message: '更新失敗: ' + err.message });
  }
});

// 2.6 POST /api/v1/questionnaires/lung - Submit Lung Cancer (LDCT) Screening Questionnaire
app.post('/api/v1/questionnaires/lung', (req, res) => {
  try {
    const { patient, lung, signature } = req.body;

    if (!patient || !patient.name || !patient.id_card_no) {
      return res.status(400).json({ success: false, message: '受檢者個人基本資料未填寫完整' });
    }

    if (!signature || !signature.base64Png) {
      return res.status(400).json({ success: false, message: '尚未完成受檢者數位親筆簽名' });
    }

    const db = loadDb();
    const qId = db.nextQuestionnaireId++;
    const now = new Date().toISOString();

    const dataHash = calculateDataHash({ patient, lung }, signature.base64Png);

    const newQuestionnaire = {
      questionnaire_id: qId,
      patient_id: Math.floor(100 + Math.random() * 900),
      form_type: 'LUNG',
      payment_type: lung.payment_type || '預防保健',
      screening_date: lung.clinic_date || now.split('T')[0],
      status: 'COMPLETED',
      patient: {
        chart_no: patient.chart_no || patient.chartNo || `00${Math.floor(100000 + Math.random() * 900000)}`,
        id_card_no: patient.id_card_no || patient.idCardNo,
        name: patient.name,
        gender: patient.gender || 'M',
        birth_date: patient.birth_date || patient.birthDate,
        is_indigenous: !!(patient.is_indigenous || patient.isIndigenous),
        indigenous_tribe: patient.indigenous_tribe || patient.indigenousTribe || '',
        phone: patient.phone || '',
        mobile: patient.mobile,
        zip_code: patient.zip_code || patient.zipCode || '557',
        city: patient.city || '',
        district: patient.district || '',
        village: patient.village || '',
        road: patient.road || '',
        section_lane: patient.section_lane || patient.sectionLane || '',
        education_level: patient.education_level || patient.educationLevel || '',
        occupation_status: patient.occupation_status || patient.occupationStatus || '',
        marriage_status: patient.marriage_status || patient.marriageStatus || ''
      },
      lung: {
        payment_type: lung.payment_type || '預防保健',
        hospital_name: lung.hospital_name || '竹山秀傳醫療社團法人竹山秀傳醫院',
        hospital_code: lung.hospital_code || '0938040012',
        clinic_date: lung.clinic_date || now.split('T')[0],
        consent: lung.consent || {
          screened_past_2years: false,
          is_pregnant: false,
          had_chest_ct_past_12months: false,
          had_lung_cancer: false,
          cannot_hold_breath: false,
          hemoptysis_past_month: false,
          weight_loss_past_year: false,
          accept_biopsy_or_surgery: 'YES',
          agreed_items: {
            reduced_mortality_informed: true,
            early_detection_limitation_informed: true,
            nodule_ratio_and_followup_informed: true,
            not_cancer_prevention_informed: true,
            biennial_screening_fee_liability_informed: true,
            followup_clinic_or_mail_informed: true,
            image_upload_and_cross_query_agreed: true,
            data_linkage_privacy_agreed: true
          },
          educator_name: '',
          checked_system_no_duplicate: true
        },
        height_cm: lung.height_cm || null,
        weight_kg: lung.weight_kg || null,
        bmi: lung.bmi || (lung.height_cm && lung.weight_kg ? Number((lung.weight_kg / Math.pow(lung.height_cm / 100, 2)).toFixed(1)) : null),
        pulmonary_disease_history: lung.pulmonary_disease_history || {
          copd: false,
          tb: false,
          pneumonia: false,
          chronic_bronchitis: false,
          pneumoconiosis: false,
          emphysema: false,
          ipf: false,
          systemic_sclerosis: false,
          none: true,
          exception_declared: false
        },
        family_history: lung.family_history || {
          has_family_history: false,
          total_affected_count: 0,
          details: {
            father: { affectedCount: 0, diagnosedAgeMin: null },
            mother: { affectedCount: 0, diagnosedAgeMin: null },
            brother: { affectedCount: 0, diagnosedAgeMin: null },
            sister: { affectedCount: 0, diagnosedAgeMin: null },
            son: { affectedCount: 0, diagnosedAgeMin: null },
            daughter: { affectedCount: 0, diagnosedAgeMin: null }
          },
          proof_relative_name: '',
          proof_relative_birth: '',
          proof_relative_id: ''
        },
        smoking_history: lung.smoking_history || {
          co_reading_ppm: null,
          has_smoking_history: false,
          packs_per_day: null,
          smoking_years: null,
          pack_years: null,
          is_quit: false,
          quit_year_minguo: null,
          smoking_cessation_service: 'NONE',
          secondhand_smoke_exposure: false,
          no_smoke_and_no_secondhand: true
        },
        oil_smoke: lung.oil_smoke || {
          cooking_years: null,
          fried_days_per_week: null,
          stir_fry_days_per_week: null,
          deep_fry_days_per_week: null,
          use_range_hood: true
        },
        occupational_exposure: lung.occupational_exposure || {
          asbestos: false,
          heavy_metals_coal: false,
          dust_cotton: false,
          radiation_environment: false,
          temple_incense: false,
          none: true
        },
        declarations: lung.declarations || {},
        result: lung.result || null
      },
      patient_signature_url: signature.base64Png,
      patient_signed_at: signature.signedAt || now,
      patient_sign_ip: req.ip || '127.0.0.1',
      doctor_signature_url: null,
      doctor_signed_at: null,
      data_hash: dataHash,
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      void_reason_code: null,
      void_reason_remark: null,
      version: 1,
      created_by: '受檢者自填(平板填報)',
      created_at: now,
      updated_at: now
    };

    db.questionnaires.unshift(newQuestionnaire);

    recordAuditLog(db, {
      questionnaireId: qId,
      actionType: 'CREATE',
      operatorId: 'PATIENT_KIOSK',
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      memo: `成功簽署並建立胸部低劑量電腦斷層檢查(LDCT)問卷與個案同意書 (${patient.name})`
    });

    saveDb(db);

    return res.status(201).json({
      success: true,
      code: 201,
      message: '肺癌篩檢問卷與同意書已完成簽署與封存',
      data: {
        questionnaireId: qId,
        dataHash
      }
    });
  } catch (err) {
    console.error('Error submitting lung form:', err);
    res.status(500).json({ success: false, message: '儲存問卷失敗: ' + err.message });
  }
});

// 2.7 PUT /api/v1/questionnaires/:id/lung-result - Update Lung Cancer LDCT Screening Result (Lung-RADS)
app.put('/api/v1/questionnaires/:id/lung-result', (req, res) => {
  try {
    const qId = parseInt(req.params.id);
    const db = loadDb();
    const item = db.questionnaires.find(q => q.questionnaire_id === qId);

    if (!item) {
      return res.status(404).json({ success: false, message: '找不到此問卷' });
    }

    if (item.form_type !== 'LUNG') {
      return res.status(400).json({ success: false, message: '此問卷非肺癌篩檢表單' });
    }

    const now = new Date().toISOString();

    item.lung = {
      ...item.lung,
      result: {
        ...(item.lung?.result || {}),
        ...req.body
      }
    };

    item.updated_at = now;

    // Recalculate hash
    item.data_hash = calculateDataHash(
      { patient: item.patient, lung: item.lung },
      item.patient_signature_url
    );

    recordAuditLog(db, {
      questionnaireId: qId,
      actionType: 'TEST_RESULT',
      operatorId: req.headers['x-user-id'] || req.body.interpretation_doctor || '放射科/胸腔專科醫師',
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      memo: `登錄/更新胸部LDCT判讀結果，Lung-RADS分級: Category ${req.body.lung_rads_category || '未註明'}，結節數: ${req.body.over_6mm_total_number || '0'}`
    });

    saveDb(db);

    return res.json({
      success: true,
      code: 200,
      message: '胸部低劑量電腦斷層檢查判讀結果已成功入檔保存',
      data: item
    });
  } catch (err) {
    console.error('Error saving lung result:', err);
    res.status(500).json({ success: false, message: '更新失敗: ' + err.message });
  }
});

// 2.8 POST /api/v1/questionnaires/breast - Submit Breast Cancer Screening Questionnaire (附表四之四)
app.post('/api/v1/questionnaires/breast', (req, res) => {
  try {
    const { patient, breast, signature } = req.body;

    if (!patient || !patient.name || !patient.id_card_no) {
      return res.status(400).json({ success: false, message: '受檢者個人基本資料未填寫完整' });
    }

    if (!signature || !signature.base64Png) {
      return res.status(400).json({ success: false, message: '尚未完成受檢者數位親筆簽名' });
    }

    const db = loadDb();
    const qId = db.nextQuestionnaireId++;
    const now = new Date().toISOString();

    const dataHash = calculateDataHash({ patient, breast }, signature.base64Png);

    const newQuestionnaire = {
      questionnaire_id: qId,
      patient_id: Math.floor(100 + Math.random() * 900),
      form_type: 'BREAST',
      payment_type: breast.payment_type || '預防保健',
      screening_date: breast.clinic_date || now.split('T')[0],
      status: 'COMPLETED',
      patient: {
        chart_no: patient.chart_no || patient.chartNo || `00${Math.floor(100000 + Math.random() * 900000)}`,
        id_card_no: patient.id_card_no || patient.idCardNo,
        name: patient.name,
        gender: patient.gender || 'F',
        birth_date: patient.birth_date || patient.birthDate,
        is_indigenous: !!(patient.is_indigenous || patient.isIndigenous),
        indigenous_tribe: patient.indigenous_tribe || patient.indigenousTribe || '',
        phone: patient.phone || '',
        mobile: patient.mobile,
        zip_code: patient.zip_code || patient.zipCode || '557',
        city: patient.city || '',
        district: patient.district || '',
        village: patient.village || '',
        road: patient.road || '',
        section_lane: patient.section_lane || patient.sectionLane || '',
        education_level: patient.education_level || patient.educationLevel || '',
        occupation_status: patient.occupation_status || patient.occupationStatus || '',
        marriage_status: patient.marriage_status || patient.marriageStatus || ''
      },
      breast: {
        sampling_unit: breast.sampling_unit || '竹山秀傳醫療社團法人竹山秀傳醫院',
        sampling_unit_code: breast.sampling_unit_code || '0938040012',
        clinic_date: breast.clinic_date || now.split('T')[0],
        payment_type: breast.payment_type || '預防保健',
        screening_van: !!breast.screening_van,
        van_plate_number: breast.van_plate_number || '',
        
        disease_history: {
          breast_cancer: !!breast.disease_history?.breast_cancer,
          breast_cancer_left: !!breast.disease_history?.breast_cancer_left,
          breast_cancer_right: !!breast.disease_history?.breast_cancer_right,
          other_cancer: !!breast.disease_history?.other_cancer,
          other_cancer_detail: breast.disease_history?.other_cancer_detail || '',
          breast_benign_disease: !!breast.disease_history?.breast_benign_disease,
          benign_fibroadenoma: !!breast.disease_history?.benign_fibroadenoma,
          benign_fibrocystic: !!breast.disease_history?.benign_fibrocystic,
          benign_hyperplasia: !!breast.disease_history?.benign_hyperplasia,
          benign_other: !!breast.disease_history?.benign_other,
          benign_other_detail: breast.disease_history?.benign_other_detail || '',
          benign_unknown: !!breast.disease_history?.benign_unknown
        },

        family_history: {
          has_breast_cancer: !!breast.family_history?.has_breast_cancer,
          mother: !!breast.family_history?.mother,
          mother_diagnosed_age: breast.family_history?.mother_diagnosed_age || '',
          sister: !!breast.family_history?.sister,
          sister_diagnosed_age: breast.family_history?.sister_diagnosed_age || '',
          daughter: !!breast.family_history?.daughter,
          daughter_diagnosed_age: breast.family_history?.daughter_diagnosed_age || '',
          grandmother: !!breast.family_history?.grandmother,
          grandmother_diagnosed_age: breast.family_history?.grandmother_diagnosed_age || '',
          maternal_grandmother: !!breast.family_history?.maternal_grandmother,
          maternal_grandmother_diagnosed_age: breast.family_history?.maternal_grandmother_diagnosed_age || '',
          other_relative: !!breast.family_history?.other_relative,
          other_relative_relation: breast.family_history?.other_relative_relation || '',
          other_relative_diagnosed_age: breast.family_history?.other_relative_diagnosed_age || ''
        },

        menstruation_history: {
          menarche_age: breast.menstruation_history?.menarche_age || '',
          menopause_status: breast.menstruation_history?.menopause_status || '自然停經',
          menopause_age: breast.menstruation_history?.menopause_age || '',
          hysterectomy_left_ovary_retained: !!breast.menstruation_history?.hysterectomy_left_ovary_retained,
          hysterectomy_right_ovary_retained: !!breast.menstruation_history?.hysterectomy_right_ovary_retained,
          hysterectomy_both_ovaries_removed: !!breast.menstruation_history?.hysterectomy_both_ovaries_removed,
          chemo_radiation_menopause: !!breast.menstruation_history?.chemo_radiation_menopause,
          last_menstrual_period_date: breast.menstruation_history?.last_menstrual_period_date || ''
        },

        reproductive_history: {
          has_given_birth: !!breast.reproductive_history?.has_given_birth,
          first_birth_age: breast.reproductive_history?.first_birth_age || '',
          has_breastfed: !!breast.reproductive_history?.has_breastfed,
          breastfeeding_duration_months: breast.reproductive_history?.breastfeeding_duration_months || ''
        },

        medication_history: {
          has_used_hormone_replacement: !!breast.medication_history?.has_used_hormone_replacement,
          hormone_duration_months: breast.medication_history?.hormone_duration_months || '',
          is_currently_using_hormone: !!breast.medication_history?.is_currently_using_hormone,
          has_used_oral_contraceptives: !!breast.medication_history?.has_used_oral_contraceptives,
          contraceptive_duration_months: breast.medication_history?.contraceptive_duration_months || ''
        },

        breast_symptoms: {
          has_symptoms: !!breast.breast_symptoms?.has_symptoms,
          mass_tender_right: !!breast.breast_symptoms?.mass_tender_right,
          mass_tender_left: !!breast.breast_symptoms?.mass_tender_left,
          nipple_discharge_right: !!breast.breast_symptoms?.nipple_discharge_right,
          nipple_discharge_left: !!breast.breast_symptoms?.nipple_discharge_left,
          other_symptom: !!breast.breast_symptoms?.other_symptom,
          other_symptom_detail: breast.breast_symptoms?.other_symptom_detail || '',
          lesion_location: breast.breast_symptoms?.lesion_location || {
            right_outer_upper: false,
            right_inner_upper: false,
            right_outer_lower: false,
            right_inner_lower: false,
            right_areola: false,
            left_outer_upper: false,
            left_inner_upper: false,
            left_outer_lower: false,
            left_inner_lower: false,
            left_areola: false
          }
        },

        surgery_history: {
          has_surgery: !!breast.surgery_history?.has_surgery,
          biopsy_right: !!breast.surgery_history?.biopsy_right,
          biopsy_left: !!breast.surgery_history?.biopsy_left,
          biopsy_year: breast.surgery_history?.biopsy_year || '',
          lumpectomy_right: !!breast.surgery_history?.lumpectomy_right,
          lumpectomy_left: !!breast.surgery_history?.lumpectomy_left,
          lumpectomy_year: breast.surgery_history?.lumpectomy_year || '',
          mastectomy_right: !!breast.surgery_history?.mastectomy_right,
          mastectomy_left: !!breast.surgery_history?.mastectomy_left,
          mastectomy_year: breast.surgery_history?.mastectomy_year || '',
          reconstruction_right: !!breast.surgery_history?.reconstruction_right,
          reconstruction_left: !!breast.surgery_history?.reconstruction_left,
          reconstruction_year: breast.surgery_history?.reconstruction_year || '',
          augmentation_right: !!breast.surgery_history?.augmentation_right,
          augmentation_left: !!breast.surgery_history?.augmentation_left,
          augmentation_year: breast.surgery_history?.augmentation_year || ''
        },

        result: breast.result || {
          machine_type: 'DR',
          palpation_result: '未觸摸到硬塊',
          palpation_remark: '',
          breast_density: 'c',
          prior_film_comparison: '無舊片可比對',
          prior_film_date: '',
          birads_category: '1',
          assessment_finding: '兩側乳房乳腺實質對稱，無顯著腫塊、微小鈣化或結構扭曲',
          recommendation: '定期每2年接受一次乳房X光攝影檢查',
          referral_needed: false,
          radiology_physician: '王立德 醫師 (放射診斷專科 #4128)',
          radiologic_technologist: '張慈芬 醫事放射師 (#2091)',
          report_date: now.split('T')[0]
        }
      },
      patient_signature_url: signature.base64Png,
      patient_signed_at: now,
      patient_sign_ip: req.ip || '127.0.0.1',
      doctor_signature_url: null,
      doctor_signed_at: null,
      data_hash: dataHash,
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      void_reason_code: null,
      void_reason_remark: null,
      version: 1,
      created_by: '民眾線上填寫 (乳癌攝影行動平板)',
      created_at: now,
      updated_at: now
    };

    db.questionnaires.unshift(newQuestionnaire);

    recordAuditLog(db, {
      questionnaireId: qId,
      actionType: 'CREATE',
      operatorId: patient.id_card_no,
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      memo: `受檢者 ${patient.name} 於乳癌攝影車/院端完成附表四之四檢查紀錄表自填並親簽`
    });

    saveDb(db);

    return res.status(201).json({
      success: true,
      code: 201,
      message: '乳房X光攝影檢查紀錄表單已成功儲存入檔！',
      data: {
        questionnaire_id: qId,
        data_hash: dataHash,
        created_at: now
      }
    });
  } catch (err) {
    console.error('Error saving breast questionnaire:', err);
    res.status(500).json({ success: false, message: '儲存問卷失敗: ' + err.message });
  }
});

// 2.9 PUT /api/v1/questionnaires/:id/breast-result - Update Breast Screening Radiology Result (BI-RADS)
app.put('/api/v1/questionnaires/:id/breast-result', (req, res) => {
  try {
    const qId = parseInt(req.params.id);
    const db = loadDb();
    const item = db.questionnaires.find(q => q.questionnaire_id === qId);

    if (!item) {
      return res.status(404).json({ success: false, message: '找不到此問卷' });
    }

    if (item.form_type !== 'BREAST') {
      return res.status(400).json({ success: false, message: '此問卷非乳癌篩檢表單' });
    }

    const now = new Date().toISOString();

    item.breast = {
      ...item.breast,
      result: {
        ...(item.breast?.result || {}),
        ...req.body
      }
    };

    item.updated_at = now;

    // Recalculate hash
    item.data_hash = calculateDataHash(
      { patient: item.patient, breast: item.breast },
      item.patient_signature_url
    );

    recordAuditLog(db, {
      questionnaireId: qId,
      actionType: 'TEST_RESULT',
      operatorId: req.headers['x-user-id'] || req.body.radiology_physician || '放射科專科醫師',
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      memo: `登錄/更新乳房X光攝影判讀結果，BI-RADS分級: Category ${req.body.birads_category || '未註明'}，處置建議: ${req.body.recommendation || '無'}`
    });

    saveDb(db);

    return res.json({
      success: true,
      code: 200,
      message: '乳房X光攝影檢查判讀結果已成功入檔保存',
      data: item
    });
  } catch (err) {
    console.error('Error saving breast result:', err);
    res.status(500).json({ success: false, message: '更新失敗: ' + err.message });
  }
});

// 3. GET /api/v1/admin/questionnaires - List questionnaires with filters & pagination
app.get('/api/v1/admin/questionnaires', (req, res) => {
  try {
    const db = loadDb();
    const {
      page = 1,
      pageSize = 20,
      formType,
      startDate,
      endDate,
      status,
      resultFilter,
      search,
      includeDeleted = 'false'
    } = req.query;

    const showDeleted = includeDeleted === 'true';

    let list = db.questionnaires.filter(item => {
      // Soft-delete filter: default hide deleted
      if (!showDeleted && item.is_deleted) return false;
      if (showDeleted && status === 'VOIDED' && !item.is_deleted) return false;

      // Form type filter
      if (formType && formType !== 'ALL' && item.form_type !== formType) return false;

      // Date range filter
      if (startDate && item.screening_date < startDate) return false;
      if (endDate && item.screening_date > endDate) return false;

      // Status filter
      if (status && status !== 'ALL') {
        if (status === 'VOIDED' && !item.is_deleted) return false;
        if (status !== 'VOIDED' && item.status !== status) return false;
      }

      // Result filter
      if (resultFilter && resultFilter !== 'ALL') {
        const abnormalBethesda = ['4', '16', '6', '7', '8', '9', '10', '11', '17', '5', '15', '18', '12', '13'];
        if (resultFilter === 'REFERRAL') {
          if (item.form_type === 'ORAL' && item.oral?.inspection_result !== 'REFERRAL') return false;
          if (item.form_type === 'GASTRIC' && item.gastric?.test_result !== 'POSITIVE') return false;
          if (item.form_type === 'FECAL' && item.fecal?.test_result !== 'POSITIVE') return false;
          if (item.form_type === 'CERVICAL' && !abnormalBethesda.includes(item.cervical?.cytology_diagnosis)) return false;
          if (item.form_type === 'LUNG') {
            const isLungReferral = ['4A', '4B', '4X'].includes(item.lung?.result?.lung_rads_category) || !!item.lung?.result?.referral_needed;
            if (!isLungReferral) return false;
          }
          if (item.form_type === 'BREAST') {
            const isBreastReferral = ['0', '3', '4', '4A', '4B', '4C', '5'].includes(item.breast?.result?.birads_category) || !!item.breast?.result?.referral_needed;
            if (!isBreastReferral) return false;
          }
        } else if (resultFilter === 'NORMAL') {
          if (item.form_type === 'ORAL' && item.oral?.inspection_result !== 'NORMAL') return false;
          if (item.form_type === 'GASTRIC' && item.gastric?.test_result !== 'NEGATIVE') return false;
          if (item.form_type === 'FECAL' && item.fecal?.test_result !== 'NEGATIVE') return false;
          if (item.form_type === 'CERVICAL' && item.cervical?.cytology_diagnosis !== '1') return false;
          if (item.form_type === 'LUNG') {
            const isLungReferral = ['4A', '4B', '4X'].includes(item.lung?.result?.lung_rads_category) || !!item.lung?.result?.referral_needed;
            if (isLungReferral || !['1', '2'].includes(item.lung?.result?.lung_rads_category)) return false;
          }
          if (item.form_type === 'BREAST') {
            const isBreastReferral = ['0', '3', '4', '4A', '4B', '4C', '5'].includes(item.breast?.result?.birads_category) || !!item.breast?.result?.referral_needed;
            if (isBreastReferral || !['1', '2'].includes(item.breast?.result?.birads_category)) return false;
          }
        }
      }

      // Search keyword filter
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        const nameMatch = item.patient?.name?.toLowerCase().includes(q);
        const chartMatch = item.patient?.chart_no?.toLowerCase().includes(q);
        const idMatch = item.patient?.id_card_no?.toLowerCase().includes(q);
        if (!nameMatch && !chartMatch && !idMatch) return false;
      }

      return true;
    });

    const total = list.length;
    const p = Math.max(1, parseInt(page));
    const ps = Math.max(1, parseInt(pageSize));
    const startIdx = (p - 1) * ps;
    const paginated = list.slice(startIdx, startIdx + ps);

    // Mask ID cards for security in list view
    const safeList = paginated.map(item => ({
      ...item,
      patient: {
        ...item.patient,
        id_card_no_masked: maskIdCard(item.patient?.id_card_no)
      }
    }));

    res.json({
      success: true,
      total,
      page: p,
      pageSize: ps,
      totalPages: Math.ceil(total / ps),
      data: safeList
    });
  } catch (err) {
    console.error('Error fetching list:', err);
    res.status(500).json({ success: false, message: '查詢失敗: ' + err.message });
  }
});

// 4. GET /api/v1/admin/questionnaires/:id - Get single questionnaire detail
app.get('/api/v1/admin/questionnaires/:id', (req, res) => {
  try {
    const qId = parseInt(req.params.id);
    const db = loadDb();
    const item = db.questionnaires.find(q => q.questionnaire_id === qId);

    if (!item) {
      return res.status(404).json({ success: false, message: '找不到此問卷' });
    }

    // Record view in audit log
    recordAuditLog(db, {
      questionnaireId: qId,
      actionType: 'VIEW',
      operatorId: req.headers['x-user-id'] || '林管理師 (工號: NS-8821)',
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      memo: `檢視個案問卷詳情 (${item.patient?.name})`
    });
    saveDb(db);

    res.json({
      success: true,
      data: item
    });
  } catch (err) {
    console.error('Error fetching questionnaire detail:', err);
    res.status(500).json({ success: false, message: '讀取失敗: ' + err.message });
  }
});

// 5. DELETE /api/v1/admin/questionnaires/:id - Soft-delete (作廢問卷)
app.delete('/api/v1/admin/questionnaires/:id', (req, res) => {
  try {
    const qId = parseInt(req.params.id);
    const { voidReasonCode, voidReasonRemark, authPassword } = req.body;

    if (!voidReasonCode) {
      return res.status(400).json({ success: false, message: '作廢原因代碼為必填項目' });
    }

    // Authenticate manager password (allow standard admin password 'admin123' or '123456')
    if (authPassword && authPassword !== 'admin123' && authPassword !== '123456') {
      return res.status(401).json({ success: false, message: '管理師授權密碼不正確' });
    }

    const db = loadDb();
    const item = db.questionnaires.find(q => q.questionnaire_id === qId);

    if (!item) {
      return res.status(404).json({ success: false, message: '問卷不存在' });
    }

    if (item.is_deleted) {
      return res.status(400).json({ success: false, message: '此問卷已處於作廢狀態，無須重複作廢' });
    }

    const now = new Date().toISOString();
    const operator = req.headers['x-user-id'] || '林管理師 (工號: NS-8821)';

    item.is_deleted = true;
    item.status = 'VOIDED';
    item.deleted_at = now;
    item.deleted_by = operator;
    item.void_reason_code = voidReasonCode;
    item.void_reason_remark = voidReasonRemark || '';
    item.updated_at = now;

    // Record immutable audit log
    recordAuditLog(db, {
      questionnaireId: qId,
      actionType: 'SOFT_DELETE',
      operatorId: operator,
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      memo: `問卷作廢。原因代碼: ${voidReasonCode}。備註: ${voidReasonRemark || '無'}`
    });

    saveDb(db);

    res.json({
      success: true,
      code: 200,
      message: '問卷已成功作廢，系統已寫入永久稽核紀錄',
      data: {
        questionnaireId: qId,
        status: 'VOIDED',
        isDeleted: true,
        deletedAt: now,
        deletedBy: operator,
        voidReasonCode,
        voidReasonRemark
      }
    });
  } catch (err) {
    console.error('Error voiding questionnaire:', err);
    res.status(500).json({ success: false, message: '作廢失敗: ' + err.message });
  }
});

// 6. GET /api/v1/admin/questionnaires/:id/audit-logs - View audit trail
app.get('/api/v1/admin/questionnaires/:id/audit-logs', (req, res) => {
  try {
    const qId = parseInt(req.params.id);
    const db = loadDb();
    const logs = db.auditLogs.filter(l => l.questionnaire_id === qId);

    res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '取得稽核日誌失敗' });
  }
});

// 7. POST /api/v1/admin/questionnaires/:id/audit-print - Record print/export action
app.post('/api/v1/admin/questionnaires/:id/audit-print', (req, res) => {
  try {
    const qId = parseInt(req.params.id);
    const db = loadDb();
    const item = db.questionnaires.find(q => q.questionnaire_id === qId);

    if (item) {
      recordAuditLog(db, {
        questionnaireId: qId,
        actionType: 'PRINT',
        operatorId: req.headers['x-user-id'] || '林管理師 (工號: NS-8821)',
        clientIp: req.ip,
        userAgent: req.headers['user-agent'],
        memo: `執行 A4 套印/PDF 匯出 (${item.form_type === 'GASTRIC' ? '胃癌問卷' : '口篩問卷'})`
      });
      saveDb(db);
    }

    res.json({ success: true, message: '列印紀錄已儲存' });
  } catch (err) {
    res.status(500).json({ success: false, message: '記錄列印失敗' });
  }
});

// 8. GET /api/v1/stats and /api/stats - Statistics dashboard overview
app.get(['/api/v1/stats', '/api/stats'], (req, res) => {
  try {
    const db = loadDb();
    const total = db.questionnaires.length;
    const active = db.questionnaires.filter(q => !q.is_deleted);
    const voided = db.questionnaires.filter(q => q.is_deleted);
    const gastricCount = active.filter(q => q.form_type === 'GASTRIC').length;
    const oralCount = active.filter(q => q.form_type === 'ORAL').length;
    const fecalCount = active.filter(q => q.form_type === 'FECAL').length;
    const cervicalCount = active.filter(q => q.form_type === 'CERVICAL').length;
    const lungCount = active.filter(q => q.form_type === 'LUNG').length;
    const breastCount = active.filter(q => q.form_type === 'BREAST').length;

    const abnormalBethesda = ['4', '16', '6', '7', '8', '9', '10', '11', '17', '5', '15', '18', '12', '13'];

    const referralCount = active.filter(q =>
      (q.form_type === 'ORAL' && q.oral?.inspection_result === 'REFERRAL') ||
      (q.form_type === 'GASTRIC' && q.gastric?.test_result === 'POSITIVE') ||
      (q.form_type === 'FECAL' && q.fecal?.test_result === 'POSITIVE') ||
      (q.form_type === 'CERVICAL' && abnormalBethesda.includes(q.cervical?.cytology_diagnosis)) ||
      (q.form_type === 'LUNG' && (['4A', '4B', '4X'].includes(q.lung?.result?.lung_rads_category) || !!q.lung?.result?.referral_needed)) ||
      (q.form_type === 'BREAST' && (['0', '3', '4', '4A', '4B', '4C', '5'].includes(q.breast?.result?.birads_category) || !!q.breast?.result?.referral_needed))
    ).length;

    const waitingDoctorCount = active.filter(q => q.form_type === 'ORAL' && q.status === 'WAITING_DOCTOR').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = db.questionnaires.filter(q => q.screening_date === todayStr).length;

    res.json({
      success: true,
      stats: {
        total,
        activeCount: active.length,
        voidedCount: voided.length,
        gastricCount,
        oralCount,
        fecalCount,
        cervicalCount,
        lungCount,
        breastCount,
        waitingDoctorCount,
        referralCount,
        referralRate: active.length > 0 ? ((referralCount / active.length) * 100).toFixed(1) : 0,
        todayCount
      }
    });


  } catch (err) {
    res.status(500).json({ success: false, message: '統計資料計算失敗' });
  }
});

// Serve frontend production build if available (for cloud deployments like Railway)
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[E-ScreenQ Server] Backend API running on http://localhost:${PORT}`);
});
