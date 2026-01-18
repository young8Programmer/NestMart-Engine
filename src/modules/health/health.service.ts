import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private dataSource: DataSource) {}

  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }

  async checkDatabase() {
    try {
      const isInitialized = this.dataSource.isInitialized;
      
      if (!isInitialized) {
        return {
          status: 'error',
          database: 'disconnected',
          message: 'Database connection is not established',
        };
      }

      // Simple query to verify database is responding
      await this.dataSource.query('SELECT 1');

      return {
        status: 'ok',
        database: 'connected',
        message: 'Database is healthy',
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'error',
        message: error.message,
      };
    }
  }
}
