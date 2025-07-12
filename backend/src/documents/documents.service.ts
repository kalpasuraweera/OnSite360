import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Document as PrismaDocument } from '@prisma/client';
import { AuthenticatedRequest } from 'src/auth/auth.guard';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    file: Express.Multer.File,
    user: AuthenticatedRequest['user'],
  ): Promise<PrismaDocument> {
    // Defensive: check file
    if (!file) throw new NotFoundException('No file uploaded');
    // Multer already stores the file securely in ./uploads with a random name
    // Defensive: ensure file path is within uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const destPath = path.resolve(file.path);
    if (!destPath.startsWith(uploadsDir)) {
      throw new NotFoundException('Invalid file path');
    }
    // Defensive: sanitize file url
    const uniqueName = path.basename(file.filename);
    const url = `/uploads/${uniqueName}`;
    const doc = await this.prisma.document.create({
      data: {
        projectId: createDocumentDto.projectId,
        name: file.originalname,
        url,
        type: createDocumentDto.type,
        category: createDocumentDto.category ?? null,
        version: createDocumentDto.version || '1.0',
        size: file.size ?? null,
        mimeType: file.mimetype ?? null,
        uploadedById: user?.sub || null,
        description: createDocumentDto.description ?? null,
        tags: createDocumentDto.tags ?? [],
      },
      include: { uploader: true },
    });
    // Ensure tags is always string[] (never null)
    return { ...doc, tags: doc.tags ?? [] };
  }

  async findAll(
    projectId?: string,
    userId?: string,
  ): Promise<PrismaDocument[]> {
    const docs = await this.prisma.document.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        ...(userId ? { uploadedById: userId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { uploader: true },
    });
    return docs.map((doc) => ({ ...doc, tags: doc.tags ?? [] }));
  }

  async findOne(id: string): Promise<PrismaDocument> {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return { ...doc, tags: doc.tags ?? [] };
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<PrismaDocument> {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        ...updateDocumentDto,
        category: updateDocumentDto.category ?? null,
        description: updateDocumentDto.description ?? null,
        tags: updateDocumentDto.tags ?? [],
      },
      include: { uploader: true },
    });
    return { ...updated, tags: updated.tags ?? [] };
  }

  async remove(id: string): Promise<PrismaDocument> {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    const deleted = await this.prisma.document.delete({ where: { id } });
    return { ...deleted, tags: deleted.tags ?? [] };
  }
}
