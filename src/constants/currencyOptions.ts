import type { DropdownOption } from '@/components';

export const CURRENCY_OPTIONS: DropdownOption[] = [
  { value: 'TRY', label: 'TRY (₺)', nativeName: 'Türk Lirası', flag: '₺' },
  { value: 'USD', label: 'USD ($)', nativeName: 'US Dollar', flag: '💵' },
  { value: 'EUR', label: 'EUR (€)', nativeName: 'Euro', flag: '💶' },
  { value: 'GBP', label: 'GBP (£)', nativeName: 'British Pound', flag: '💷' },
];

