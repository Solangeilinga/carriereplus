const prisma = require('../../config/db');

async function listResources({ category, page = 1, pageSize = 20 }) {
  const where = category ? { category } : {};
  const [items, total] = await Promise.all([
    prisma.libraryResource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.libraryResource.count({ where }),
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize) };
}

async function createResource(data) {
  return prisma.libraryResource.create({ data });
}

module.exports = { listResources, createResource };
