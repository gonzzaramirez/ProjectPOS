import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL no está definida');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

async function main() {
  console.log('Seeding...');

  const market = await prisma.market.create({
    data: {
      name: 'Cantina Principal',
      slug: 'cantina-principal',
      flags: {},
    },
  });

  const point = await prisma.point.create({
    data: {
      point: 'Cantina Principal',
      tag: 'CP',
      id_market: market.id_market,
    },
  });

  const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
  const cajeroPassword = await bcrypt.hash('cajero123', SALT_ROUNDS);
  const cajeroPin = await bcrypt.hash('1234', SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      user: 'admin',
      password: adminPassword,
      role: 'Admin',
      id_point: point.id_point,
      id_market: market.id_market,
    },
  });

  const cajero = await prisma.user.create({
    data: {
      user: 'cajero1',
      password: cajeroPassword,
      pin: cajeroPin,
      role: 'Cajero',
      id_point: point.id_point,
      id_market: market.id_market,
    },
  });

  const cajero2 = await prisma.user.create({
    data: {
      user: 'cajero2',
      password: cajeroPassword,
      pin: cajeroPin,
      role: 'Cajero',
      id_point: point.id_point,
      id_market: market.id_market,
    },
  });

  const catBebidas = await prisma.category.create({
    data: {
      category: 'Bebidas',
      description: 'Bebidas frías y calientes',
      id_point: point.id_point,
      id_market: market.id_market,
    },
  });

  const catComida = await prisma.category.create({
    data: {
      category: 'Comida',
      description: 'Platos y snacks',
      id_point: point.id_point,
      id_market: market.id_market,
    },
  });

  const catTragos = await prisma.category.create({
    data: {
      category: 'Tragos',
      description: 'Tragos y cócteles',
      id_point: point.id_point,
      id_market: market.id_market,
    },
  });

  const products = [
    { product_name: 'Cerveza Quilmes', price: 1500, stock: 200, id_category: catBebidas.id_category, id_point: point.id_point, id_market: market.id_market },
    { product_name: 'Coca-Cola 500ml', price: 800, stock: 150, id_category: catBebidas.id_category, id_point: point.id_point, id_market: market.id_market },
    { product_name: 'Agua Mineral 500ml', price: 500, stock: 100, id_category: catBebidas.id_category, id_point: point.id_point, id_market: market.id_market },
    { product_name: 'Fernet con Coca', price: 2500, stock: 50, id_category: catTragos.id_category, id_point: point.id_point, id_market: market.id_market, requires_cooking: false },
    { product_name: 'Gin Tónica', price: 3000, stock: 30, id_category: catTragos.id_category, id_point: point.id_point, id_market: market.id_market },
    { product_name: 'Hamburguesa', price: 3500, stock: 40, id_category: catComida.id_category, id_point: point.id_point, id_market: market.id_market, requires_cooking: true },
    { product_name: 'Papas Fritas', price: 2000, stock: 60, id_category: catComida.id_category, id_point: point.id_point, id_market: market.id_market, requires_cooking: true },
    { product_name: 'Empanada', price: 1200, stock: 80, id_category: catComida.id_category, id_point: point.id_point, id_market: market.id_market, requires_cooking: true },
    { product_name: 'Panchos', price: 1500, stock: 50, id_category: catComida.id_category, id_point: point.id_point, id_market: market.id_market, requires_cooking: true },
    { product_name: 'Choripán', price: 2500, stock: 30, id_category: catComida.id_category, id_point: point.id_point, id_market: market.id_market, requires_cooking: true },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log('Seed completado!');
  console.log(`  Market: ${market.name} (#${market.id_market})`);
  console.log(`  Punto: ${point.point} (#${point.id_point})`);
  console.log(`  Admin: admin / admin123`);
  console.log(`  Cajero1: cajero1 / PIN: 1234`);
  console.log(`  Cajero2: cajero2 / PIN: 1234`);
  console.log(`  Categorías: ${[catBebidas, catComida, catTragos].length}`);
  console.log(`  Productos: ${products.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
