import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: { absolute: `${company.name} — ${company.business.ko}` },
  description: `${company.name}는 모바일 애플리케이션을 개발하는 회사입니다.`,
};

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-shade" aria-hidden="true" />
        <div className="wrap hero-copy">
          <p className="hero-brand" translate="no">
            {company.nameKo}
          </p>
          <h1 id="home-title">
            세상에 도움이 되는
            <br />
            <span className="hero-accent">앱과 서비스</span>를 만듭니다
          </h1>
          <div className="actions">
            <Link className="btn btn-solid" href="/company">
              ABOUT →
            </Link>
            <a className="btn btn-ghost" href={`mailto:${company.email}`}>
              이메일 보내기 →
            </a>
          </div>
        </div>
      </section>

      <section className="block work" aria-labelledby="work-title">
        <div className="wrap">
          <div className="section-title">
            <p className="section-eyebrow">하는 일</p>
            <h2 id="work-title">
              만드는 방식이
              <br />
              <span className="title-accent">결과를 바꿉니다</span>
            </h2>
            <p className="section-lede">
              개발자가 아닌 사용자의 시선으로 바라보며, 작은것 하나라도 소중하게 생각합니다.
            </p>
          </div>
          <div className="work-list">
            <article className="work-item">
              <span className="num">01</span>
              <h3>앱 개발</h3>
              <p>
                세상에 필요한 앱을 만듭니다. 아무리 작은 기능이라도 누군가에게는 꼭 필요하기 때문에
                최선을 다해 개발해 드립니다.
              </p>
            </article>
            <article className="work-item">
              <span className="num">02</span>
              <h3>서비스 개발</h3>
              <p>
                경영관리, 회계, 원가, 재무 업무 경력을 바탕으로 현업의 시선으로 회사에서 꾸준히 사용할
                수 있는 서비스를 개발해 드립니다.
              </p>
            </article>
            <article className="work-item">
              <span className="num">03</span>
              <h3>유지 보수</h3>
              <p>저희는 개발보다 유지, 보수가 더 중요하다고 생각합니다. 끝까지 책임지겠습니다.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="contact-title">
        <div className="wrap band-inner">
          <div>
            <p className="section-eyebrow light">문의</p>
            <h2 id="contact-title">
              앱과 회사에 대한 문의는
              <br />
              <span className="hero-accent">이메일로 받습니다</span>
            </h2>
            <p>문의 메일은 확인하고 답장드립니다.</p>
          </div>
          <a className="btn btn-solid" href={`mailto:${company.email}`}>
            {company.email} →
          </a>
        </div>
      </section>
    </>
  );
}
