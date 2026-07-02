import { integer, pgTable, serial, text, timestamp, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the users table linked by Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the budget_profiles table
export const budgetProfiles = pgTable('budget_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  monthlyIncome: integer('monthly_income').notNull(),
  allocatedPercent: integer('allocated_percent').notNull(),
  priority: text('priority').notNull(), // 'savings' | 'balance' | 'performance'
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the orders table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(), // We'll store generated order references (e.g., "ORD-12345")
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  date: text('date').notNull(),
  subtotal: real('subtotal').notNull(),
  tax: real('tax').notNull(),
  shipping: real('shipping').notNull(),
  total: real('total').notNull(),
  shippingName: text('shipping_name').notNull(),
  shippingEmail: text('shipping_email').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  shippingCity: text('shipping_city').notNull(),
  shippingZipCode: text('shipping_zip_code').notNull(),
  status: text('status').notNull(), // 'Processing' | 'Shipped' | 'Delivered'
  discount: real('discount'),
  discountDevice: text('discount_device'),
  itemsJson: text('items_json').notNull(), // JSON string representing CartItem[]
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relationships for the tables
export const usersRelations = relations(users, ({ one, many }) => ({
  budgetProfile: one(budgetProfiles, {
    fields: [users.id],
    references: [budgetProfiles.userId],
  }),
  orders: many(orders),
}));

export const budgetProfilesRelations = relations(budgetProfiles, ({ one }) => ({
  user: one(users, {
    fields: [budgetProfiles.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));
