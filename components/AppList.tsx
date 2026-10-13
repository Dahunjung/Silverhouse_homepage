import Link from "next/link";
import { company } from "@/lib/company";

export function AppList() {
  if (company.apps.length === 0) return null;

  return (
    <section className="block" aria-labelledby="apps-heading">
      <div className="wrap">
        <div className="section-title">
          <p className="section-eyebrow">제품</p>
          <h2 id="apps-heading">지금 만들고 있는 앱</h2>
        </div>
        <ul className="app-list">
          {company.apps.map((app) => (
            <li key={app.name}>
              <h3 translate="no">{app.name}</h3>
              <p>{app.summaryKo}</p>
              {app.url ? (
                app.url.startsWith("/") ? (
                  <Link href={app.url}>자세히 보기 →</Link>
                ) : (
                  <a href={app.url} translate="no">
                    {app.url.replace(/^https?:\/\//, "")}
                  </a>
                )
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
