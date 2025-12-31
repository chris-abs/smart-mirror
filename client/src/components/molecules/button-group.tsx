import { Home, Dumbbell, User } from "lucide-react";

import { IconButton } from "../atoms/icon-button";
import { useNavigation } from "../../contexts/navigation-context";

export function ButtonGroup() {
  const { currentRoute, setCurrentRoute } = useNavigation();

  return (
    <div className="w-full flex justify-center items-center gap-3">
      <IconButton
        aria-label="Home"
        className="rounded-xl px-4 py-8"
        onClick={() => setCurrentRoute("home")}
      >
        <Home className="size-7" />
      </IconButton>
      <IconButton
        aria-label="Fitness"
        className="rounded-xl px-4 py-8"
        onClick={() => setCurrentRoute("workout")}
      >
        <Dumbbell className="size-7" />
      </IconButton>
      <IconButton
        aria-label="User"
        className="rounded-xl px-4 py-8"
        onClick={() => setCurrentRoute("user")}
      >
        <User className="size-7" />
      </IconButton>
    </div>
  );
}

