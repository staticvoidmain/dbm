create table Sales.m_Order_Product (
  id int primary key,
  order_id int not null,
  product_id int not null,
  quantity int not null
);
