"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/ui/skeleton-variants";
import { Trash2, Edit, Plus } from "lucide-react";
import { useSearchItems, useDeleteSearchItem } from "@/hooks/api/useSearchItems";
import { formatDatePakistan } from "@/lib/date-utils";

const ItemsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useSearchItems({
    page,
    limit: 20,
    search: debouncedSearch,
  });

  const deleteItem = useDeleteSearchItem();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`/items?page=${newPage}${debouncedSearch ? `&search=${debouncedSearch}` : ""}`);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItem.mutateAsync(itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete item");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} columns={3} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Error loading items. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = data?.data || [];
  const totalPages = data?.pagination.totalPages || 1;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl">Line Items</CardTitle>
            <Link href="/items/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Item
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No items found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {item.createdAt ? formatDatePakistan(item.createdAt) : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Link href={`/items/${item.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setItemToDelete(item.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) handlePageChange(page - 1);
                      }}
                      className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (totalPages <= 7) return true;
                      return (
                        p === 1 ||
                        p === totalPages ||
                        (p >= page - 1 && p <= page + 1)
                      );
                    })
                    .map((p, idx, arr) => {
                      if (idx > 0 && arr[idx - 1] !== p - 1) {
                        return (
                          <React.Fragment key={p}>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(p);
                                }}
                                isActive={page === p}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      }
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(p);
                            }}
                            isActive={page === p}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) handlePageChange(page + 1);
                      }}
                      className={
                        page === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteItem.isPending}
            >
              {deleteItem.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ItemsPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} columns={3} />
          </CardContent>
        </Card>
      </div>
    }>
      <ItemsPageContent />
    </Suspense>
  );
};

export default ItemsPage;
