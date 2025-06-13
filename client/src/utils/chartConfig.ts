import { ChartConfiguration, ChartOptions } from 'chart.js';

export const defaultChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#45, 45, 45',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      display: false,
      grid: {
        color: 'rgba(45, 45, 45, 0.5)',
        drawBorder: false,
      },
    },
    y: {
      display: false,
      grid: {
        color: 'rgba(45, 45, 45, 0.5)',
        drawBorder: false,
      },
    },
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 4,
    },
    line: {
      tension: 0.4,
    },
  },
};

export const priceChartOptions: ChartOptions = {
  ...defaultChartOptions,
  scales: {
    ...defaultChartOptions.scales,
    x: {
      ...defaultChartOptions.scales?.x,
      display: true,
      ticks: {
        color: '#9ca3af',
        maxTicksLimit: 6,
      },
    },
    y: {
      ...defaultChartOptions.scales?.y,
      display: true,
      position: 'right',
      ticks: {
        color: '#9ca3af',
        callback: function(value) {
          return '$' + Number(value).toLocaleString();
        },
      },
    },
  },
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#ffffff',
        usePointStyle: true,
        padding: 20,
      },
    },
  },
};

export const rsiChartOptions: ChartOptions = {
  ...defaultChartOptions,
  scales: {
    ...defaultChartOptions.scales,
    y: {
      ...defaultChartOptions.scales?.y,
      min: 0,
      max: 100,
      ticks: {
        stepSize: 25,
      },
    },
  },
};

export const volumeChartOptions: ChartOptions = {
  ...defaultChartOptions,
  scales: {
    ...defaultChartOptions.scales,
    y: {
      ...defaultChartOptions.scales?.y,
      beginAtZero: true,
    },
  },
};

export const getChartColors = () => ({
  primary: '#00d4ff',
  secondary: '#f97316',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  purple: '#8b5cf6',
  blue: '#3b82f6',
  gray: '#6b7280',
});

export const createGradient = (ctx: CanvasRenderingContext2D, color: string, alpha = 0.1) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color.replace('rgb', 'rgba').replace(')', `, ${alpha})`));
  gradient.addColorStop(1, 'transparent');
  return gradient;
};

export const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    return '$' + price.toFixed(4);
  }
};

export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1e9) {
    return (volume / 1e9).toFixed(1) + 'B';
  } else if (volume >= 1e6) {
    return (volume / 1e6).toFixed(1) + 'M';
  } else if (volume >= 1e3) {
    return (volume / 1e3).toFixed(1) + 'K';
  }
  return volume.toFixed(0);
};
