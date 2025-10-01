import { Injectable, Scope } from '@nestjs/common';
import {
  CertificateBuilderService,
  Page,
} from 'src/certificates/certificate-builder.service';
import { S3Service } from 'src/s3/s3.service';
import {
  S3KeyFormat,
  S3KeyKind,
  Template,
} from 'src/templates/entities/template.entity';
import { TemplatesService } from 'src/templates/templates.service';

@Injectable({ scope: Scope.REQUEST })
export class PreviewService {
  private template: Template;

  constructor(
    private readonly certificateBuilder: CertificateBuilderService,
    private readonly s3: S3Service,
    private readonly templatesService: TemplatesService,
  ) {}

  async preview(id: string) {
    this.template = await this.templatesService.findOneBy({
      where: { id, finished: false },
      relations: {
        structure: true,
        blueprint: true,
        signatures: true,
        logos: true,
      },
    });

    const files = await this.certificateBuilder.build(
      this.template,
      '0000000000',
    );

    await this.uploadPreview(files);
    return this.getUrls();
  }

  private async uploadPreview(files: {
    front: Page;
    back: Page | undefined;
    merged: Express.Multer.File;
  }) {
    await Promise.all([
      this.uploadPage('front', files.front),
      this.uploadPage('back', files.back),
      this.s3.uploadFile(files.merged, this.getKey('merged', 'pdf')),
    ]);
  }

  private async uploadPage(kind: S3KeyKind, page?: Page) {
    if (!page) return;

    await Promise.all([
      this.s3.uploadFile(page.pdf, this.getKey(kind, 'pdf')),
      this.s3.uploadFile(page.png, this.getKey(kind, 'png')),
      this.s3.uploadString(page.html, this.getKey(kind, 'html'), 'text/html'),
    ]);
  }

  private async getUrls() {
    const [frontHtml, frontPdf, frontPng, mergedPdf] = await Promise.all([
      this.s3.getPresignedUrl(this.getKey('front', 'html')),
      this.s3.getPresignedUrl(this.getKey('front', 'pdf')),
      this.s3.getPresignedUrl(this.getKey('front', 'png')),
      this.s3.getPresignedUrl(this.getKey('merged', 'pdf')),
    ]);

    const urls = {
      front: { html: frontHtml, pdf: frontPdf, png: frontPng },
      back: { html: null, pdf: null, png: null },
      merged: { pdf: mergedPdf },
    } as Record<S3KeyKind, Record<S3KeyFormat, string | null>>;

    if (this.template.metadata.hasBackPage) {
      const [backHtml, backPdf, backPng] = await Promise.all([
        this.s3.getPresignedUrl(this.getKey('back', 'html')),
        this.s3.getPresignedUrl(this.getKey('back', 'pdf')),
        this.s3.getPresignedUrl(this.getKey('back', 'png')),
      ]);

      urls.back = { html: backHtml, pdf: backPdf, png: backPng };
    }

    return urls;
  }

  private getKey(kind: S3KeyKind, format: S3KeyFormat) {
    return this.template.getS3Key({ kind, format, preview: true });
  }
}
