import { createContext, useContext, useState, type ReactNode } from "react";

export type Route = "home" | "workout" | "user";

type NavigationContextType = {
  currentRoute: Route;
  setCurrentRoute: (route: Route) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<Route>("home");

  return (
    <NavigationContext.Provider value={{ currentRoute, setCurrentRoute }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}

