import { company } from "@/lib/company";

type PageIntroProps = {
  title: string;
  lede?: string;
};

export function PageIntro({ title, lede }: PageIntroProps) {
  return (
    <header className="page-intro">
      <p className="kicker" translate="no">
        {company.nameKo}
      </p>
      <h1>{title}</h1>
      {lede ? <p className="lede">{lede}</p> : null}
    </header>
  );
}
