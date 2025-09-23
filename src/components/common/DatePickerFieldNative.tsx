// DatePickerFieldNative - Native DateTimePicker ile tarih seçimi (YYYY-MM-DD)
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import View from './View';
import Text from './Text';
import TouchableOpacity from './TouchableOpacity';
import { useTheme } from '@/contexts';
import { useLocale } from '@/hooks';
import type { SupportedLanguage } from '@/services/locale/localeService';

function formatISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISO(value?: string): Date {
  if (!value) return new Date();
  const parts = value.split('-').map(Number);
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    const d = new Date(parts[0]!, parts[1]! - 1, parts[2]!);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
}

export interface DatePickerFieldNativeProps {
  value?: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
}

const DatePickerFieldNative: React.FC<DatePickerFieldNativeProps> = ({ value, onChange, placeholder }) => {
  const { colors, currentTheme } = useTheme();
  const { t, currentLanguage } = useLocale();
  const [open, setOpen] = useState(false);
  const normalizedValue = useMemo(() => (value && value.trim() ? value : undefined), [value]);
  const [temp, setTemp] = useState<Date>(parseISO(normalizedValue));

  const localeMap: Record<SupportedLanguage, string> = useMemo(
    () => ({
      en: 'en-US',
      tr: 'tr-TR',
      de: 'de-DE',
      fr: 'fr-FR',
      it: 'it-IT',
      es: 'es-ES',
    }),
    []
  );

  const pickerLocale = useMemo(() => localeMap[currentLanguage] ?? 'en-US', [localeMap, currentLanguage]);
  const themeVariant = useMemo<'light' | 'dark'>(() => (currentTheme === 'dark' || currentTheme === 'colorful' ? 'dark' : 'light'), [currentTheme]);

  useEffect(() => {
    if (!open) {
      setTemp(parseISO(normalizedValue));
    }
  }, [normalizedValue, open]);

  const display = useMemo(() => normalizedValue ?? placeholder ?? 'YYYY-MM-DD', [normalizedValue, placeholder]);

  const handleConfirm = () => {
    onChange(formatISO(temp));
    setOpen(false);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'set' && selected) {
      onChange(formatISO(selected));
    }
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        variant="transparent"
        onPress={() => {
          setTemp(parseISO(normalizedValue));
          setOpen(true);
        }}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 12,
        }}
      >
        <Text variant={normalizedValue ? 'primary' : 'secondary'}>{display}</Text>
      </TouchableOpacity>

      {/* iOS: modal içinde inline/spinner; Android: native dialog, yine modal içinde kullanılabilir */}
      {open && (
        Platform.OS === 'android' ? (
          <DateTimePicker
            value={parseISO(normalizedValue)}
            mode="date"
            display="calendar"
            onChange={handleAndroidChange}
            locale={pickerLocale}
            themeVariant={themeVariant}
          />
        ) : (
          <Modal visible transparent animationType="fade" onRequestClose={() => setOpen(false)}>
            <TouchableOpacity
              variant="transparent"
              style={[styles.overlay, { backgroundColor: colors.text + '66' }] as any}
              onPress={() => setOpen(false)}
              activeOpacity={1}
            >
              <View variant="surface" style={[styles.sheet, { borderColor: colors.border }] as any}>
                <DateTimePicker
                  value={temp}
                  mode="date"
                  display="inline"
                  onChange={(_, d) => d && setTemp(d)}
                  locale={pickerLocale}
                  themeVariant={themeVariant}
                  accentColor={colors.primary}
                  style={{ alignSelf: 'center', backgroundColor: colors.card, borderRadius: 12 }}
                />
                <View variant="transparent" style={styles.actions}>
                  <TouchableOpacity
                    variant="transparent"
                    style={[styles.btn, { borderColor: colors.border }] as any}
                    onPress={() => setOpen(false)}
                  >
                    <Text variant="secondary">{t('common.buttons.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    variant="primary"
                    style={[styles.btn, { backgroundColor: colors.primary }] as any}
                    onPress={handleConfirm}
                  >
                    <Text style={{ color: colors.onPrimary }}>{t('common.buttons.ok')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        )
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  sheet: { width: '100%', maxWidth: 420, borderRadius: 12, borderWidth: 1, padding: 16, gap: 16 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btn: { flex: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
});

export default DatePickerFieldNative;
