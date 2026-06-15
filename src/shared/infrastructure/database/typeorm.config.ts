import { DataSource, DataSourceOptions } from 'typeorm';
import { ProductAggregate } from 'src/modules/product/domain/aggregates/product.aggregate';
import { CustomerEntity } from 'src/modules/customer/domain/entities/customer.entity';
import { InventoryMovement } from 'src/modules/inventory/domain/entities/inventory-movement.entity';
import { OrderAggregate } from 'src/modules/order/domain/aggregates/order.aggregate';
import { OrderItem } from 'src/modules/order/domain/entities/order-item.entity';
import { PaymentTypeEntity } from 'src/modules/payment-type/domain/entities/payment-type.entity';
import { AcceptanceRule } from 'src/modules/payment-type/domain/value-objects/acceptance-rule.vo';


export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://distribuidora:distribuidora@db:5432/distribuidora',
  synchronize: false,
  migrationsRun: true,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  entities: [
    ProductAggregate,
    CustomerEntity,
    InventoryMovement,
    OrderAggregate,
    OrderItem,
    PaymentTypeEntity,
    AcceptanceRule,
  ],
  logging: process.env.NODE_ENV === 'development' ? ['error', 'migration'] : ['error'],
};

export default new DataSource(dataSourceOptions);
