// UI Demo Screen - Yeni bileşenleri test etmek için demo sayfası
import React, { useState } from 'react';
import { StyleSheet, ScrollView as RNScrollView } from 'react-native';
import { useTheme } from '@/contexts';
import { useLocale } from '@/hooks';
import { Layout, PageHeader, View, Text, Card, Button, ProgressBar, Badge, StatCard, WalletCard, BarChart, QuickActions, RecentTransactions, WeeklySummary } from '@/components';

const UIDemoScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [progress, setProgress] = useState(65);
  const [loading, setLoading] = useState(false);

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Layout
      headerComponent={<PageHeader title={t('screens.ui_demo.title') || 'UI Bileşenleri Demo'} />}
    >
      <RNScrollView style={styles.container}>
        {/* Button Bileşenleri */}
        <Card padding="large" style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            🎨 Modern Button Bileşenleri
          </Text>
          
          <View style={styles.buttonGroup}>
            <Button title="Primary" variant="primary" onPress={() => {}} />
            <Button title="Secondary" variant="secondary" onPress={() => {}} />
            <Button title="Success" variant="success" onPress={() => {}} />
            <Button title="Danger" variant="danger" onPress={() => {}} />
          </View>

          <View style={styles.buttonGroup}>
            <Button title="Outline" variant="outline" onPress={() => {}} />
            <Button title="Ghost" variant="ghost" onPress={() => {}} />
            <Button title="Gradient" variant="gradient" onPress={() => {}} />
          </View>

          <View style={styles.buttonGroup}>
            <Button 
              title="Loading Test" 
              variant="primary" 
              loading={loading}
              onPress={handleLoadingTest}
            />
            <Button 
              title={t('screens.ui_demo.icon_left') || '🎉 Icon Left'} 
              variant="success" 
              icon="🎉"
              iconPosition="left"
              onPress={() => {}}
            />
            <Button 
              title={t('screens.ui_demo.icon_right') || 'Icon Right ➡️'} 
              variant="outline" 
              icon="➡️"
              iconPosition="right"
              onPress={() => {}}
            />
          </View>

          <View style={styles.buttonGroup}>
            <Button title="Small" variant="primary" size="small" onPress={() => {}} />
            <Button title="Medium" variant="primary" size="medium" onPress={() => {}} />
            <Button title="Large" variant="primary" size="large" onPress={() => {}} />
            <Button title="XLarge" variant="primary" size="xlarge" onPress={() => {}} />
          </View>

          <Button 
            title="Full Width Button" 
            variant="gradient" 
            fullWidth 
            onPress={() => {}}
            style={styles.fullWidthButton}
          />
        </Card>

        {/* ProgressBar Bileşenleri */}
        <Card padding="large" style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            📊 ProgressBar Bileşenleri
          </Text>
          
          <View style={styles.progressGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Varsayılan Progress Bar
            </Text>
            <ProgressBar progress={progress} showLabel />
          </View>

          <View style={styles.progressGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Farklı Varyantlar
            </Text>
            <ProgressBar progress={45} variant="success" showLabel />
            <ProgressBar progress={75} variant="warning" showLabel />
            <ProgressBar progress={90} variant="danger" showLabel />
            <ProgressBar progress={100} variant="success" showLabel />
          </View>

          <View style={styles.progressGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Farklı Boyutlar
            </Text>
            <ProgressBar progress={60} size="small" showLabel />
            <ProgressBar progress={60} size="medium" showLabel />
            <ProgressBar progress={60} size="large" showLabel />
          </View>

          <View style={styles.buttonGroup}>
            <Button 
              title={t('screens.ui_demo.increase') || 'Artır'} 
              variant="outline" 
              size="small"
              onPress={() => setProgress(Math.min(100, progress + 10))}
            />
            <Button 
              title="Azalt" 
              variant="outline" 
              size="small"
              onPress={() => setProgress(Math.max(0, progress - 10))}
            />
            <Button 
              title="Reset" 
              variant="outline" 
              size="small"
              onPress={() => setProgress(0)}
            />
          </View>
        </Card>

        {/* WalletCard Bileşenleri */}
        <Card padding="large" style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            💳 Modern Cüzdan Kartı
          </Text>
          
          <View style={styles.walletGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Pozitif Bakiye
            </Text>
            <WalletCard
              title={t('screens.ui_demo.main_wallet') || 'Ana Cüzdan'}
              balance={15420}
              income={25000}
              expense={9580}
              currency="₺"
              animated={true}
            />
          </View>

          <View style={styles.walletGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Negatif Bakiye
            </Text>
            <WalletCard
              title={t('screens.ui_demo.credit_card') || 'Kredi Kartı'}
              balance={-2500}
              income={0}
              expense={2500}
              currency="₺"
              animated={true}
            />
          </View>

          <View style={styles.walletGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Loading Durumu
            </Text>
            <WalletCard
              title={t('screens.ui_demo.loading') || 'Yükleniyor...'}
              balance={0}
              income={0}
              expense={0}
              loading={true}
            />
          </View>
        </Card>

        {/* BarChart Bileşenleri */}
        <Card padding="large" style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            📊 Modern Bar Chart
          </Text>
          
          <View style={styles.chartGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Basit Bar Chart
            </Text>
            <BarChart
              title={t('screens.ui_demo.monthly_income') || 'Aylık Gelir'}
              subtitle="Son 6 ay"
              data={[
                { label: 'Oca', value: 15000, color: colors.primary },
                { label: 'Şub', value: 18000, color: colors.primary },
                { label: 'Mar', value: 12000, color: colors.primary },
                { label: 'Nis', value: 22000, color: colors.primary },
                { label: 'May', value: 19000, color: colors.primary },
                { label: 'Haz', value: 25000, color: colors.primary },
              ]}
              height={120}
              animated={true}
              variant="gradient"
            />
          </View>

          <View style={styles.chartGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Stacked Bar Chart
            </Text>
            <BarChart
              title={t('screens.ui_demo.monthly_expenses') || 'Aylık Giderler'}
              subtitle={t('screens.ui_demo.total_vs_paid') || 'Toplam vs Ödenen'}
              data={[
                { label: 'Oca', value: 12000, secondaryValue: 8000, color: colors.danger, secondaryColor: colors.success },
                { label: 'Şub', value: 15000, secondaryValue: 12000, color: colors.danger, secondaryColor: colors.success },
                { label: 'Mar', value: 18000, secondaryValue: 15000, color: colors.danger, secondaryColor: colors.success },
                { label: 'Nis', value: 14000, secondaryValue: 10000, color: colors.danger, secondaryColor: colors.success },
                { label: 'May', value: 16000, secondaryValue: 14000, color: colors.danger, secondaryColor: colors.success },
                { label: 'Haz', value: 20000, secondaryValue: 18000, color: colors.danger, secondaryColor: colors.success },
              ]}
              height={120}
              animated={true}
              variant="stacked"
            />
          </View>

          <View style={styles.chartGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Renkli Bar Chart
            </Text>
            <BarChart
              title={t('screens.ui_demo.category_expenses') || 'Kategori Bazlı Harcamalar'}
              subtitle="Bu ay"
              data={[
                { label: 'Yemek', value: 2500, color: colors.success },
                { label: 'Ulaşım', value: 800, color: colors.info },
                { label: 'Eğlence', value: 1200, color: colors.warning },
                { label: 'Sağlık', value: 600, color: colors.danger },
                { label: 'Diğer', value: 900, color: colors.primary },
              ]}
              height={120}
              animated={true}
              variant="default"
            />
          </View>
        </Card>

        {/* QuickActions Bileşenleri */}
        <Card padding="large" style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            ⚡ Hızlı İşlemler
          </Text>
          
          <QuickActions
            actions={[
              {
                id: 'add-income',
                title: 'Gelir Ekle',
                subtitle: 'Yeni gelir',
                icon: '💰',
                color: colors.success,
                onPress: () => console.log('Gelir ekle'),
              },
              {
                id: 'add-expense',
                title: 'Gider Ekle',
                subtitle: 'Yeni gider',
                icon: '💸',
                color: colors.danger,
                onPress: () => console.log('Gider ekle'),
              },
              {
                id: 'view-reports',
                title: 'Raporlar',
                subtitle: 'Analizler',
                icon: '📊',
                color: colors.info,
                onPress: () => console.log('Raporlar'),
              },
              {
                id: 'settings',
                title: 'Ayarlar',
                subtitle: 'Konfigürasyon',
                icon: '⚙️',
                color: colors.primary,
                onPress: () => console.log('Ayarlar'),
                badge: '3',
              },
            ]}
            columns={2}
            animated={true}
          />
        </Card>

        {/* RecentTransactions Bileşenleri */}
        <Card padding="large" style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            📝 Son İşlemler
          </Text>
          
          <RecentTransactions
            transactions={[
              {
                id: '1',
                title: 'Maaş',
                amount: 15000,
                type: 'income',
                category: 'Maaş',
                date: new Date().toISOString(),
                status: 'completed',
                icon: '💰',
              },
              {
                id: '2',
                title: 'Market Alışverişi',
                amount: 250,
                type: 'expense',
                category: 'Yemek',
                date: new Date(Date.now() - 86400000).toISOString(),
                status: 'completed',
                icon: '🛒',
              },
              {
                id: '3',
                title: 'Elektrik Faturası',
                amount: 180,
                type: 'expense',
                category: 'Faturalar',
                date: new Date(Date.now() - 172800000).toISOString(),
                status: 'pending',
                icon: '⚡',
              },
              {
                id: '4',
                title: 'Freelance Proje',
                amount: 5000,
                type: 'income',
                category: 'Proje',
                date: new Date(Date.now() - 259200000).toISOString(),
                status: 'completed',
                icon: '💼',
              },
            ]}
            maxItems={4}
            showStatus={true}
            animated={true}
            onTransactionPress={(transaction) => console.log('Transaction pressed:', transaction)}
            onViewAllPress={() => console.log('View all pressed')}
          />
        </Card>

        {/* WeeklySummary Bileşenleri */}
        <Card padding="large" style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            📅 Haftalık Özet
          </Text>
          
          <WeeklySummary
            data={[
              { day: 'Pzt', income: 0, expense: 150, net: -150 },
              { day: 'Sal', income: 0, expense: 200, net: -200 },
              { day: 'Çar', income: 0, expense: 300, net: -300 },
              { day: 'Per', income: 15000, expense: 500, net: 14500 },
              { day: 'Cum', income: 0, expense: 250, net: -250 },
              { day: 'Cmt', income: 0, expense: 400, net: -400 },
              { day: 'Paz', income: 0, expense: 100, net: -100 },
            ]}
            animated={true}
            showProgress={true}
          />
        </Card>

        {/* StatCard Bileşenleri */}
        <Card padding="large" style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            📊 Modern İstatistik Kartları
          </Text>
          
          <View style={styles.statGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Farklı Varyantlar
            </Text>
            <View style={styles.statGrid}>
              <StatCard
                title="Toplam Gelir"
                value="₺15,420"
                subtitle="Bu ay"
                icon="💰"
                trend="up"
                trendValue="+12%"
                variant="success"
              />
              <StatCard
                title="Toplam Gider"
                value="₺8,750"
                subtitle="Bu ay"
                icon="💸"
                trend="down"
                trendValue="-5%"
                variant="danger"
              />
              <StatCard
                title={t('screens.ui_demo.pending_payments') || 'Bekleyen Ödemeler'}
                value="₺2,340"
                subtitle={t('screens.ui_demo.unpaid') || 'Ödenmemiş'}
                icon="⏳"
                trend="neutral"
                trendValue="3 adet"
                variant="warning"
              />
              <StatCard
                title={t('screens.ui_demo.net_income') || 'Net Kazanç'}
                value="₺6,670"
                subtitle="Bu ay"
                icon="📈"
                trend="up"
                trendValue="+18%"
                variant="primary"
              />
            </View>
          </View>

          <View style={styles.statGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Loading Durumu
            </Text>
            <View style={styles.statGrid}>
              <StatCard
                title={t('screens.ui_demo.loading') || 'Yükleniyor...'}
                value="0"
                loading={true}
                variant="default"
              />
            </View>
          </View>
        </Card>

        {/* Badge Bileşenleri */}
        <Card padding="large" style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            🏷️ Badge Bileşenleri
          </Text>
          
          <View style={styles.badgeGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Farklı Varyantlar
            </Text>
            <View style={styles.badgeRow}>
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
            </View>
          </View>

          <View style={styles.badgeGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Farklı Boyutlar
            </Text>
            <View style={styles.badgeRow}>
              <Badge size="small">Small</Badge>
              <Badge size="medium">Medium</Badge>
              <Badge size="large">Large</Badge>
            </View>
          </View>

          <View style={styles.badgeGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Farklı Şekiller
            </Text>
            <View style={styles.badgeRow}>
              <Badge shape="rounded">Rounded</Badge>
              <Badge shape="pill">Pill</Badge>
              <Badge shape="square">Square</Badge>
            </View>
          </View>

          <View style={styles.badgeGroup}>
            <Text variant="secondary" size="medium" weight="medium">
              Animasyonlu Badge'ler
            </Text>
            <View style={styles.badgeRow}>
              <Badge animated pulse variant="success">Pulse</Badge>
              <Badge animated variant="primary">Animated</Badge>
            </View>
          </View>
        </Card>

        {/* Card Bileşenleri */}
        <Card padding="large" style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            🃏 Modern Card Bileşenleri
          </Text>
          
          <View style={styles.cardGroup}>
            <Card variant="default" padding="medium">
              <Text variant="primary" weight="medium">Default Card</Text>
              <Text variant="secondary" size="small">Standart kart tasarımı</Text>
            </Card>

            <Card variant="elevated" padding="medium">
              <Text variant="primary" weight="medium">Elevated Card</Text>
              <Text variant="secondary" size="small">Gölgeli kart tasarımı</Text>
            </Card>

            <Card variant="outlined" padding="medium">
              <Text variant="primary" weight="medium">Outlined Card</Text>
              <Text variant="secondary" size="small">Çerçeveli kart tasarımı</Text>
            </Card>

            <Card variant="filled" padding="medium">
              <Text variant="primary" weight="medium">Filled Card</Text>
              <Text variant="secondary" size="small">Dolu arka planlı kart</Text>
            </Card>

            <Card variant="gradient" padding="medium">
              <Text variant="primary" weight="medium" style={{ color: colors.onPrimary }}>
                Gradient Card
              </Text>
              <Text variant="secondary" size="small" style={{ color: colors.onPrimary }}>
                Gradient arka planlı kart
              </Text>
            </Card>
          </View>

          <View style={styles.cardGroup}>
            <Card 
              variant="elevated" 
              padding="medium" 
              pressable 
              animated
              onPress={() => {}}
            >
              <Text variant="primary" weight="medium">Pressable Card</Text>
              <Text variant="secondary" size="small">Tıklanabilir ve animasyonlu kart</Text>
            </Card>
          </View>
        </Card>

        {/* Kullanım Örnekleri */}
        <Card padding="large" style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            💡 Kullanım Örnekleri
          </Text>
          
          <Card variant="elevated" padding="medium" style={styles.exampleCard}>
            <View style={styles.exampleHeader}>
              <Text variant="primary" weight="bold">Görev Tamamlandı</Text>
              <Badge variant="success" size="small">Tamamlandı</Badge>
            </View>
            <Text variant="secondary" size="small" style={styles.exampleDescription}>
              Bu görev başarıyla tamamlandı ve sistem güncellendi.
            </Text>
            <ProgressBar progress={100} variant="success" showLabel />
            <View style={styles.exampleActions}>
              <Button title="Detaylar" variant="outline" size="small" onPress={() => {}} />
              <Button title="Kapat" variant="primary" size="small" onPress={() => {}} />
            </View>
          </Card>

          <Card variant="outlined" padding="medium" style={styles.exampleCard}>
            <View style={styles.exampleHeader}>
              <Text variant="primary" weight="bold">Dosya Yükleme</Text>
              <Badge variant="warning" size="small">Yükleniyor</Badge>
            </View>
            <Text variant="secondary" size="small" style={styles.exampleDescription}>
              Dosya yükleniyor, lütfen bekleyin...
            </Text>
            <ProgressBar progress={progress} variant="default" showLabel />
            <View style={styles.exampleActions}>
              <Button title={t('screens.ui_demo.cancel') || 'İptal'} variant="ghost" size="small" onPress={() => {}} />
            </View>
          </Card>
        </Card>
      </RNScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  fullWidthButton: {
    marginTop: 8,
  },
  progressGroup: {
    marginBottom: 20,
    gap: 8,
  },
  badgeGroup: {
    marginBottom: 16,
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statGroup: {
    marginBottom: 16,
    gap: 8,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  walletGroup: {
    marginBottom: 16,
    gap: 8,
  },
  chartGroup: {
    marginBottom: 20,
    gap: 8,
  },
  cardGroup: {
    gap: 12,
    marginBottom: 16,
  },
  exampleCard: {
    marginBottom: 12,
  },
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleDescription: {
    marginBottom: 12,
  },
  exampleActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
});

export default UIDemoScreen;
