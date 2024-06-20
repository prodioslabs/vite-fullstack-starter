import * as fs from 'fs/promises'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import puppeteer, { PDFOptions } from 'puppeteer'
import { JSDOM } from 'jsdom'
import { Environment } from '../config/env.config'
import handlebars from '../utils/handlebars'

@Injectable()
export class BrowserService {
  static DEFAULT_VIEWPORT = {
    height: 720,
    width: 1280,
  }

  static DEFAULT_PDF_OPTIONS: PDFOptions = {
    format: 'a4',
    printBackground: true,
  }

  constructor(private readonly configService: ConfigService<Environment>) {}

  async generatePdf({
    templatePath,
    data,
    pdfOptions,
    extraHtmlContent,
  }: {
    templatePath: string
    data: any
    pdfOptions?: PDFOptions
    extraHtmlContent?: string
  }) {
    const template = await fs.readFile(templatePath, 'utf-8')
    const compile = handlebars.compile(template)

    const assetsData = await this.getAssetsData()

    const htmlContent = compile({
      ...data,
      assets: assetsData,
    })

    const browser = await this.getBrowser()

    const page = await browser.newPage()

    let html = await this.addStyleSheetToHtmlContent(htmlContent)
    if (extraHtmlContent) {
      html = await this.addExtraHTMLContent(html, extraHtmlContent)
    }

    await page.setContent(html)

    const buffer = await page.pdf({ ...BrowserService.DEFAULT_PDF_OPTIONS, ...(pdfOptions ?? {}) })

    await browser.close()

    return buffer
  }

  private async getBrowser() {
    const defaultOptions = {
      defaultViewport: BrowserService.DEFAULT_VIEWPORT,
    }

    // Use local puppeteer if BROWSERLESS_WS_ENDPOINT is not set
    const browserWSEndpoint = this.configService.get<string | undefined>('BROWSERLESS_WS_ENDPOINT')
    if (!browserWSEndpoint) {
      return puppeteer.launch(defaultOptions)
    }

    return puppeteer.connect({
      browserWSEndpoint: this.configService.get('BROWSERLESS_WS_ENDPOINT'),
      ...defaultOptions,
    })
  }

  private async addStyleSheetToHtmlContent(htmlContent: string) {
    const tailwindStyle = await fs.readFile('./static/assets/tailwind-output.css', 'utf-8')
    const dom = new JSDOM(htmlContent)
    const doc = dom.window.document
    const styles = doc.createElement('style')
    styles.append(tailwindStyle)
    const head = doc.querySelector('head')
    if (head) {
      head.appendChild(styles)
    }
    return dom.serialize()
  }

  private async getAssetsData() {
    const logo = await fs.readFile('./static/assets/logo.png', 'base64')

    return { logo }
  }

  private async addExtraHTMLContent(htmlContent: string, extraHTMLContent: string) {
    const dom = new JSDOM(htmlContent)
    const extraHTMLContentDOM = new JSDOM(extraHTMLContent).window.document.body
    dom.window.document.body.appendChild(extraHTMLContentDOM)
    return dom.serialize()
  }
}
