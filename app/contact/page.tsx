import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "문의",
  description: `${company.name} 이메일 ${company.email}`,
};

export default function ContactPage() {
  return (
    <article className="wrap page-article">
      <PageIntro
        title="문의"
        lede="회사와 앱에 대한 문의는 이메일로 보내 주세요. 받은 메일은 확인하고 답장드립니다."
      />
      <p>
        <a className="page-email" href={`mailto:${company.email}`} translate="no">
          {company.email}
        </a>
      </p>
    </article>
  );
}
