// DatePicker - Basit tarih seçici (YYYY-MM-DD), Dropdown tabanlı
import React, { useEffect, useMemo, useState } from 'react';
import View from './View';
import Dropdown, { DropdownOption } from './Dropdown';

export interface DatePickerProps {
  value?: string; // ISO: YYYY-MM-DD
  onChange: (value: string) => void;
  startYear?: number; // default: currentYear - 5
  endYear?: number;   // default: currentYear + 3
  style?: any;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const daysInMonth = (y: number, m: number) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, startYear, endYear, style }) => {
  const now = new Date();
  const [y, setY] = useState<number>(value ? Number(value.slice(0, 4)) : now.getFullYear());
  const [m, setM] = useState<number>(value ? Number(value.slice(5, 7)) : now.getMonth() + 1);
  const [d, setD] = useState<number>(value ? Number(value.slice(8, 10)) : now.getDate());

  const yearStart = startYear ?? now.getFullYear() - 5;
  const yearEnd = endYear ?? now.getFullYear() + 3;

  const yearOptions: DropdownOption[] = useMemo(
    () => Array.from({ length: yearEnd - yearStart + 1 }, (_, i) => yearStart + i).map((yy) => ({
      value: String(yy),
      label: String(yy),
      nativeName: '',
      flag: '',
    })),
    [yearStart, yearEnd]
  );

  const monthOptions: DropdownOption[] = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i + 1).map((mm) => ({
      value: pad2(mm),
      label: pad2(mm),
      nativeName: '',
      flag: '',
    })),
    []
  );

  const dayOptions: DropdownOption[] = useMemo(() => {
    const max = daysInMonth(y, m);
    return Array.from({ length: max }, (_, i) => i + 1).map((dd) => ({
      value: pad2(dd),
      label: pad2(dd),
      nativeName: '',
      flag: '',
    }));
  }, [y, m]);

  // Gün ayı aşarsa düzelt
  useEffect(() => {
    const max = daysInMonth(y, m);
    if (d > max) setD(max);
  }, [y, m]);

  // Değişimde ISO üret
  useEffect(() => {
    const iso = `${y}-${pad2(m)}-${pad2(d)}`;
    onChange(iso);
  }, [y, m, d]);

  return (
    <View variant="transparent" style={[{ flexDirection: 'row', gap: 12 }, style] as any}>
      <Dropdown options={yearOptions} selectedValue={String(y)} onSelect={(val) => setY(Number(val))} />
      <Dropdown options={monthOptions} selectedValue={pad2(m)} onSelect={(val) => setM(Number(val))} />
      <Dropdown options={dayOptions} selectedValue={pad2(d)} onSelect={(val) => setD(Number(val))} />
    </View>
  );
};

export default DatePicker;
