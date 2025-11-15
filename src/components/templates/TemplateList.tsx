import React, { useState } from 'react';
import { format } from 'date-fns';
import { FileText, Edit2, Trash2, Copy, Star, StarOff } from 'lucide-react';
import type { Template } from '../../types/template';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ConfirmModal } from '../common/Modal';

interface TemplateListProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onDuplicate: (template: Template) => void;
  onSetDefault: (id: string) => void;
  onCreateNew: () => void;
}

interface TemplateCardProps {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSetDefault: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onSetDefault,
}) => {
  const blockCount = template.schemaJSON.layout.length;

  return (
    <Card hoverable className="group">
      <div className="flex gap-4">
        {/* Preview Thumbnail */}
        <div className="w-32 h-40 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 relative overflow-hidden border-2 border-gray-200 dark:border-gray-600">
          {template.thumbnail ? (
            <img
              src={template.thumbnail}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText size={48} className="text-gray-400" />
            </div>
          )}
          {template.isDefault && (
            <div className="absolute top-2 right-2">
              <Badge variant="success" size="sm">
                Default
              </Badge>
            </div>
          )}
        </div>

        {/* Template Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {blockCount} block{blockCount !== 1 ? 's' : ''}
              </p>
            </div>
            {!template.isDefault && (
              <button
                onClick={onSetDefault}
                className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                title="Set as default template"
              >
                <StarOff size={20} />
              </button>
            )}
            {template.isDefault && (
              <button
                className="p-2 text-yellow-500"
                title="Default template"
                disabled
              >
                <Star size={20} fill="currentColor" />
              </button>
            )}
          </div>

          {/* Template Details */}
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-4">
              <span>Created: {format(new Date(template.createdAt), 'MMM dd, yyyy')}</span>
              <span>Updated: {format(new Date(template.updatedAt), 'MMM dd, yyyy')}</span>
            </div>
            <div>
              <span className="font-medium">Styles:</span>
              <span className="ml-2">
                Primary Color:{' '}
                <span
                  className="inline-block w-4 h-4 rounded border border-gray-300 align-middle"
                  style={{ backgroundColor: template.schemaJSON.styles.primaryColor }}
                />
              </span>
              <span className="ml-3">Font: {template.schemaJSON.styles.fontFamily}</span>
            </div>
            <div>
              <span className="font-medium">Blocks:</span>
              <span className="ml-2">
                {template.schemaJSON.layout.map((block) => block.type).join(', ')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" onClick={onEdit}>
              <Edit2 size={16} className="mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="secondary" onClick={onDuplicate}>
              <Copy size={16} className="mr-1" />
              Duplicate
            </Button>
            {!template.isDefault && (
              <Button size="sm" variant="danger" onClick={onDelete}>
                <Trash2 size={16} className="mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onEdit,
  onDelete,
  onDuplicate,
  onSetDefault,
  onCreateNew,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const sortedTemplates = [...templates].sort((a, b) => {
    // Default template always first
    if (a.isDefault) return -1;
    if (b.isDefault) return 1;
    // Then sort by updated date
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FileText size={64} className="text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Templates Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          Create your first custom invoice template with our visual designer. Design the perfect
          layout for your business.
        </p>
        <Button variant="primary" onClick={onCreateNew}>
          <FileText size={20} className="mr-2" />
          Create Your First Template
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Invoice Templates
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your custom invoice templates
          </p>
        </div>
        <Button variant="primary" onClick={onCreateNew}>
          <FileText size={20} className="mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={() => onEdit(template)}
            onDelete={() => handleDeleteClick(template.id)}
            onDuplicate={() => onDuplicate(template)}
            onSetDefault={() => onSetDefault(template.id)}
          />
        ))}
      </div>

      <ConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
