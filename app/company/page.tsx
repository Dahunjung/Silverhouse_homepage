import type { Metadata } from "next";
import { CompanyFacts } from "@/components/CompanyFacts";
import { PageIntro } from "@/components/PageIntro";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "ABOUT",
  description: `${company.name}의 회사명, 사업장 주소와 이메일을 확인할 수 있습니다.`,
};

export default function CompanyPage() {
  return (
    <article className="wrap page-article">
      <PageIntro
        title="ABOUT"
        lede={`${company.nameKo}는 세상에 필요한 앱과 서비스를 개발하는 회사입니다. 경영관리, 회계, 원가, 재무 현업 경력을 바탕으로 개발자가 아닌 사용자의 입장에서 개발합니다.`}
      />
      <div className="after-intro">
        <CompanyFacts />
      </div>
    </article>
  );
}
