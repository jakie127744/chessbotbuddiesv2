import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { AdBanner } from "@/components/ads/AdBanner";
import { AdSenseConfig } from "@/components/ads/AdSenseConfig";
import { AdSenseRouteChangeHandler } from "@/components/ads/AdSenseRouteChangeHandler";
import { FenBoard, ImageBoard } from "@/components/ArticleBoards";
import { getAdSlotId } from "@/lib/ads/ad-manager";
import { getAllArticles, getArticleBySlug } from "@/lib/mdx";

const Paragraph = ({ children, className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) => {
  const mergedClassName = ["text-[var(--text-secondary)] text-base leading-relaxed mb-4", className]
    .filter(Boolean)
    .join(" ");

  // Always use <div> to avoid hydration errors from MDX nesting <p> inside <p>
  return (
    <div {...rest} className={mergedClassName}>
      {children}
    </div>
  );
};

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      {...props}
      className="text-3xl font-black text-white mt-6 mb-3 leading-tight"
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      className="text-2xl font-bold text-white mt-6 mb-3 leading-snug"
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      {...props}
      className="text-xl font-bold text-white mt-5 mb-2"
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <Paragraph {...props} />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="text-jungle-green-400 hover:text-jungle-green-300 underline underline-offset-4"
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      {...props}
      className="list-disc pl-6 space-y-2 text-[var(--text-secondary)] mb-4"
    />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol
      {...props}
      className="list-decimal pl-6 space-y-2 text-[var(--text-secondary)] mb-4"
    />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="leading-relaxed" />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      {...props}
      className="border-l-4 border-jungle-green-500/60 pl-4 italic text-[var(--text-secondary)] mb-4"
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      {...props}
      className="px-1.5 py-0.5 rounded bg-[var(--surface-highlight)] text-sm"
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      {...props}
      className="bg-[var(--surface-highlight)] border border-[var(--border)] rounded-lg p-4 text-sm overflow-x-auto mb-4"
    />
  ),
  Image: (props: React.ComponentProps<typeof Image>) => (
    <span className="block my-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-highlight)]">
      <Image
        {...props}
        alt={props.alt || ""}
        className={`w-full h-auto object-cover ${props.className || ""}`.trim()}
      />
    </span>
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <Image
      src={(props.src as string) || ""}
      alt={props.alt || ""}
      width={(props as any).width || 1200}
      height={(props as any).height || 630}
      className={`w-full h-auto object-cover ${props.className || ""}`.trim()}
    />
  ),
  FenBoard: (props: React.ComponentProps<typeof FenBoard>) => <FenBoard {...props} />,
  ImageBoard: (props: React.ComponentProps<typeof ImageBoard>) => <ImageBoard {...props} />,
};

interface NewsArticlePageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const article = getArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <AdSenseConfig />
      <React.Suspense fallback={null}>
        <AdSenseRouteChangeHandler />
      </React.Suspense>

      <Link
        href="/news"
        className="text-[var(--text-secondary)] text-sm hover:text-white transition-colors"
      >
        ← Back to news
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <header className="space-y-3">
            <p className="text-xs font-bold uppercase text-[var(--text-tertiary)] tracking-[0.2em]">
              {article.category || "Story"}
            </p>
            <h1 className="text-4xl font-black text-white leading-tight">{article.title}</h1>
            <div className="text-[10px] font-bold uppercase text-[var(--text-tertiary)] tracking-wide flex items-center gap-2">
              <span>{article.date}</span>
              {article.tags?.length ? <span>• {article.tags.join(", ")}</span> : null}
            </div>
          </header>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 flex justify-center">
            <AdBanner
              dataAdSlot={getAdSlotId("article")}
              dataAdFormat="autorelaxed"
              className="w-full"
            />
          </div>

          <article className="prose prose-invert max-w-none space-y-6">
            <MDXRemote source={article.content} components={mdxComponents} />

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 flex justify-center">
              <AdBanner
                dataAdSlot={getAdSlotId("article")}
                dataAdFormat="autorelaxed"
                className="w-full"
              />
            </div>
          </article>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-4 sticky top-6">
            <p className="text-xs font-bold uppercase text-[var(--text-tertiary)] tracking-[0.2em] mb-3">
              Sponsored
            </p>
            <AdBanner
              dataAdSlot={getAdSlotId("sidebar")}
              dataAdFormat="auto"
              className="w-full"
              style={{ minHeight: "280px" }}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
