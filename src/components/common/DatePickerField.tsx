// DatePickerField - Tıklanınca modal içinde DatePicker açan alan
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet } from 'react-native';
import View from './View';
import Text from './Text';
import TouchableOpacity from './TouchableOpacity';
import { useTheme } from '@/contexts';
import DatePicker from './DatePicker';
import { useLocale } from '@/hooks';

export interface DatePickerFieldProps {
  value?: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ value, onChange, placeholder }) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState<string | undefined>(value && value.trim() ? value : undefined);

  const normalizedValue = useMemo(() => (value && value.trim() ? value : undefined), [value]);
  const display = useMemo(() => normalizedValue ?? placeholder ?? 'YYYY-MM-DD', [normalizedValue, placeholder]);

  useEffect(() => {
    if (!open) setTemp(normalizedValue);
  }, [normalizedValue, open]);

  return (
    <>
      <TouchableOpacity
        variant="transparent"
        onPress={() => {
          setTemp(normalizedValue);
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

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          variant="transparent"
          style={[styles.overlay, { backgroundColor: colors.text + '66' }] as any}
          onPress={() => setOpen(false)}
          activeOpacity={1}
        >
          <View variant="surface" style={[styles.sheet, { borderColor: colors.border }] as any}>
            <DatePicker value={temp} onChange={setTemp as any} />
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
                onPress={() => {
                  if (temp) onChange(temp);
                  setOpen(false);
                }}
              >
                <Text style={{ color: colors.onPrimary }}>{t('common.buttons.ok')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  sheet: { width: '100%', maxWidth: 420, borderRadius: 12, borderWidth: 1, padding: 16, gap: 16 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btn: { flex: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
});

export default DatePickerField;
