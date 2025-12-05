import { Injectable } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import PDFMerger from 'pdf-merger-js';
import puppeteer, { Browser, Page, ProtocolError } from 'puppeteer';
import { InjectLogger } from 'src/decorators/inject-logger.decorator';
import { Logger } from 'winston';

const PUPPETEER_MINIMAL_ARGS = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];

@Injectable()
export class RendererService {
  private browserPromise: Promise<Browser> = puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: PUPPETEER_MINIMAL_ARGS,
    userDataDir: '/tmp/puppeteer_user_data',
    protocolTimeout: 3000,
  });

  constructor(@InjectLogger() private readonly logger: Logger) {}

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
    return this.retry(async () => this._png(html), 3, ProtocolError);
  }

  private async _png(html: string) {
    const buffer = await this.render(html, async (page) => {
      await page.setViewport({
        width: this.mmToPx(297),
        height: this.mmToPx(210),
        deviceScaleFactor: 1,
      });
      await page.bringToFront();
      return page.screenshot({
        fullPage: true,
        omitBackground: true,
        optimizeForSpeed: true,
      });
    });
    return this.toFile(buffer, 'image/png');
  }

  private async render(html: string, fn: (page: Page) => Promise<Uint8Array>) {
    const browser = await this.browserPromise;
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.evaluateHandle('document.fonts.ready');
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

  private async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    errorType: ClassConstructor<Error>,
  ): Promise<T> {
    let retries = 0;
    const delay = 1000;
    while (true) {
      try {
        return await fn();
      } catch (error) {
        retries++;
        this.logger.error(`Retrying...`, {
          retries,
          maxRetries,
          delay: `${delay * retries}ms`,
          errorType: errorType.name,
          errorMessage: (error as Error).message,
        });
        if (retries >= maxRetries || !(error instanceof errorType)) throw error;

        await new Promise((resolve) => setTimeout(resolve, delay * retries));
      }
    }
  }
}
