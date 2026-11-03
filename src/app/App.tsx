import { Header } from "./layout/Header/Header";
import { Input } from "@/shared/ui/Input/Input";

function App() {
  return (
    <>
      <Header />
      <main style={{ padding: "40px var(--page-padding)" }}>
        <h1>Məhsullar</h1>
        <Input></Input>
      </main>
    </>
  );
}

export default App;
