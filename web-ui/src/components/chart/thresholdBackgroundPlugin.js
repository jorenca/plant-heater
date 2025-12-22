export default function thresholdBackgroundPlugin() {
  return {
    id: "thresholdBackground",

    beforeDatasetsDraw(chart, args, pluginOptions) {
      const {
        ctx,
        chartArea: { top, bottom },
        scales,
      } = chart;

      const {
        timestamps = [],
        values = [],
        threshold,
        colorAbove = "rgba(255, 99, 132, 0.15)",
        colorBelow = null,
      } = pluginOptions;

      if (!timestamps.length || !values.length) return;

      ctx.save();

      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const tsStart = timestamps[i];
        const tsEnd = timestamps[i + 1];

        if (!tsStart) continue;

        const xStart = scales.x.getPixelForValue(tsStart);
        const xEnd = tsEnd
          ? scales.x.getPixelForValue(tsEnd)
          : scales.x.right;

        if (!isFinite(xStart) || !isFinite(xEnd)) continue;

        if (value >= threshold && colorAbove) {
          ctx.fillStyle = colorAbove;
        } else if (value < threshold && colorBelow) {
          ctx.fillStyle = colorBelow;
        } else {
          continue;
        }

        ctx.fillRect(
          xStart,
          top,
          xEnd - xStart,
          bottom - top
        );
      }

      ctx.restore();
    },
  };
}
