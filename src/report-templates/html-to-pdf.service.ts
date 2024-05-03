import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';

@Injectable()
export class HtmlToPdfService {
  constructor(
    readonly fileUploadsService: FileUploadsService,
    private readonly configService: ConfigService,
  ) {}
  async generatePDF(templateHtml, fileS3Location, data, waitSelectors = []) {
    //return process.cwd()
    // return path.join(process.cwd(), '\src\report-templates\damsire-report-page1.html')
    //let templateHtml = fs.readFileSync(path.join(process.cwd(), htmlFilePath), 'utf8');
    // return templateHtml
    //templateHtml = templateHtml.replace(`GRAPH_RADAR_BROODMARESIRE_AGE_XVALUES`, `GRAPH_RADAR_BROODMARESIRE_AGE_XVALUES = `+ JSON.stringify(data.graphs.ageProfile.labels))
    //templateHtml = templateHtml.replace(`GRAPH_RADAR_BROODMARESIRE_AGE_DATASETS`, `GRAPH_RADAR_BROODMARESIRE_AGE_DATASETS = `+ JSON.stringify(data.graphs.ageProfile.datasets))

    //templateHtml = templateHtml.replace(`GRAPH_RADAR_BROODMARESIRE_DISTANCE_XVALUES`, `GRAPH_RADAR_BROODMARESIRE_DISTANCE_XVALUES = `+ JSON.stringify(data.graphs.distanceProfile.labels))
    //templateHtml = templateHtml.replace(`GRAPH_RADAR_BROODMARESIRE_DISTANCE_DATASETS`, `GRAPH_RADAR_BROODMARESIRE_DISTANCE_DATASETS = `+ JSON.stringify(data.graphs.distanceProfile.datasets))
    //BOF HandleBar Code
    handlebars.registerHelper('ifFifthGen', function (index, options) {
      if (index % 5 == 0) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });
    handlebars.registerHelper('ifSixthGen', function (index, options) {
      if (index % 6 == 0) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });
    handlebars.registerHelper('ifFourth', function (index, options) {
      if (index % 4 == 0) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });

    handlebars.registerHelper('inc', function (value, options) {
      return parseInt(value) + 1;
    });

    handlebars.registerHelper('ifEq', function (a, b, options) {
      if (a == b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    handlebars.registerHelper('ifNotEq', function (a, b, options) {
      if (a != b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    handlebars.registerHelper('gEq', function (a, b) {
      var next = arguments[arguments.length - 1];
      return a >= b ? next.fn(this) : next.inverse(this);
    });

    handlebars.registerHelper('gT', function (a, b) {
      var next = arguments[arguments.length - 1];
      return a > b ? next.fn(this) : next.inverse(this);
    });

    handlebars.registerHelper('lEq', function (a, b) {
      var next = arguments[arguments.length - 1];
      return a <= b ? next.fn(this) : next.inverse(this);
    });

    handlebars.registerHelper('lT', function (a, b) {
      var next = arguments[arguments.length - 1];
      return a < b ? next.fn(this) : next.inverse(this);
    });

    handlebars.registerHelper('isArrayEmpty', function (a, b, options) {
      if (a.length === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    handlebars.registerHelper('getProfileRating', function (profileRating) {
      let percent = profileRating - 100;
      return 'translateX(' + percent + '%)';
    });

    //EOF HandleBar Code
    let template = handlebars.compile(templateHtml);
    let html = template(data);
    //let pdfPath = path.join(path.join(process.cwd(), pdfExportPath), pdfName);
    let options = {
      timeout: 0,
      displayHeaderFooter: false,
      printBackground: true,
      //path: pdfPath,
      format: <const>'A3',
      //pageRanges: '1-' + (html.match(/class="reports-wrapper/g) || []).length,
      screen: 'print',
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm',
      },
      //headerTemplate: "<div></div>",
      //footerTemplate: '<div class="footer-wrapper"><img src="https://uat-s3-lambda-bucket.s3.ap-southeast-2.amazonaws.com/report-templates/admin/images/stallion-logo.png" alt="stallion match"/></div>'
    };

    let executablePath = null;
    if (this.configService.get('app.nodeEnv') != 'local') {
      executablePath = '/usr/bin/google-chrome';
    }

    const browser = await puppeteer.launch({
      executablePath: executablePath,
      headless: true,
      //executablePath: (process.platform === 'win32') ? null : '/usr/bin/chromium-browser',
      args: [
        //'--single-process',
        '--no-zygote',
        '--no-sandbox',
        //'--no-sandbox',
        //'--headless',
        //'--disable-gpu',
        '--disable-setuid-sandbox',
        //'--disable-dev-shm-usage'
        '--font-render-hinting=none',
      ],
      ignoreDefaultArgs: ['--disable-extensions'],
    });
    const context = await browser.createIncognitoBrowserContext();
    var page = await context.newPage();

    /* await page.setViewport({
      width: 2480,
      height: 1748,
      deviceScaleFactor: 1,
    }); */
    //await page.goto(`data:text/html;charset=UTF-8,${html}`, {
    // waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
    //  waitUntil: ['load', 'networkidle0'],
    // timeout: 0,
    //});
    /* await page.goto(`data:text/html;charset=UTF-8,${html}`, {
      timeout: 60000,
      waitUntil: ["load","networkidle2"]
    }); */
    //return html
    await page.setContent(html, {
      timeout: 60000,
      waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
    });

    await waitSelectors.reduce(async (promise, element) => {
      await promise;
      await page.waitForSelector(`#${element}`, { visible: true });
    }, Promise.resolve());
    // page.emulateMediaType('print')
    //let _canvasHandle = await page.$('#ageChart');

    // await page.waitForFunction(asyncCall)
    let buffer = await page.pdf(options);
    await this.fileUploadsService.uploadFileToS3(
      fileS3Location,
      buffer,
      'application/pdf',
    );
    /* await this.fileUploadsService.uploadFileToS3(
      fileS3Location,
      Buffer.from(html, 'utf8'),
      'text/html'
    ); */
    //await _canvasHandle.dispose()
    await context.close();
    await browser.close();
    return fileS3Location;
  }

  async generatePDFForReport(
    templateHtml,
    fileS3Location,
    data,
    waitSelectors = [],
  ) {
    //return process.cwd()
    // return path.join(process.cwd(), '\src\report-templates\damsire-report-page1.html')
    //let templateHtml = fs.readFileSync(path.join(process.cwd(), htmlFilePath), 'utf8');
    // return templateHtml
    //templateHtml = templateHtml.replace(`GRAPH_RADAR_BROODMARESIRE_AGE_XVALUES`, `GRAPH_RADAR_BROODMARESIRE_AGE_XVALUES = `+ JSON.stringify(data.graphs.ageProfile.labels))
    //templateHtml = templateHtml.replace(`GRAPH_RADAR_BROODMARESIRE_AGE_DATASETS`, `GRAPH_RADAR_BROODMARESIRE_AGE_DATASETS = `+ JSON.stringify(data.graphs.ageProfile.datasets))

    //templateHtml = templateHtml.replace(`GRAPH_RADAR_BROODMARESIRE_DISTANCE_XVALUES`, `GRAPH_RADAR_BROODMARESIRE_DISTANCE_XVALUES = `+ JSON.stringify(data.graphs.distanceProfile.labels))
    //templateHtml = templateHtml.replace(`GRAPH_RADAR_BROODMARESIRE_DISTANCE_DATASETS`, `GRAPH_RADAR_BROODMARESIRE_DISTANCE_DATASETS = `+ JSON.stringify(data.graphs.distanceProfile.datasets))
    //BOF HandleBar Code
    handlebars.registerHelper('ifFifthGen', function (index, options) {
      if (index % 5 == 0) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });
    handlebars.registerHelper('ifFourth', function (index, options) {
      if (index % 4 == 0) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });

    handlebars.registerHelper('ifFirst', function (index, options) {
      if (index % 1 == 0) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });

    handlebars.registerHelper('ifEq', function (a, b, options) {
      if (a == b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    handlebars.registerHelper('ifNotEq', function (a, b, options) {
      if (a != b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    handlebars.registerHelper('inc', function (value, options) {
      return parseInt(value) + 1;
    });

    handlebars.registerHelper('gEq', function (a, b) {
      var next = arguments[arguments.length - 1];
      return a >= b ? next.fn(this) : next.inverse(this);
    });

    handlebars.registerHelper('gT', function (a, b) {
      var next = arguments[arguments.length - 1];
      return a > b ? next.fn(this) : next.inverse(this);
    });

    handlebars.registerHelper('lEq', function (a, b) {
      var next = arguments[arguments.length - 1];
      return a <= b ? next.fn(this) : next.inverse(this);
    });

    handlebars.registerHelper('lT', function (a, b) {
      var next = arguments[arguments.length - 1];
      return a < b ? next.fn(this) : next.inverse(this);
    });

    handlebars.registerHelper('isArrayEmpty', function (a, b, options) {
      if (a.length === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    //EOF HandleBar Code
    let template = handlebars.compile(templateHtml);
    let html = template(data);
    //let pdfPath = path.join(path.join(process.cwd(), pdfExportPath), pdfName);
    let options = {
      timeout: 0,
      displayHeaderFooter: true,
      printBackground: true,
      //path: pdfPath,
      format: <const>'A5',
      //pageRanges: '1-' + (html.match(/class="reports-wrapper/g) || []).length,
      screen: 'print',
      margin: {
        //top: "3cm",
        //right: "2.5cm",
        //bottom: "2.5cm",
        //left: "2.5cm",
      },
      //headerTemplate: "<div></div>",
      //footerTemplate: '<div class="footer-wrapper"><img src="https://uat-s3-lambda-bucket.s3.ap-southeast-2.amazonaws.com/report-templates/admin/images/stallion-logo.png" alt="stallion match"/></div>'
    };

    let executablePath = null;
    if (this.configService.get('app.nodeEnv') != 'local') {
      executablePath = '/usr/bin/google-chrome';
    }

    const browser = await puppeteer.launch({
      executablePath: executablePath,
      headless: true,
      //executablePath: (process.platform === 'win32') ? null : '/usr/bin/chromium-browser',
      args: [
        //'--single-process',
        '--no-zygote',
        '--no-sandbox',
        //'--no-sandbox',
        //'--headless',
        //'--disable-gpu',
        '--disable-setuid-sandbox',
        //'--disable-dev-shm-usage',
        '--font-render-hinting=none'
      ],
      ignoreDefaultArgs: ['--disable-extensions'],
    });
    const context = await browser.createIncognitoBrowserContext();
    var page = await context.newPage();

    const dpi = 600;
    await page.setViewport({
      width: 1754,
      height: 2480,
      deviceScaleFactor: dpi/96,
    }); 
    //await page.goto(`data:text/html;charset=UTF-8,${html}`, {
    // waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
    //  waitUntil: ['load', 'networkidle0'],
    // timeout: 0,
    //});
    /* await page.goto(`data:text/html;charset=UTF-8,${html}`, {
      timeout: 60000,
      waitUntil: ["load","networkidle2"]
    }); */
    //return html
    await page.setContent(html, {
      timeout: 60000,
      waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
    });

    await waitSelectors.reduce(async (promise, element) => {
      await promise;
      await page.waitForSelector(`#${element}`, { visible: true });
    }, Promise.resolve());
    // page.emulateMediaType('print')
    //let _canvasHandle = await page.$('#ageChart');

    // await page.waitForFunction(asyncCall)
    let buffer = await page.pdf(options);
    await this.fileUploadsService.uploadFileToS3(
      fileS3Location,
      buffer,
      'application/pdf',
    );
    /* await this.fileUploadsService.uploadFileToS3(
      fileS3Location,
      Buffer.from(html, 'utf8'),
      'text/html'
    ); */
    //await _canvasHandle.dispose()
    await context.close();
    await browser.close();
    return fileS3Location;
  }
}
