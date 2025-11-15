import React, { useState } from 'react';
import type { LineItem, Item } from '../../types';
import { Button, Input, Select } from '../common';
import { Trash2, Plus } from 'lucide-react';
import { calculateLineItemTotal } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatting';
import { v4 as uuidv4 } from 'uuid';

interface LineItemsTableProps {
  lineItems: LineItem[];
  onChange: (lineItems: LineItem[]) => void;
  items: Item[];
  errors?: { [key: number]: { [field: string]: string } };
}

export const LineItemsTable: React.FC<LineItemsTableProps> = ({
  lineItems,
  onChange,
  items,
  errors = {},
}) => {
  const [showItemSelect, setShowItemSelect] = useState<number | null>(null);

  const addLineItem = () => {
    const newLineItem: LineItem = {
      id: uuidv4(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    onChange([...lineItems, newLineItem]);
  };

  const addItemFromCatalog = (index: number, itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const updatedLineItems = [...lineItems];
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      itemId: item.id,
      name: item.name,
      description: item.description,
      unitPrice: item.unitPrice,
      total: calculateLineItemTotal(updatedLineItems[index].quantity, item.unitPrice),
    };
    onChange(updatedLineItems);
    setShowItemSelect(null);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedLineItems = [...lineItems];
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      [field]: value,
    };

    // Recalculate total if quantity or unitPrice changed
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? Number(value) : updatedLineItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? Number(value) : updatedLineItems[index].unitPrice;
      updatedLineItems[index].total = calculateLineItemTotal(quantity, unitPrice);
    }

    onChange(updatedLineItems);
  };

  const removeLineItem = (index: number) => {
    const updatedLineItems = lineItems.filter((_, i) => i !== index);
    onChange(updatedLineItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Line Items
        </h3>
        <Button variant="secondary" size="sm" onClick={addLineItem}>
          <Plus size={16} className="mr-1" />
          Add Line Item
        </Button>
      </div>

      {lineItems.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No line items yet. Click "Add Line Item" to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 w-24">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 w-32">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 w-32">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 w-16">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((lineItem, index) => (
                <tr
                  key={lineItem.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3">
                    {showItemSelect === index ? (
                      <div className="space-y-2">
                        <Select
                          options={items.map((item) => ({
                            value: item.id,
                            label: `${item.name} - ${formatCurrency(item.unitPrice)}`,
                          }))}
                          value=""
                          onChange={(e) => addItemFromCatalog(index, e.target.value)}
                          placeholder="Select from catalog"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowItemSelect(null)}
                          className="text-xs"
                        >
                          Or enter custom
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          value={lineItem.name}
                          onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                          placeholder="Item name"
                          error={errors[index]?.name}
                        />
                        {items.length > 0 && !lineItem.itemId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowItemSelect(index)}
                            className="text-xs"
                          >
                            Select from catalog
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={lineItem.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Description"
                      error={errors[index]?.description}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min="1"
                      value={lineItem.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                      error={errors[index]?.quantity}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={lineItem.unitPrice}
                      onChange={(e) => updateLineItem(index, 'unitPrice', Number(e.target.value))}
                      error={errors[index]?.unitPrice}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(lineItem.total)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => removeLineItem(index)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Remove line item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
