import { ScoringDiagram } from '@/features/progress/components/ScoringDiagram';
import { buttonVariants } from '@/shared/components/ui/button';
import { ARTICLES, type Article, type Block } from '../articles';

const when = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

function Piece({ block }: { block: Block }) {
  switch (block.kind) {
    case 'h':
      return <h2 className="mt-10 text-[clamp(24px,3.4vw,32px)] font-bold text-raspberry">{block.text}</h2>;
    case 'p':
      return <p className="mt-4 text-[17px] leading-relaxed text-grape/90">{block.text}</p>;
    case 'list':
      return (
        <ul className="mt-4 flex list-disc flex-col gap-2 pl-6 text-[17px] leading-relaxed text-grape/90">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'steps':
      return (
        <div className="mt-5 flex flex-col gap-3">
          {block.items.map((item) => (
            <div key={item.title} className="rounded-[24px] bg-cream p-5 candy-petal [--candy:6px]">
              <h3 className="text-xl font-semibold text-grape">{item.title}</h3>
              <p className="mt-1 leading-relaxed text-grape/85">{item.text}</p>
            </div>
          ))}
        </div>
      );
    case 'diagram':
      return <ScoringDiagram className="mt-6" />;
    case 'callout':
      return (
        <aside className="mt-6 rounded-[24px] bg-blush p-5">
          <h3 className="text-lg font-semibold text-raspberry">{block.title}</h3>
          <p className="mt-1 leading-relaxed text-grape/85">{block.text}</p>
        </aside>
      );
    case 'table':
      return (
        <figure className="mt-6">
          <div className="overflow-x-auto rounded-[24px] bg-cream p-2">
            <table className="w-full border-collapse text-left text-[15px]">
              <thead>
                <tr>
                  {block.head.map((cell) => (
                    <th key={cell} className="border-b-2 border-petal p-3 font-semibold text-raspberry">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={cell} className="border-b border-dashed border-petal p-3 align-top text-grape/85">
                        {i === 0 ? <b>{cell}</b> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && <figcaption className="mt-2 text-sm text-grape/60">{block.caption}</figcaption>}
        </figure>
      );
  }
}

/** One guide: standfirst, the blocks, the sources, and a nudge to the other guide. */
export function ArticleScreen({ article }: { article: Article }) {
  const other = ARTICLES.find((a) => a.slug !== article.slug);

  return (
    <main className="mx-auto max-w-[760px] px-5">
      <a href="#/home" className="text-sm font-semibold text-raspberry">
        ← Maths Garden
      </a>
      <p className="mt-6 text-5xl">{article.emoji}</p>
      <h1 className="mt-2 text-[clamp(30px,5vw,48px)] font-bold leading-tight text-raspberry">{article.title}</h1>
      <p className="mt-3 text-[19px] leading-relaxed text-grape/80">{article.standfirst}</p>
      <p className="mt-3 text-sm text-grape/55">
        {article.minutes} min read · updated {when(article.updated)}
      </p>

      <article>
        {article.blocks.map((block, i) => (
          <Piece key={i} block={block} />
        ))}
      </article>

      <section className="mt-12 rounded-[28px] bg-cream p-6 candy-petal [--candy:8px]">
        <h2 className="text-2xl font-semibold text-raspberry">Sources</h2>
        <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-grape/85">
          {article.references.map((reference) => (
            <li key={reference.text}>
              {reference.href ? (
                <a href={reference.href} target="_blank" rel="noreferrer noopener" className="underline hover:text-raspberry">
                  {reference.text}
                </a>
              ) : (
                reference.text
              )}
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {other && (
          <a href={`#/guides/${other.slug}`} className={buttonVariants({ variant: 'quiet' })}>
            {other.emoji} {other.title}
          </a>
        )}
        <a href="#/resources" className={buttonVariants()}>
          🖨 Free printables
        </a>
      </div>
    </main>
  );
}
