import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { company, formatKoreanDate } from "@/lib/company";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${company.name} 웹사이트의 개인정보처리방침입니다. 문의 이메일 ${company.email}`,
};

export default function PrivacyPage() {
  const updatedKo = formatKoreanDate(company.privacyUpdated);

  return (
    <article className="wrap policy">
      <PageIntro
        title="개인정보처리방침"
        lede={`${company.nameKo}(이하 "회사")는 개인정보 보호법 등 관련 법령을 지키며 개인정보를 처리합니다. 이 방침은 회사 웹사이트에 적용됩니다.`}
      />

      <div className="prose">
        <h2>1. 처리하는 개인정보</h2>
        <p>
          회사 웹사이트는 회원가입, 문의 양식, 결제, 분석 도구를 두지 않으며, 이를 통해 개인정보를
          수집하지 않습니다.
        </p>
        <p>이용자가 이메일로 연락하면 회사는 답변과 업무 연락을 위해 다음 정보를 처리합니다.</p>
        <ul>
          <li>이메일 주소</li>
          <li>메일에 적힌 이름, 연락처, 문의 내용 등 이용자가 직접 보낸 정보</li>
        </ul>
        <p>
          웹사이트를 호스팅하는 사업자는 보안과 서비스 운영을 위해 접속 기록(IP 주소, 브라우저 종류,
          접속 일시, 요청 주소)을 짧은 기간 처리할 수 있습니다. 회사는 이 기록을 광고나 이용자 분석에
          사용하지 않습니다.
        </p>

        <h2>2. 처리 목적과 보유 기간</h2>
        <p>회사는 문의에 답하고, 업무상 연락하고, 웹사이트를 안전하게 운영하기 위해 개인정보를 처리합니다.</p>
        <p>
          문의 메일은 처리가 끝난 뒤 1년을 넘기지 않는 범위에서 보관한 다음 지체 없이 삭제합니다. 다른
          법령에 보관 의무가 있으면 그 기간을 따릅니다. 접속 기록의 보관 기간은 호스팅 사업자의 운영
          정책에 따릅니다.
        </p>

        <h2>3. 제3자 제공과 위탁</h2>
        <p>
          법령에 근거가 있거나 이용자가 따로 동의한 경우를 제외하고, 개인정보를 제3자에게 제공하지
          않습니다. 개인정보를 판매하지 않습니다.
        </p>
        <p>
          회사는 웹사이트 호스팅을 외부 사업자에게 맡길 수 있습니다. 호스팅 사업자는 사이트를 공개하고
          보호하기 위해 접속 기록을 처리할 수 있으며, 서버 위치에 따라 그 처리가 대한민국 밖에서 이루어질
          수 있습니다. 그 밖의 개인정보 처리 위탁은 하지 않습니다.
        </p>

        <h2>4. 이용자의 권리</h2>
        <p>
          이용자는 회사에 자신의 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다. 아래 이메일로
          요청하면 지체 없이 조치하고 결과를 알립니다. 법령에서 정한 사유가 있으면 요청의 일부 또는
          전부가 제한될 수 있으며, 그 경우 이유를 알려 드립니다.
        </p>

        <h2>5. 안전성 확보와 쿠키</h2>
        <p>
          회사는 개인정보가 담긴 메일에 접근할 수 있는 사람을 업무에 필요한 범위로 제한합니다. 웹사이트는
          HTTPS로 제공합니다. 회사는 분석이나 광고를 위한 쿠키를 사용하지 않습니다.
        </p>

        <h2>6. 앱에서의 처리</h2>
        <p>
          회사가 배포하는 모바일 앱에서 개인정보를 별도로 처리할 때에는, 수집을 시작하기 전에 해당 앱
          또는 이 방침의 개정을 통해 항목, 목적, 보유 기간을 알립니다.
        </p>

        <h2>7. 개인정보 보호책임자</h2>
        <p>
          개인정보와 관련한 문의, 열람, 정정, 삭제, 처리정지 요청은{" "}
          <a href={`mailto:${company.email}`} translate="no">
            {company.email}
          </a>
          로 보내 주세요. 사업장 주소는 <Link href="/company">ABOUT</Link>에 있습니다.
        </p>

        <h2>8. 권익침해 구제</h2>
        <p>개인정보 침해에 대한 신고나 상담이 필요하면 아래 기관에 문의할 수 있습니다.</p>
        <ul>
          <li>
            개인정보분쟁조정위원회: (국번없이) 1833-6972 (
            <a href="https://www.kopico.go.kr" target="_blank" rel="noopener noreferrer">
              www.kopico.go.kr
            </a>
            )
          </li>
          <li>
            개인정보침해신고센터: (국번없이) 118 (
            <a href="https://privacy.kisa.or.kr" target="_blank" rel="noopener noreferrer">
              privacy.kisa.or.kr
            </a>
            )
          </li>
          <li>
            경찰청 사이버범죄신고시스템: (국번없이) 182 (
            <a href="https://ecrm.police.go.kr" target="_blank" rel="noopener noreferrer">
              ecrm.police.go.kr
            </a>
            )
          </li>
        </ul>

        <h2>9. 방침의 변경</h2>
        <p>
          이 방침의 내용이 바뀌면 이 페이지에 변경 내용과 시행일을 올립니다. 시행일: {updatedKo}.
        </p>

        <p className="note">
          회사 정보는 <Link href="/company/">ABOUT</Link> 페이지에서도 확인할 수 있습니다.
        </p>
      </div>
    </article>
  );
}
