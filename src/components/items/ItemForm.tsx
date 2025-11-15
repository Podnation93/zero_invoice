import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Item, ItemFormData } from '../../types/item';
import { useAppContext } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { itemSchema } from '../../utils/validation';
import { z } from 'zod';

interface ItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: Item;
}

export const ItemForm: React.FC<ItemFormProps> = ({
  isOpen,
  onClose,
  editingItem,
}) => {
  const { items, setItems } = useAppContext();
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    unitPrice: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        description: editingItem.description,
        unitPrice: editingItem.unitPrice.toString(),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        unitPrice: '',
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof ItemFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    try {
      itemSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ItemFormData, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof ItemFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const unitPrice = parseFloat(formData.unitPrice);

      if (editingItem) {
        // Update existing item
        const updatedItem: Item = {
          ...editingItem,
          name: formData.name.trim(),
          description: formData.description.trim(),
          unitPrice,
          updatedAt: now,
        };
        setItems(
          items.map((item) =>
            item.id === editingItem.id ? updatedItem : item
          )
        );
      } else {
        // Create new item
        const newItem: Item = {
          id: uuidv4(),
          name: formData.name.trim(),
          description: formData.description.trim(),
          unitPrice,
          createdAt: now,
          updatedAt: now,
        };
        setItems([...items, newItem]);
      }

      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
      setErrors({
        name: 'An error occurred while saving the item. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const formatPriceInput = (value: string): string => {
    // Remove any non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }

    return cleaned;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPriceInput(e.target.value);
    setFormData((prev) => ({
      ...prev,
      unitPrice: formatted,
    }));

    // Clear error when user starts typing
    if (errors.unitPrice) {
      setErrors((prev) => ({
        ...prev,
        unitPrice: undefined,
      }));
    }
  };

  const handlePriceBlur = () => {
    // Format to 2 decimal places on blur if there's a value
    if (formData.unitPrice && !isNaN(parseFloat(formData.unitPrice))) {
      const formatted = parseFloat(formData.unitPrice).toFixed(2);
      setFormData((prev) => ({
        ...prev,
        unitPrice: formatted,
      }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Edit Item' : 'Add New Item'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Item Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="e.g., Website Design, Consulting Hour"
          required
          autoFocus
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="Describe what this item includes..."
          rows={4}
          required
        />

        <div>
          <Input
            label="Unit Price"
            name="unitPrice"
            type="text"
            inputMode="decimal"
            value={formData.unitPrice}
            onChange={handlePriceChange}
            onBlur={handlePriceBlur}
            error={errors.unitPrice}
            placeholder="0.00"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter the price per unit (e.g., per hour, per item, per project)
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {editingItem ? 'Update Item' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
