import { Fragment, type ReactNode } from "react";
import { useT } from "@/features/i18n/i18n";
import type { LegalDocument } from "./documents";

// Addresses in the text become links; nothing else in the wording is touched.
const LINK = /(\S+@\S+\.[a-z]{2,}|www\.[^\s,]+[^\s,.])/g;

function linkify(text: string): ReactNode {
  return text.split(LINK).map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    const href = part.includes("@") ? `mailto:${part}` : `https://${part}`;
    return (
      <a key={i} href={href} className="font-semibold text-raspberry underline">
        {part}
      </a>
    );
  });
}

/** Terms or Privacy Policy: title, last-updated line, then numbered or named sections. English only. */
export function LegalScreen({ document: doc }: { document: LegalDocument }) {
  const t = useT();
  const other =
    doc.slug === "terms"
      ? { href: "#/privacy", label: t("footer.privacy") }
      : { href: "#/terms", label: t("footer.terms") };
  return (
    <main className="mx-auto max-w-[760px] px-5" lang="en" dir="ltr">
      <a
        href="#/home"
        className="text-sm font-semibold text-raspberry hover:underline"
      >
        ← Maths Garden
      </a>
      <h1 className="mt-6 text-[clamp(30px,5vw,48px)] font-bold leading-tight text-raspberry">
        {doc.title}
      </h1>
      <p className="mt-2 text-sm text-grape/60">
        Last updated {doc.updated} · {t("legal.englishOnly")}
      </p>
      <article>
        {doc.intro.map((p) => (
          <p key={p} className="mt-4 text-[17px] leading-relaxed text-grape/90">
            {linkify(p)}
          </p>
        ))}
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mt-10 text-[clamp(22px,3vw,28px)] font-bold text-raspberry">
              {section.heading}
            </h2>
            {section.paragraphs.map((p) => (
              <p
                key={p}
                className="mt-4 text-[17px] leading-relaxed text-grape/90"
              >
                {linkify(p)}
              </p>
            ))}
          </section>
        ))}
      </article>
      <p className="mt-12">
        <a href={other.href} className="font-semibold text-raspberry underline">
          {other.label} →
        </a>
      </p>
    </main>
  );
}
