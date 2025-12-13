import prisma from '../lib/prisma';

export interface CreateSmartTagDTO {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  conditions?: any;
  isAutomatic?: boolean;
}

export interface UpdateSmartTagDTO {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  conditions?: any;
  isAutomatic?: boolean;
  isActive?: boolean;
}

export class SmartTagService {
  async createSmartTag(data: CreateSmartTagDTO) {
    const smartTag = await prisma.smartTag.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || '#9D39FE',
        icon: data.icon,
        conditions: data.conditions,
        isAutomatic: data.isAutomatic || false,
        isActive: true,
      },
    });

    return smartTag;
  }

  async listSmartTags() {
    const smartTags = await prisma.smartTag.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return smartTags;
  }

  async getAllSmartTags() {
    const smartTags = await prisma.smartTag.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return smartTags;
  }

  async getSmartTag(id: string) {
    const smartTag = await prisma.smartTag.findUnique({
      where: { id },
    });

    if (!smartTag) throw new Error('Smart Tag not found');
    return smartTag;
  }

  async updateSmartTag(id: string, data: UpdateSmartTagDTO) {
    const smartTag = await prisma.smartTag.findUnique({
      where: { id },
    });

    if (!smartTag) throw new Error('Smart Tag not found');

    const updated = await prisma.smartTag.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        conditions: data.conditions,
        isAutomatic: data.isAutomatic,
        isActive: data.isActive,
      },
    });

    return updated;
  }

  async deleteSmartTag(id: string) {
    const smartTag = await prisma.smartTag.findUnique({
      where: { id },
    });

    if (!smartTag) throw new Error('Smart Tag not found');

    await prisma.smartTag.delete({ where: { id } });
    return { success: true };
  }

  // Aplicar tags automáticos a un contacto basado en condiciones
  async evaluateAndApplyTags(contactId: string) {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) return [];

    const automaticTags = await prisma.smartTag.findMany({
      where: { isAutomatic: true, isActive: true },
    });

    const appliedTags: string[] = [];

    for (const tag of automaticTags) {
      if (tag.conditions && this.evaluateConditions(contact, tag.conditions)) {
        appliedTags.push(tag.name);
      }
    }

    // Actualizar tags del contacto
    if (appliedTags.length > 0) {
      const existingTags = contact.tags || [];
      const combinedTags = [...existingTags, ...appliedTags];
      const newTags = Array.from(new Set(combinedTags));

      await prisma.contact.update({
        where: { id: contactId },
        data: { tags: newTags },
      });
    }

    return appliedTags;
  }

  // Evaluar condiciones de un tag
  private evaluateConditions(contact: any, conditions: any): boolean {
    if (!conditions || !conditions.field) return false;

    const { field, operator, value } = conditions;
    const contactValue = contact[field];

    if (contactValue === undefined || contactValue === null) return false;

    switch (operator) {
      case '==':
      case '=':
        return contactValue == value;
      case '!=':
        return contactValue != value;
      case '>':
        return contactValue > value;
      case '>=':
        return contactValue >= value;
      case '<':
        return contactValue < value;
      case '<=':
        return contactValue <= value;
      case 'contains':
        return String(contactValue).toLowerCase().includes(String(value).toLowerCase());
      case 'startsWith':
        return String(contactValue).toLowerCase().startsWith(String(value).toLowerCase());
      case 'endsWith':
        return String(contactValue).toLowerCase().endsWith(String(value).toLowerCase());
      default:
        return false;
    }
  }

  // Obtener estadísticas de uso de tags
  async getTagStats() {
    const contacts = await prisma.contact.findMany({
      select: { tags: true },
    });

    const tagCounts: Record<string, number> = {};

    for (const contact of contacts) {
      for (const tag of contact.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    return tagCounts;
  }
}

export default new SmartTagService();
