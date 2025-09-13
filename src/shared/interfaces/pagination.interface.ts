/**
 * Input interface for pagination parameters
 *
 * @interface IPaginationInput
 * @property {number} skip - Number of records to skip (offset)
 * @property {number} limit - Maximum number of records to return
 */
export interface IPaginationInput {
  skip: number;
  limit: number;
}

/**
 * Pagination metadata for paginated responses
 *
 * @interface IPaginatedResponsePagination
 * @property {number} total - Total number of records matching the query
 * @property {number} limit - Maximum number of records returned per page
 * @property {number} skip - Number of records skipped (offset)
 */
export interface IPaginatedResponsePagination {
  total: number;
  limit: number;
  skip: number;
}

/**
 * Generic interface for paginated API responses
 *
 * @interface IPaginatedResponse
 * @template Result - Type of the individual result items
 * @property {IPaginatedResponsePagination} pagination - Pagination metadata
 * @property {Result[]} results - Array of result items
 */
export interface IPaginatedResponse<Result> {
  pagination: IPaginatedResponsePagination;
  results: Result[];
}
