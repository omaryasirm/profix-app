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
import { useCustomer, useUpdateCustomer } from "@/hooks/api/useCustomers";

const EditCustomerPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { data: customer, isLoading } = useCustomer(params.id);
  const updateCustomer = useUpdateCustomer();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setContact(customer.contact || "");
      setVehicle(customer.vehicle || "");
      setRegistrationNo(customer.registrationNo || "");
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await updateCustomer.mutateAsync({
        id: parseInt(params.id),
        data: {
          name,
          contact: contact || null,
          vehicle: vehicle || null,
          registrationNo: registrationNo || null,
        },
      });
      router.push(`/customers/${params.id}`);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to update customer");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto md:px-4 md:py-6 max-w-2xl">
        {/* Mobile: No card */}
        <div className="md:hidden px-3 py-4">
          <FormSkeleton fields={4} />
        </div>
        {/* Desktop: Card */}
        <div className="hidden md:block">
          <FormSkeleton fields={4} />
        </div>
      </div>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="contact">Contact</Label>
        <Input
          id="contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="vehicle">Vehicle</Label>
        <Input
          id="vehicle"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="registrationNo">Registration No</Label>
        <Input
          id="registrationNo"
          value={registrationNo}
          onChange={(e) => setRegistrationNo(e.target.value)}
          className="mt-1"
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
        <Button type="submit" disabled={updateCustomer.isPending}>
          {updateCustomer.isPending ? (
            <>
              <Spinner />
              <span className="ml-2">Updating...</span>
            </>
          ) : (
            "Update Customer"
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="container mx-auto md:px-4 md:py-6 max-w-2xl">
      {/* Mobile: No card */}
      <div className="md:hidden px-3 py-4 space-y-6">
        <h1 className="text-2xl font-bold">Edit Customer</h1>
        {formContent}
      </div>

      {/* Desktop: Card */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Edit Customer</CardTitle>
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCustomerPage;
