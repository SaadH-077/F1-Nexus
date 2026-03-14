import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, ARCHIVE_ARTICLES } from "@/lib/articles";

export function generateStaticParams() {
  return ARCHIVE_ARTICLES.map((a) => ({ slug: a.slug }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-24">
      {/* Back */}
      <Link
        href="/analyst"
        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors mb-6"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Race Analyst
      </Link>

      {/* Hero image */}
      <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 mb-8">
        <img
          src={article.circuit}
          alt={article.race}
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 40%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        <div className="absolute bottom-0 left-0 p-8">
          <span
            className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 inline-block"
            style={{
              background: article.tagColor + "25",
              color: article.tagColor,
              border: `1px solid ${article.tagColor}40`,
            }}
          >
            {article.tag}
          </span>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-white leading-tight mt-2">
            {article.title}
          </h1>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border-dark">
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
          <span
            className="material-symbols-outlined text-primary text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            person
          </span>
        </div>
        <div>
          <p className="text-sm font-black text-white">~ Saad Haroon</p>
          <p className="text-[11px] text-slate-500">
            {article.date} · {article.readTime}
          </p>
        </div>

        <div className="ml-auto hidden sm:flex items-center gap-2">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            {article.race}
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-lg text-slate-300 leading-relaxed mb-8 font-light italic border-l-2 border-primary pl-4">
        {article.subtitle}
      </p>

      {/* Body paragraphs */}
      <div className="space-y-6">
        {article.paragraphs.map((para, i) => (
          <p
            key={i}
            className="text-slate-300 text-base leading-[1.85] tracking-wide"
            style={{ textIndent: "1.5em" }}
          >
            {para}
          </p>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-border-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">
            Written by
          </p>
          <p className="text-sm font-black text-white">~ Saad Haroon</p>
          <p className="text-[11px] text-slate-500">F1 Nexus · Race Analyst</p>
        </div>
        <Link
          href="/analyst"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-sm">article</span>
          More Analysis
        </Link>
      </div>
    </div>
  );
}
