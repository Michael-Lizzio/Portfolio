import { Container } from "@/components/Container";
import type { Funnel, HowItWent as HowItWentData } from "@/lib/schema";

/**
 * "How it went": the traction block under a shipped app's overview. Three
 * parts, in reading order: a short timeline, the change I made with the funnel
 * chart that shows it, and what I watch. Built to be read in 30 seconds.
 *
 * Every number here is a fixed fact as of the content's `asOf` date. The live,
 * rounded totals are the stats line in the page header (public/stats.json).
 */
export function HowItWent({ data }: { data: HowItWentData }) {
  return (
    <section aria-labelledby="how-it-went" className="mt-16 md:mt-20">
      <Container>
        <h2 id="how-it-went" className="text-2xl font-semibold tracking-tight text-fg">
          How it went
        </h2>

        <Timeline steps={data.timeline} />

        {/* Phone: the fix, its chart, then what I watch. From lg the chart
            sits on the right beside both. */}
        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-0">
          <div className="flex flex-col gap-4 text-lg text-fg lg:col-span-5 lg:row-start-1">
            {data.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {data.funnel ? (
            <div className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
              <FunnelChart funnel={data.funnel} />
            </div>
          ) : null}

          {data.watch.length > 0 ? (
            <dl className="grid gap-5 border-t border-border-default pt-6 lg:col-span-5 lg:row-start-2 lg:mt-8 lg:self-start">
              {data.watch.map((item) => (
                <div key={item.label}>
                  <dt className="font-mono text-xs uppercase tracking-wide text-fg-faint">{item.label}</dt>
                  <dd className="mt-1.5 text-fg">{item.text}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

/**
 * Left to right from md, top to bottom on a phone. The dots sit on one rule so
 * the steps read as a sequence; the last dot is filled because it is "now".
 */
function Timeline({ steps }: { steps: HowItWentData["timeline"] }) {
  return (
    <ol className="relative mt-8 grid gap-7 md:grid-cols-3 md:gap-8">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <li key={step.title} className="relative pl-8 md:pl-0 md:pt-8">
            {/* The rule: down the left on a phone, across the top from md. */}
            {last ? null : (
              <span
                aria-hidden="true"
                className="absolute left-[5px] top-4 h-[calc(100%+1.75rem)] w-px bg-border-strong md:left-3 md:top-[5px] md:h-px md:w-[calc(100%+2rem)]"
              />
            )}
            <span
              aria-hidden="true"
              className={`absolute left-0 top-1.5 size-[11px] rounded-full border-2 md:top-0 ${
                last ? "border-[var(--chart-after)] bg-[var(--chart-after)]" : "border-[var(--border-control)] bg-bg"
              }`}
            />
            <p className="font-mono text-xs uppercase tracking-wide text-fg-faint">{step.when}</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-fg">{step.title}</p>
          </li>
        );
      })}
    </ol>
  );
}

function percent(count: number, base: number): number {
  return base === 0 ? 0 : Math.round((count / base) * 100);
}

/**
 * A funnel as paired bars: one row per step, the old version in grey and the
 * new one in the app's colour, each as a share of the people who started.
 * Every bar is labelled with its percentage, and the exact counts are in the
 * table that screen readers get (and in the bar's tooltip), so colour never
 * carries the meaning on its own.
 */
function FunnelChart({ funnel }: { funnel: Funnel }) {
  const [before, after] = funnel.series;
  const tones = ["bg-[var(--chart-before)]", "bg-[var(--chart-after)]"] as const;

  return (
    <figure className="rounded-lg border border-border-default bg-surface p-5 shadow-card sm:p-6">
      <figcaption className="text-base font-semibold text-fg">{funnel.title}</figcaption>

      {/* Legend: the two versions. Always present, because there are two series. */}
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-hidden="true">
        {funnel.series.map((series, index) => (
          <li key={series.label} className="flex items-baseline gap-2">
            <span className={`inline-block size-2.5 shrink-0 translate-y-[1px] rounded-[3px] ${tones[index]}`} />
            <span>
              <span className="font-medium text-fg">{series.label}</span>{" "}
              <span className="text-fg-muted">{series.detail}</span>
            </span>
          </li>
        ))}
      </ul>

      <ol className="mt-6 flex flex-col gap-5" aria-hidden="true">
        {funnel.steps.map((step, stepIndex) => {
          const focus = funnel.focus === stepIndex;
          return (
            <li key={step} className={focus ? "-mx-3 rounded-md bg-bg-subtle px-3 py-3" : undefined}>
              <p className="text-sm font-medium text-fg">{step}</p>
              <div className="mt-2 flex flex-col gap-[3px]">
                {funnel.series.map((series, seriesIndex) => {
                  const count = series.counts[stepIndex];
                  const value = percent(count, series.counts[0]);
                  return (
                    <div
                      key={series.label}
                      className="grid grid-cols-[minmax(0,1fr)_2.75rem] items-center gap-3"
                      title={`${series.label}: ${count} of ${series.counts[0]} (${value}%)`}
                    >
                      <div className="h-3">
                        <div
                          className={`h-full rounded-r-[4px] ${tones[seriesIndex]}`}
                          style={{ width: `${Math.max(value, 1)}%` }}
                        />
                      </div>
                      <span
                        className={`text-right text-sm tabular-nums ${
                          seriesIndex === 1 ? "font-semibold text-fg" : "text-fg-muted"
                        }`}
                      >
                        {value}%
                      </span>
                    </div>
                  );
                })}
              </div>
              {focus && funnel.focusNote ? (
                <p className="mt-2.5 text-sm text-fg-muted">{funnel.focusNote}</p>
              ) : null}
            </li>
          );
        })}
      </ol>

      {/* The same numbers as a table, for screen readers. */}
      <table className="sr-only">
        <caption>{funnel.title}</caption>
        <thead>
          <tr>
            <th scope="col">Step</th>
            <th scope="col">
              {before.label}, {before.detail}
            </th>
            <th scope="col">
              {after.label}, {after.detail}
            </th>
          </tr>
        </thead>
        <tbody>
          {funnel.steps.map((step, stepIndex) => (
            <tr key={step}>
              <th scope="row">{step}</th>
              {[before, after].map((series) => (
                <td key={series.label}>
                  {series.counts[stepIndex]} of {series.counts[0]} (
                  {percent(series.counts[stepIndex], series.counts[0])}%)
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {funnel.focusNote ? <p className="sr-only">{funnel.focusNote}</p> : null}

      <div className="mt-6 border-t border-border-default pt-4">
        <p className="text-sm text-fg-muted">{funnel.caption}</p>
        <p className="mt-1.5 font-mono text-xs text-fg-faint">{funnel.source}</p>
      </div>
    </figure>
  );
}
