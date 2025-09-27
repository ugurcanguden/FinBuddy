// PaymentListSection - Ödeme listesi bölümü
import React from 'react';
import { View, Text, Card, TouchableOpacity, Button, Badge } from '@/components';
import { useLocale } from '@/hooks';
import { useNavigation } from '@/contexts';
import type { Entry } from '@/models';

interface PaymentListSectionProps {
  entries: Entry[];
  loading: boolean;
  error: string | null;
  entryStatuses: Record<string, 'pending' | 'paid'>;
  onLoadEntries: () => void;
  onPaymentAction: (entryId: string) => void;
  onConfirmDelete: (entryId: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

const PaymentListSection: React.FC<PaymentListSectionProps> = ({
  entries,
  loading,
  error,
  entryStatuses,
  onLoadEntries,
  onPaymentAction,
  onConfirmDelete,
  formatCurrency,
  formatDate
}) => {
  const { t } = useLocale();
  const { navigateTo } = useNavigation();

  return (
    <View style={{ marginBottom: 32 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text variant="primary" size="large" weight="bold">
          {t('screens.payments.payments_list') || 'Ödemeler'} ({entries.length})
        </Text>
        
        {entries.length > 0 && (
          <Button
            variant="outline"
            size="small"
            onPress={() => navigateTo('addPayment')}
            title={t('screens.payments.add_payment_button') || 'Yeni Ekle'}
            style={{ alignSelf: 'flex-end' }}
          />
        )}
      </View>

      {loading ? (
        <Card variant="default" style={{ padding: 24, alignItems: 'center' }}>
          <Text variant="secondary" size="medium" style={{ textAlign: 'center' }}>
            {t('common.messages.loading')}
          </Text>
        </Card>
      ) : error ? (
        <Card variant="outlined" style={{ padding: 24, alignItems: 'center' }}>
          <Text variant="error" size="medium" style={{ textAlign: 'center', marginBottom: 16 }}>
            {error}
          </Text>
          <Button
            variant="outline"
            size="small"
            onPress={onLoadEntries}
            title={t('screens.payments.try_again') || 'Tekrar Dene'}
            style={{ alignSelf: 'center' }}
          />
        </Card>
      ) : entries.length === 0 ? (
        <Card variant="outlined" style={{ padding: 32, alignItems: 'center' }}>
          <Text variant="secondary" size="medium" style={{ textAlign: 'center', marginBottom: 16 }}>
            {t('screens.payments.first_payment_message') || 'Henüz ödeme yok'}
          </Text>
          <Button
            variant="primary"
            size="medium"
            onPress={() => navigateTo('addPayment')}
            title={t('screens.payments.first_payment') || 'İlk Ödemenizi Ekleyin'}
            style={{ alignSelf: 'center' }}
          />
        </Card>
      ) : (
        <View style={{ gap: 12 }}>
          {entries.map((entry) => (
            <Card key={entry.id} variant="elevated" style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => navigateTo('paymentDetails', { entryId: entry.id })}
                  style={{ flex: 1 }}
                >
                  <View style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text variant="primary" size="medium" weight="bold" style={{ flex: 1 }}>
                        {entry.title || (t('screens.payments.payment') || 'Ödeme')}
                      </Text>
                      <Badge 
                        variant={entry.schedule_type === 'installment' ? 'warning' : 'info'}
                        size="small"
                      >
                        {entry.schedule_type === 'installment' 
                          ? (t('screens.payments.installment') || 'Taksitli') 
                          : (t('screens.payments.one_time') || 'Tek Seferlik')
                        }
                      </Badge>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text variant="primary" size="large" weight="bold">
                        {formatCurrency(entry.amount)}
                      </Text>
                      <Text variant="secondary" size="small">
                        {formatDate(entry.start_date)}
                      </Text>
                    </View>
                    
                    {entry.schedule_type === 'installment' && (
                      <View style={{ marginTop: 4 }}>
                        <Text variant="secondary" size="small">
                          {entry.months} {t('screens.payments.installment') || 'taksit'} • {entry.category_id}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
                
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <TouchableOpacity
                    style={[
                      {
                        backgroundColor: entryStatuses[entry.id] === 'paid' ? '#10B981' : '#EF4444',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        minWidth: 60,
                        alignItems: 'center',
                      },
                      entryStatuses[entry.id] === 'paid' && { backgroundColor: '#10B981' }
                    ]}
                    onPress={() => onPaymentAction(entry.id)}
                  >
                    <Text style={[
                      { color: 'white', fontSize: 12, fontWeight: '600' },
                      entryStatuses[entry.id] === 'paid' && { color: 'white' }
                    ] as any}>
                      {entryStatuses[entry.id] === 'paid' 
                        ? (t('screens.payments.paid_button') || 'Ödendi')
                        : (t('screens.payments.pay_button') || 'Öde')
                      }
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ padding: 8 }}
                    onPress={() => onConfirmDelete(entry.id)}
                  >
                    <Text variant="error" size="medium">🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
};

export default PaymentListSection;
