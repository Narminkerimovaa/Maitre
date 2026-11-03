import {
  useEffect,
  useRef,
  useState,
  useMemo,
  type KeyboardEvent,
} from "react";
import { useCategoriesStore } from "@/features/products/store/categoriesStore";
import { useProductsStore } from "@/features/products/store/productsStore";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { Button } from "@/shared/ui/Button/Button";
import { CloseIcon, SearchIcon } from "@/shared/ui/Icons";
import { Input } from "@/shared/ui/Input/Input";
import { Select } from "@/shared/ui/Select/Select";
import styles from "./ProductsToolbar.module.css";

export function ProductsToolbar() {
  const storeSearch = useProductsStore((s) => s.query.search);
  const categoryId = useProductsStore((s) => s.query.categoryId);
  const setSearch = useProductsStore((s) => s.setSearch);
  const setCategory = useProductsStore((s) => s.setCategory);

  const categories = useCategoriesStore((s) => s.items);
  const categoriesStatus = useCategoriesStore((s) => s.status);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);

  const [value, setValue] = useState(storeSearch);
  const [prevStoreSearch, setPrevStoreSearch] = useState(storeSearch);
  const debounced = useDebouncedValue(value, 300);
  const hasTypedRef = useRef(false);

  if (storeSearch !== prevStoreSearch) {
    setPrevStoreSearch(storeSearch);
    if (value.trim() !== storeSearch) setValue(storeSearch);
  }

  useEffect(() => {
    if (!hasTypedRef.current) return;
    void setSearch(debounced.trim());
  }, [debounced, setSearch]);

  const clear = () => {
    hasTypedRef.current = true;
    setValue("");
    void setSearch("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && value) {
      event.preventDefault();
      clear();
    }
  };

  const options = useMemo(
    () => [
      { value: "", label: "Bütün kateqoriyalar" },
      ...categories.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [categories],
  );

  return (
    <div className={styles.toolbar}>
      <div className={styles.search}>
        <Input
          icon={<SearchIcon />}
          placeholder="Ada görə axtar…"
          aria-label="Ada görə axtar"
          autoComplete="off"
          value={value}
          onChange={(event) => {
            hasTypedRef.current = true;
            setValue(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          endSlot={
            value ? (
              <button
                type="button"
                className={styles.clear}
                aria-label="Axtarışı təmizlə"
                onClick={clear}
              >
                <CloseIcon width={16} height={16} />
              </button>
            ) : null
          }
        />
      </div>

      <div className={styles.category}>
        <Select
          aria-label="Kateqoriya"
          options={options}
          value={categoryId === null ? "" : String(categoryId)}
          disabled={
            categoriesStatus === "idle" || categoriesStatus === "loading"
          }
          onChange={(value) =>
            void setCategory(value === "" ? null : Number(value))
          }
        />
      </div>

      {categoriesStatus === "error" && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void fetchCategories()}
        >
          Kateqoriyaları yenilə
        </Button>
      )}
    </div>
  );
}
