import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

type TabBarVisibilityContextValue = {
  hidden: boolean;
  setTabBarHidden: (hidden: boolean) => void;
};

const TabBarVisibilityContext = createContext<TabBarVisibilityContextValue | null>(null);

export function TabBarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const contextValue = useMemo(
    () => ({ hidden, setTabBarHidden: setHidden }),
    [hidden],
  );

  return (
    <TabBarVisibilityContext.Provider value={contextValue}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export function useTabBarScroll() {
  const context = useContext(TabBarVisibilityContext);
  const lastOffset = useRef(0);

  if (!context) {
    throw new Error('useTabBarScroll must be used inside TabBarVisibilityProvider');
  }

  useEffect(() => {
    lastOffset.current = 0;
    context.setTabBarHidden(false);
  }, [context.setTabBarHidden]);

  return (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = Math.max(0, event.nativeEvent.contentOffset.y);
    const delta = offset - lastOffset.current;

    if (Math.abs(delta) >= 4) {
      context.setTabBarHidden(delta > 0 && offset > 8);
      lastOffset.current = offset;
    }
  };
}

export function useTabBarVisibilityContext() {
  const context = useContext(TabBarVisibilityContext);

  if (!context) {
    throw new Error('useTabBarVisibilityContext must be used inside TabBarVisibilityProvider');
  }

  return context;
}