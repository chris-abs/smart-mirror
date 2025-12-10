import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type IconButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
>;

export function IconButton({
  children,
  className = "",
  ...rest
}: IconButtonProps) {
  return (
    <button
      className={
        "inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-2 text-xs " +
        "hover:bg-white/10 active:scale-95 transition " +
        className
      }
      {...rest}
    >
      {children}
    </button>
  );
}
