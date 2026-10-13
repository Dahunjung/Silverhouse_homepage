import { company } from "@/lib/company";
import { getSiteUrlString } from "@/lib/site";

export function JsonLd() {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    alternateName: [company.nameKo, company.nameEn],
    description: `${company.name} develops mobile applications.`,
    email: company.email,
    knowsAbout: company.business.en,
  };

  if (company.phone) data.telephone = company.phone;
  const siteUrl = company.siteUrl || getSiteUrlString();
  if (siteUrl) data.url = siteUrl;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
