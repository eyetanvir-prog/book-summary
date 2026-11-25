import { notFound, redirect } from "next/navigation";
import { SectionView } from "@/components/SectionView";
import { sectionBySlug, sectionPage, sections } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return sections.flatMap((section) => {
    const { pages } = sectionPage(section.slug, 1);
    return Array.from({ length: pages - 1 }, (_, i) => ({ slug: section.slug, n: String(i + 2) }));
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  const section = sectionBySlug(slug);
  return { title: section ? `${section.label}, page ${n} — Quarto` : "Quarto" };
}

export default async function SectionPageN({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  const section = sectionBySlug(slug);
  const page = Number(n);
  if (!section || !Number.isInteger(page) || page < 1) notFound();
  if (page === 1) redirect(`/sections/${slug}`);
  if (page > sectionPage(slug, 1).pages) notFound();
  return <SectionView section={section} page={page} />;
}
