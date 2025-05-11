export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
}

export const createPage = <T>(items: T[], page: number, pageSize: number): Page<T> => {
  return {
    items,
    page,
    pageSize,
  };
};

export interface PageRequest {
  page: number;
  pageSize: number;
}
