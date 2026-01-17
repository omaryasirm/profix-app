"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Spinner from "@/app/components/Spinner";
import { useCreateCustomer } from "@/hooks/api/useCustomers";

const NewCustomerPage = () => {
  const router = useRouter();
  const createCustomer = useCreateCustomer();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await createCustomer.mutateAsync({
        name,
        contact: contact || null,
        vehicle: vehicle || null,
        registrationNo: registrationNo || null,
      });
      router.push("/customers");
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to create customer");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Customer</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Button type="submit" disabled={createCustomer.isPending}>
                {createCustomer.isPending ? (
                  <>
                    <Spinner />
                    <span className="ml-2">Creating...</span>
                  </>
                ) : (
                  "Create Customer"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewCustomerPage;
