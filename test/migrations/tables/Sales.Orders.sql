create table Sales.Orders (
  id int primary key,
  customer_id int not null,
  status int not null,
  order_date date not null
);