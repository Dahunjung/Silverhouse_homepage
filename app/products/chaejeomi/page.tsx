import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "채점이",
  description:
    "매일 반복되는 채점 스트레스, 이제 AI 채점이에게 맡기세요. 산수·받아쓰기·일기·영어 사진 채점과 오답노트.",
};

const features = [
  {
    title: "4가지 맞춤형 채점",
    body: "산수, 받아쓰기, 일기, 영어까지. 과목에 맞는 방식으로 채점합니다.",
  },
  {
    title: "스마트 사진 채점",
    body: "카메라로 찍거나 갤러리에서 고르세요. 여러 장도 한꺼번에 처리할 수 있습니다.",
  },
  {
    title: "똑똑한 오답노트",
    body: "틀린 문제는 자동으로 저장됩니다. 필요할 때 다시 복습하세요.",
  },
  {
    title: "일기·영어 첨삭",
    body: "단순 정답 확인을 넘어 맞춤법과 문장까지 스마트하게 살펴봅니다.",
  },
];

const benefits = [
  {
    title: "초스피드 업무 경감",
    body: "선생님과 학부모님의 채점 부담을 줄여 주는 필수 아이템입니다.",
  },
  {
    title: "아이의 학습 성장",
    body: "오답노트로 취약 유형을 파악하고, 다음 학습으로 이어갑니다.",
  },
];

export default function ChaejeomiPage() {
  return (
    <article className="product-page">
      <section className="product-hero" aria-labelledby="product-title">
        <div className="wrap product-hero-grid">
          <div className="product-hero-copy">
            <p className="section-eyebrow">제품</p>
            <p className="product-brand" translate="no">
              채점이
            </p>
            <h1 id="product-title">
              매일 반복되는 채점 스트레스,
              <br />
              이제 AI <span className="title-accent">채점이</span>에게 맡기세요
            </h1>
            <p className="lede">우리 아이 학습지도, 이제 사진 한 장으로 끝!</p>
            <div className="actions" style={{ justifyContent: "flex-start" }}>
              <a className="btn btn-solid" href={`mailto:${company.email}?subject=채점이 문의`}>
                문의하기 →
              </a>
              <Link className="btn btn-outline" href="/contact">
                연락처 보기
              </Link>
            </div>
          </div>
          <div className="product-hero-visual">
            <Image
              src="/products/chaejeomi.jpg"
              alt="채점이 앱 소개 이미지. 스마트폰 화면과 주요 기능을 보여 줍니다."
              width={900}
              height={1600}
              className="product-poster"
              priority
            />
          </div>
        </div>
      </section>

      <section className="block" aria-labelledby="features-title">
        <div className="wrap">
          <div className="section-title">
            <p className="section-eyebrow">주요 기능</p>
            <h2 id="features-title">사진 한 장으로 시작하는 채점</h2>
          </div>
          <div className="feature-list">
            {features.map((feature, index) => (
              <article className="feature-item" key={feature.title}>
                <span className="num">0{index + 1}</span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="block product-benefit-band" aria-labelledby="benefits-title">
        <div className="wrap">
          <div className="section-title">
            <p className="section-eyebrow">이런 점이 좋아요</p>
            <h2 id="benefits-title">선생님과 학부모를 위한 선택</h2>
          </div>
          <div className="benefit-list">
            {benefits.map((benefit) => (
              <article className="benefit-item" key={benefit.title}>
                <h3>{benefit.title}</h3>
                <p>{benefit.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="product-cta-title">
        <div className="wrap band-inner">
          <div>
            <p className="section-eyebrow light">채점이</p>
            <h2 id="product-cta-title">
              지금 바로
              <br />
              <span className="hero-accent">채점이</span>를 만나보세요
            </h2>
            <p>촬영 이미지는 채점 목적으로만 안전하게 보호됩니다.</p>
          </div>
          <div className="product-cta-actions">
            <a
              className="store-chip"
              href="https://apps.apple.com/kr/app/채점이-산수-받아쓰기-일기-ai-채점/id6764313576"
              target="_blank"
              rel="noopener noreferrer"
            >
              앱스토어
            </a>
            <a
              className="store-chip"
              href="https://play.google.com/store/apps/details?id=com.thehunss.check_flutter&hl=ko"
              target="_blank"
              rel="noopener noreferrer"
            >
              구글 플레이
            </a>
            <a className="btn btn-solid" href={`mailto:${company.email}?subject=채점이 문의`}>
              이메일 문의 →
            </a>
          </div>
        </div>
      </section>
    </article>
  );
}
