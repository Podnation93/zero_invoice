import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { Customer, CustomerFormData } from '../../types';
import { customerSchema } from '../../utils/validation';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { v4 as uuidv4 } from 'uuid';
import { ZodError } from 'zod';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ isOpen, onClose, customer }) => {
  const { customers, setCustomers } = useAppContext();
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        street: customer.billingAddress.street,
        city: customer.billingAddress.city,
        state: customer.billingAddress.state,
        zipCode: customer.billingAddress.zipCode,
        country: customer.billingAddress.country,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof CustomerFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data
      const validatedData = customerSchema.parse(formData);

      const now = new Date().toISOString();

      if (customer) {
        // Update existing customer
        const updatedCustomer: Customer = {
          ...customer,
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || undefined,
          billingAddress: {
            street: validatedData.street,
            city: validatedData.city,
            state: validatedData.state,
            zipCode: validatedData.zipCode,
            country: validatedData.country,
          },
          updatedAt: now,
        };

        const updatedCustomers = customers.map((c) =>
          c.id === customer.id ? updatedCustomer : c
        );
        setCustomers(updatedCustomers);
      } else {
        // Create new customer
        const newCustomer: Customer = {
          id: uuidv4(),
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || undefined,
          billingAddress: {
            street: validatedData.street,
            city: validatedData.city,
            state: validatedData.state,
            zipCode: validatedData.zipCode,
            country: validatedData.country,
          },
          createdAt: now,
          updatedAt: now,
        };

        setCustomers([...customers, newCustomer]);
      }

      onClose();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<Record<keyof CustomerFormData, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof CustomerFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error('Unexpected error:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Edit Customer' : 'Create New Customer'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="John Doe"
              autoFocus
            />
          </div>

          <Input
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="john@example.com"
          />

          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Billing Address
          </h4>

          <div className="space-y-4">
            <Input
              label="Street Address *"
              name="street"
              value={formData.street}
              onChange={handleChange}
              error={errors.street}
              placeholder="123 Main Street"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City *"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                placeholder="New York"
              />

              <Input
                label="State *"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={errors.state}
                placeholder="NY"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="ZIP Code *"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                error={errors.zipCode}
                placeholder="10001"
              />

              <Input
                label="Country *"
                name="country"
                value={formData.country}
                onChange={handleChange}
                error={errors.country}
                placeholder="United States"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose} type="button" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isSubmitting}>
            {customer ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
