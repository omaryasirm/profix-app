"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormSkeleton } from "@/components/ui/skeleton-variants";
import Spinner from "@/app/components/Spinner";
import { useSearchItem, useUpdateSearchItem } from "@/hooks/api/useSearchItems";

const EditItemPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { data: item, isLoading } = useSearchItem(params.id);
  const updateItem = useUpdateSearchItem();

  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setDescription(item.description);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await updateItem.mutateAsync({
        id: parseInt(params.id),
        data: { description },
      });
      router.push("/items");
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to update item");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <FormSkeleton fields={1} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Line Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter item description"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateItem.isPending}>
                {updateItem.isPending ? (
                  <>
                    <Spinner />
                    <span className="ml-2">Updating...</span>
                  </>
                ) : (
                  "Update Item"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditItemPage;
