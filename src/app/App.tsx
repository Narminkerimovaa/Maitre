import { Header } from "./layout/Header/Header";
import { Button } from "@/shared/ui/Button/Button";

function App() {
  return (
    <>
      <Header />
      <main style={{ padding: "40px var(--page-padding)" }}>
        <h1>Məhsullar</h1>
        <Button variant="primary" size="sm">click</Button>
      </main>
    </>
  );
}

export default App;
