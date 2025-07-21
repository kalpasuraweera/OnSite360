import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { IoAdd, IoRemove, IoClose, IoCopy, IoEye, IoSave, IoRefresh, IoSettings, IoDownload, IoShare, IoPlay, IoPause, IoStop, IoSkipBackward, IoSkipForward, IoShuffle, IoRepeat, IoVolumeMedium, IoVolumeHigh, IoVolumeLow, IoVolumeOff, IoColorPalette, IoGrid, IoList, IoBarChart, IoLineChart, IoPieChart, IoStatsChart, IoTrendingUp, IoTrendingDown, IoAnalytics, IoFilter, IoSearch, IoCalendar, IoTime, IoLayers, IoResize, IoBrush, IoText, IoMove, IoRotate } from 'react-icons/io5';

export type ChartType = 
  | 'line' | 'area' | 'bar' | 'column' | 'pie' | 'doughnut' | 'scatter' | 'bubble'
  | 'candlestick' | 'ohlc' | 'heatmap' | 'treemap' | 'sunburst' | 'radar'
  | 'polar' | 'gauge' | 'funnel' | 'waterfall' | 'box' | 'violin'
  | 'histogram' | 'density' | 'sankey' | 'chord' | 'network' | 'force'
  | 'timeline' | 'gantt' | 'calendar' | 'map' | 'choropleth' | '3d';

export type DataType = 'number' | 'string' | 'date' | 'boolean' | 'category' | 'time' | 'geo';

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median' | 'mode' | 'stddev' | 'variance';

export type AnimationType = 
  | 'none' | 'fade' | 'slide' | 'bounce' | 'elastic' | 'spring' | 'scale'
  | 'rotate' | 'flip' | 'zoom' | 'wave' | 'pulse' | 'glow' | 'shimmer';

export type ColorScheme = 
  | 'default' | 'pastel' | 'vibrant' | 'monochrome' | 'analogous' | 'complementary'
  | 'triadic' | 'tetradic' | 'split-complementary' | 'warm' | 'cool' | 'earth'
  | 'ocean' | 'sunset' | 'forest' | 'purple' | 'rainbow' | 'custom';

export type DataSource = {
  type: 'static' | 'api' | 'csv' | 'json' | 'database' | 'websocket' | 'realtime';
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  body?: unknown;
  transform?: (data: unknown) => ChartDataPoint[];
  refreshInterval?: number;
  cache?: boolean;
  authentication?: {
    type: 'bearer' | 'basic' | 'api-key' | 'oauth';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
  pagination?: {
    enabled: boolean;
    pageSize: number;
    pageParam: string;
    totalParam: string;
  };
  errorHandling?: {
    retries: number;
    retryDelay: number;
    fallbackData?: ChartDataPoint[];
    onError?: (error: Error) => void;
  };
};

export type ChartDataPoint = {
  x: string | number | Date;
  y: number | number[];
  z?: number; // for bubble charts
  category?: string;
  label?: string;
  color?: string;
  size?: number;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
  coordinates?: [number, number]; // for geo charts
  children?: ChartDataPoint[]; // for hierarchical charts
};

export type ChartSeries = {
  id: string;
  name: string;
  type?: ChartType;
  data: ChartDataPoint[];
  color?: string;
  visible?: boolean;
  yAxis?: number; // for multiple y-axes
  stack?: string; // for stacked charts
  smooth?: boolean;
  step?: boolean;
  fill?: boolean;
  opacity?: number;
  lineWidth?: number;
  pointSize?: number;
  pattern?: 'solid' | 'dashed' | 'dotted' | 'dash-dot';
  gradient?: {
    type: 'linear' | 'radial';
    stops: Array<{ offset: number; color: string }>;
    direction?: 'horizontal' | 'vertical' | 'diagonal';
  };
  animation?: {
    type: AnimationType;
    duration: number;
    delay: number;
    easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  };
  marker?: {
    enabled: boolean;
    shape: 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'custom';
    size: number;
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  label?: {
    enabled: boolean;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';
    format?: string;
    color?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    rotation?: number;
  };
  dataLabels?: {
    enabled: boolean;
    format?: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'inside' | 'outside';
    color?: string;
    fontSize?: number;
    background?: string;
    border?: string;
  };
  tooltip?: {
    enabled: boolean;
    format?: string;
    headerFormat?: string;
    pointFormat?: string;
    footerFormat?: string;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    shadow?: boolean;
    animation?: boolean;
  };
  events?: {
    onHover?: (point: ChartDataPoint, series: ChartSeries) => void;
    onClick?: (point: ChartDataPoint, series: ChartSeries) => void;
    onDoubleClick?: (point: ChartDataPoint, series: ChartSeries) => void;
    onSelect?: (points: ChartDataPoint[], series: ChartSeries) => void;
  };
};

export type ChartAxis = {
  id: string;
  type: 'linear' | 'logarithmic' | 'datetime' | 'category' | 'ordinal';
  position: 'left' | 'right' | 'top' | 'bottom';
  title?: {
    text: string;
    color?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    rotation?: number;
    offset?: number;
  };
  min?: number | Date | string;
  max?: number | Date | string;
  step?: number;
  tickInterval?: number;
  labels?: {
    enabled: boolean;
    format?: string;
    color?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    rotation?: number;
    offset?: number;
    step?: number;
    formatter?: (value: unknown) => string;
  };
  gridLines?: {
    enabled: boolean;
    color?: string;
    width?: number;
    style?: 'solid' | 'dashed' | 'dotted';
    opacity?: number;
  };
  tickMarks?: {
    enabled: boolean;
    color?: string;
    width?: number;
    length?: number;
    position: 'inside' | 'outside' | 'cross';
  };
  crosshair?: {
    enabled: boolean;
    color?: string;
    width?: number;
    style?: 'solid' | 'dashed' | 'dotted';
    snap?: boolean;
  };
  plotBands?: Array<{
    from: number | Date | string;
    to: number | Date | string;
    color?: string;
    opacity?: number;
    label?: string;
  }>;
  plotLines?: Array<{
    value: number | Date | string;
    color?: string;
    width?: number;
    style?: 'solid' | 'dashed' | 'dotted';
    label?: string;
  }>;
  breaks?: Array<{
    from: number | Date | string;
    to: number | Date | string;
    breakSize?: number;
  }>;
  reversed?: boolean;
  opposite?: boolean;
  offset?: number;
  startOnTick?: boolean;
  endOnTick?: boolean;
  showFirstLabel?: boolean;
  showLastLabel?: boolean;
  minorTicks?: {
    enabled: boolean;
    interval?: number;
    color?: string;
    width?: number;
    length?: number;
  };
  zones?: Array<{
    value: number;
    color?: string;
    fillColor?: string;
    dashStyle?: 'solid' | 'dashed' | 'dotted';
  }>;
};

export type ChartLegend = {
  enabled: boolean;
  position: 'top' | 'bottom' | 'left' | 'right' | 'floating';
  align: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  layout: 'horizontal' | 'vertical';
  floating?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadow?: boolean;
  itemStyle?: {
    color?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    textDecoration?: 'none' | 'underline' | 'line-through';
  };
  itemHoverStyle?: {
    color?: string;
  };
  itemDistance?: number;
  symbolWidth?: number;
  symbolHeight?: number;
  symbolPadding?: number;
  symbolRadius?: number;
  useHTML?: boolean;
  labelFormatter?: (series: ChartSeries) => string;
  navigation?: {
    enabled: boolean;
    style?: Record<string, string>;
    activeColor?: string;
    inactiveColor?: string;
  };
  pagination?: {
    enabled: boolean;
    maxPages?: number;
  };
  title?: {
    text: string;
    style?: Record<string, string>;
  };
  bubbleLegend?: {
    enabled: boolean;
    ranges?: Array<{
      value: number;
      color?: string;
    }>;
  };
};

export type ChartTooltip = {
  enabled: boolean;
  shared?: boolean;
  split?: boolean;
  crosshairs?: boolean | Array<{
    width?: number;
    color?: string;
    style?: 'solid' | 'dashed' | 'dotted';
  }>;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadow?: boolean;
  style?: Record<string, string>;
  useHTML?: boolean;
  headerFormat?: string;
  pointFormat?: string;
  footerFormat?: string;
  formatter?: (tooltip: unknown) => string;
  positioner?: (labelWidth: number, labelHeight: number, point: ChartDataPoint) => { x: number; y: number };
  outside?: boolean;
  followPointer?: boolean;
  followTouchMove?: boolean;
  hideDelay?: number;
  padding?: number;
  snap?: number;
  stickOnContact?: boolean;
  valueDecimals?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  xDateFormat?: string;
  changeDecimals?: number;
  dateTimeLabelFormats?: Record<string, string>;
  distance?: number;
  animation?: {
    duration: number;
    easing?: string;
  };
};

export type ChartExport = {
  enabled: boolean;
  formats: Array<'png' | 'jpg' | 'pdf' | 'svg' | 'csv' | 'json' | 'excel'>;
  filename?: string;
  scale?: number;
  width?: number;
  height?: number;
  sourceWidth?: number;
  sourceHeight?: number;
  allowHTML?: boolean;
  backgroundColor?: string;
  fallbackToExportServer?: boolean;
  printMaxWidth?: number;
  libURL?: string;
  buttons?: {
    contextButton?: {
      enabled: boolean;
      text?: string;
      symbol?: string;
      symbolStroke?: string;
      symbolFill?: string;
      theme?: Record<string, unknown>;
      titleKey?: string;
      menuItems?: string[];
    };
  };
  menuItemDefinitions?: Record<string, {
    textKey?: string;
    text?: string;
    onclick?: () => void;
    separator?: boolean;
  }>;
};

export type ChartInteraction = {
  zoom?: {
    type: 'x' | 'y' | 'xy' | 'pinch';
    enabled: boolean;
    resetButton?: {
      enabled: boolean;
      position: 'top' | 'bottom' | 'left' | 'right';
      theme?: Record<string, unknown>;
    };
    key?: 'alt' | 'ctrl' | 'meta' | 'shift';
    mouseWheel?: {
      enabled: boolean;
      sensitivity: number;
    };
  };
  pan?: {
    enabled: boolean;
    key?: 'alt' | 'ctrl' | 'meta' | 'shift';
  };
  selection?: {
    enabled: boolean;
    mode: 'x' | 'y' | 'xy';
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    onSelect?: (event: unknown) => void;
  };
  brush?: {
    enabled: boolean;
    xAxis?: Array<{
      min: number | Date;
      max: number | Date;
    }>;
    yAxis?: Array<{
      min: number;
      max: number;
    }>;
  };
  crossfilter?: {
    enabled: boolean;
    dimensions: string[];
    onFilter?: (filters: Record<string, unknown>) => void;
  };
  drill?: {
    enabled: boolean;
    series?: ChartSeries[];
    drillUpButton?: {
      enabled: boolean;
      position: 'top' | 'bottom' | 'left' | 'right';
      theme?: Record<string, unknown>;
    };
    onDrillDown?: (point: ChartDataPoint) => ChartSeries[];
    onDrillUp?: () => void;
  };
};

export type ChartAnnotation = {
  id: string;
  type: 'text' | 'line' | 'rectangle' | 'circle' | 'arrow' | 'callout' | 'image';
  x?: number | string | Date;
  y?: number;
  x2?: number | string | Date;
  y2?: number;
  text?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  rotation?: number;
  opacity?: number;
  shadow?: boolean;
  draggable?: boolean;
  linked?: boolean;
  crop?: boolean;
  overflow?: 'allow' | 'justify';
  useHTML?: boolean;
  zIndex?: number;
  events?: {
    onAdd?: (annotation: ChartAnnotation) => void;
    onEdit?: (annotation: ChartAnnotation) => void;
    onRemove?: (annotation: ChartAnnotation) => void;
    onDrag?: (annotation: ChartAnnotation) => void;
  };
  shapeOptions?: {
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    r?: number; // for circles
    ry?: number; // for ellipses
  };
  labelOptions?: {
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: number;
    borderWidth?: number;
    padding?: number;
    shadow?: boolean;
    style?: Record<string, string>;
    useHTML?: boolean;
    x?: number;
    y?: number;
  };
  markerEnd?: string;
  markerStart?: string;
};

export type ChartTheme = {
  name: string;
  colors: string[];
  chart?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    plotBackgroundColor?: string;
    plotBorderColor?: string;
    plotBorderWidth?: number;
    plotShadow?: boolean;
    className?: string;
    style?: Record<string, string>;
  };
  title?: {
    color?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    fontFamily?: string;
  };
  subtitle?: {
    color?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    fontFamily?: string;
  };
  xAxis?: Partial<ChartAxis>;
  yAxis?: Partial<ChartAxis>;
  legend?: Partial<ChartLegend>;
  tooltip?: Partial<ChartTooltip>;
  plotOptions?: {
    series?: Record<string, unknown>;
    line?: Record<string, unknown>;
    area?: Record<string, unknown>;
    bar?: Record<string, unknown>;
    column?: Record<string, unknown>;
    pie?: Record<string, unknown>;
  };
  credits?: {
    enabled: boolean;
    text?: string;
    href?: string;
    style?: Record<string, string>;
    position?: {
      align: 'left' | 'center' | 'right';
      verticalAlign: 'top' | 'middle' | 'bottom';
      x?: number;
      y?: number;
    };
  };
  responsive?: {
    rules: Array<{
      condition: {
        maxWidth?: number;
        minWidth?: number;
        maxHeight?: number;
        minHeight?: number;
        callback?: () => boolean;
      };
      chartOptions: Record<string, unknown>;
    }>;
  };
};

export type ChartBuilder = {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  type: ChartType;
  
  // Data
  series: ChartSeries[];
  dataSource?: DataSource;
  
  // Axes
  xAxis: ChartAxis[];
  yAxis: ChartAxis[];
  
  // Visual elements
  legend: ChartLegend;
  tooltip: ChartTooltip;
  colorScheme: ColorScheme;
  customColors?: string[];
  
  // Layout and styling
  width?: number | string;
  height?: number | string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  // Theme and appearance
  theme?: ChartTheme;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadow?: boolean;
  
  // Features
  animation?: {
    enabled: boolean;
    duration: number;
    easing: string;
    delay?: number;
  };
  interaction: ChartInteraction;
  annotations: ChartAnnotation[];
  export: ChartExport;
  
  // Real-time features
  realtime?: {
    enabled: boolean;
    interval: number;
    maxPoints?: number;
    onUpdate?: (data: ChartDataPoint[]) => void;
  };
  
  // Responsive design
  responsive?: {
    enabled: boolean;
    breakpoints: Record<string, Partial<ChartBuilder>>;
  };
  
  // Events
  events?: {
    onLoad?: (chart: ChartBuilder) => void;
    onResize?: (chart: ChartBuilder, width: number, height: number) => void;
    onRender?: (chart: ChartBuilder) => void;
    onDataUpdate?: (chart: ChartBuilder, newData: ChartDataPoint[]) => void;
    onSeriesChange?: (chart: ChartBuilder, series: ChartSeries[]) => void;
    onAxisChange?: (chart: ChartBuilder, axis: ChartAxis) => void;
  };
  
  // Advanced features
  plugins?: Array<{
    name: string;
    enabled: boolean;
    config?: Record<string, unknown>;
  }>;
  
  // Performance
  performance?: {
    enableWebGL?: boolean;
    turboThreshold?: number;
    cropThreshold?: number;
    groupPixelWidth?: number;
    pointInterval?: number;
    pointStart?: number;
  };
  
  // Accessibility
  accessibility?: {
    enabled: boolean;
    description?: string;
    keyboardNavigation?: {
      enabled: boolean;
      focusBorder?: {
        enabled: boolean;
        hideBrowserFocusOutline?: boolean;
        style?: Record<string, string>;
        margin?: number;
      };
      order?: string[];
      wrapAround?: boolean;
    };
    point?: {
      valueDecimals?: number;
      valueDescriptionFormat?: string;
      valueSuffix?: string;
      valuePrefix?: string;
    };
    series?: {
      descriptionFormat?: string;
      pointDescriptionEnabledThreshold?: number;
    };
    screenReaderSection?: {
      beforeChartFormat?: string;
      afterChartFormat?: string;
      beforeRegionLabel?: string;
      afterRegionLabel?: string;
      beforeTableFormat?: string;
      tableFormat?: string;
      afterTableFormat?: string;
    };
    announceNewData?: {
      enabled: boolean;
      minAnnounceInterval?: number;
      announcementFormatter?: (allSeries: ChartSeries[], newSeries?: ChartSeries, newPoint?: ChartDataPoint) => string;
    };
  };
  
  // Metadata
  version?: string;
  author?: string;
  created?: Date;
  modified?: Date;
  tags?: string[];
  category?: string;
  
  // Configuration
  config?: {
    autoResize?: boolean;
    reflow?: boolean;
    allowDecimalsInYAxis?: boolean;
    ignoreHiddenSeries?: boolean;
    spacingTop?: number;
    spacingRight?: number;
    spacingBottom?: number;
    spacingLeft?: number;
    resetZoomButton?: {
      theme?: Record<string, unknown>;
      position?: {
        align: 'left' | 'center' | 'right';
        verticalAlign: 'top' | 'middle' | 'bottom';
        x?: number;
        y?: number;
      };
    };
    panKey?: 'alt' | 'ctrl' | 'meta' | 'shift';
    selectionMarkerFill?: string;
    styledMode?: boolean;
  };
};

interface ChartBuilderProps {
  config: ChartBuilder;
  data?: ChartDataPoint[];
  mode?: 'design' | 'view' | 'edit';
  onConfigChange?: (config: ChartBuilder) => void;
  onDataChange?: (data: ChartDataPoint[]) => void;
  onSeriesChange?: (series: ChartSeries[]) => void;
  className?: string;
  style?: React.CSSProperties;
  loading?: boolean;
  error?: string;
}

/**
 * Advanced Chart Builder Component
 * Creates and displays highly customizable charts with real-time data support
 */
const AdvancedChartBuilder: React.FC<ChartBuilderProps> = ({
  config,
  data = [],
  mode = 'view',
  onConfigChange,
  onDataChange,
  onSeriesChange,
  className = '',
  style,
  loading = false,
  error
}) => {
  // State management
  const [chartData, setChartData] = useState<ChartDataPoint[]>(data);
  const [isLoading, setIsLoading] = useState(loading);
  const [chartError, setChartError] = useState<string | null>(error || null);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [brushSelection, setBrushSelection] = useState<{ start: number; end: number } | null>(null);
  const [crosshairPosition, setCrosshairPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [themeColors, setThemeColors] = useState<string[]>([]);
  const [animationState, setAnimationState] = useState<'idle' | 'running' | 'paused'>('idle');

  // Refs
  const chartRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const realtimeIntervalRef = useRef<NodeJS.Timeout>();
  const animationFrameRef = useRef<number>();
  const resizeObserverRef = useRef<ResizeObserver>();
  const dataFetchIntervalRef = useRef<NodeJS.Timeout>();

  // Color schemes
  const colorSchemes: Record<ColorScheme, string[]> = {
    default: ['#3366cc', '#dc3912', '#ff9900', '#109618', '#990099', '#0099c6', '#dd4477', '#66aa00'],
    pastel: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e1baff', '#ffd1dc', '#c9ffba'],
    vibrant: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fab1a0', '#fd79a8', '#fdcb6e'],
    monochrome: ['#333333', '#666666', '#999999', '#cccccc', '#e6e6e6', '#f2f2f2', '#f8f8f8', '#ffffff'],
    analogous: ['#ff6b6b', '#ff8e53', '#ff6b9d', '#c44569', '#f8b500', '#feca57', '#ff9ff3', '#54a0ff'],
    complementary: ['#ff6b6b', '#4ecdc4', '#feca57', '#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff', '#5f27cd'],
    triadic: ['#ff6b6b', '#4ecdc4', '#feca57', '#ff6b9d', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9ff3'],
    tetradic: ['#ff6b6b', '#4ecdc4', '#feca57', '#c44569', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9ff3'],
    'split-complementary': ['#ff6b6b', '#4ecdc4', '#feca57', '#ff6b9d', '#54a0ff', '#c44569', '#00d2d3', '#ff9ff3'],
    warm: ['#ff6b6b', '#feca57', '#ff9ff3', '#ff8e53', '#f8b500', '#fab1a0', '#fd79a8', '#fdcb6e'],
    cool: ['#4ecdc4', '#54a0ff', '#5f27cd', '#00d2d3', '#0abde3', '#006ba6', '#3742fa', '#2f3542'],
    earth: ['#8d6e63', '#a1887f', '#bcaaa4', '#d7ccc8', '#efebe9', '#5d4037', '#795548', '#6d4c41'],
    ocean: ['#006ba6', '#0496ff', '#ffbc42', '#d81159', '#8f2d56', '#0abde3', '#3742fa', '#2f3542'],
    sunset: ['#ff6b6b', '#feca57', '#ff9ff3', '#fd79a8', '#fab1a0', '#fdcb6e', '#e17055', '#d63031'],
    forest: ['#27ae60', '#2ecc71', '#00b894', '#00cec9', '#55a3ff', '#74b9ff', '#0984e3', '#6c5ce7'],
    purple: ['#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e', '#e17055', '#00b894', '#00cec9', '#74b9ff'],
    rainbow: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff'],
    custom: config.customColors || ['#3366cc', '#dc3912', '#ff9900', '#109618', '#990099', '#0099c6']
  };

  // Memoized calculations
  const processedData = useMemo(() => {
    if (!chartData.length) return [];
    
    // Apply transformations based on chart type
    switch (config.type) {
      case 'bar':
      case 'column':
        return chartData.map(point => ({
          ...point,
          y: Array.isArray(point.y) ? point.y[0] : point.y
        }));
      
      case 'pie':
      case 'doughnut':
        return chartData.map(point => ({
          ...point,
          value: Array.isArray(point.y) ? point.y[0] : point.y,
          name: point.label || String(point.x)
        }));
      
      case 'scatter':
      case 'bubble':
        return chartData.filter(point => 
          typeof point.x === 'number' && typeof point.y === 'number'
        );
      
      case 'candlestick':
      case 'ohlc':
        return chartData.filter(point => 
          Array.isArray(point.y) && point.y.length >= 4
        ).map(point => ({
          ...point,
          open: (point.y as number[])[0],
          high: (point.y as number[])[1],
          low: (point.y as number[])[2],
          close: (point.y as number[])[3]
        }));
      
      default:
        return chartData;
    }
  }, [chartData, config.type]);

  const chartDimensions = useMemo(() => {
    const containerWidth = chartRef.current?.clientWidth || 800;
    const containerHeight = chartRef.current?.clientHeight || 400;
    
    const width = typeof config.width === 'number' ? config.width : 
                  typeof config.width === 'string' ? containerWidth : containerWidth;
    const height = typeof config.height === 'number' ? config.height :
                   typeof config.height === 'string' ? containerHeight : containerHeight;
    
    const margin = config.margin || { top: 20, right: 20, bottom: 30, left: 40 };
    const padding = config.padding || { top: 10, right: 10, bottom: 10, left: 10 };
    
    return {
      width,
      height,
      plotWidth: width - margin.left - margin.right - padding.left - padding.right,
      plotHeight: height - margin.top - margin.bottom - padding.top - padding.bottom,
      margin,
      padding
    };
  }, [config.width, config.height, config.margin, config.padding, chartRef.current]);

  const activeColorScheme = useMemo(() => {
    return colorSchemes[config.colorScheme] || colorSchemes.default;
  }, [config.colorScheme]);

  // Helper functions
  const getSeriesColor = useCallback((seriesIndex: number, series: ChartSeries) => {
    if (series.color) return series.color;
    return activeColorScheme[seriesIndex % activeColorScheme.length];
  }, [activeColorScheme]);

  const formatValue = useCallback((value: unknown, format?: string): string => {
    if (typeof value === 'number') {
      if (format) {
        // Apply custom formatting
        return format.replace('{value}', value.toString());
      }
      return value.toLocaleString();
    }
    
    if (value instanceof Date) {
      if (format) {
        return format.replace('{value}', value.toLocaleDateString());
      }
      return value.toLocaleDateString();
    }
    
    return String(value);
  }, []);

  const getPointPosition = useCallback((point: ChartDataPoint, seriesIndex: number) => {
    // Calculate position based on chart type and axes
    const { plotWidth, plotHeight, margin } = chartDimensions;
    const xAxis = config.xAxis[0] || {};
    const yAxis = config.yAxis[0] || {};
    
    // This is a simplified calculation - real implementation would be more complex
    let x = 0;
    let y = 0;
    
    if (typeof point.x === 'number') {
      const xMin = typeof xAxis.min === 'number' ? xAxis.min : 0;
      const xMax = typeof xAxis.max === 'number' ? xAxis.max : 100;
      x = margin.left + (point.x - xMin) / (xMax - xMin) * plotWidth;
    }
    
    if (typeof point.y === 'number') {
      const yMin = typeof yAxis.min === 'number' ? yAxis.min : 0;
      const yMax = typeof yAxis.max === 'number' ? yAxis.max : 100;
      y = margin.top + plotHeight - (point.y - yMin) / (yMax - yMin) * plotHeight;
    }
    
    return { x, y };
  }, [chartDimensions, config.xAxis, config.yAxis]);

  const animateChart = useCallback(() => {
    if (!config.animation?.enabled) return;
    
    setAnimationState('running');
    
    const animate = (timestamp: number) => {
      // Animation logic would go here
      // This is a placeholder for the actual animation implementation
      
      if (animationState === 'running') {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [config.animation, animationState]);

  const fetchRealtimeData = useCallback(async () => {
    if (!config.dataSource || !config.realtime?.enabled) return;
    
    try {
      setIsLoading(true);
      
      // Fetch data from the configured data source
      let response: Response;
      
      if (config.dataSource.type === 'api' && config.dataSource.url) {
        const fetchOptions: RequestInit = {
          method: config.dataSource.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...config.dataSource.headers,
          },
        };
        
        if (config.dataSource.authentication) {
          const auth = config.dataSource.authentication;
          switch (auth.type) {
            case 'bearer':
              if (auth.token) {
                fetchOptions.headers = {
                  ...fetchOptions.headers,
                  'Authorization': `Bearer ${auth.token}`,
                };
              }
              break;
            case 'api-key':
              if (auth.apiKey && auth.apiKeyHeader) {
                fetchOptions.headers = {
                  ...fetchOptions.headers,
                  [auth.apiKeyHeader]: auth.apiKey,
                };
              }
              break;
          }
        }
        
        if (config.dataSource.body && config.dataSource.method !== 'GET') {
          fetchOptions.body = JSON.stringify(config.dataSource.body);
        }
        
        response = await fetch(config.dataSource.url, fetchOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        const transformedData = config.dataSource.transform 
          ? config.dataSource.transform(responseData)
          : responseData;
        
        setChartData(transformedData);
        onDataChange?.(transformedData);
        config.events?.onDataUpdate?.(config, transformedData);
      }
    } catch (error) {
      console.error('Failed to fetch realtime data:', error);
      setChartError(`Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (config.dataSource?.errorHandling?.onError) {
        config.dataSource.errorHandling.onError(error as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [config, onDataChange]);

  const exportChart = useCallback((format: 'png' | 'jpg' | 'pdf' | 'svg' | 'csv' | 'json' | 'excel') => {
    if (!config.export.enabled || !config.export.formats.includes(format)) return;
    
    try {
      switch (format) {
        case 'png':
        case 'jpg':
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const link = document.createElement('a');
            link.download = `${config.export.filename || config.id}.${format}`;
            link.href = canvas.toDataURL(`image/${format}`);
            link.click();
          }
          break;
          
        case 'svg':
          if (svgRef.current) {
            const svgData = new XMLSerializer().serializeToString(svgRef.current);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            const link = document.createElement('a');
            link.download = `${config.export.filename || config.id}.svg`;
            link.href = svgUrl;
            link.click();
            URL.revokeObjectURL(svgUrl);
          }
          break;
          
        case 'json':
          const jsonData = JSON.stringify({ config, data: chartData }, null, 2);
          const jsonBlob = new Blob([jsonData], { type: 'application/json' });
          const jsonUrl = URL.createObjectURL(jsonBlob);
          const jsonLink = document.createElement('a');
          jsonLink.download = `${config.export.filename || config.id}.json`;
          jsonLink.href = jsonUrl;
          jsonLink.click();
          URL.revokeObjectURL(jsonUrl);
          break;
          
        case 'csv':
          const csvData = convertToCSV(chartData);
          const csvBlob = new Blob([csvData], { type: 'text/csv' });
          const csvUrl = URL.createObjectURL(csvBlob);
          const csvLink = document.createElement('a');
          csvLink.download = `${config.export.filename || config.id}.csv`;
          csvLink.href = csvUrl;
          csvLink.click();
          URL.revokeObjectURL(csvUrl);
          break;
      }
    } catch (error) {
      console.error('Failed to export chart:', error);
      setChartError(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [config, chartData]);

  const convertToCSV = useCallback((data: ChartDataPoint[]): string => {
    if (!data.length) return '';
    
    const headers = ['x', 'y', 'category', 'label'];
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(point => [
      point.x,
      Array.isArray(point.y) ? point.y.join(';') : point.y,
      point.category || '',
      point.label || ''
    ].join(','));
    
    return [csvHeaders, ...csvRows].join('\n');
  }, []);

  const handleChartClick = useCallback((event: React.MouseEvent) => {
    if (mode !== 'view') return;
    
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find the closest data point
    let closestPoint: ChartDataPoint | null = null;
    let closestDistance = Infinity;
    let closestSeries: ChartSeries | null = null;
    
    config.series.forEach((series, seriesIndex) => {
      series.data.forEach(point => {
        const position = getPointPosition(point, seriesIndex);
        const distance = Math.sqrt(
          Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2)
        );
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestPoint = point;
          closestSeries = series;
        }
      });
    });
    
    if (closestPoint && closestSeries && closestDistance < 20) {
      closestSeries.events?.onClick?.(closestPoint, closestSeries);
    }
  }, [mode, config.series, getPointPosition]);

  const handleChartMouseMove = useCallback((event: React.MouseEvent) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setCrosshairPosition({ x, y });
    
    // Find hovered point for tooltip
    let hoveredPoint: ChartDataPoint | null = null;
    let hoveredSeries: ChartSeries | null = null;
    let minDistance = Infinity;
    
    config.series.forEach((series, seriesIndex) => {
      if (!series.visible) return;
      
      series.data.forEach(point => {
        const position = getPointPosition(point, seriesIndex);
        const distance = Math.sqrt(
          Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2)
        );
        
        if (distance < 15 && distance < minDistance) {
          minDistance = distance;
          hoveredPoint = point;
          hoveredSeries = series;
        }
      });
    });
    
    if (hoveredPoint && hoveredSeries) {
      setHoveredPoint(hoveredPoint);
      setTooltipPosition({ x, y });
      hoveredSeries.events?.onHover?.(hoveredPoint, hoveredSeries);
    } else {
      setHoveredPoint(null);
      setTooltipPosition(null);
    }
  }, [config.series, getPointPosition]);

  const handleSeriesToggle = useCallback((seriesId: string) => {
    const newSeries = config.series.map(series => 
      series.id === seriesId 
        ? { ...series, visible: !series.visible }
        : series
    );
    
    const newConfig = { ...config, series: newSeries };
    onConfigChange?.(newConfig);
    onSeriesChange?.(newSeries);
    config.events?.onSeriesChange?.(newConfig, newSeries);
  }, [config, onConfigChange, onSeriesChange]);

  const addAnnotation = useCallback((annotation: Omit<ChartAnnotation, 'id'>) => {
    const newAnnotation: ChartAnnotation = {
      ...annotation,
      id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const newConfig = {
      ...config,
      annotations: [...config.annotations, newAnnotation]
    };
    
    onConfigChange?.(newConfig);
    newAnnotation.events?.onAdd?.(newAnnotation);
  }, [config, onConfigChange]);

  const removeAnnotation = useCallback((annotationId: string) => {
    const annotation = config.annotations.find(a => a.id === annotationId);
    if (!annotation) return;
    
    const newConfig = {
      ...config,
      annotations: config.annotations.filter(a => a.id !== annotationId)
    };
    
    onConfigChange?.(newConfig);
    annotation.events?.onRemove?.(annotation);
  }, [config, onConfigChange]);

  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const changePlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(Math.max(0.1, Math.min(5, speed)));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Effects
  useEffect(() => {
    setChartData(data);
  }, [data]);

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  useEffect(() => {
    setChartError(error || null);
  }, [error]);

  useEffect(() => {
    if (config.realtime?.enabled && config.realtime.interval) {
      realtimeIntervalRef.current = setInterval(
        fetchRealtimeData,
        config.realtime.interval
      );
      
      return () => {
        if (realtimeIntervalRef.current) {
          clearInterval(realtimeIntervalRef.current);
        }
      };
    }
  }, [config.realtime, fetchRealtimeData]);

  useEffect(() => {
    if (config.animation?.enabled) {
      animateChart();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [config.animation, animateChart]);

  useEffect(() => {
    setColorPalette(activeColorScheme);
    setThemeColors(activeColorScheme);
  }, [activeColorScheme]);

  useEffect(() => {
    // Set up resize observer
    if (chartRef.current && config.responsive?.enabled) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          config.events?.onResize?.(config, width, height);
        }
      });
      
      resizeObserverRef.current.observe(chartRef.current);
      
      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
      };
    }
  }, [config]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (realtimeIntervalRef.current) {
        clearInterval(realtimeIntervalRef.current);
      }
      if (dataFetchIntervalRef.current) {
        clearInterval(dataFetchIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  // Render methods
  const renderChart = useCallback(() => {
    if (isLoading) {
      return (
        <div className="chart-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Loading chart data...</p>
        </div>
      );
    }
    
    if (chartError) {
      return (
        <div className="chart-error">
          <div className="error-icon">⚠️</div>
          <p>{chartError}</p>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setChartError(null)}
          >
            Retry
          </button>
        </div>
      );
    }
    
    if (!processedData.length) {
      return (
        <div className="chart-empty">
          <div className="empty-icon">📊</div>
          <p>No data available</p>
          <p className="text-sm text-gray-500">Add data to see your chart</p>
        </div>
      );
    }
    
    // This would render the actual chart based on the type
    // For demo purposes, we'll render a simple placeholder
    return (
      <div className="chart-content">
        <canvas
          ref={canvasRef}
          width={chartDimensions.width}
          height={chartDimensions.height}
          className="chart-canvas"
        />
        <svg
          ref={svgRef}
          width={chartDimensions.width}
          height={chartDimensions.height}
          className="chart-svg"
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          {/* SVG annotations and overlays would go here */}
          {config.annotations.map(annotation => (
            <g key={annotation.id}>
              {annotation.type === 'text' && (
                <text
                  x={annotation.x}
                  y={annotation.y}
                  fill={annotation.color}
                  fontSize={annotation.fontSize}
                  fontWeight={annotation.fontWeight}
                  transform={`rotate(${annotation.rotation || 0})`}
                >
                  {annotation.text}
                </text>
              )}
              {annotation.type === 'line' && (
                <line
                  x1={annotation.x}
                  y1={annotation.y}
                  x2={annotation.x2}
                  y2={annotation.y2}
                  stroke={annotation.color}
                  strokeWidth={annotation.borderWidth}
                />
              )}
              {annotation.type === 'rectangle' && (
                <rect
                  x={annotation.x}
                  y={annotation.y}
                  width={typeof annotation.x2 === 'number' ? annotation.x2 - Number(annotation.x) : 100}
                  height={typeof annotation.y2 === 'number' ? annotation.y2 - Number(annotation.y) : 50}
                  fill={annotation.backgroundColor}
                  stroke={annotation.borderColor}
                  strokeWidth={annotation.borderWidth}
                  rx={annotation.borderRadius}
                />
              )}
            </g>
          ))}
        </svg>
        
        {/* Crosshair */}
        {crosshairPosition && config.interaction.zoom?.enabled && (
          <div
            className="chart-crosshair"
            style={{
              position: 'absolute',
              left: crosshairPosition.x,
              top: crosshairPosition.y,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              width: '1px',
              height: '1px',
              backgroundColor: '#666',
              boxShadow: '0 -100px 0 #666, 0 100px 0 #666, -100px 0 0 #666, 100px 0 0 #666'
            }}
          />
        )}
        
        {/* Tooltip */}
        {hoveredPoint && tooltipPosition && config.tooltip.enabled && (
          <div
            className="chart-tooltip"
            style={{
              position: 'absolute',
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 10,
              backgroundColor: config.tooltip.backgroundColor || '#fff',
              border: `1px solid ${config.tooltip.borderColor || '#ccc'}`,
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '12px',
              zIndex: 1000,
              pointerEvents: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <div className="tooltip-header">
              {formatValue(hoveredPoint.x)}
            </div>
            <div className="tooltip-body">
              Value: {formatValue(hoveredPoint.y)}
              {hoveredPoint.category && (
                <div>Category: {hoveredPoint.category}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }, [
    isLoading, chartError, processedData, chartDimensions, config,
    crosshairPosition, hoveredPoint, tooltipPosition, formatValue
  ]);

  const renderLegend = useCallback(() => {
    if (!config.legend.enabled) return null;
    
    return (
      <div className={`chart-legend ${config.legend.position} ${config.legend.layout}`}>
        {config.series.map((series, index) => (
          <div
            key={series.id}
            className={`legend-item ${!series.visible ? 'disabled' : ''}`}
            onClick={() => handleSeriesToggle(series.id)}
          >
            <div
              className="legend-symbol"
              style={{
                backgroundColor: getSeriesColor(index, series),
                width: config.legend.symbolWidth || 12,
                height: config.legend.symbolHeight || 12
              }}
            />
            <span className="legend-label">{series.name}</span>
          </div>
        ))}
      </div>
    );
  }, [config.legend, config.series, handleSeriesToggle, getSeriesColor]);

  const renderControls = useCallback(() => {
    if (mode !== 'design') return null;
    
    return (
      <div className="chart-controls">
        <div className="control-group">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => addAnnotation({
              type: 'text',
              x: chartDimensions.width / 2,
              y: chartDimensions.height / 2,
              text: 'New Annotation'
            })}
          >
            <IoAdd /> Add Annotation
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => exportChart('png')}
          >
            <IoDownload /> Export PNG
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => exportChart('svg')}
          >
            <IoDownload /> Export SVG
          </button>
        </div>
        
        <div className="control-group">
          <label className="control-label">
            Chart Type:
            <select
              value={config.type}
              onChange={(e) => {
                const newConfig = { ...config, type: e.target.value as ChartType };
                onConfigChange?.(newConfig);
              }}
            >
              <option value="line">Line</option>
              <option value="area">Area</option>
              <option value="bar">Bar</option>
              <option value="column">Column</option>
              <option value="pie">Pie</option>
              <option value="scatter">Scatter</option>
            </select>
          </label>
          
          <label className="control-label">
            Color Scheme:
            <select
              value={config.colorScheme}
              onChange={(e) => {
                const newConfig = { ...config, colorScheme: e.target.value as ColorScheme };
                onConfigChange?.(newConfig);
              }}
            >
              <option value="default">Default</option>
              <option value="pastel">Pastel</option>
              <option value="vibrant">Vibrant</option>
              <option value="monochrome">Monochrome</option>
              <option value="warm">Warm</option>
              <option value="cool">Cool</option>
            </select>
          </label>
        </div>
        
        {config.realtime?.enabled && (
          <div className="control-group">
            <button
              className={`btn btn-sm ${isPlaying ? 'btn-primary' : 'btn-outline'}`}
              onClick={togglePlayback}
            >
              {isPlaying ? <IoPause /> : <IoPlay />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <label className="control-label">
              Speed:
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={playbackSpeed}
                onChange={(e) => changePlaybackSpeed(parseFloat(e.target.value))}
              />
              <span>{playbackSpeed}x</span>
            </label>
          </div>
        )}
        
        {config.interaction.zoom?.enabled && (
          <div className="control-group">
            <button
              className="btn btn-outline btn-sm"
              onClick={resetZoom}
              disabled={zoomLevel === 1 && panOffset.x === 0 && panOffset.y === 0}
            >
              <IoRefresh /> Reset Zoom
            </button>
            
            <span className="zoom-level">
              Zoom: {Math.round(zoomLevel * 100)}%
            </span>
          </div>
        )}
      </div>
    );
  }, [
    mode, chartDimensions, config, onConfigChange, addAnnotation, exportChart,
    isPlaying, playbackSpeed, togglePlayback, changePlaybackSpeed,
    zoomLevel, panOffset, resetZoom
  ]);

  return (
    <div
      className={`advanced-chart-builder ${mode} ${className}`}
      style={style}
      data-chart-id={config.id}
      data-chart-type={config.type}
    >
      {/* Chart header */}
      {(config.title || config.subtitle) && (
        <div className="chart-header">
          {config.title && <h2 className="chart-title">{config.title}</h2>}
          {config.subtitle && <h3 className="chart-subtitle">{config.subtitle}</h3>}
          {config.description && <p className="chart-description">{config.description}</p>}
        </div>
      )}
      
      {/* Chart controls */}
      {renderControls()}
      
      {/* Main chart area */}
      <div
        ref={chartRef}
        className="chart-container"
        style={{
          width: config.width,
          height: config.height,
          backgroundColor: config.backgroundColor,
          border: config.borderWidth ? `${config.borderWidth}px solid ${config.borderColor}` : undefined,
          borderRadius: config.borderRadius,
          position: 'relative'
        }}
        onClick={handleChartClick}
        onMouseMove={handleChartMouseMove}
      >
        {renderChart()}
      </div>
      
      {/* Legend */}
      {renderLegend()}
      
      {/* Chart footer */}
      {config.export.enabled && (
        <div className="chart-footer">
          <div className="export-options">
            <span className="export-label">Export:</span>
            {config.export.formats.map(format => (
              <button
                key={format}
                className="btn btn-outline btn-sm"
                onClick={() => exportChart(format)}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
          
          {config.theme?.credits?.enabled && (
            <div className="chart-credits">
              <a 
                href={config.theme.credits.href}
                style={config.theme.credits.style}
              >
                {config.theme.credits.text || 'Chart Builder'}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedChartBuilder;
