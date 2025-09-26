// ProfileScreen - Modern profil sayfası
import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { usePaymentReminders } from '@/hooks/usePaymentReminders';
import { 
  Layout, 
  Text, 
  View, 
  Card, 
  Button, 
  SafeArea,
  StatusBar,
  PageHeader,
  TouchableOpacity,
  Switch
} from '@/components/common';
import { StatCard } from '@/components/common';

// Profil veri tipleri
interface ProfileStats {
  totalPayments: number;
  totalIncome: number;
  totalExpense: number;
  categoriesCount: number;
  streakDays: number;
  joinDate: string;
}

const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { navigateTo } = useNavigation();
  const { settings: paymentReminders, updateSettings } = usePaymentReminders();
  
  // State
  const [profileStats] = useState<ProfileStats>({
    totalPayments: 156,
    totalIncome: 125000,
    totalExpense: 89000,
    categoriesCount: 12,
    streakDays: 45,
    joinDate: '2024-01-15'
  });

  // Handlers
  const handleEditProfile = useCallback(() => {
    Alert.alert('Profil Düzenle', 'Profil düzenleme özelliği yakında eklenecek!');
  }, []);


  const handleNotificationToggle = useCallback(async (channel: 'myPayments' | 'upcomingPayments') => {
    const newValue = !paymentReminders.channels[channel];
    await updateSettings({
      channels: {
        ...paymentReminders.channels,
        [channel]: newValue,
      },
    });
  }, [updateSettings, paymentReminders.channels]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SafeArea>
      <StatusBar />
      <Layout>
        <PageHeader
          title="Profil"
          showBackButton={true}
        />
        
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Profil Header */}
          <Card variant="elevated" style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text variant="primary" size="xlarge" weight="bold" style={{ color: colors.background }}>👤</Text>
              </View>
              
              <View style={styles.userInfo}>
                <Text variant="primary" size="xlarge" weight="bold" style={styles.userName}>
                  Kullanıcı
                </Text>
                <Text variant="secondary" size="medium" style={styles.joinDate}>
                  {formatDate(profileStats.joinDate)} tarihinde katıldı
                </Text>
                
                <View style={styles.streakContainer}>
                  <Text variant="primary" size="medium" weight="medium">🔥</Text>
                  <Text variant="primary" size="medium" weight="medium" style={styles.streakText}>
                    {profileStats.streakDays} gün üst üste
                  </Text>
                </View>
              </View>
            </View>
            
            <Button
              variant="outline"
              size="small"
              onPress={handleEditProfile}
              style={styles.editButton}
              title={t('screens.profile.edit_profile') || 'Profili Düzenle'}
            />
          </Card>

          {/* İstatistikler */}
          <View style={styles.section}>
            <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
              İstatistikler
            </Text>
            
            <View style={styles.statsGrid}>
              <StatCard
                title={t('screens.profile.total_payments') || 'Toplam Ödeme'}
                value={profileStats.totalPayments.toString()}
                subtitle={t('screens.profile.total_payments_subtitle') || 'işlem'}
                icon="📊"
                variant="primary"
                animated={true}
                style={styles.statCard}
              />
              
              <StatCard
                title="Toplam Gelir"
                value={formatCurrency(profileStats.totalIncome)}
                subtitle={t('screens.profile.this_year') || 'bu yıl'}
                icon="💰"
                variant="success"
                animated={true}
                style={styles.statCard}
              />
              
              <StatCard
                title="Toplam Gider"
                value={formatCurrency(profileStats.totalExpense)}
                subtitle={t('screens.profile.this_year') || 'bu yıl'}
                icon="💸"
                variant="danger"
                animated={true}
                style={styles.statCard}
              />
              
              <StatCard
                title="Kategoriler"
                value={profileStats.categoriesCount.toString()}
                subtitle="aktif"
                icon="📂"
                variant="info"
                animated={true}
                style={styles.statCard}
              />
            </View>
          </View>

          {/* Bildirim Ayarları */}
          <View style={styles.section}>
            <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
              Bildirim Ayarları
            </Text>
            
            <Card variant="default" padding="none" style={styles.card}>
              <TouchableOpacity 
                variant="transparent"
                style={[styles.settingItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                onPress={() => handleNotificationToggle('myPayments')}
              >
                <View style={styles.settingInfo}>
                  <Text variant="primary" size="medium" weight="medium">
                    🔔 Ödeme Hatırlatmaları
                  </Text>
                  <Text variant="secondary" size="small">
                    Kendi ödemeleriniz için
                  </Text>
                </View>
                <Switch
                  value={paymentReminders.channels.myPayments || false}
                  onValueChange={() => handleNotificationToggle('myPayments')}
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                variant="transparent"
                style={[styles.settingItem, { borderBottomWidth: 0 }]}
                onPress={() => handleNotificationToggle('upcomingPayments')}
              >
                <View style={styles.settingInfo}>
                  <Text variant="primary" size="medium" weight="medium">
                    📅 Yaklaşan Ödemeler
                  </Text>
                  <Text variant="secondary" size="small">
                    Yaklaşan ödemeler için
                  </Text>
                </View>
                <Switch
                  value={paymentReminders.channels.upcomingPayments || false}
                  onValueChange={() => handleNotificationToggle('upcomingPayments')}
                />
              </TouchableOpacity>
            </Card>
          </View>

          {/* Hızlı Eylemler */}
          <View style={styles.section}>
            <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
              Hızlı Eylemler
            </Text>
            
            <View style={styles.quickActions}>
              <Button
                variant="primary"
                size="large"
                onPress={() => navigateTo('addEntry')}
                style={styles.quickActionButton}
                icon="➕"
                fullWidth
                title={t('screens.profile.add_payment') || 'Yeni Ödeme Ekle'}
              />
              
              <View style={styles.quickActionsRow}>
                <Button
                  variant="outline"
                  size="medium"
                  onPress={() => navigateTo('reports')}
                  style={styles.quickActionButton}
                  icon="📊"
                  title="Raporlar"
                />
                
                <Button
                  variant="outline"
                  size="medium"
                  onPress={() => navigateTo('categories')}
                  style={styles.quickActionButton}
                  icon="📂"
                  title="Kategoriler"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </Layout>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  profileHeader: {
    margin: 16,
    padding: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: 4,
  },
  joinDate: {
    marginBottom: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  streakText: {
    marginLeft: 4,
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
  },
  card: {
    marginBottom: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  quickActions: {
    gap: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
  },
});

export default ProfileScreen;
