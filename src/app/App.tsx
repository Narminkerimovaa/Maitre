import { ToastContainer } from "@/shared/ui/Toast/ToastContainer";
import { Header } from "./layout/Header/Header";

function App() {
  return (
    <>
      <Header />
      <ToastContainer />
      <main style={{ padding: "40px var(--page-padding)" }}>
        <h1>Məhsullar</h1>
      </main>
    </>
  );
}

export default App;
