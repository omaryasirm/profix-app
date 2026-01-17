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
import { useCustomers, useDeleteCustomer } from "@/hooks/api/useCustomers";

const CustomersPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useCustomers({
    page,
    limit: 20,
    search: debouncedSearch,
  });

  const deleteCustomer = useDeleteCustomer();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`/customers?page=${newPage}${debouncedSearch ? `&search=${debouncedSearch}` : ""}`);
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    try {
      await deleteCustomer.mutateAsync(customerToDelete);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    } catch (error: any) {
      alert(
        error.response?.data?.error ||
          "Failed to delete customer. They may have existing invoices."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto md:px-4 md:py-6 max-w-6xl">
        {/* Mobile: No card */}
        <div className="md:hidden px-3 py-4 space-y-4">
          <h1 className="text-2xl font-bold">Customers</h1>
          <TableSkeleton rows={5} columns={5} />
        </div>
        {/* Desktop: Card */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle className="text-2xl">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} columns={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto md:px-4 md:py-6 max-w-6xl">
        {/* Mobile: No card */}
        <div className="md:hidden px-3 py-4">
          <div className="text-center text-destructive">
            Error loading customers. Please try again.
          </div>
        </div>
        {/* Desktop: Card */}
        <Card className="hidden md:block">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Error loading customers. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const customers = data?.data || [];
  const totalPages = data?.pagination.totalPages || 1;

  const tableContent = (
    <>
      <div className="mb-4">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>
      <div className="overflow-x-auto -mx-3 md:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Registration No
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="text-primary hover:underline"
                        >
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {customer.contact || "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {customer.vehicle || "-"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {customer.registrationNo || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Link href={`/customers/${customer.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCustomerToDelete(customer.id);
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
    </>
  );

  return (
    <>
      <div className="container mx-auto md:px-4 md:py-6 max-w-6xl">
        {/* Mobile: No card */}
        <div className="md:hidden px-3 py-4 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold">Customers</h1>
            <Link href="/customers/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Customer
              </Button>
            </Link>
          </div>
          {tableContent}
        </div>

        {/* Desktop: Card */}
        <Card className="hidden md:block">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-2xl">Customers</CardTitle>
              <Link href="/customers/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Customer
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {tableContent}
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot
              be undone. If this customer has invoices, deletion will be
              prevented.
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
              disabled={deleteCustomer.isPending}
            >
              {deleteCustomer.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const CustomersPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto md:px-4 md:py-6 max-w-6xl">
        {/* Mobile: No card */}
        <div className="md:hidden px-3 py-4 space-y-4">
          <h1 className="text-2xl font-bold">Customers</h1>
          <TableSkeleton rows={5} columns={5} />
        </div>
        {/* Desktop: Card */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle className="text-2xl">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} columns={5} />
          </CardContent>
        </Card>
      </div>
    }>
      <CustomersPageContent />
    </Suspense>
  );
};

export default CustomersPage;
