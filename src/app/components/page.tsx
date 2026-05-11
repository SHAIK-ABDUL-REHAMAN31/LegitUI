"use client";

import { useState, useMemo } from "react";
import { useComponentStore } from "@/lib/component-store";
import ComponentCard from "@/components/ComponentCard";
import { Search, ChevronDown } from "lucide-react";
import styles from "./page.module.css";

export default function ComponentsIndexPage() {
  const { components, categories } = useComponentStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Components");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = components;

    if (selectedCategory !== "All Components") {
      result = result.filter(
        (c) => c.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.includes(q))
      );
    }

    return result;
  }, [components, search, selectedCategory]);

  const allCategories = ["All Components", ...categories.map((c) => c.name)];

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <h1 className={styles.pageTitle}>Index</h1>

      {/* Search & Filter Bar */}
      <div className={styles.filterBar}>
        {/* Search */}
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`search-input ${styles.searchInputFull}`}
          />
        </div>

        {/* Category Dropdown */}
        <div className={styles.dropdownWrapper}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={styles.dropdownButton}
          >
            {selectedCategory}
            <ChevronDown size={14} />
          </button>

          {dropdownOpen && (
            <div className={styles.dropdownMenu}>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setDropdownOpen(false);
                  }}
                  className={`${styles.dropdownItem} ${
                    selectedCategory === cat
                      ? styles.dropdownItemActive
                      : styles.dropdownItemInactive
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Count badge */}
        <span className={styles.countBadge}>
          {filtered.length} component{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Component Grid */}
      {filtered.length > 0 ? (
        <div className={styles.componentGrid}>
          {filtered.map((comp) => (
            <ComponentCard key={comp.id} component={comp} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No components found</p>
          <p className={styles.emptySubtitle}>
            Try a different search or category.
          </p>
        </div>
      )}
    </div>
  );
}
