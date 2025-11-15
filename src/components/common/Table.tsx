import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps {
  children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return (
    <thead className="bg-gray-50 dark:bg-gray-900">
      <tr>{children}</tr>
    </thead>
  );
};

interface TableHeaderCellProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  align = 'left',
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <th
      className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${alignClasses[align]}`}
    >
      {children}
    </th>
  );
};

interface TableBodyProps {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return (
    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </tbody>
  );
};

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  onClick,
  hoverable = false,
}) => {
  return (
    <tr
      onClick={onClick}
      className={`${
        hoverable || onClick
          ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
          : ''
      }`}
    >
      {children}
    </tr>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  align = 'left',
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${alignClasses[align]}`}
    >
      {children}
    </td>
  );
};
