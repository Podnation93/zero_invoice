import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  FileText,
  User,
  Image,
  AlignLeft,
  DollarSign,
  FileSignature,
  MessageSquare,
} from 'lucide-react';
import type { BlockType } from '../../types/template';

interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const blockDefinitions: BlockDefinition[] = [
  {
    type: 'logo',
    label: 'Logo',
    icon: <Image size={24} />,
    description: 'Company logo',
    color: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-300',
  },
  {
    type: 'header',
    label: 'Header',
    icon: <FileText size={24} />,
    description: 'Invoice title and details',
    color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300',
  },
  {
    type: 'customer',
    label: 'Customer Info',
    icon: <User size={24} />,
    description: 'Customer details',
    color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300',
  },
  {
    type: 'items',
    label: 'Line Items',
    icon: <AlignLeft size={24} />,
    description: 'Invoice line items table',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300',
  },
  {
    type: 'totals',
    label: 'Totals',
    icon: <DollarSign size={24} />,
    description: 'Subtotal, tax, and total',
    color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300',
  },
  {
    type: 'notes',
    label: 'Notes',
    icon: <MessageSquare size={24} />,
    description: 'Additional notes',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900 dark:text-indigo-300',
  },
  {
    type: 'footer',
    label: 'Footer',
    icon: <FileSignature size={24} />,
    description: 'Footer information',
    color: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900 dark:text-gray-300',
  },
];

interface DraggableBlockProps {
  block: BlockDefinition;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ block }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${block.type}`,
    data: { type: block.type, isNew: true },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${block.color} p-4 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md`}
    >
      <div className="flex flex-col items-center gap-2">
        {block.icon}
        <span className="text-sm font-medium">{block.label}</span>
        <span className="text-xs opacity-75 text-center">{block.description}</span>
      </div>
    </div>
  );
};

interface BlockPaletteProps {
  className?: string;
}

export const BlockPalette: React.FC<BlockPaletteProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Block Palette
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Drag blocks onto the canvas to build your invoice template
      </p>
      <div className="grid grid-cols-1 gap-3">
        {blockDefinitions.map((block) => (
          <DraggableBlock key={block.type} block={block} />
        ))}
      </div>
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Tips:
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Drag blocks to position them</li>
          <li>• Resize blocks by dragging corners</li>
          <li>• Click blocks to configure</li>
          <li>• Delete blocks with the trash icon</li>
        </ul>
      </div>
    </div>
  );
};
