import { Home, Dumbbell, User } from "lucide-react";

import { IconButton } from "../atoms/icon-button";

export function ButtonGroup() {
  return (
    <div className="w-full flex justify-center items-center gap-3">
      <IconButton aria-label="Home" className="rounded-xl px-4 py-8">
        <Home className="size-7" />
      </IconButton>
      <IconButton aria-label="Fitness" className="rounded-xl px-4 py-8">
        <Dumbbell className="size-7" />
      </IconButton>
      <IconButton aria-label="User" className="rounded-xl px-4 py-8">
        <User className="size-7" />
      </IconButton>
    </div>
  );
}

