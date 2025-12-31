import type { ReactNode } from "react";
import { ButtonGroup } from "../molecules/button-group";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col">
      {children}
      <div className="pb-8 w-full">
        <ButtonGroup />
      </div>
    </div>
  );
}

