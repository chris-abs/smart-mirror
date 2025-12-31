import { createContext } from "react";

export type Route = "home" | "workout" | "user";

type NavigationContextType = {
  currentRoute: Route;
  setCurrentRoute: (route: Route) => void;
};

export const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

