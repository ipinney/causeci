import { GuideArticle, guideMetadata } from "@/components/guide-article";
import { GUIDES, getGuide } from "@/lib/guides";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamicParams = false;

type GuideRoute = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: GuideRoute): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return guideMetadata(guide);
}

export default async function GuidePage({ params }: GuideRoute) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return <GuideArticle guide={guide} />;
}
