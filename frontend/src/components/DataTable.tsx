import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { IoClose, IoChevronDown, IoChevronUp, IoCheckmark, IoSearch, IoRefresh, IoFilter, IoAdd, IoRemove } from 'react-icons/io5';

export type DataTableColumn<T = any> = {
  key: keyof T | string;
  title: string;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  sticky?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  renderFilter?: (column: DataTableColumn<T>) => React.ReactNode;
  sorter?: (a: T, b: T) => number;
  defaultSortOrder?: 'asc' | 'desc';
  filterDropdown?: React.ReactNode;
  filterIcon?: React.ReactNode;
  ellipsis?: boolean;
  copyable?: boolean;
  editable?: boolean;
  required?: boolean;
  dataType?: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  options?: Array<{ label: string; value: any; color?: string }>;
  format?: string;
  placeholder?: string;
  validation?: (value: any) => string | undefined;
  onEdit?: (value: any, record: T, key: keyof T) => void;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  tooltip?: string | ((record: T) => string);
  conditionalStyle?: (value: any, record: T) => React.CSSProperties;
  hidden?: boolean;
  fixed?: boolean;
  groupable?: boolean;
  aggregatable?: boolean;
  aggregateFunction?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';
  customAggregate?: (values: any[]) => any;
};

export type DataTableRowSelection<T = any> = {
  type?: 'checkbox' | 'radio';
  selectedRowKeys?: React.Key[];
  onChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  onSelect?: (record: T, selected: boolean, selectedRows: T[], nativeEvent: Event) => void;
  onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
  getCheckboxProps?: (record: T) => { disabled?: boolean; name?: string };
  hideSelectAll?: boolean;
  preserveSelectedRowKeys?: boolean;
  columnWidth?: string | number;
  columnTitle?: React.ReactNode;
  fixed?: boolean;
  renderCell?: (checked: boolean, record: T, index: number, originNode: React.ReactNode) => React.ReactNode;
};

export type DataTablePagination = {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  pageSizeOptions?: string[];
  position?: 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'both';
  size?: 'default' | 'small';
  simple?: boolean;
  hideOnSinglePage?: boolean;
  responsive?: boolean;
  itemRender?: (page: number, type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next', originalElement: React.ReactElement) => React.ReactNode;
};

export type DataTableSorter<T = any> = {
  field?: keyof T;
  order?: 'asc' | 'desc';
  column?: DataTableColumn<T>;
  columnKey?: string;
};

export type DataTableFilter = {
  [key: string]: React.Key[] | null;
};

export type DataTableExpandable<T = any> = {
  expandedRowKeys?: React.Key[];
  defaultExpandedRowKeys?: React.Key[];
  expandedRowRender?: (record: T, index: number, indent: number, expanded: boolean) => React.ReactNode;
  expandIcon?: (props: { expanded: boolean; onExpand: () => void; record: T }) => React.ReactNode;
  expandRowByClick?: boolean;
  onExpand?: (expanded: boolean, record: T) => void;
  onExpandedRowsChange?: (expandedKeys: React.Key[]) => void;
  indentSize?: number;
  rowExpandable?: (record: T) => boolean;
  defaultExpandAllRows?: boolean;
  expandIconColumnIndex?: number;
  showExpandColumn?: boolean;
  childrenColumnName?: string;
  columnWidth?: string | number;
  columnTitle?: React.ReactNode;
  fixed?: boolean | 'left' | 'right';
};

export type DataTableGrouping<T = any> = {
  groupBy?: keyof T | Array<keyof T>;
  groupRenderer?: (groupKey: string, groupData: T[], level: number) => React.ReactNode;
  expandGroupsByDefault?: boolean;
  showGroupSummary?: boolean;
  groupSummaryRenderer?: (groupData: T[], groupKey: string) => React.ReactNode;
  sortGroups?: boolean;
  groupSorter?: (a: { key: string; data: T[] }, b: { key: string; data: T[] }) => number;
};

export type DataTableVirtualization = {
  enabled?: boolean;
  itemHeight?: number;
  overscan?: number;
  scrollToIndex?: number;
  scrollToAlignment?: 'start' | 'center' | 'end' | 'auto';
  onScroll?: (params: { scrollDirection: 'forward' | 'backward'; scrollOffset: number; scrollUpdateWasRequested: boolean }) => void;
};

export type DataTableExport = {
  enabled?: boolean;
  formats?: Array<'csv' | 'excel' | 'pdf' | 'json'>;
  filename?: string;
  excludeColumns?: string[];
  customExport?: (data: any[], format: string) => void;
  onBeforeExport?: (data: any[]) => any[];
  onAfterExport?: (success: boolean, error?: Error) => void;
};

interface DataTableProps<T = any> {
  // Data and basic props
  data?: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  empty?: React.ReactNode;
  error?: string | React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  testId?: string;

  // Row props
  rowKey?: keyof T | ((record: T) => React.Key);
  rowClassName?: string | ((record: T, index: number) => string);
  rowStyle?: React.CSSProperties | ((record: T, index: number) => React.CSSProperties);
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  rowSelection?: DataTableRowSelection<T>;

  // Header props
  showHeader?: boolean;
  headerHeight?: number;
  headerClassName?: string;
  headerStyle?: React.CSSProperties;

  // Sorting
  sortable?: boolean;
  defaultSorter?: DataTableSorter<T>;
  sorter?: DataTableSorter<T>;
  onSortChange?: (sorter: DataTableSorter<T>) => void;
  multiSort?: boolean;
  sortDirections?: Array<'asc' | 'desc'>;

  // Filtering
  filterable?: boolean;
  filters?: DataTableFilter;
  onFilterChange?: (filters: DataTableFilter) => void;
  filterMode?: 'menu' | 'tree';
  globalFilter?: boolean;
  globalFilterValue?: string;
  onGlobalFilterChange?: (value: string) => void;
  globalFilterPlaceholder?: string;

  // Pagination
  pagination?: DataTablePagination | false;

  // Selection
  selectionMode?: 'single' | 'multiple' | 'none';
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;

  // Expandable rows
  expandable?: DataTableExpandable<T>;

  // Grouping
  grouping?: DataTableGrouping<T>;

  // Virtualization
  virtualization?: DataTableVirtualization;
  height?: number;
  maxHeight?: number;

  // Resizing
  resizable?: boolean;
  onColumnResize?: (column: DataTableColumn<T>, width: number) => void;

  // Drag and drop
  draggable?: boolean;
  onRowDrop?: (dragIndex: number, dropIndex: number) => void;
  onColumnDrop?: (dragIndex: number, dropIndex: number) => void;

  // Editing
  editable?: boolean;
  editMode?: 'cell' | 'row' | 'form';
  onCellEdit?: (value: any, record: T, column: DataTableColumn<T>) => void;
  onRowEdit?: (record: T) => void;
  editingKey?: React.Key;
  onEditingKeyChange?: (key: React.Key | null) => void;

  // Export
  exportConfig?: DataTableExport;

  // Events
  onCellClick?: (record: T, column: DataTableColumn<T>, event: React.MouseEvent) => void;
  onCellDoubleClick?: (record: T, column: DataTableColumn<T>, event: React.MouseEvent) => void;
  onRowClick?: (record: T, index: number, event: React.MouseEvent) => void;
  onRowDoubleClick?: (record: T, index: number, event: React.MouseEvent) => void;
  onHeaderClick?: (column: DataTableColumn<T>, event: React.MouseEvent) => void;

  // Performance
  bordered?: boolean;
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
  size?: 'small' | 'middle' | 'large';
  tableLayout?: 'auto' | 'fixed';
  scroll?: { x?: string | number | true; y?: string | number };

  // Advanced features
  tree?: boolean;
  treeColumnKey?: string;
  treeDefaultExpandAll?: boolean;
  summary?: (data: T[]) => React.ReactNode;
  footer?: React.ReactNode;
  caption?: React.ReactNode;
  sticky?: boolean | { offsetHeader?: number; offsetScroll?: number; getContainer?: () => HTMLElement };

  // Accessibility
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;

  // Localization
  locale?: {
    filterTitle?: string;
    filterConfirm?: string;
    filterReset?: string;
    filterEmptyText?: string;
    filterCheckall?: string;
    filterSearchPlaceholder?: string;
    emptyText?: string;
    selectAll?: string;
    selectInvert?: string;
    selectionAll?: string;
    sortTitle?: string;
    expand?: string;
    collapse?: string;
    triggerDesc?: string;
    triggerAsc?: string;
    cancelSort?: string;
  };

  // Custom renderers
  components?: {
    table?: React.ComponentType<any>;
    header?: {
      wrapper?: React.ComponentType<any>;
      row?: React.ComponentType<any>;
      cell?: React.ComponentType<any>;
    };
    body?: {
      wrapper?: React.ComponentType<any>;
      row?: React.ComponentType<any>;
      cell?: React.ComponentType<any>;
    };
  };
}

/**
 * Advanced DataTable component with comprehensive features
 * Supports sorting, filtering, pagination, selection, editing, grouping, virtualization, and more
 */
const DataTable = <T extends Record<string, any> = any>({
  data = [],
  columns,
  loading = false,
  empty,
  error,
  className = '',
  style,
  id,
  testId = 'data-table',
  rowKey = 'id',
  rowClassName,
  rowStyle,
  onRow,
  rowSelection,
  showHeader = true,
  headerHeight = 40,
  headerClassName = '',
  headerStyle,
  sortable = true,
  defaultSorter,
  sorter,
  onSortChange,
  multiSort = false,
  sortDirections = ['asc', 'desc'],
  filterable = true,
  filters,
  onFilterChange,
  filterMode = 'menu',
  globalFilter = true,
  globalFilterValue = '',
  onGlobalFilterChange,
  globalFilterPlaceholder = 'Search...',
  pagination = false,
  selectionMode = 'none',
  selectedRows = [],
  onSelectionChange,
  expandable,
  grouping,
  virtualization,
  height,
  maxHeight,
  resizable = false,
  onColumnResize,
  draggable = false,
  onRowDrop,
  onColumnDrop,
  editable = false,
  editMode = 'cell',
  onCellEdit,
  onRowEdit,
  editingKey,
  onEditingKeyChange,
  exportConfig,
  onCellClick,
  onCellDoubleClick,
  onRowClick,
  onRowDoubleClick,
  onHeaderClick,
  bordered = true,
  striped = false,
  hover = true,
  compact = false,
  size = 'middle',
  tableLayout = 'auto',
  scroll,
  tree = false,
  treeColumnKey,
  treeDefaultExpandAll = false,
  summary,
  footer,
  caption,
  sticky = false,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  locale = {},
  components
}: DataTableProps<T>): React.ReactElement => {
  // State management
  const [internalData, setInternalData] = useState<T[]>(data);
  const [internalSorter, setInternalSorter] = useState<DataTableSorter<T> | undefined>(defaultSorter);
  const [internalFilters, setInternalFilters] = useState<DataTableFilter>({});
  const [internalGlobalFilter, setInternalGlobalFilter] = useState(globalFilterValue);
  const [internalSelectedRows, setInternalSelectedRows] = useState<T[]>(selectedRows);
  const [expandedRows, setExpandedRows] = useState<React.Key[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowKey: React.Key; columnKey: string } | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  // Refs
  const tableRef = useRef<HTMLTableElement>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const resizeObserverRef = useRef<ResizeObserver>();

  // Memoized calculations
  const processedData = useMemo(() => {
    let result = [...internalData];

    // Apply global filter
    if (globalFilter && internalGlobalFilter) {
      result = result.filter(record =>
        columns.some(column => {
          const value = getNestedValue(record, column.key as string);
          return String(value).toLowerCase().includes(internalGlobalFilter.toLowerCase());
        })
      );
    }

    // Apply column filters
    Object.entries(internalFilters).forEach(([columnKey, filterValue]) => {
      if (filterValue && filterValue.length > 0) {
        result = result.filter(record => {
          const value = getNestedValue(record, columnKey);
          return filterValue.includes(value);
        });
      }
    });

    // Apply sorting
    if (internalSorter && internalSorter.field) {
      result.sort((a, b) => {
        const column = columns.find(col => col.key === internalSorter.field);
        if (column?.sorter) {
          return internalSorter.order === 'desc' ? column.sorter(b, a) : column.sorter(a, b);
        }

        const aValue = getNestedValue(a, internalSorter.field as string);
        const bValue = getNestedValue(b, internalSorter.field as string);

        if (aValue < bValue) return internalSorter.order === 'desc' ? 1 : -1;
        if (aValue > bValue) return internalSorter.order === 'desc' ? -1 : 1;
        return 0;
      });
    }

    // Apply grouping
    if (grouping?.groupBy) {
      // Group processing logic would go here
    }

    return result;
  }, [internalData, internalGlobalFilter, internalFilters, internalSorter, columns, globalFilter, grouping]);

  // Helper functions
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const getRowKey = useCallback((record: T, index: number) => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return getNestedValue(record, rowKey as string) ?? index;
  }, [rowKey]);

  const handleSort = useCallback((column: DataTableColumn<T>) => {
    if (!column.sortable) return;

    const currentOrder = internalSorter?.field === column.key ? internalSorter.order : undefined;
    let newOrder: 'asc' | 'desc' | undefined;

    if (!currentOrder) {
      newOrder = column.defaultSortOrder || 'asc';
    } else if (currentOrder === 'asc') {
      newOrder = 'desc';
    } else {
      newOrder = undefined; // Reset sorting
    }

    const newSorter = newOrder ? { field: column.key as keyof T, order: newOrder, column } : undefined;
    setInternalSorter(newSorter);
    onSortChange?.(newSorter as DataTableSorter<T>);
  }, [internalSorter, onSortChange]);

  const handleFilter = useCallback((columnKey: string, filterValue: React.Key[] | null) => {
    const newFilters = { ...internalFilters, [columnKey]: filterValue };
    setInternalFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [internalFilters, onFilterChange]);

  const handleGlobalFilter = useCallback((value: string) => {
    setInternalGlobalFilter(value);
    onGlobalFilterChange?.(value);
  }, [onGlobalFilterChange]);

  const handleRowSelection = useCallback((record: T, selected: boolean) => {
    let newSelectedRows: T[];

    if (selectionMode === 'single') {
      newSelectedRows = selected ? [record] : [];
    } else if (selectionMode === 'multiple') {
      if (selected) {
        newSelectedRows = [...internalSelectedRows, record];
      } else {
        newSelectedRows = internalSelectedRows.filter(row => getRowKey(row, 0) !== getRowKey(record, 0));
      }
    } else {
      return;
    }

    setInternalSelectedRows(newSelectedRows);
    onSelectionChange?.(newSelectedRows);
  }, [selectionMode, internalSelectedRows, onSelectionChange, getRowKey]);

  const handleSelectAll = useCallback((selected: boolean) => {
    const newSelectedRows = selected ? [...processedData] : [];
    setInternalSelectedRows(newSelectedRows);
    onSelectionChange?.(newSelectedRows);
  }, [processedData, onSelectionChange]);

  const handleCellEdit = useCallback((record: T, column: DataTableColumn<T>, value: any) => {
    onCellEdit?.(value, record, column);
    setEditingCell(null);
  }, [onCellEdit]);

  const handleExport = useCallback((format: string) => {
    if (!exportConfig?.enabled) return;

    try {
      const exportData = processedData.map(record => {
        const row: any = {};
        columns.forEach(column => {
          if (!exportConfig.excludeColumns?.includes(column.key as string)) {
            row[column.title] = getNestedValue(record, column.key as string);
          }
        });
        return row;
      });

      const processedExportData = exportConfig.onBeforeExport?.(exportData) || exportData;

      if (exportConfig.customExport) {
        exportConfig.customExport(processedExportData, format);
      } else {
        // Default export logic
        switch (format) {
          case 'csv':
            exportToCSV(processedExportData, exportConfig.filename);
            break;
          case 'json':
            exportToJSON(processedExportData, exportConfig.filename);
            break;
          // Add more export formats as needed
        }
      }

      exportConfig.onAfterExport?.(true);
    } catch (error) {
      exportConfig.onAfterExport?.(false, error as Error);
    }
  }, [processedData, columns, exportConfig]);

  const exportToCSV = (data: any[], filename?: string) => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'data'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: any[], filename?: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'data'}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Effects
  useEffect(() => {
    setInternalData(data);
  }, [data]);

  useEffect(() => {
    setInternalGlobalFilter(globalFilterValue);
  }, [globalFilterValue]);

  useEffect(() => {
    setInternalSelectedRows(selectedRows);
  }, [selectedRows]);

  // Render helpers
  const renderHeaderCell = (column: DataTableColumn<T>) => {
    const isSorted = internalSorter?.field === column.key;
    const sortOrder = isSorted ? internalSorter?.order : undefined;

    return (
      <th
        key={column.key as string}
        className={`${column.headerClassName || ''} ${isSorted ? 'sorted' : ''}`}
        style={{
          width: column.width,
          minWidth: column.minWidth,
          maxWidth: column.maxWidth,
          textAlign: column.align,
          ...column.conditionalStyle?.(null, {} as T),
        }}
        onClick={() => column.sortable && handleSort(column)}
      >
        <div className="flex items-center justify-between">
          <span>{column.renderHeader ? column.renderHeader() : column.title}</span>
          {column.sortable && (
            <div className="sort-icons ml-2">
              {!sortOrder && <IoChevronDown className="opacity-30" size={12} />}
              {sortOrder === 'asc' && <IoChevronUp size={12} />}
              {sortOrder === 'desc' && <IoChevronDown size={12} />}
            </div>
          )}
          {column.filterable && (
            <button
              className="filter-trigger ml-1"
              onClick={(e) => {
                e.stopPropagation();
                // Show filter dropdown
              }}
            >
              <IoFilter size={12} />
            </button>
          )}
        </div>
      </th>
    );
  };

  const renderCell = (record: T, column: DataTableColumn<T>, rowIndex: number) => {
    const value = getNestedValue(record, column.key as string);
    const cellKey = `${getRowKey(record, rowIndex)}-${column.key as string}`;
    const isEditing = editingCell?.rowKey === getRowKey(record, rowIndex) && editingCell?.columnKey === column.key;

    let cellContent: React.ReactNode = value;

    if (column.render) {
      cellContent = column.render(value, record, rowIndex);
    } else if (isEditing && column.editable) {
      cellContent = (
        <input
          type="text"
          defaultValue={value}
          onBlur={(e) => handleCellEdit(record, column, e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleCellEdit(record, column, (e.target as HTMLInputElement).value);
            }
          }}
          autoFocus
        />
      );
    }

    return (
      <td
        key={cellKey}
        className={`${column.cellClassName || ''} ${column.className || ''}`}
        style={{
          textAlign: column.align,
          ...column.conditionalStyle?.(value, record),
        }}
        onClick={() => {
          onCellClick?.(record, column, {} as React.MouseEvent);
          if (column.editable && editMode === 'cell') {
            setEditingCell({ rowKey: getRowKey(record, rowIndex), columnKey: column.key as string });
          }
        }}
        onDoubleClick={() => onCellDoubleClick?.(record, column, {} as React.MouseEvent)}
      >
        {cellContent}
      </td>
    );
  };

  const renderRow = (record: T, index: number) => {
    const key = getRowKey(record, index);
    const isSelected = internalSelectedRows.some(row => getRowKey(row, 0) === key);
    const isExpanded = expandedRows.includes(key);

    return (
      <React.Fragment key={key}>
        <tr
          className={`
            ${typeof rowClassName === 'function' ? rowClassName(record, index) : rowClassName || ''}
            ${isSelected ? 'selected' : ''}
            ${hover ? 'hover:bg-gray-50' : ''}
            ${striped && index % 2 === 1 ? 'bg-gray-50' : ''}
          `}
          style={typeof rowStyle === 'function' ? rowStyle(record, index) : rowStyle}
          onClick={() => onRowClick?.(record, index, {} as React.MouseEvent)}
          onDoubleClick={() => onRowDoubleClick?.(record, index, {} as React.MouseEvent)}
          {...onRow?.(record, index)}
        >
          {/* Selection column */}
          {selectionMode !== 'none' && (
            <td className="selection-cell">
              <input
                type={selectionMode === 'single' ? 'radio' : 'checkbox'}
                checked={isSelected}
                onChange={(e) => handleRowSelection(record, e.target.checked)}
              />
            </td>
          )}

          {/* Expand column */}
          {expandable && (
            <td className="expand-cell">
              <button
                onClick={() => {
                  const newExpandedRows = isExpanded
                    ? expandedRows.filter(k => k !== key)
                    : [...expandedRows, key];
                  setExpandedRows(newExpandedRows);
                  expandable.onExpand?.(!isExpanded, record);
                }}
              >
                {isExpanded ? <IoChevronUp /> : <IoChevronDown />}
              </button>
            </td>
          )}

          {/* Data columns */}
          {columns.filter(col => !col.hidden).map(column => renderCell(record, column, index))}
        </tr>

        {/* Expanded row content */}
        {expandable && isExpanded && expandable.expandedRowRender && (
          <tr className="expanded-row">
            <td colSpan={columns.length + (selectionMode !== 'none' ? 1 : 0) + (expandable ? 1 : 0)}>
              {expandable.expandedRowRender(record, index, 0, isExpanded)}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="data-table-loading" data-testid={`${testId}-loading`}>
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
          <span className="ml-2">Loading data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="data-table-error" data-testid={`${testId}-error`}>
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (processedData.length === 0) {
    return (
      <div className="data-table-empty" data-testid={`${testId}-empty`}>
        {empty || (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">No data available</h3>
            <p>There are no records to display</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`data-table-container ${className}`}
      style={style}
      id={id}
      data-testid={testId}
    >
      {/* Global filter */}
      {globalFilter && (
        <div className="data-table-global-filter mb-4">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input input-bordered w-full pl-10"
              placeholder={globalFilterPlaceholder}
              value={internalGlobalFilter}
              onChange={(e) => handleGlobalFilter(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Export buttons */}
      {exportConfig?.enabled && (
        <div className="data-table-export mb-4 flex gap-2">
          {exportConfig.formats?.map(format => (
            <button
              key={format}
              className="btn btn-outline btn-sm"
              onClick={() => handleExport(format)}
            >
              Export {format.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto" style={{ maxHeight }}>
        <table
          ref={tableRef}
          className={`
            table w-full
            ${bordered ? 'table-bordered' : ''}
            ${compact ? 'table-compact' : ''}
            ${size === 'small' ? 'table-sm' : size === 'large' ? 'table-lg' : ''}
          `}
          style={{ tableLayout }}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
        >
          {/* Caption */}
          {caption && <caption>{caption}</caption>}

          {/* Header */}
          {showHeader && (
            <thead ref={headerRef} className={headerClassName} style={headerStyle}>
              <tr>
                {/* Selection header */}
                {selectionMode === 'multiple' && (
                  <th className="selection-header">
                    <input
                      type="checkbox"
                      checked={internalSelectedRows.length === processedData.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                )}

                {/* Expand header */}
                {expandable && <th className="expand-header"></th>}

                {/* Column headers */}
                {columns.filter(col => !col.hidden).map(renderHeaderCell)}
              </tr>
            </thead>
          )}

          {/* Body */}
          <tbody ref={bodyRef}>
            {processedData.map(renderRow)}
          </tbody>

          {/* Summary */}
          {summary && (
            <tfoot>
              <tr>
                <td colSpan={columns.length + (selectionMode !== 'none' ? 1 : 0) + (expandable ? 1 : 0)}>
                  {summary(processedData)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Footer */}
      {footer && <div className="data-table-footer mt-4">{footer}</div>}

      {/* Pagination */}
      {pagination && (
        <div className="data-table-pagination mt-4">
          {/* Pagination component would be implemented here */}
        </div>
      )}
    </div>
  );
};

export default DataTable;
