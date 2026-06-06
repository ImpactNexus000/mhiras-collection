import { SIZE_CHART, SIZE_NOTE, MEASURE_TIPS } from "@/lib/size-guide";

/**
 * The size chart itself — pure markup from the size-guide data. No client
 * hooks, so it renders fine inside both the server /size-guide page and the
 * client size-guide modal.
 */
export function SizeGuideContent() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-charcoal-soft leading-relaxed">
        Our pieces are pre-loved, so sizing can vary a little by brand and era.
        Sizes below are <strong>UK sizes</strong>, with body measurements in
        inches — always check the labelled size on each item&apos;s product page.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border">
          <thead>
            <tr className="bg-cream-dark text-left">
              <th className="px-3 py-2 font-medium">UK Size</th>
              <th className="px-3 py-2 font-medium">Bust (in)</th>
              <th className="px-3 py-2 font-medium">Waist (in)</th>
              <th className="px-3 py-2 font-medium">Hip (in)</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_CHART.map((row) => (
              <tr key={row.size} className="border-t border-border">
                <td className="px-3 py-2 font-medium">{row.size}</td>
                <td className="px-3 py-2">{row.bust}</td>
                <td className="px-3 py-2">{row.waist}</td>
                <td className="px-3 py-2">{row.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-charcoal-soft">{SIZE_NOTE}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">How to measure</h3>
        <ul className="space-y-1.5 text-sm text-charcoal-soft">
          {MEASURE_TIPS.map((t) => (
            <li key={t.label}>
              <span className="font-medium text-charcoal">{t.label}:</span>{" "}
              {t.tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
