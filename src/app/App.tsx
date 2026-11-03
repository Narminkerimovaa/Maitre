import { ToastContainer } from "@/shared/ui/Toast/ToastContainer";
import { Header } from "./layout/Header/Header";
import { ProductsPage } from "@/features/products";

function App() {
  return (
    <>
      <Header />
      <ToastContainer />
      <ProductsPage />
    </>
  );
}

export default App;
