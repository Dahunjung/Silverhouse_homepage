/** Vercel·로컬 빌드에서 canonical/OG용 절대 URL (없으면 metadataBase 생략) */
export function getSiteUrl(): URL | undefined {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  if (!raw) return undefined;
  const href = raw.startsWith("http") ? raw : `https://${raw}`;
  return new URL(href);
}

export function getSiteUrlString(): string | undefined {
  return getSiteUrl()?.origin;
}
