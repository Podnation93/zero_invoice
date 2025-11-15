import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Settings, Move } from 'lucide-react';
import type { LayoutBlock, BlockType } from '../../types/template';

interface CanvasBlockProps {
  block: LayoutBlock;
  onDelete: (id: string) => void;
  onConfigure: (block: LayoutBlock) => void;
  isSelected: boolean;
  onClick: (block: LayoutBlock) => void;
}

const CanvasBlock: React.FC<CanvasBlockProps> = ({
  block,
  onDelete,
  onConfigure,
  isSelected,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { block },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    left: `${block.position.x}px`,
    top: `${block.position.y}px`,
    width: `${block.size.width}px`,
    height: `${block.size.height}px`,
  };

  const blockColors: Record<BlockType, string> = {
    logo: 'bg-purple-50 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700',
    header: 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700',
    customer: 'bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700',
    items: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700',
    totals: 'bg-red-50 border-red-300 dark:bg-red-900/30 dark:border-red-700',
    notes: 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700',
    footer: 'bg-gray-50 border-gray-300 dark:bg-gray-900/30 dark:border-gray-700',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute ${blockColors[block.type]} border-2 rounded-lg p-4 cursor-move hover:shadow-lg transition-all ${
        isSelected ? 'ring-2 ring-primary-500 border-primary-500' : ''
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(block);
      }}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Move size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
            {block.type}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfigure(block);
            }}
            className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
            title="Configure block"
          >
            <Settings size={14} className="text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
            className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
            title="Delete block"
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {block.size.width} x {block.size.height}
      </div>
    </div>
  );
};

interface DesignerCanvasProps {
  blocks: LayoutBlock[];
  onBlocksChange: (blocks: LayoutBlock[]) => void;
  onBlockDelete: (id: string) => void;
  onBlockConfigure: (block: LayoutBlock) => void;
  selectedBlock: LayoutBlock | null;
  onBlockSelect: (block: LayoutBlock | null) => void;
}

export const DesignerCanvas: React.FC<DesignerCanvasProps> = ({
  blocks,
  onBlocksChange: _onBlocksChange,
  onBlockDelete,
  onBlockConfigure,
  selectedBlock,
  onBlockSelect,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'designer-canvas',
  });

  const [canvasSize] = useState({ width: 794, height: 1123 }); // A4 size in pixels at 96 DPI

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Canvas (A4 Size)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Design your invoice template by arranging blocks
        </p>
      </div>

      <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-8 overflow-auto">
        <div
          ref={setNodeRef}
          className={`relative bg-white dark:bg-gray-800 mx-auto shadow-2xl transition-all ${
            isOver ? 'ring-4 ring-primary-500' : ''
          }`}
          style={{
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
            minHeight: `${canvasSize.height}px`,
          }}
          onClick={() => onBlockSelect(null)}
        >
          {blocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 dark:text-gray-600 text-lg mb-2">
                  Drop blocks here to start designing
                </p>
                <p className="text-gray-400 dark:text-gray-600 text-sm">
                  Drag blocks from the palette on the left
                </p>
              </div>
            </div>
          )}

          {blocks.map((block) => (
            <CanvasBlock
              key={block.id}
              block={block}
              onDelete={onBlockDelete}
              onConfigure={onBlockConfigure}
              isSelected={selectedBlock?.id === block.id}
              onClick={onBlockSelect}
            />
          ))}
        </div>
      </div>

      {selectedBlock && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Selected Block: {selectedBlock.type}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">Position:</span> X: {selectedBlock.position.x}, Y:{' '}
              {selectedBlock.position.y}
            </div>
            <div>
              <span className="font-medium">Size:</span> {selectedBlock.size.width} x{' '}
              {selectedBlock.size.height}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
