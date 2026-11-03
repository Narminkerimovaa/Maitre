import { useEffect, useRef, useState } from "react";
import { useProductsUrlSync } from "@/features/products/hooks/useProductsUrlSync";
import { useCategoriesStore } from "@/features/products/store/categoriesStore";
import {
  getTotalPages,
  PAGE_SIZE,
  useProductsStore,
} from "@/features/products/store/productsStore";
import { Button } from "@/shared/ui/Button/Button";
import { PlusIcon } from "@/shared/ui/Icons";
import { Pagination } from "@/shared/ui/Pagination/Pagination";
import { getVisibleRange } from "@/shared/utils/pagination";
import { ProductsTable } from "../ProductsTable/ProductsTable";
import { ProductsToolbar } from "../ProductsToolbar/ProductsToolbar";
import {
  ProductFormModal,
  type FormTarget,
} from "../ProductFormModal/ProductFormModal";
import styles from "./ProductsPage.module.css";

export function ProductsPage() {
  useProductsUrlSync();

  const [formTarget, setFormTarget] = useState<FormTarget>(null);

  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);
  const categories = useCategoriesStore((s) => s.items);
  const categoriesStatus = useCategoriesStore((s) => s.status);

  const total = useProductsStore((s) => s.total);
  const status = useProductsStore((s) => s.status);
  const hasLoadedOnce = useProductsStore((s) => s.hasLoadedOnce);
  const page = useProductsStore((s) => s.query.page);
  const categoryId = useProductsStore((s) => s.query.categoryId);
  const hasFilter = useProductsStore(
    (s) => s.query.search !== "" || s.query.categoryId !== null,
  );
  const setPage = useProductsStore((s) => s.setPage);
  const setCategory = useProductsStore((s) => s.setCategory);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categoriesStatus !== "success" || categoryId === null) return;
    if (!categories.some((c) => c.id === categoryId)) void setCategory(null);
  }, [categoriesStatus, categories, categoryId, setCategory]);

  const anchorRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const top = anchorRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0)
      anchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  const subtitle = !hasLoadedOnce
    ? "Menyudakı bütün məhsullar"
    : hasFilter
      ? `${total} məhsul tapıldı`
      : `Menyudakı bütün məhsullar · ${total} məhsul`;

  const { from, to } = getVisibleRange(page, PAGE_SIZE, total);
  const showFooter = status !== "error" && total > 0;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Məhsullar</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <div className={styles.action}>
          <Button onClick={() => setFormTarget({ mode: "create" })}>
            <PlusIcon />
            Yeni məhsul
          </Button>
        </div>
      </div>

      <ProductsToolbar />

      <div ref={anchorRef}>
        <ProductsTable
          onCreate={() => setFormTarget({ mode: "create" })}
          onEdit={(product) => setFormTarget({ mode: "edit", product })}
        />
      </div>

      {showFooter && (
        <footer className={styles.footer}>
          <span className={styles.range}>
            {from}-{to} / {total} məhsul
          </span>
          <Pagination
            page={page}
            totalPages={getTotalPages(total)}
            onChange={(p) => void setPage(p)}
          />
        </footer>
      )}
      <ProductFormModal
        target={formTarget}
        onClose={() => setFormTarget(null)}
      />
    </main>
  );
}
