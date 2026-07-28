const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');

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

async function updateResource(id, data) {
  const resource = await prisma.libraryResource.findUnique({ where: { id } });
  if (!resource) throw new ApiError(404, 'Ressource introuvable');
  return prisma.libraryResource.update({ where: { id }, data });
}

async function deleteResource(id) {
  const resource = await prisma.libraryResource.findUnique({ where: { id } });
  if (!resource) throw new ApiError(404, 'Ressource introuvable');
  await prisma.libraryResource.delete({ where: { id } });
}

module.exports = { listResources, createResource, updateResource, deleteResource };
