export type JobFilter = {
  keyword?: string;
  location?: string;
  page?: number;
  perPage?: number;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};
