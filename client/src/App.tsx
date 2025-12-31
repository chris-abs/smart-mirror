import { NavigationProvider, useNavigation } from "./contexts/navigation-context";
import { Layout } from "./components/organisms/layout";
import { HomeCanvas } from "./components/organisms/home-canvas";
import { WorkoutCanvas } from "./components/organisms/workout-canvas";

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
