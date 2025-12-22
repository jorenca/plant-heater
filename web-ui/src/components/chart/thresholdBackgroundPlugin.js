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
        datasetIndex = 0,
        threshold,
        colorAbove = "rgba(255, 99, 132, 0.15)",
        colorBelow = null,
      } = pluginOptions;

      const meta = chart.getDatasetMeta(datasetIndex);
      const data = pluginOptions.values;

      if (!meta || !data) return;

      ctx.save();

      for (let i = 0; i < data.length; i++) {
        const value = data[i];
        const xStart = meta.data[i]?.x;
        const xEnd =
          meta.data[i + 1]?.x ?? scales.x.right;

        if (xStart == null || xEnd == null) continue;

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