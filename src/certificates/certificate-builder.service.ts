import { Injectable, Scope } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import Handlebars from 'handlebars';
import { RendererService } from 'src/certificates/renderer.service';
import QRCode from 'qrcode';
import {
  BackContentType,
  Template,
} from 'src/templates/entities/template.entity';
import { Signature } from 'src/signatures/entities/signature.entity';
import { Logo } from 'src/logos/entities/logo.entity';
import {
  Completion,
  ReduStructure,
  StructuresService,
} from 'src/structures/structures.service';
import { ReduUser, UsersService } from 'src/users/users.service';

export type Page = {
  html: string;
  pdf: Express.Multer.File;
  png: Express.Multer.File;
};

@Injectable({ scope: Scope.REQUEST })
export class CertificateBuilderService {
  private readonly QR_CODE_BASE_URL = process.env.QR_CODE_BASE_URL!;
  private template: Template;
  private structure: ReduStructure;
  private completion: Completion;
  private user: ReduUser;
  private validationCode: string;

  constructor(
    private readonly s3: S3Service,
    private readonly renderer: RendererService,
    private readonly structureService: StructuresService,
    private readonly usersService: UsersService,
  ) {}

  async build(template: Template, validationCode: string) {
    this.template = template;
    this.validationCode = validationCode;

    const [structure, user, completion] = await Promise.all([
      this.structureService.getReduStructure(this.template.structure),
      this.usersService.getReduUser(),
      this.structureService.getCompletion(this.template.structure),
    ]);

    this.structure = structure;
    this.user = user;
    this.completion = completion;

    const [front, back] = await Promise.all([
      this.generateFrontPage(),
      this.generateBackPage(),
    ]);

    const merged = back
      ? await this.renderer.mergePdf([front.pdf, back.pdf])
      : front.pdf;

    return {
      front,
      back,
      merged,
    };
  }

  private async generateQRCode(): Promise<string> {
    const validationUrl = `${this.QR_CODE_BASE_URL}/${this.validationCode}`;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await QRCode.toDataURL(validationUrl, {
      width: 64,
    });
  }

  private async generateFrontPage() {
    const data = await this.getFrontData();
    const templateKey = this.template.blueprint.getS3Key('front');
    return this.getBaseHandlebarsTemplate(templateKey)
      .then((handlebars) => handlebars(data))
      .then((html) => Handlebars.compile(html))
      .then((handlebars) => handlebars(data))
      .then((html) => this.render(html));
  }

  private async generateBackPage() {
    if (!this.template.metadata.hasBackPage) return;

    const data = await this.getBackData();
    const blueprintTemplateKind =
      typeof data.content === 'string' || data.content.childrenCount <= 16
        ? 'backSmall'
        : 'backLarge';

    const templateKey = this.template.blueprint.getS3Key(blueprintTemplateKind);
    return this.getBaseHandlebarsTemplate(templateKey)
      .then((handlebars) => handlebars(data))
      .then((html) => Handlebars.compile(html))
      .then((handlebars) => handlebars(data))
      .then((html) => this.render(html));
  }

  private async getBaseHandlebarsTemplate(spacesKey: string) {
    return this.s3
      .getFile(spacesKey)
      .then((file) => file?.Body?.transformToString())
      .then(Handlebars.compile);
  }

  private async render(html: string): Promise<Page> {
    const [pdf, png] = await Promise.all([
      this.renderer.pdf(html),
      this.renderer.png(html),
    ]);

    return {
      html,
      pdf,
      png,
    };
  }

  private async getFrontData() {
    const [signatures, logos, background, qrcode] = await Promise.all([
      this.getSignatures(),
      this.getLogos(),
      this.getBackground('front'),
      this.generateQRCode(),
    ]);

    return {
      ...this.template.front,
      workload: this.getWorkload(),
      signatures,
      logos,
      background,
      qrcode,
      currentDate: this.formatDate(new Date()),
      'NOME COMPLETO DO CURSISTA': this.user.name,
      CPF: this.user.cpf,
      'NOME DA ESTRUTURA': this.structure.name,
      'NOTA FINAL DO CURSISTA': this.completion.grade,
      'PERCENTUAL DE FREQUÊNCIA DO CURSISTA': this.formatPercentage(
        this.completion.presence,
      ),
      'NOME DA PLATAFORMA': this.template.front.organization,
      'CARGA HORÁRIA': this.getWorkload(),
      'DATA DE INÍCIO DA ATIVIDADE': this.formatDate(
        this.template.front.startDate,
      ),
      'DATA DE TÉRMINO DA ATIVIDADE': this.formatDate(
        this.template.front.endDate,
      ),
    };
  }

  private async getSignatures() {
    const buildSignature = async (s: Signature) => {
      return {
        name: s.name,
        role: s.role,
        organization: this.template.front.organization,
        url: await this.s3.getPresignedUrl(s.getSpacesKey()),
      };
    };

    return Promise.all(this.template.signatures.map(buildSignature));
  }

  private async getLogos() {
    const buildLogo = async (l: Logo) => {
      return {
        url: await this.s3.getPresignedUrl(l.getSpacesKey()),
      };
    };

    return Promise.all(this.template.logos.map(buildLogo));
  }

  private async getBackground(page: 'front' | 'back') {
    const kind = `${page}Background` as const;
    const key = this.template.metadata.customBackground[page]
      ? this.template.getS3Key({ kind })
      : this.template.blueprint.getS3Key(kind);

    return this.s3.getPresignedUrl(key);
  }

  private async getBackData() {
    const [background, content, qrcode] = await Promise.all([
      this.getBackground('back'),
      this.getBackContent(),
      this.generateQRCode(),
    ]);

    return {
      ...this.template.back,
      organization: this.template.front.organization,
      background,
      content,
      qrcode,
      workload: this.getWorkload(),
      currentDate: this.formatDate(new Date()),
      'NOME COMPLETO DO CURSISTA': this.user.name,
      CPF: this.user.cpf,
      'NOME DA ESTRUTURA': this.structure.name,
      'NOTA FINAL DO CURSISTA': this.completion.grade,
      'PERCENTUAL DE FREQUÊNCIA DO CURSISTA': this.formatPercentage(
        this.completion.presence,
      ),
      'NOME DA PLATAFORMA': this.template.front.organization,
      'CARGA HORÁRIA': this.getWorkload(),
      'DATA DE INÍCIO DA ATIVIDADE': this.formatDate(
        this.template.front.startDate,
      ),
      'DATA DE TÉRMINO DA ATIVIDADE': this.formatDate(
        this.template.front.endDate,
      ),
    };
  }

  private async getBackContent() {
    if (this.template.back.content.type === BackContentType.CUSTOM)
      return this.template.back.content.value || '';

    const children = await this.structureService.getChildren(
      this.template.structure,
      this.template.back.content.type,
    );

    return {
      childrenCount: children.pagination.totalCount,
      children: children.collection.map((child) => ({
        id: child.id,
        name: child.name,
        description: child.description,
      })),
    };
  }

  private formatDate(date: Date) {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  private getWorkload() {
    const baseWorkload = this.template.front.workload;
    const presenceWorkload = this.structure.presenceWorkload;
    const attendanceWorkload = this.structure.attendanceWorkload;

    return this.template.front.sumPresenceWorkload
      ? baseWorkload + presenceWorkload
      : baseWorkload + attendanceWorkload;
  }

  private formatPercentage(percentage: number) {
    return `${percentage.toFixed(1)}%`;
  }
}
