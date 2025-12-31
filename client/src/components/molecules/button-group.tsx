import { Home, Dumbbell, User } from "lucide-react";

import { IconButton } from "../atoms/icon-button";

export function ButtonGroup() {
  return (
    <div className="w-full flex justify-center items-center gap-2">
      <IconButton aria-label="Home" className="rounded-xl px-6 py-8">
        <Home className="size-5" />
      </IconButton>
      <IconButton aria-label="Fitness" className="rounded-xl px-6 py-8">
        <Dumbbell className="size-5" />
      </IconButton>
      <IconButton aria-label="User" className="rounded-xl px-6 py-8">
        <User className="size-5" />
      </IconButton>
    </div>
  );
}

