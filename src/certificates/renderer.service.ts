import { Injectable } from '@nestjs/common';
import PDFMerger from 'pdf-merger-js';
import puppeteer, { Browser, Page } from 'puppeteer';

@Injectable()
export class RendererService {
  private browserPromise: Promise<Browser> = puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  async onModuleDestroy() {
    const browser = await this.browserPromise;
    await browser.close();
  }

  // REFACTOR: isso deveria estar nesse serviço?
  async mergePdf(pdfs: Express.Multer.File[]) {
    const merger = new PDFMerger();
    for (const pdf of pdfs) {
      await merger.add(pdf.buffer);
    }

    const buffer = await merger.saveAsBuffer();
    return this.toFile(buffer, 'application/pdf');
  }

  async pdf(html: string) {
    const buffer = await this.render(html, async (page) => {
      return page.pdf({
        format: 'A4',
        landscape: true,
        omitBackground: true,
        printBackground: true,
      });
    });

    return this.toFile(buffer, 'application/pdf');
  }

  async png(html: string) {
    const buffer = await this.render(html, async (page) => {
      await page.setViewport({
        width: this.mmToPx(297),
        height: this.mmToPx(210),
        deviceScaleFactor: 1,
      });
      await page.evaluateHandle('document.fonts.ready');
      return page.screenshot({
        fullPage: true,
        omitBackground: true,
      });
    });

    return this.toFile(buffer, 'image/png');
  }

  private async render(html: string, fn: (page: Page) => Promise<Uint8Array>) {
    const browser = await this.browserPromise;
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });
      return await fn(page);
    } finally {
      await page.close();
    }
  }

  private toFile(
    buffer: Uint8Array,
    mimeType: 'application/pdf' | 'image/png',
  ): Express.Multer.File {
    return {
      buffer,
      fieldname: 'file',
      originalname: 'file.' + mimeType.split('/')[1],
      encoding: '7bit',
      mimetype: mimeType,
      size: buffer.length,
    } as Express.Multer.File;
  }

  private mmToPx(mm: number) {
    return Math.round(mm * 3.7795275591);
  }
}
