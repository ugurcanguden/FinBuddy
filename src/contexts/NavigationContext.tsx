// Navigation Context - Global navigation state yönetimi
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ScreenType =
  | 'home'
  | 'settings'
  | 'categories'
  | 'addCategory'
  | 'editCategory'
  | 'addPayment'
  | 'payments'
  | 'paymentDetails'
  | 'incomes'
  | 'addEntry'
  | 'paymentsHub'
  | 'reportBuilder'
  | 'transactions'
  | 'accounts'
  | 'reports';

interface NavigationContextType {
  currentScreen: ScreenType;
  navigateTo: (screen: ScreenType, params?: any) => void;
  goBack: () => void;
  resetToHome: () => void;
  screenHistory: ScreenType[];
  currentParams: any;
  getCurrentParams: () => any;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['home']);
  const [currentParams, setCurrentParams] = useState<any>(null);

  const navigateTo = useCallback((screen: ScreenType, params?: any) => {
    setCurrentScreen(screen);
    setCurrentParams(params);
    setScreenHistory(prev => [...prev, screen]);
  }, []);

  const goBack = useCallback(() => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop(); // Son ekranı çıkar
      const previousScreen = newHistory[newHistory.length - 1];
      setCurrentScreen(previousScreen!); // previousScreen'in undefined olmayacağından eminiz çünkü length > 1 kontrolü yaptık
      setScreenHistory(newHistory);
      setCurrentParams(null);
    }
  }, [screenHistory]);

  const resetToHome = useCallback(() => {
    setCurrentScreen('home');
    setScreenHistory(['home']);
    setCurrentParams(null);
  }, []);

  const value: NavigationContextType = {
    currentScreen,
    navigateTo,
    goBack,
    resetToHome,
    screenHistory,
    currentParams,
    getCurrentParams: () => currentParams,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export default NavigationContext;
