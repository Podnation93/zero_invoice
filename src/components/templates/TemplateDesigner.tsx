import React, { useState, useEffect } from 'react';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import { Save, X, Sparkles } from 'lucide-react';
import type { LayoutBlock, BlockType, Template, TemplateSchema, StyleConfig } from '../../types/template';
import { BlockPalette } from './BlockPalette';
import { DesignerCanvas } from './DesignerCanvas';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { LayoutSuggestions } from '../ai/LayoutSuggestions';

interface TemplateDesignerProps {
  template?: Template | null;
  onSave: (name: string, schema: TemplateSchema) => void;
  onCancel: () => void;
}

const defaultStyles: StyleConfig = {
  primaryColor: '#3B82F6',
  fontFamily: 'Arial, sans-serif',
  fontSize: {
    header: 24,
    body: 12,
    small: 10,
  },
  spacing: {
    padding: 16,
    margin: 8,
  },
};

const defaultBlockSizes: Record<BlockType, { width: number; height: number }> = {
  logo: { width: 150, height: 100 },
  header: { width: 700, height: 120 },
  customer: { width: 350, height: 150 },
  items: { width: 750, height: 300 },
  totals: { width: 300, height: 150 },
  notes: { width: 750, height: 100 },
  footer: { width: 750, height: 80 },
};

export const TemplateDesigner: React.FC<TemplateDesignerProps> = ({
  template,
  onSave,
  onCancel,
}) => {
  const [templateName, setTemplateName] = useState(template?.name || '');
  const [blocks, setBlocks] = useState<LayoutBlock[]>(template?.schemaJSON.layout || []);
  const [styles, setStyles] = useState<StyleConfig>(template?.schemaJSON.styles || defaultStyles);
  const [selectedBlock, setSelectedBlock] = useState<LayoutBlock | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showStylesModal, setShowStylesModal] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [error, setError] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
      setBlocks(template.schemaJSON.layout);
      setStyles(template.schemaJSON.styles);
    }
  }, [template]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Check if we're dragging from the palette (new block)
    const isNewBlock = active.data.current?.isNew;

    if (isNewBlock && over.id === 'designer-canvas') {
      const blockType = active.data.current?.type as BlockType;
      const defaultSize = defaultBlockSizes[blockType];

      // Calculate drop position
      const dropX = event.delta.x || 50;
      const dropY = event.delta.y || 50;

      const newBlock: LayoutBlock = {
        id: uuidv4(),
        type: blockType,
        position: {
          x: Math.max(0, dropX),
          y: Math.max(0, dropY),
        },
        size: defaultSize,
        config: {},
      };

      setBlocks([...blocks, newBlock]);
    } else if (!isNewBlock && active.id !== over.id) {
      // Reordering existing blocks
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = [...blocks];
        const [movedBlock] = newBlocks.splice(oldIndex, 1);
        newBlocks.splice(newIndex, 0, movedBlock);
        setBlocks(newBlocks);
      }
    }
  };

  const handleBlockDelete = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlock?.id === id) {
      setSelectedBlock(null);
    }
  };

  const handleBlockConfigure = (block: LayoutBlock) => {
    setSelectedBlock(block);
    // In a full implementation, you would open a config modal here
    alert(`Configure ${block.type} block - Configuration UI would open here`);
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }

    if (blocks.length === 0) {
      setError('Please add at least one block to your template');
      return;
    }

    const schema: TemplateSchema = {
      layout: blocks,
      styles,
    };

    onSave(templateName, schema);
  };

  const handleApplySuggestions = (suggestedLayout: LayoutBlock[]) => {
    setBlocks(suggestedLayout);
    setShowAISuggestions(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {template ? 'Edit Template' : 'New Template'}
            </h2>
            <Input
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value);
                setError('');
              }}
              placeholder="Template Name"
              className="max-w-xs"
              error={error && !templateName.trim() ? error : ''}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowStylesModal(true)}
            >
              Styles
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAISuggestions(true)}
            >
              <Sparkles size={16} className="mr-1" />
              AI Suggestions
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              <Save size={16} className="mr-1" />
              Save Template
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X size={16} className="mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Designer Area */}
      <div className="flex-1 overflow-hidden">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="h-full flex gap-4 p-4 max-w-[1800px] mx-auto">
            {/* Block Palette */}
            <div className="w-64 flex-shrink-0">
              <BlockPalette />
            </div>

            {/* Canvas */}
            <div className="flex-1 min-w-0">
              <SortableContext items={blocks.map((b) => b.id)}>
                <DesignerCanvas
                  blocks={blocks}
                  onBlocksChange={setBlocks}
                  onBlockDelete={handleBlockDelete}
                  onBlockConfigure={handleBlockConfigure}
                  selectedBlock={selectedBlock}
                  onBlockSelect={setSelectedBlock}
                />
              </SortableContext>
            </div>
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="bg-primary-100 border-2 border-primary-500 rounded-lg p-4 opacity-75">
                Dragging...
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Styles Configuration Modal */}
      <Modal
        isOpen={showStylesModal}
        onClose={() => setShowStylesModal(false)}
        title="Template Styles"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Primary Color"
            type="color"
            value={styles.primaryColor}
            onChange={(e) => setStyles({ ...styles, primaryColor: e.target.value })}
          />
          <Input
            label="Font Family"
            value={styles.fontFamily}
            onChange={(e) => setStyles({ ...styles, fontFamily: e.target.value })}
            placeholder="Arial, sans-serif"
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Header Font Size"
              type="number"
              value={styles.fontSize.header}
              onChange={(e) =>
                setStyles({
                  ...styles,
                  fontSize: { ...styles.fontSize, header: Number(e.target.value) },
                })
              }
            />
            <Input
              label="Body Font Size"
              type="number"
              value={styles.fontSize.body}
              onChange={(e) =>
                setStyles({
                  ...styles,
                  fontSize: { ...styles.fontSize, body: Number(e.target.value) },
                })
              }
            />
            <Input
              label="Small Font Size"
              type="number"
              value={styles.fontSize.small}
              onChange={(e) =>
                setStyles({
                  ...styles,
                  fontSize: { ...styles.fontSize, small: Number(e.target.value) },
                })
              }
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setShowStylesModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI Layout Suggestions */}
      {showAISuggestions && (
        <LayoutSuggestions
          currentLayout={blocks}
          onApply={handleApplySuggestions}
          onClose={() => setShowAISuggestions(false)}
        />
      )}
    </div>
  );
};
