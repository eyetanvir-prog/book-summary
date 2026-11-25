import { notFound } from "next/navigation";
import { SectionView } from "@/components/SectionView";
import { sectionBySlug, sections } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return sections.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const section = sectionBySlug((await params).slug);
  return { title: section ? `${section.label} — Quarto` : "Quarto" };
}

export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const section = sectionBySlug((await params).slug);
  if (!section) notFound();
  return <SectionView section={section} page={1} />;
}
