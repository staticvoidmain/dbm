CREATE TABLE "sales"."visit" ("date" timestamp with time zone DEFAULT NULL);
CREATE TABLE "sales"."m_order_product" ("order_id" integer DEFAULT NULL, "quantity" integer DEFAULT NULL, "id" integer DEFAULT NULL, "product_id" integer DEFAULT NULL);
CREATE TABLE "sales"."contact" ("first_name" varchar DEFAULT NULL, "phone" varchar DEFAULT NULL, "id" integer DEFAULT NULL, "last_name" varchar DEFAULT NULL);
CREATE TABLE "public"."visit" ("date" timestamp with time zone DEFAULT NULL);
CREATE TABLE "sales"."customer" ("address" varchar DEFAULT NULL, "first_name" varchar DEFAULT NULL, "id" integer DEFAULT NULL, "phone" varchar DEFAULT NULL, "state" varchar DEFAULT NULL, "last_name" varchar DEFAULT NULL, "zip" varchar DEFAULT NULL, "city" varchar DEFAULT NULL);
CREATE TABLE "sales"."lead" ("product_id" integer DEFAULT NULL, "id" integer DEFAULT NULL, "contact_id" integer DEFAULT NULL);
CREATE TABLE "sales"."orders" ("customer_id" integer DEFAULT NULL, "id" integer DEFAULT NULL, "order_date" date DEFAULT NULL, "status" integer DEFAULT NULL);
