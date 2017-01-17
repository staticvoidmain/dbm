create table Sales.Customer(
  id int primary key,
  first_name varchar(50) not null,
  last_name varchar(50) not null,
  phone varchar(10) not null,
  address varchar(256) not null,
  city varchar(64) not null,
  state varchar (32) not null,
  zip varchar(10)
);
