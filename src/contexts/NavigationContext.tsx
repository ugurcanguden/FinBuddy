// Navigation Context - Global navigation state yönetimi
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ScreenType = 'home' | 'settings' | 'categories' | 'transactions' | 'accounts' | 'reports';

interface NavigationContextType {
  currentScreen: ScreenType;
  navigateTo: (screen: ScreenType) => void;
  goBack: () => void;
  resetToHome: () => void;
  screenHistory: ScreenType[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['home']);

  const navigateTo = useCallback((screen: ScreenType) => {
    setCurrentScreen(screen);
    setScreenHistory(prev => [...prev, screen]);
  }, []);

  const goBack = useCallback(() => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop(); // Son ekranı çıkar
      const previousScreen = newHistory[newHistory.length - 1];
      setCurrentScreen(previousScreen);
      setScreenHistory(newHistory);
    }
  }, [screenHistory]);

  const resetToHome = useCallback(() => {
    setCurrentScreen('home');
    setScreenHistory(['home']);
  }, []);

  const value: NavigationContextType = {
    currentScreen,
    navigateTo,
    goBack,
    resetToHome,
    screenHistory,
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
