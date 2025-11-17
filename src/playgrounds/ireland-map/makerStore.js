import { create } from "zustand";
import { makers } from "./makerData";

export const useMakerStore = create((set, get) => ({
  // State
  searchQuery: "",
  selectedCraftType: "all",
  selectedCounty: "all",
  selectedMaker: null,
  clusterThreshold: 12, // Distance threshold for showing clusters - lower means clusters appear closer
  showClusters: true, // Whether to show clusters or individual markers

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSelectedCraftType: (craftType) => set({ selectedCraftType: craftType }),
  
  setSelectedCounty: (county) => set({ selectedCounty: county }),
  
  setSelectedMaker: (maker) => set({ selectedMaker: maker }),
  
  setShowClusters: (show) => set({ showClusters: show }),
  
  clearFilters: () =>
    set({
      searchQuery: "",
      selectedCraftType: "all",
      selectedCounty: "all",
    }),

  // Computed - Get filtered makers based on search and filters
  getFilteredMakers: () => {
    const { searchQuery, selectedCraftType, selectedCounty } = get();
    
    let filtered = [...makers];

    // Filter by craft type
    if (selectedCraftType !== "all") {
      filtered = filtered.filter((maker) => maker.craftType === selectedCraftType);
    }

    // Filter by county
    if (selectedCounty !== "all") {
      filtered = filtered.filter((maker) => maker.county === selectedCounty);
    }

    // Filter by search query (full-text search)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((maker) => {
        // Search in maker name
        if (maker.name.toLowerCase().includes(query)) return true;
        
        // Search in craft type
        if (maker.craftType.toLowerCase().includes(query)) return true;
        
        // Search in county
        if (maker.county.toLowerCase().includes(query)) return true;
        
        // Search in bio
        if (maker.bio.toLowerCase().includes(query)) return true;
        
        // Search in product names and descriptions
        const hasMatchingProduct = maker.products.some((product) => {
          return (
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
          );
        });
        
        return hasMatchingProduct;
      });
    }

    return filtered;
  },
}));

