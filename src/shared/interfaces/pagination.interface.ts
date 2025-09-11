export interface IPaginationInput {
    skip: number;
    limit: number;
  }
  export interface IPaginatedResponsePagination {
    total: number;
    limit: number;
    skip: number;
  }
  export interface IPaginatedResponse<Result> {
    pagination: IPaginatedResponsePagination;
    results: Result[];
  }
  