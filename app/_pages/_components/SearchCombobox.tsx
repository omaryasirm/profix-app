"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
  const MAX_ITEMS_DISPLAYED = 50;
  const queryClient = useQueryClient();

  // Extract the resource name from the endpoint (e.g., "/api/searchItems" -> "searchItems")
  const resourceName = searchEndpoint.split('/').pop() || searchEndpoint;

  // Fetch all items immediately in background
  const { data, isLoading } = useQuery({
    queryKey: [resourceName, "all"],
    queryFn: async () => {
      const response = await axios.get(
        `${searchEndpoint}?page=1&limit=1000`
      );
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

  // Limit displayed items for performance
  const items = filteredItems.slice(0, MAX_ITEMS_DISPLAYED);
  const hasMoreItems = filteredItems.length > MAX_ITEMS_DISPLAYED;

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
            ? items.find((item: T) => item[searchKey] === value[searchKey])?.[
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
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                {items.length === 0 ? (
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
                  <CommandGroup>
                    {items.map((item: T) => (
                      <CommandItem
                        key={item[searchKey]}
                        value={String(item[displayKey])}
                        onSelect={() => {
                          onValueChange(item);
                          setSearchQuery("");
                          setOpen(false);
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
                    ))}
                    {hasMoreItems && (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground text-center border-t">
                        Showing {items.length} of {filteredItems.length} results. Keep typing to narrow down...
                      </div>
                    )}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
