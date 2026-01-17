"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SearchComboboxProps<T> {
  value?: T;
  onValueChange: (value: T) => void;
  onAddNew?: (query: string) => void;
  searchEndpoint: string;
  searchKey: string;
  displayKey: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchCombobox<T extends Record<string, any>>({
  value,
  onValueChange,
  onAddNew,
  searchEndpoint,
  searchKey,
  displayKey,
  placeholder = "Search...",
  className,
  disabled = false,
}: SearchComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const queryClient = useQueryClient();
  const [scrollElement, setScrollElement] = React.useState<HTMLDivElement | null>(null);

  // Extract the resource name from the endpoint (e.g., "/api/searchItems" -> "searchItems")
  const resourceName = searchEndpoint.split('/').pop() || searchEndpoint;

  // Fetch all items immediately in background
  const { data, isLoading } = useQuery({
    queryKey: [resourceName, "all"],
    queryFn: async () => {
      const response = await axios.get(`${searchEndpoint}?limit=10000`);
      return Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleAddNew = async (query: string) => {
    if (onAddNew) {
      // Create optimistic item with temp ID
      const tempId = `temp_${Date.now()}`;
      const optimisticItem = {
        [searchKey]: tempId,
        [displayKey]: query,
        _isTemp: true, // Mark as temporary
      } as T;

      // Add to cache immediately
      queryClient.setQueryData([resourceName, "all"], (old: any) => {
        const currentData = Array.isArray(old) ? old : old?.data || [];
        return [optimisticItem, ...currentData];
      });

      // Close dropdown immediately
      setOpen(false);
      setSearchQuery("");

      // Select the optimistic item
      onValueChange(optimisticItem);

      // Call API in background
      try {
        await onAddNew(query);

        // Remove temp item after API succeeds
        queryClient.setQueryData([resourceName, "all"], (old: any) => {
          const currentData = Array.isArray(old) ? old : old?.data || [];
          return currentData.filter((item: T) => item[searchKey] !== tempId);
        });

        // Mutation's onSuccess will now refetch and add the real item
      } catch (error) {
        // Remove temp item on error
        queryClient.setQueryData([resourceName, "all"], (old: any) => {
          const currentData = Array.isArray(old) ? old : old?.data || [];
          return currentData.filter((item: T) => item[searchKey] !== tempId);
        });
        console.error("Failed to add item:", error);
      }
    }
  };

  const allItems = data || [];

  // Filter items locally based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return allItems;

    const query = searchQuery.toLowerCase();
    return allItems.filter((item: T) =>
      String(item[displayKey]).toLowerCase().includes(query)
    );
  }, [allItems, searchQuery, displayKey]);

  // Virtualize the list for performance
  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => 32, // Approximate height of each item
    overscan: 5, // Render 5 extra items above/below viewport
  });

  // Scroll to top when search query changes
  React.useEffect(() => {
    if (scrollElement) {
      scrollElement.scrollTop = 0;
    }
  }, [searchQuery, scrollElement]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {value
            ? filteredItems.find((item: T) => item[searchKey] === value[searchKey])?.[
                displayKey
              ] || value[displayKey] || placeholder
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        side="bottom"
        align="start"
        avoidCollisions={false}
        sideOffset={8}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9"
          />
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <>
              {filteredItems.length === 0 ? (
                <CommandEmpty>
                  {onAddNew && searchQuery ? (
                    <div className="flex justify-center py-2 px-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddNew(searchQuery)}
                        className="gap-2 font-normal text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-4 w-4" />
                        <span>
                          Create <span className="font-medium text-foreground">&quot;{searchQuery}&quot;</span>
                        </span>
                      </Button>
                    </div>
                  ) : (
                    "No results found."
                  )}
                </CommandEmpty>
              ) : (
                <div
                  ref={setScrollElement}
                  className="max-h-[300px] overflow-y-auto overscroll-contain"
                >
                  <div
                    style={{
                      height: `${virtualizer.getTotalSize() + 50}px`,
                      width: "100%",
                      position: "relative"
                    }}
                  >
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                      const item = filteredItems[virtualItem.index] as T;
                      return (
                        <CommandItem
                          key={item[searchKey]}
                          data-index={virtualItem.index}
                          ref={virtualizer.measureElement}
                          value={String(item[displayKey])}
                          onSelect={() => {
                            onValueChange(item);
                            setSearchQuery("");
                            setOpen(false);
                          }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          {item[displayKey]}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              value?.[searchKey] === item[searchKey]
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
