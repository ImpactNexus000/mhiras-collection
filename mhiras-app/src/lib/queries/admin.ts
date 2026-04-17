import { db } from "@/lib/db";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Batch 1: revenue and order counts
  const [monthlyRevenue, lastMonthRevenue, monthlyOrders, lastMonthOrders] =
    await Promise.all([
      db.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          paymentStatus: PaymentStatus.PAID,
        },
        _sum: { total: true },
      }),
      db.order.aggregate({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          paymentStatus: PaymentStatus.PAID,
        },
        _sum: { total: true },
      }),
      db.order.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      db.order.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
    ]);

  // Batch 2: product and user counts
  const [activeListings, pendingOrders, totalCustomers, lowStockProducts] =
    await Promise.all([
      db.product.count({ where: { status: "PUBLISHED" } }),
      db.order.count({ where: { status: OrderStatus.PENDING } }),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.product.count({
        where: { status: "PUBLISHED", stock: { lte: 3 } },
      }),
    ]);

  const revenueThisMonth = monthlyRevenue._sum.total ?? 0;
  const revenueLastMonth = lastMonthRevenue._sum.total ?? 0;
  const revenueChange =
    revenueLastMonth > 0
      ? Math.round(
          ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        )
      : revenueThisMonth > 0
        ? 100
        : 0;

  const orderChange = monthlyOrders - lastMonthOrders;

  return {
    revenueThisMonth,
    revenueChange,
    monthlyOrders,
    orderChange,
    activeListings,
    pendingOrders,
    totalCustomers,
    lowStockProducts,
  };
}

/**
 * Get daily revenue for the last 7 days.
 */
export async function getWeeklyRevenue() {
  const days: { label: string; revenue: number }[] = [];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const result = await db.order.aggregate({
      where: {
        createdAt: { gte: start, lt: end },
        paymentStatus: PaymentStatus.PAID,
      },
      _sum: { total: true },
    });

    days.push({
      label: dayLabels[start.getDay()],
      revenue: result._sum.total ?? 0,
    });
  }

  return days;
}

/**
 * Get recent orders for the dashboard.
 */
export async function getRecentOrders(limit = 5) {
  return db.order.findMany({
    include: {
      user: { select: { firstName: true, lastName: true } },
      items: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get order counts by status for tab badges.
 */
export async function getOrderStatusCounts() {
  const [all, pending, processing, shipped, delivered, cancelled] =
    await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: "PENDING" } }),
      db.order.count({ where: { status: "PROCESSING" } }),
      db.order.count({ where: { status: "SHIPPED" } }),
      db.order.count({ where: { status: "DELIVERED" } }),
      db.order.count({ where: { status: "CANCELLED" } }),
    ]);

  return { all, pending, processing, shipped, delivered, cancelled };
}

// ============================================
// ADMIN ORDERS
// ============================================

export async function getAdminOrders(
  filters: {
    status?: OrderStatus;
    search?: string;
    paymentStatus?: PaymentStatus;
  } = {},
  page = 1,
  pageSize = 20
) {
  const where: Record<string, unknown> = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.paymentStatus) {
    where.paymentStatus = filters.paymentStatus;
  }

  if (filters.search) {
    where.OR = [
      { orderNumber: { contains: filters.search, mode: "insensitive" } },
      {
        user: {
          OR: [
            { firstName: { contains: filters.search, mode: "insensitive" } },
            { lastName: { contains: filters.search, mode: "insensitive" } },
            { email: { contains: filters.search, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, slug: true } },
          },
        },
        address: { select: { state: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.order.count({ where }),
  ]);

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get product counts by status for tab badges.
 */
export async function getProductStatusCounts() {
  const [all, published, draft, soldOut] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: "PUBLISHED" } }),
    db.product.count({ where: { status: "DRAFT" } }),
    db.product.count({ where: { status: "SOLD_OUT" } }),
  ]);

  return { all, published, draft, soldOut };
}

// ============================================
// ADMIN PRODUCTS
// ============================================

export async function getAdminProducts(
  filters: {
    status?: string;
    category?: string;
    search?: string;
    lowStock?: boolean;
  } = {},
  page = 1,
  pageSize = 20
) {
  const where: Record<string, unknown> = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.search) {
    where.name = { contains: filters.search, mode: "insensitive" };
  }

  if (filters.lowStock) {
    where.stock = { lte: 3 };
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ============================================
// ADMIN CUSTOMERS
// ============================================

export async function getAdminCustomers(
  filters: { search?: string } = {},
  page = 1,
  pageSize = 20
) {
  const where: Record<string, unknown> = { role: "CUSTOMER" };

  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [customers, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  // Get total spent per customer
  const customerIds = customers.map((c) => c.id);
  const spending = await db.order.groupBy({
    by: ["userId"],
    where: {
      userId: { in: customerIds },
      paymentStatus: PaymentStatus.PAID,
    },
    _sum: { total: true },
  });

  const spendingMap = new Map(
    spending.map((s) => [s.userId, s._sum.total ?? 0])
  );

  const customersWithSpending = customers.map((c) => ({
    ...c,
    totalSpent: spendingMap.get(c.id) ?? 0,
  }));

  return {
    customers: customersWithSpending,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getCustomerStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Batch 1: simple counts
  const [totalCustomers, newThisMonth] = await Promise.all([
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({
      where: { role: "CUSTOMER", createdAt: { gte: startOfMonth } },
    }),
  ]);

  // Batch 2: heavier queries
  const [repeatBuyerGroups, avgOrderValue] = await Promise.all([
    db.order.groupBy({
      by: ["userId"],
      having: { userId: { _count: { gt: 1 } } },
    }),
    db.order.aggregate({
      where: { paymentStatus: PaymentStatus.PAID },
      _avg: { total: true },
    }),
  ]);

  return {
    totalCustomers,
    newThisMonth,
    repeatBuyers: repeatBuyerGroups.length,
    avgOrderValue: Math.round(avgOrderValue._avg.total ?? 0),
  };
}

// ============================================
// ADMIN INVENTORY
// ============================================

export async function getInventorySummary() {
  const [totalProducts, outOfStock, lowStock, totalValue] = await Promise.all([
    db.product.count({ where: { status: "PUBLISHED" } }),
    db.product.count({ where: { status: "PUBLISHED", stock: 0 } }),
    db.product.count({ where: { status: "PUBLISHED", stock: { gt: 0, lte: 3 } } }),
    db.product.aggregate({
      where: { status: "PUBLISHED" },
      _sum: { sellingPrice: true },
    }),
  ]);

  return {
    totalProducts,
    outOfStock,
    lowStock,
    inStock: totalProducts - outOfStock,
    totalValue: totalValue._sum.sellingPrice ?? 0,
  };
}

export async function getInventoryProducts(
  filter: "all" | "low" | "out" = "all",
  page = 1,
  pageSize = 20
) {
  const where: Record<string, unknown> = { status: "PUBLISHED" };

  if (filter === "low") {
    where.stock = { gt: 0, lte: 3 };
  } else if (filter === "out") {
    where.stock = 0;
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true,
        sellingPrice: true,
        size: true,
        status: true,
        category: { select: { name: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
        _count: { select: { orderItems: true } },
      },
      orderBy: { stock: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ============================================
// ADMIN PAYMENTS
// ============================================

export async function getPaymentsSummary() {
  const [totalPaid, totalPending, totalFailed, totalRefunded] =
    await Promise.all([
      db.order.aggregate({
        where: { paymentStatus: PaymentStatus.PAID },
        _sum: { total: true },
        _count: true,
      }),
      db.order.aggregate({
        where: { paymentStatus: PaymentStatus.PENDING },
        _sum: { total: true },
        _count: true,
      }),
      db.order.aggregate({
        where: { paymentStatus: PaymentStatus.FAILED },
        _sum: { total: true },
        _count: true,
      }),
      db.order.aggregate({
        where: { paymentStatus: PaymentStatus.REFUNDED },
        _sum: { total: true },
        _count: true,
      }),
    ]);

  return {
    paid: { amount: totalPaid._sum.total ?? 0, count: totalPaid._count },
    pending: {
      amount: totalPending._sum.total ?? 0,
      count: totalPending._count,
    },
    failed: { amount: totalFailed._sum.total ?? 0, count: totalFailed._count },
    refunded: {
      amount: totalRefunded._sum.total ?? 0,
      count: totalRefunded._count,
    },
  };
}

export async function getPaymentOrders(
  paymentStatus?: PaymentStatus,
  page = 1,
  pageSize = 20
) {
  const where: Record<string, unknown> = {};
  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        paymentRef: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.order.count({ where }),
  ]);

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}
