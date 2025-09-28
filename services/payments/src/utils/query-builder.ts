/**
 * Type-safe query builder for database operations
 * Replaces all any[] usage with properly typed parameters
 */

export type QueryParameterValue = string | number | boolean | null | Date;

export interface QueryParameters {
  text: string;
  values: QueryParameterValue[];
}

export class TypedQueryBuilder {
  private query: string = '';
  private parameters: QueryParameterValue[] = [];
  private parameterIndex: number = 1;

  constructor(baseQuery?: string) {
    if (baseQuery) {
      this.query = baseQuery;
    }
  }

  /**
   * Add a WHERE clause with a parameter
   */
  where(column: string, operator: string, value: QueryParameterValue): this {
    const prefix = this.query.includes('WHERE') ? ' AND' : ' WHERE';
    this.query += `${prefix} ${column} ${operator} $${this.parameterIndex}`;
    this.parameters.push(value);
    this.parameterIndex++;
    return this;
  }

  /**
   * Add an OR WHERE clause with a parameter
   */
  orWhere(column: string, operator: string, value: QueryParameterValue): this {
    if (!this.query.includes('WHERE')) {
      return this.where(column, operator, value);
    }
    this.query += ` OR ${column} ${operator} $${this.parameterIndex}`;
    this.parameters.push(value);
    this.parameterIndex++;
    return this;
  }

  /**
   * Add a WHERE IN clause
   */
  whereIn(column: string, values: QueryParameterValue[]): this {
    const prefix = this.query.includes('WHERE') ? ' AND' : ' WHERE';
    const placeholders = values.map(() => {
      const placeholder = `$${this.parameterIndex}`;
      this.parameterIndex++;
      return placeholder;
    }).join(', ');

    this.query += `${prefix} ${column} IN (${placeholders})`;
    this.parameters.push(...values);
    return this;
  }

  /**
   * Add a WHERE NOT IN clause
   */
  whereNotIn(column: string, values: QueryParameterValue[]): this {
    const prefix = this.query.includes('WHERE') ? ' AND' : ' WHERE';
    const placeholders = values.map(() => {
      const placeholder = `$${this.parameterIndex}`;
      this.parameterIndex++;
      return placeholder;
    }).join(', ');

    this.query += `${prefix} ${column} NOT IN (${placeholders})`;
    this.parameters.push(...values);
    return this;
  }

  /**
   * Add a WHERE NULL clause
   */
  whereNull(column: string): this {
    const prefix = this.query.includes('WHERE') ? ' AND' : ' WHERE';
    this.query += `${prefix} ${column} IS NULL`;
    return this;
  }

  /**
   * Add a WHERE NOT NULL clause
   */
  whereNotNull(column: string): this {
    const prefix = this.query.includes('WHERE') ? ' AND' : ' WHERE';
    this.query += `${prefix} ${column} IS NOT NULL`;
    return this;
  }

  /**
   * Add a WHERE BETWEEN clause
   */
  whereBetween(column: string, min: QueryParameterValue, max: QueryParameterValue): this {
    const prefix = this.query.includes('WHERE') ? ' AND' : ' WHERE';
    this.query += `${prefix} ${column} BETWEEN $${this.parameterIndex} AND $${this.parameterIndex + 1}`;
    this.parameters.push(min, max);
    this.parameterIndex += 2;
    return this;
  }

  /**
   * Add a WHERE LIKE clause
   */
  whereLike(column: string, pattern: string): this {
    const prefix = this.query.includes('WHERE') ? ' AND' : ' WHERE';
    this.query += `${prefix} ${column} LIKE $${this.parameterIndex}`;
    this.parameters.push(pattern);
    this.parameterIndex++;
    return this;
  }

  /**
   * Add an ORDER BY clause
   */
  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.query += ` ORDER BY ${column} ${direction}`;
    return this;
  }

  /**
   * Add a LIMIT clause
   */
  limit(limit: number): this {
    this.query += ` LIMIT ${limit}`;
    return this;
  }

  /**
   * Add an OFFSET clause
   */
  offset(offset: number): this {
    this.query += ` OFFSET ${offset}`;
    return this;
  }

  /**
   * Add a GROUP BY clause
   */
  groupBy(columns: string | string[]): this {
    const cols = Array.isArray(columns) ? columns.join(', ') : columns;
    this.query += ` GROUP BY ${cols}`;
    return this;
  }

  /**
   * Add a HAVING clause
   */
  having(column: string, operator: string, value: QueryParameterValue): this {
    const prefix = this.query.includes('HAVING') ? ' AND' : ' HAVING';
    this.query += `${prefix} ${column} ${operator} $${this.parameterIndex}`;
    this.parameters.push(value);
    this.parameterIndex++;
    return this;
  }

  /**
   * Add a JOIN clause
   */
  join(table: string, column1: string, operator: string, column2: string): this {
    this.query += ` JOIN ${table} ON ${column1} ${operator} ${column2}`;
    return this;
  }

  /**
   * Add a LEFT JOIN clause
   */
  leftJoin(table: string, column1: string, operator: string, column2: string): this {
    this.query += ` LEFT JOIN ${table} ON ${column1} ${operator} ${column2}`;
    return this;
  }

  /**
   * Add raw SQL to the query
   */
  raw(sql: string): this {
    this.query += ` ${sql}`;
    return this;
  }

  /**
   * Build and return the final query with parameters
   */
  build(): QueryParameters {
    return {
      text: this.query,
      values: this.parameters
    };
  }

  /**
   * Reset the builder
   */
  reset(): this {
    this.query = '';
    this.parameters = [];
    this.parameterIndex = 1;
    return this;
  }
}

/**
 * Helper function to build INSERT query
 */
export function buildInsertQuery(
  table: string,
  data: Record<string, QueryParameterValue>
): QueryParameters {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

  return {
    text: `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
    values
  };
}

/**
 * Helper function to build UPDATE query
 */
export function buildUpdateQuery(
  table: string,
  data: Record<string, QueryParameterValue>,
  whereClause: { column: string; value: QueryParameterValue }
): QueryParameters {
  const columns = Object.keys(data);
  const values = Object.values(data);

  const setClauses = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
  values.push(whereClause.value);

  return {
    text: `UPDATE ${table} SET ${setClauses} WHERE ${whereClause.column} = $${columns.length + 1} RETURNING *`,
    values
  };
}

/**
 * Helper function to build DELETE query
 */
export function buildDeleteQuery(
  table: string,
  whereClause: { column: string; value: QueryParameterValue }
): QueryParameters {
  return {
    text: `DELETE FROM ${table} WHERE ${whereClause.column} = $1 RETURNING *`,
    values: [whereClause.value]
  };
}

/**
 * Helper function to build batch insert query
 */
export function buildBatchInsertQuery(
  table: string,
  records: Array<Record<string, QueryParameterValue>>
): QueryParameters {
  if (records.length === 0) {
    throw new Error('Cannot build batch insert with empty records');
  }

  const columns = Object.keys(records[0]);
  const values: QueryParameterValue[] = [];
  const valueClauses: string[] = [];

  let paramIndex = 1;
  for (const record of records) {
    const placeholders = columns.map(() => `$${paramIndex++}`).join(', ');
    valueClauses.push(`(${placeholders})`);
    values.push(...columns.map(col => record[col]));
  }

  return {
    text: `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${valueClauses.join(', ')} RETURNING *`,
    values
  };
}