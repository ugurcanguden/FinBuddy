// Test Data - Bildirim testi için örnek veriler
import { paymentService } from '@/services';

export const createTestPayments = async (): Promise<void> => {
  try {
    console.log('🧪 Test ödemeleri oluşturuluyor...');
    
    // Test gider ödemesi (yarın)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    
    // Test gelir ödemesi (2 gün sonra)
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().slice(0, 10);
    
    // Test gider ödemesi oluştur
    const expenseEntry = await paymentService.createEntryWithSchedule({
      categoryId: '1', // Varsayılan gider kategorisi
      title: 'Test Kredi Ödemesi',
      amount: 1500,
      months: 1,
      startDate: tomorrowStr,
      type: 'expense'
    });
    
    console.log('✅ Test gider ödemesi oluşturuldu:', expenseEntry);
    
    // Test gelir ödemesi oluştur
    const incomeEntry = await paymentService.createEntryWithSchedule({
      categoryId: '2', // Varsayılan gelir kategorisi
      title: 'Test Maaş',
      amount: 5000,
      months: 1,
      startDate: dayAfterTomorrowStr,
      type: 'income'
    });
    
    console.log('✅ Test gelir ödemesi oluşturuldu:', incomeEntry);
    
    console.log('🎉 Test verileri başarıyla oluşturuldu!');
    
  } catch (error) {
    console.error('❌ Test verisi oluşturma hatası:', error);
  }
};

export const clearTestPayments = async (): Promise<void> => {
  try {
    console.log('🧹 Test ödemeleri temizleniyor...');
    
    // Tüm test ödemelerini sil
    const allPayments = await paymentService.getAllPayments();
    const testPayments = allPayments.filter(p => 
      p.title?.includes('Test') || 
      p.title?.includes('test')
    );
    
    for (const payment of testPayments) {
      await paymentService.deletePayment(payment.id);
    }
    
    console.log(`✅ ${testPayments.length} adet test ödemesi silindi`);
    
  } catch (error) {
    console.error('❌ Test verisi temizleme hatası:', error);
  }
};
