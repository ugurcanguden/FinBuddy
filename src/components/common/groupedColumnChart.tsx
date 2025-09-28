import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet, LayoutChangeEvent, TouchableOpacity, Pressable,
} from "react-native";
import { useTheme } from "@/contexts";
import { useLocale } from "@/hooks";

type SeriesValues = Record<string, number>;
export type GroupedDatum = { label: string; values: SeriesValues };
type ColorsMap = Record<string, string>;

export type GroupedColumnChartProps = {
  data: GroupedDatum[];
  colors: ColorsMap;
  height?: number;
  barWidth?: number;
  barGap?: number;
  groupGap?: number;
  yTicks?: number;
  maxValue?: number;
  formatValue?: (n: number) => string;
  axisWidth?: number;
};

const DEFAULT_HEIGHT = 220;
const X_LABEL_SPACE = 36;

export default function GroupedColumnChart({
  data,
  colors,
  height = DEFAULT_HEIGHT,
  barWidth = 18,
  barGap = 8,
  groupGap = 20,
  yTicks = 4,
  maxValue,
  formatValue = (n) => String(n),
  axisWidth = 80,
}: GroupedColumnChartProps) {
  const { t } = useLocale();
  const { colors: themeColors } = useTheme();

  const [plotHeight, setPlotHeight] = useState<number>(height);
  const [centerTip, setCenterTip] = useState<{
    seriesName: string; value: string; label: string; color: string;
    visible: boolean;
  } | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (h) setPlotHeight(h);
  }, []);

      // seriler
      const seriesKeys = useMemo(
        () => Array.from(new Set(data.flatMap(d => Object.keys(d.values || {})))),
        [data]
      );
      const seriesCount = seriesKeys.length;

  // dikey scroll eşiği (istersen kapatabilirsin)
  const [yScrollEnabled, setYScrollEnabled] = useState(false);
  useEffect(() => {
    const all = data.flatMap(d => Object.values(d.values || {}));
    if (!all.length) return;
    const mx = Math.max(...all), mn = Math.min(...all);
    setYScrollEnabled(mx - mn > mx * 0.3);
  }, [data]);

  // ölçek
  const globalMax = useMemo(() => {
    const vals = data.flatMap(d => seriesKeys.map(k => d.values?.[k] ?? 0));
    const m = Math.max(0, ...vals);
    return (maxValue ?? m) * 1.05; // tepe payı hafif
  }, [data, seriesKeys, maxValue]);

  const scaleY = useCallback((v: number) => {
    if (globalMax <= 0) return 0;
    return (v / globalMax) * plotHeight;
  }, [globalMax, plotHeight]);

  // 0..max tickler
  const ticks = useMemo(() => {
    const t = Math.max(1, yTicks);
    return Array.from({ length: t + 1 }, (_, i) => (globalMax * i) / t);
  }, [globalMax, yTicks]);

  // genişlikler
  const groupWidth = useMemo(
    () => seriesCount * barWidth + Math.max(0, seriesCount - 1) * barGap,
    [seriesCount, barWidth, barGap]
  );
  const chartWidth = useMemo(
    () => data.length * (groupWidth + groupGap) + groupGap,
    [data.length, groupWidth, groupGap]
  );

  // bar tıklandığında — merkezi tooltip aç
  const openCenterTip = useCallback((seriesName: string, val: number, groupLabel: string) => {
    setCenterTip({
      visible: true,
      seriesName,
      value: formatValue(val),
      label: groupLabel,
      color: colors?.[seriesName] || "#9CA3AF",
    });
  }, [formatValue, colors]);

  const closeCenterTip = useCallback(() => setCenterTip(null), []);

  return (
    <View style={[styles.container, { position: "relative", paddingTop: 10 }]}>
      <View style={{ flexDirection: "row", marginBottom: 4 }}>
        {/* Sol Y ekseni - SABİT */}
        <View style={{ width: axisWidth, position: 'absolute', left: 0, top: 0, zIndex: 10 }}>
          <View style={{ height: plotHeight, justifyContent: "flex-end", paddingTop: 10 }}>
            {ticks.map((t, i) => {
              const y = plotHeight - scaleY(t);
              return (
                <View key={`yl-${i}`} style={[styles.yLabelWrap, { top: y - 10 }]}>
                  <Text
                    style={[styles.yLabel, { color: themeColors.textSecondary }]}
                    numberOfLines={1}
                    // soldan sağa yaz
                    children={formatValue(t)}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Sağ taraf: grafik + X etiketleri (yatay scroll) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          contentContainerStyle={{ paddingRight: 8, paddingLeft: axisWidth }}
          nestedScrollEnabled
        >
          <View style={{ width: chartWidth }}>
            {/* Dikey scroll sadece çizim alanında */}
            <ScrollView
              showsVerticalScrollIndicator={yScrollEnabled}
              style={{ height }}
              contentContainerStyle={{ minHeight: height }}
              nestedScrollEnabled
              scrollEnabled={yScrollEnabled}
            >
              <View
                style={[styles.chartSurface, { height, backgroundColor: themeColors.background }]}
                onLayout={onLayout}
              >
                {/* Grid + 0 hattı */}
                {ticks.map((t, i) => {
                  const y = plotHeight - scaleY(t);
                  return <View key={`g-${i}`} style={[styles.gridLine, { top: y, backgroundColor: themeColors.border }]} />;
                })}
                <View style={[styles.gridLine, { top: plotHeight, backgroundColor: themeColors.border }]} />

                {/* Gruplar */}
                {data.map((d, idx) => {
                  const groupLeft = groupGap + idx * (groupWidth + groupGap);
                  return (
                    <View
                      key={`grp-${idx}`}
                      style={[styles.groupWrap, { left: groupLeft, width: groupWidth, height: plotHeight }]}
                    >
                      {seriesKeys.map((k, sIdx) => {
                        const val = d.values?.[k] ?? 0;
                        const h = scaleY(val);
                        const x = sIdx * (barWidth + barGap);
                        const color = colors?.[k] || "#9CA3AF";

                        return (
                          <React.Fragment key={`bar-${idx}-${k}`}>
                            <TouchableOpacity
                              style={[styles.bar, { left: x, width: barWidth, height: h, backgroundColor: color, bottom: 0 }]}
                              activeOpacity={0.7}
                              onPress={() => openCenterTip(k, val, d.label)}
                            />
                          </React.Fragment>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            {/* X ekseni etiketleri (sadece yatay scroll) */}
            <View
              style={{
                height: X_LABEL_SPACE,
                width: chartWidth,
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: groupGap,
                paddingRight: groupGap,
              }}
            >
              {data.map((d, idx) => (
                <View key={`x-${idx}`} style={{ width: groupWidth, marginRight: groupGap, alignItems: "center" }}>
                  <Text
                    style={[styles.xLabel, { color: themeColors.text, writingDirection: "ltr" }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {d.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* MERKEZİ TOOLTIP */}
      {centerTip?.visible && (
        <Pressable
          style={[
            styles.centerOverlay,
            { left: axisWidth, right: 0, height, top: 0 }, // sadece grafiğin üstünü kapla
          ]}
          onPress={closeCenterTip}
        >
          <View
            style={[
              styles.centerCard,
              { backgroundColor: themeColors.background, borderColor: themeColors.border },
            ]}
          >
            <View style={styles.centerRow}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: centerTip.color || "#999" },
                ]}
              />
              {/* soldan sağa tek satır: Ay — Seri: Değer */}
              <Text
                style={[styles.centerText, { color: themeColors.text }]}
                numberOfLines={2}
              >
                {centerTip.label}
              </Text>
              <Text
                style={[styles.centerText, { color: themeColors.text, marginTop: 2 }]}
                numberOfLines={1}
              >
                {centerTip.seriesName}
              </Text>
              <Text
                style={[styles.centerText, { color: themeColors.primary, fontWeight: "700", marginTop: 2 }]}
                numberOfLines={1}
              >
                {centerTip.value}
              </Text>
            </View>
            <Text style={[styles.centerHint, { color: themeColors.textSecondary }]}>
              {t('charts.tooltip.close_hint') || 'Kapatmak için dokun'}
            </Text>
          </View>
        </Pressable>
      )}

      {/* Legend */}
      <View style={styles.legendWrap}>
        {seriesKeys.map((k) => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: colors?.[k] || "#9CA3AF" }]} />
            <Text style={[styles.legendText, { color: themeColors.text }]}>{k}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  chartSurface: { position: "relative" },
  gridLine: { position: "absolute", left: 0, right: 0, height: StyleSheet.hairlineWidth },
  yLabelWrap: { position: "absolute", right: 6, alignItems: "flex-end", minHeight: 20, justifyContent: "center" },
  yLabel: { fontSize: 11, textAlign: "right", lineHeight: 14, writingDirection: "ltr" },
  groupWrap: { position: "absolute", bottom: 0 },
  bar: {
    position: "absolute",
    borderTopLeftRadius: 4, borderTopRightRadius: 4,
    alignItems: "center", justifyContent: "flex-end",
  },
  xLabel: { fontSize: 14, fontWeight: "700", textAlign: "center" },

  // merkez tooltip
  centerOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  centerCard: {
    minWidth: 220,
    maxWidth: 320,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  centerRow: { flexDirection: "row", alignItems: "center" },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  centerText: { fontSize: 15, fontWeight: "600" },
  centerHint: { marginTop: 6, fontSize: 12, textAlign: "center" },

  legendWrap: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8, alignItems: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", marginRight: 12, marginTop: 4 },
  swatch: { width: 12, height: 12, borderRadius: 2, marginRight: 6 },
  legendText: { fontSize: 12 },
});
