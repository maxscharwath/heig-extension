export interface MenuBase {
  starter: string;
  mainCourse: string[];
  dessert: string;
  containsPork: boolean;
}

export interface Menu extends MenuBase {
  hash: string;
  rating: {
    value: number;
    count: number;
  };
}

export interface MenuResponse {
  day: string;
  menus: Menu[];
}

export interface MenuWeekResponse {
  _id: string;
  week: number;
  year: number;
  monday: string;
  friday: string;
  days: MenuResponse[];
  lastSave: string;
  lastPublish: string;
  lastNotify: string;
}
