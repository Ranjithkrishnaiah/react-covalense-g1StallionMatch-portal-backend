import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';

@Injectable({ scope: Scope.REQUEST })
export class MailPreviewService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly fileUploadsService: FileUploadsService,
  ) {}

  /* Get Mail Preview */
  async fetchMail(dirId: string, fileId: string) {
    let fileKey = `mail-preview/${dirId}/${fileId}.html`;
    let emailPreview = await this.fileUploadsService.generateGetPresignedUrl(
      fileKey,
    );
    return {
      emailPreview,
    };
  }
}
