import Navbar from "./Components/layout/Navbar.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import ErrorBoundary from "./Components/common/ErrorBoundary.jsx";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1"><ErrorBoundary><AppRoutes /></ErrorBoundary></main>
    </div>
  );
}

export default App;