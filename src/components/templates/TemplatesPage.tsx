import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../../context/AppContext';
import type { Template, TemplateSchema } from '../../types/template';
import { TemplateList } from './TemplateList';
import { TemplateDesigner } from './TemplateDesigner';

type ViewMode = 'list' | 'designer';

export const TemplatesPage: React.FC = () => {
  const { templates, setTemplates } = useAppContext();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setViewMode('designer');
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setViewMode('designer');
  };

  const handleSave = (name: string, schema: TemplateSchema) => {
    const now = new Date().toISOString();

    if (editingTemplate) {
      // Update existing template
      const updatedTemplate: Template = {
        ...editingTemplate,
        name,
        schemaJSON: schema,
        updatedAt: now,
      };

      setTemplates(templates.map((t) => (t.id === editingTemplate.id ? updatedTemplate : t)));
    } else {
      // Create new template
      const newTemplate: Template = {
        id: uuidv4(),
        name,
        isDefault: templates.length === 0, // First template is default
        schemaJSON: schema,
        createdAt: now,
        updatedAt: now,
      };

      setTemplates([...templates, newTemplate]);
    }

    setViewMode('list');
    setEditingTemplate(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingTemplate(null);
  };

  const handleDelete = (id: string) => {
    const templateToDelete = templates.find((t) => t.id === id);

    if (templateToDelete?.isDefault) {
      alert('Cannot delete the default template. Please set another template as default first.');
      return;
    }

    setTemplates(templates.filter((t) => t.id !== id));
  };

  const handleDuplicate = (template: Template) => {
    const now = new Date().toISOString();
    const duplicatedTemplate: Template = {
      ...template,
      id: uuidv4(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };

    setTemplates([...templates, duplicatedTemplate]);
  };

  const handleSetDefault = (id: string) => {
    setTemplates(
      templates.map((t) => ({
        ...t,
        isDefault: t.id === id,
      }))
    );
  };

  if (viewMode === 'designer') {
    return (
      <TemplateDesigner
        template={editingTemplate}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TemplateList
        templates={templates}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onSetDefault={handleSetDefault}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
};
