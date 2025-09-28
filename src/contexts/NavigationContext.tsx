// Navigation Context - Global navigation state yönetimi
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ScreenType =
  | 'splash'
  | 'initialSetup'
  | 'privacyTerms'
  | 'privacyTermsInitial'
  | 'onboarding'
  | 'home'
  | 'settings'
  | 'profile'
  | 'categories'
  | 'addCategory'
  | 'editCategory'
  | 'addPayment'
  | 'payments'
  | 'paymentDetails'
  | 'incomes'
  | 'addEntry'
  | 'debug'
  | 'paymentsHub'
  | 'reportBuilder'
  | 'transactions'
  | 'accounts'
  | 'reports'
  | 'uiDemo';

interface NavigationContextType {
  currentScreen: ScreenType;
  navigateTo: (screen: ScreenType, params?: Record<string, unknown>) => void;
  goBack: () => void;
  resetToHome: () => void;
  screenHistory: ScreenType[];
  currentParams: Record<string, unknown> | null;
  getCurrentParams: () => Record<string, unknown>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['splash']);
  const [currentParams, setCurrentParams] = useState<Record<string, unknown> | null>(null);

  const navigateTo = useCallback((screen: ScreenType, params?: Record<string, unknown>) => {
    setCurrentScreen(screen);
    setCurrentParams(params || null);
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
    getCurrentParams: () => currentParams || {},
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
