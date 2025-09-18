# Testing Setup

Bu proje için önerilen test altyapısı Jest + React Native Testing Library’dir.

## Kurulum (Expo)
Not: Ağ erişimi gerekebilir. Paket kurmak için uygun ortamda çalıştırın.

```
npm install -D jest @testing-library/react-native @testing-library/jest-native jest-expo
```

`package.json` içine script ekleyin:

```
"test": "jest"
```

`jest.config.js` ekleyin:

```
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|expo-.*)/)'
  ],
};
```

## Örnek Test
`__tests__/example.test.tsx`

```
import React from 'react';
import { render } from '@testing-library/react-native';
import Text from '@/components/common/Text';

test('renders text', () => {
  const { getByText } = render(<Text>Merhaba</Text>);
  expect(getByText('Merhaba')).toBeTruthy();
});
```

## İpuçları
- UI testlerinde erişilebilirlik etiketlerini kullanın (`accessibilityLabel`).
- Saf yardımcı fonksiyonları ayrı testlerle doğrulayın.

