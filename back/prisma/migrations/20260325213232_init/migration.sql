-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Vendedor', 'Cocina');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Pendiente', 'Preparado', 'Entregado', 'Cancelado');

-- CreateTable
CREATE TABLE "Point" (
    "id_point" SERIAL NOT NULL,
    "point" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "Point_pkey" PRIMARY KEY ("id_point")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "user" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'Vendedor',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_point" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id_category" SERIAL NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "id_point" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id_category")
);

-- CreateTable
CREATE TABLE "Product" (
    "id_product" SERIAL NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "requires_cooking" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_category" INTEGER NOT NULL,
    "id_point" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id_product")
);

-- CreateTable
CREATE TABLE "Order" (
    "id_order" SERIAL NOT NULL,
    "order_number" SERIAL NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'Pendiente',
    "client_name" VARCHAR(100) NOT NULL,
    "client_dni" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "payment_method" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_point" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id_order")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id_order_item" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_at_sale" DOUBLE PRECISION NOT NULL,
    "id_order" INTEGER NOT NULL,
    "id_product" INTEGER NOT NULL,
    "id_point" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id_order_item")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_key" ON "User"("user");

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_number_key" ON "Order"("order_number");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_point_fkey" FOREIGN KEY ("id_point") REFERENCES "Point"("id_point") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_id_point_fkey" FOREIGN KEY ("id_point") REFERENCES "Point"("id_point") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_id_category_fkey" FOREIGN KEY ("id_category") REFERENCES "Category"("id_category") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_id_point_fkey" FOREIGN KEY ("id_point") REFERENCES "Point"("id_point") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_id_point_fkey" FOREIGN KEY ("id_point") REFERENCES "Point"("id_point") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_id_order_fkey" FOREIGN KEY ("id_order") REFERENCES "Order"("id_order") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_id_product_fkey" FOREIGN KEY ("id_product") REFERENCES "Product"("id_product") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_id_point_fkey" FOREIGN KEY ("id_point") REFERENCES "Point"("id_point") ON DELETE RESTRICT ON UPDATE CASCADE;
