import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactBranchDto, UpdateContactBranchDto } from './dto/contacts.dto';

const DEFAULT_BRANCHES = [
  {
    city_ru: 'Владикавказ',
    city_en: 'Vladikavkaz',
    address_ru: 'Гастелло, 73',
    address_en: 'Gastello str., 73',
    phone: '+7 (906) 495-88-61',
    whatsapp: 'https://wa.me/79064958861',
    sortOrder: 1,
  },
  {
    city_ru: 'Сочи',
    city_en: 'Sochi',
    address_ru: 'Курортный проспект, 86',
    address_en: 'Kurortny Ave., 86',
    phone: '+7 (989) 166-03-03',
    whatsapp: 'https://wa.me/79891660303',
    sortOrder: 2,
  },
  {
    city_ru: 'Новокузнецк',
    city_en: 'Novokuznetsk',
    address_ru: 'пр. Пионерский, 42',
    address_en: 'Pionersky Ave., 42',
    phone: '+7 (905) 969-55-00',
    whatsapp: 'https://wa.me/79059695500',
    sortOrder: 3,
  },
  {
    city_ru: 'Черногория',
    city_en: 'Montenegro',
    address_ru: 'Будва, Бечичи',
    address_en: 'Budva, Becici',
    phone: '+382 (68) 807-204',
    whatsapp: 'https://wa.me/38268807204',
    sortOrder: 4,
  },
  {
    city_ru: 'Дубай',
    city_en: 'Dubai',
    address_ru: 'Business Bay, Iris Bay Tower',
    address_en: 'Business Bay, Iris Bay Tower',
    phone: '+971 (58) 580-7204',
    whatsapp: 'https://wa.me/971585807204',
    sortOrder: 5,
  },
];

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async listBranches() {
    let branches = await this.prisma.contactBranch.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    if (branches.length === 0) {
      await this.prisma.contactBranch.createMany({
        data: DEFAULT_BRANCHES,
      });
      branches = await this.prisma.contactBranch.findMany({
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      });
    }

    return branches;
  }

  async getBranch(id: number) {
    const branch = await this.prisma.contactBranch.findUnique({ where: { id } });
    if (!branch) throw new NotFoundException('Филиал не найден');
    return branch;
  }

  createBranch(dto: CreateContactBranchDto) {
    return this.prisma.contactBranch.create({
      data: {
        city_ru: dto.city_ru.trim(),
        city_en: dto.city_en ? dto.city_en.trim() : '',
        address_ru: dto.address_ru ? dto.address_ru.trim() : '',
        address_en: dto.address_en ? dto.address_en.trim() : '',
        phone: dto.phone ? dto.phone.trim() : '',
        whatsapp: dto.whatsapp ? dto.whatsapp.trim() : '',
        workHours_ru: dto.workHours_ru ? dto.workHours_ru.trim() : '',
        workHours_en: dto.workHours_en ? dto.workHours_en.trim() : '',
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async updateBranch(id: number, dto: UpdateContactBranchDto) {
    await this.getBranch(id);
    return this.prisma.contactBranch.update({
      where: { id },
      data: {
        ...(dto.city_ru !== undefined && { city_ru: dto.city_ru.trim() }),
        ...(dto.city_en !== undefined && { city_en: dto.city_en.trim() }),
        ...(dto.address_ru !== undefined && { address_ru: dto.address_ru.trim() }),
        ...(dto.address_en !== undefined && { address_en: dto.address_en.trim() }),
        ...(dto.phone !== undefined && { phone: dto.phone.trim() }),
        ...(dto.whatsapp !== undefined && { whatsapp: dto.whatsapp.trim() }),
        ...(dto.workHours_ru !== undefined && { workHours_ru: dto.workHours_ru.trim() }),
        ...(dto.workHours_en !== undefined && { workHours_en: dto.workHours_en.trim() }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async deleteBranch(id: number) {
    await this.getBranch(id);
    await this.prisma.contactBranch.delete({ where: { id } });
    return { ok: true };
  }
}
