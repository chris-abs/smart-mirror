import { Layout } from "./components/organisms/layout";
import { HomeCanvas } from "./components/organisms/canvas/home-canvas";
import { WorkoutCanvas } from "./components/organisms/canvas/workout-canvas";
import { NavigationProvider } from "./contexts";
import { useNavigation } from "./hooks/use-navigation";

function AppContent() {
  const { currentRoute } = useNavigation();

  return (
    <Layout>
      {currentRoute === "home" && <HomeCanvas />}
      {currentRoute === "workout" && <WorkoutCanvas />}
      {currentRoute === "user" && <HomeCanvas />}
    </Layout>
  );
}

function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}

export default App;
