export type BlockType = 'logo' | 'header' | 'customer' | 'items' | 'totals' | 'notes' | 'footer';

export interface LayoutBlock {
  id: string;
  type: BlockType;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  config: Record<string, any>;
}

export interface StyleConfig {
  primaryColor: string;
  fontFamily: string;
  fontSize: {
    header: number;
    body: number;
    small: number;
  };
  spacing: {
    padding: number;
    margin: number;
  };
}

export interface TemplateSchema {
  layout: LayoutBlock[];
  styles: StyleConfig;
}

export interface Template {
  id: string;
  name: string;
  isDefault: boolean;
  thumbnail?: string;
  schemaJSON: TemplateSchema;
  createdAt: string;
  updatedAt: string;
}
