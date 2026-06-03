import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://distribuidora:distribuidora@db:5432/distribuidora',
  synchronize: false,
  migrationsRun: true,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  entities: [
    __dirname + '/../../**/*.aggregate{.ts,.js}',
    __dirname + '/../../**/*.entity{.ts,.js}',
  ],
  logging: process.env.NODE_ENV === 'development' ? ['error', 'migration'] : ['error'],
};

export default new DataSource(dataSourceOptions);
