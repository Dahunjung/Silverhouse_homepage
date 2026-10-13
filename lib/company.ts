export type AppItem = {
  name: string;
  summaryKo: string;
  summaryEn: string;
  url?: string;
};

/**
 * 회사 정보의 원본입니다.
 * 전화번호, 사업자등록번호, 사이트 주소, 앱 목록은 값이 있을 때만 페이지에 표시됩니다.
 */
export const company = {
  nameKo: "실버파워",
  nameEn: "Silverpower",
  /** 화면에 쓰는 회사명 */
  name: "실버파워(Silverpower)",
  representative: "정다훈",
  email: "thehunss@gmail.com",
  /** 예: "041-000-0000" */
  phone: "",
  /** 예: "000-00-00000" */
  registrationNumber: "",
  /** 예: "https://silverpower.kr" — 비우면 Vercel/NEXT_PUBLIC_SITE_URL 사용 */
  siteUrl: "",
  /** 개인정보 보호책임자. 비워 두면 대표자를 표시합니다. */
  privacyOfficer: "",
  business: {
    ko: "모바일 애플리케이션 개발",
    en: "Mobile application development",
  },
  address: {
    ko: "충청남도 태안군 태안읍 해창길 31-3 (태안읍)",
    en: "31-3, Haechang-gil, Taean-eup, Taean-gun, Chungcheongnam-do, Republic of Korea",
  },
  privacyUpdated: "2026-09-30",
  termsUpdated: "2026-10-01",
  /**
   * 앱이 준비되면 항목을 추가하면 홈에 표시됩니다.
   * { name, summaryKo, summaryEn, url }
   */
  apps: [
    {
      name: "채점이",
      summaryKo: "산수·받아쓰기·일기·영어를 사진으로 채점하고 오답노트로 복습하는 AI 채점 앱",
      summaryEn: "AI grading app for math, dictation, diary, and English",
      url: "/products/chaejeomi",
    },
  ] as AppItem[],
};

export function privacyOfficerName() {
  return company.privacyOfficer || company.representative;
}

export function mapHref() {
  const query = company.address.ko.replace(/\s*\([^)]*\)\s*$/, "");
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}`;
}

export function formatKoreanDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}
