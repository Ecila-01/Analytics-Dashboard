export interface YouTubeMetric {
  month: string;
  views: number;
  revenue: number;
}

export interface WebStoreMetric {
  month: string;
  unitsSold: number;
  revenue: number;
  conversionRate: number; 
}

export interface ChannelData {
  id: string;
  name: string;
  metrics: YouTubeMetric[];
}

export interface StoreData {
  id: string;
  name: string;
  metrics: WebStoreMetric[];
}

export const mockChannels: ChannelData[] = [
  {
    id: "yt-1",
    name: "GlowGarden Core",
    metrics: [
      { month: "Jan", views: 120000, revenue: 2400 },
      { month: "Feb", views: 150000, revenue: 3100 },
      { month: "Mar", views: 140000, revenue: 2900 }, // Dip here
      { month: "Apr", views: 240000, revenue: 5600 },
    ]
  },
  {
    id: "yt-2",
    name: "GlowGarden Shorts",
    metrics: [
      { month: "Jan", views: 450000, revenue: 450 },
      { month: "Feb", views: 600000, revenue: 620 },
      { month: "Mar", views: 850000, revenue: 910 },
      { month: "Apr", views: 810000, revenue: 750 }, // Dip here
    ]
  }
];

export const mockStores: StoreData[] = [
  {
    id: "shop-1",
    name: "Seeds & Merch US",
    metrics: [
      { month: "Jan", unitsSold: 320, revenue: 9600, conversionRate: 2.4 },
      { month: "Feb", unitsSold: 410, revenue: 12300, conversionRate: 2.8 },
      { month: "Mar", unitsSold: 580, revenue: 17400, conversionRate: 3.1 },
      { month: "Apr", unitsSold: 720, revenue: 21600, conversionRate: 3.5 },
    ]
  },
  {
    id: "shop-2",
    name: "Premium Tools EU",
    metrics: [
      { month: "Jan", unitsSold: 110, revenue: 5500, conversionRate: 1.8 },
      { month: "Feb", unitsSold: 95, revenue: 4750, conversionRate: 1.6 }, // Dip here
      { month: "Mar", unitsSold: 150, revenue: 7500, conversionRate: 2.1 },
      { month: "Apr", unitsSold: 130, revenue: 6500, conversionRate: 1.9 }, // Dip here
    ]
  }
];