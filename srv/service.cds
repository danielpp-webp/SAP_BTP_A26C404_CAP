using { entities } from '../db/schema';

service SalesOrders {
    entity Orders as projection on entities.Orders;
    entity Items as projection on entities.Items;
    
    @readonly
    entity OrderStatus_VH as projection on entities.OrderStatus_VH;
    @readonly
    entity Country_VH as projection on entities.Country_VH;
    @readonly
    entity UnitOfMeasure_VH as projection on entities.UnitOfMeasure_VH;
}