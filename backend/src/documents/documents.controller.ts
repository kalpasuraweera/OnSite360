import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import * as path from 'path';
import { AuthenticatedRequest } from 'src/auth/auth.guard';
import { Document as PrismaDocument } from '@prisma/client';
import * as fs from 'fs';

@Controller('documents')
@ApiTags('Documents')
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document upload',
    type: CreateDocumentDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, uuidv4() + ext);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
      },
      fileFilter: (req, file, cb) => {
        // Accept only certain mime types (e.g., images, pdf, docx)
        const allowed = [
          'image/jpeg',
          'image/png',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  async uploadDocument(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({
            fileType:
              /^(image\/jpeg|image\/png|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/,
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ): Promise<PrismaDocument> {
    return this.documentsService.create(createDocumentDto, file, req.user);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all documents (optionally filter by project or user)',
  })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'List of documents.' })
  async findAll(
    @Query('projectId') projectId?: string,
    @Query('userId') userId?: string,
  ): Promise<PrismaDocument[]> {
    return this.documentsService.findAll(projectId, userId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all documents for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'List of documents for a project.' })
  async getByProject(
    @Param('projectId') projectId: string,
  ): Promise<PrismaDocument[]> {
    return this.documentsService.findAll(projectId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all documents uploaded by a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'List of documents uploaded by a user.',
  })
  async getByUser(@Param('userId') userId: string): Promise<PrismaDocument[]> {
    return this.documentsService.findAll(undefined, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document details.' })
  async findOne(@Param('id') id: string): Promise<PrismaDocument> {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update document details (e.g., version, category, etc.)',
  })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiResponse({ status: 200, description: 'Updated document.' })
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ): Promise<PrismaDocument> {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Deleted document.' })
  async remove(@Param('id') id: string): Promise<PrismaDocument> {
    return this.documentsService.remove(id);
  }
}
