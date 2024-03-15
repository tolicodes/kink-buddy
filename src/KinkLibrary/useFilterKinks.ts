import { useState, useEffect, useCallback } from 'react';
import { Kinks } from './types';

export type CategoryWithCount = {
  value: string;
  count: number;
};


interface Filters {
  searchText: string;
  selectedCategories: string[];
  isFavorite: boolean;
  status: 'done' | 'todo' | ''; // Assuming status can be 'done', 'todo', or any string. Adjust as necessary.
  needsSupplies: boolean;
  level: string; // Assuming level is a string that matches certain criteria. Adjust as necessary.
  isGroup: boolean;
}

export const useFilterKinks = (allKinks: Kinks) => {
  const sortKinks = useCallback((kinks: Kinks) => {
    // After filtering, sort so favorites always come first
    return kinks.sort((a, b) => {
      // If both or neither are favorite, they remain in their original order
      if (a.favorite === b.favorite) return 0;
      // If 'a' is favorite but 'b' is not, 'a' should come first
      if (a.favorite && !b.favorite) return -1;
      // If 'b' is favorite but 'a' is not, 'b' should come first
      return 1;
    });
  }, [])

  const onFilterChange = useCallback((filters: Filters) => {
    const filtered = allKinks.filter((kink) => {
      const matchesSearchText = filters.searchText === '' || kink.idea_title.toLowerCase().includes(filters.searchText.toLowerCase()) || kink.idea_description.toLowerCase().includes(filters.searchText.toLowerCase());

      const matchesCategories = filters.selectedCategories.length === 0 || kink.categories.some(category => filters.selectedCategories.includes(category));

      const matchesFavorite = !filters.isFavorite || kink.favorite;

      const matchesStatus = filters.status === '' || kink.status === filters.status;

      const matchesLevel = filters.level === '' || kink.level === filters.level;

      return matchesSearchText && matchesCategories && matchesFavorite && matchesStatus && matchesLevel;
    });

    const sortedFiltered = sortKinks(filtered);

    console.log({
      sortedFiltered
    })

    setFilteredKinks(sortedFiltered);
  }, [allKinks, sortKinks]);

  const [filteredKinks, setFilteredKinks] = useState<Kinks>([]);

  useEffect(() => {
    console.log('yo')
    const sortedKinks = sortKinks(allKinks);
    setFilteredKinks(sortedKinks);
    console.log({
      sortedKinks
    })
  }, [allKinks, sortKinks]);


  const extractCategories = (kinks: Kinks): CategoryWithCount[] => {
    const categoryCounts = new Map<string, number>();

    kinks.forEach(kink => {
      kink.categories.forEach(category => {
        const currentCount = categoryCounts.get(category) || 0;
        categoryCounts.set(category, currentCount + 1);
      });
    });

    // Convert the map to an array of objects with name and count
    const categoriesWithCounts: CategoryWithCount[] = Array.from(categoryCounts).map(([value, count]) => ({
      value,
      count,
    }));

    // Optionally, sort categories by count or name
    categoriesWithCounts.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));

    return categoriesWithCounts;
  };

  const [categories, setCategories] = useState<CategoryWithCount[]>([]);

  useEffect(() => {
    const categoriesWithCounts = extractCategories(allKinks);
    setCategories(categoriesWithCounts);
  }, [allKinks])

  // Return both the filtered list of kinks and the function to change the filters
  return { filteredKinks, onFilterChange, categories };
};
