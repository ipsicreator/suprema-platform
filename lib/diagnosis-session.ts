import type { UserInfo } from "@/lib/user-info";

export type Step3Topic = {
  id: string;
  subject: string;
  keyword: string;
  topic_title: string;
  topic_direction?: string;
  books: string[];
  papers: string[];
  data_sources: string[];
  expected_conclusion?: string;
  setuk_sentence: string;
};

export type Step3SessionState = {
  subject?: string;
  careerHint?: string;
  topics?: Step3Topic[];
};

export type Step4Judgment = "하향" | "안정" | "도전" | "불가";

export type Step4Target = {
  id: string;
  university: string;
  department: string;
  trackType: string;
  admissionName: string;
  judgment: Step4Judgment;
  reason: string;
};

export type Step4SessionState = {
  email?: string;
  openId?: string;
  targets?: Step4Target[];
};

export type DiagnosisSessionSnapshot = {
  userInfo: Partial<UserInfo> | null;
  step2Memo: string;
  step3: Step3SessionState | null;
  step3Email: string;
  step4: Step4SessionState | null;
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readDiagnosisSessionSnapshot(): DiagnosisSessionSnapshot {
  if (typeof window === "undefined") {
    return {
      userInfo: null,
      step2Memo: "",
      step3: null,
      step3Email: "",
      step4: null,
    };
  }

  return {
    userInfo: safeParse<Partial<UserInfo>>(window.sessionStorage.getItem("suprema_user_info")),
    step2Memo: window.sessionStorage.getItem("diagnosis_step2_local_memo") || "",
    step3: safeParse<Step3SessionState>(window.sessionStorage.getItem("diagnosis_step3_topics")),
    step3Email: window.sessionStorage.getItem("diagnosis_step3_email") || "",
    step4: safeParse<Step4SessionState>(window.sessionStorage.getItem("diagnosis_step4_state")),
  };
}
