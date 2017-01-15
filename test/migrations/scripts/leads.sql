create database Marketing;

create schema Sales;

create table Sales.Lead (
  id int not null identity(1, 1),
  product_id int not null,
  contact_id int not null
);

create table Sales.Contact (
  id int not null,
  first_name varchar(50),
  last_name varchar(50),
  phone varchar(10) not null,
);

create table Sales.Customer (
  id int not null,
  first_name varchar(50) not null,
  last_name varchar(50) not null,
  phone varchar(10) not null,
  address varchar(256) not null,
  city varchar(64) not null,
  state varchar (32) not null,
  zip varchar(10)
);

create table Sales.Orders (
  id int not null,
  customer_id int not null,
  status int not null,
  order_date date not null
);

-- create.table Sales.m_Order_Product
create table Sales.m_Order_Product (
  id int not null,
  order_id int not null,
  product_id int not null,
  quantity int not null
);

-- todo: foreign key relationships