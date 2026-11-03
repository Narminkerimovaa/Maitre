import { Header } from "./layout/Header/Header";
import { Select } from "@/shared/ui/Select/Select";

function App() {
  return (
    <>
      <Header />
      <main style={{ padding: "40px var(--page-padding)" }}>
        <h1>Məhsullar</h1>
        <Select></Select>
      </main>
    </>
  );
}

export default App;
