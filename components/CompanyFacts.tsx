import { company, mapHref } from "@/lib/company";

type CompanyFactsProps = {
  id?: string;
  title?: string;
};

export function CompanyFacts({ id = "organization", title = "조직 정보" }: CompanyFactsProps) {
  const headingId = `${id}-title`;
  const tel = company.phone.replace(/[^\d+]/g, "");

  return (
    <section className="facts" id={id} aria-labelledby={headingId}>
      <div className="section-title">
        <h2 id={headingId}>{title}</h2>
      </div>
      <dl className="facts-list">
        <div className="fact">
          <dt>회사명</dt>
          <dd translate="no">{company.nameKo}</dd>
        </div>
        <div className="fact">
          <dt>사업 내용</dt>
          <dd>{company.business.ko}</dd>
        </div>
        {company.registrationNumber ? (
          <div className="fact">
            <dt>사업자등록번호</dt>
            <dd translate="no">{company.registrationNumber}</dd>
          </div>
        ) : null}
        <div className="fact">
          <dt>사업장 주소</dt>
          <dd>
            <span className="addr-ko" translate="no">
              {company.address.ko}
            </span>
            <a className="map-link" href={mapHref()} target="_blank" rel="noopener noreferrer">
              지도에서 보기
            </a>
          </dd>
        </div>
        <div className="fact">
          <dt>이메일</dt>
          <dd>
            <a className="email" href={`mailto:${company.email}`} translate="no">
              {company.email}
            </a>
          </dd>
        </div>
        {company.phone ? (
          <div className="fact">
            <dt>전화번호</dt>
            <dd>
              <a href={`tel:${tel}`} translate="no">
                {company.phone}
              </a>
            </dd>
          </div>
        ) : null}
        {company.siteUrl ? (
          <div className="fact">
            <dt>웹사이트</dt>
            <dd>
              <a href={company.siteUrl} translate="no">
                {company.siteUrl.replace(/^https?:\/\//, "")}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
