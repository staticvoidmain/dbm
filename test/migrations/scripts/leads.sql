create database Marketing;

create schema Sales;

create table Sales.Lead (
  id int not null identity(1, 1),
  product_id int not null,
  contact_id int not null
) on Primary

create table Sales.Contact (
  id int not null identity(1,1),
  first_name varchar(50),
  last_name varchar(50),
  phone varchar(10) not null,
) on Primary


create table Sales.Customer (
  id int not null identity(1,1)
)

create table Sales.Orders (
  id int not null identity(1,1)

)