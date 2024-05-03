import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cheerio from 'cheerio';
import * as fs from 'fs-extra';
import handlebars from 'handlebars';
import { I18nService } from 'nestjs-i18n';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { RegisterInterest } from 'src/register-interests/entity/register-interest.entity';
import { PRODUCTLIST } from 'src/utils/constants/products';
import { v4 as uuidv4 } from 'uuid';
import { CommonMailDto } from './dto/common-mail.dto';
import { MailData } from './interfaces/mail-data.interface';
import { getRepository } from 'typeorm';
import { PageSettings } from 'src/page-settings/entities/page-settings.entity';

@Injectable()
export class MailService {
  constructor(
    private i18n: I18nService,
    private mailerService: MailerService,
    private configService: ConfigService,
    private commonUtilsService: CommonUtilsService,
    private fileUploadsService: FileUploadsService,
  ) {}

  async sendMailAfterCopy(sendMailOptions: any) {
    let htmlFilePath = `${this.configService.get('app.frontendDomain')}/`;
    let bucketFileLocation = `mail-preview/${uuidv4()}/${uuidv4()}`;
    // Load the template file
    const templateFile = await fs.readFile(
      `src/mail/mail-templates${sendMailOptions.template}.hbs`,
      'utf8',
    );
    // Compile the Handlebars template
    const template = handlebars.compile(templateFile);
    // Render the template with the provided data
    const renderedHtml = template(sendMailOptions.context);
    // Load the HTML text into a cheerio instance
    const $ = cheerio.load(renderedHtml);
    // Find the first table element
    const firstTable = $('table').first();
    // Remove the first table element if it exists
    if (firstTable) {
      firstTable.remove();
    }
    // Get the modified HTML text
    const modifiedHtmlText = $.html();
    //Copying Html to file - transfer to S3
    await this.fileUploadsService.uploadFileToS3(
      `${bucketFileLocation}.html`,
      Buffer.from(modifiedHtmlText),
      'text/html',
    );
    // Set the HTML content of the email
    // sendMailOptions.html = renderedHtml;
    // Send the email using the MailerService
    sendMailOptions.context.extUrl = htmlFilePath + bucketFileLocation;

    try {
      return await this.mailerService.sendMail(sendMailOptions);
    } catch (err) {
      console.log('=================== error', err);
    }
  }

  async memberSignUp(mailData: MailData<{ hash: string; fullName: string }>) {
    return await this.sendMailAfterCopy({
      to: mailData.to,
      subject: await this.i18n.t('common.confirmEmail'),
      text: `${this.configService.get('app.frontendDomain')}/confirm-email/${
        mailData.data.hash
      } ${await this.i18n.t('common.confirmEmail')}`,
      template: '/activation',
      context: {
        title: await this.i18n.t('common.confirmEmail'),
        url: `${this.configService.get('app.frontendDomain')}/confirm-email/${
          mailData.data.hash
        }`,
        actionTitle: await this.i18n.t('common.confirmEmail'),
        app_name: this.configService.get('app.name'),
        fullName: await this.commonUtilsService.toTitleCase(
          mailData.data.fullName,
        ),
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        portalUrl: process.env.FRONTEND_DOMAIN,
      },
    });
  }

  async forgotPassword(mailData: MailData<{ hash: string; fullName: string }>) {
    await this.sendMailAfterCopy({
      to: mailData.to,
      subject: await this.i18n.t('common.resetPassword'),
      text: `${this.configService.get('app.frontendDomain')}/reset-password/${
        mailData.data.hash
      } ${await this.i18n.t('common.resetPassword')}`,
      template: '/reset-password',
      context: {
        title: await this.i18n.t('common.resetPassword'),
        url: `${this.configService.get('app.frontendDomain')}/reset-password/${
          mailData.data.hash
        }`,
        app_name: this.configService.get('app.name'),
        fullName: await this.commonUtilsService.toTitleCase(
          mailData.data.fullName,
        ),
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        portalUrl: process.env.FRONTEND_DOMAIN,
      },
    });
  }

  async inviteUser(
    mailData: MailData<{ hash: string; fullName: string; farmName: string }>,
  ) {
    await this.sendMailAfterCopy({
      to: mailData.to,
      subject: `You have been invited to ${await this.commonUtilsService.toTitleCase(
        mailData.data.farmName,
      )} on Stallion Match`,
      text: `${this.configService.get('app.frontendDomain')}/invite-user/${
        mailData.data.hash
      } ${await this.i18n.t('common.inviteUser')}`,
      template: '/invite-user',
      context: {
        title: await this.i18n.t('common.inviteUser'),
        url: `${this.configService.get('app.frontendDomain')}/invite-user/${
          mailData.data.hash
        }`,
        actionTitle: await this.i18n.t('common.inviteUser'),
        app_name: this.configService.get('app.name'),
        fullName: await this.commonUtilsService.toTitleCase(
          mailData.data.fullName,
        ),
        farmName: await this.commonUtilsService.toTitleCase(
          mailData.data.farmName,
        ),
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        portalUrl: process.env.FRONTEND_DOMAIN,
      },
    });
  }

  async registerYourInterest(record: RegisterInterest) {
    let unSubscribeUrl =
      process.env.FRONTEND_DOMAIN +
      '/' +
      process.env.FRONTEND_APP_UNSUBSCRIPTION_URI +
      record.registerInterestUuid;
    await this.sendMailAfterCopy({
      to: record.email,
      subject: 'Welcome to StallionMatch',
      template: '/register-your-interest',
      context: {
        fullName: record.fullName,
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        unSubscribeUrl: unSubscribeUrl,
        portalUrl: process.env.FRONTEND_DOMAIN,
        portalView:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_REGISTER_YOUR_INTEREST_URI +
          record.registerInterestUuid,
      },
    });
  }

  async registerYourInterestOnFarm(record: RegisterInterest) {
    let unSubscribeUrl =
      process.env.FRONTEND_DOMAIN +
      '/' +
      process.env.FRONTEND_APP_UNSUBSCRIPTION_URI +
      record.registerInterestUuid;
    await this.sendMailAfterCopy({
      to: record.email,
      subject: 'Welcome to StallionMatch',
      template: '/register-your-interest-farm',
      context: {
        fullName: record.fullName,
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        unSubscribeUrl: unSubscribeUrl,
        portalUrl: process.env.FRONTEND_DOMAIN,
        portalView:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_REGISTER_YOUR_INTEREST_FARM_URI +
          record.registerInterestUuid,
      },
    });
  }

  async insightReportSubscription(record: RegisterInterest) {
    let unSubscribeUrl =
      process.env.FRONTEND_DOMAIN +
      '/' +
      process.env.FRONTEND_APP_UNSUBSCRIPTION_URI +
      record.registerInterestUuid;
    let downloadReport = process.env.EMAIL_TEMPLATE_IMAGES_PATH + '/Report.pdf';
    await this.sendMailAfterCopy({
      to: record.email,
      subject: 'Welcome to StallionMatch',
      template: '/insight-report-subscription',
      context: {
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        unSubscribeUrl: unSubscribeUrl,
        downloadReport: downloadReport,
        portalUrl: process.env.FRONTEND_DOMAIN,
        portalView:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_INSIGHT_REPORT_SUBSCRIPTION_URI +
          record.registerInterestUuid,
      },
    });
  }

  async farmSubscription(record: RegisterInterest) {
    let unSubscribeUrl =
      process.env.FRONTEND_DOMAIN +
      '/' +
      process.env.FRONTEND_APP_UNSUBSCRIPTION_URI +
      record.registerInterestUuid;
    await this.sendMailAfterCopy({
      to: record.email,
      subject: 'Welcome to StallionMatch',
      template: '/email-subscription',
      context: {
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        unSubscribeUrl: unSubscribeUrl,
        portalUrl: process.env.FRONTEND_DOMAIN,
        portalView:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_EMAILSUBSCRIPTION_URI +
          record.registerInterestUuid,
      },
    });
  }

  async unSubscribe(record: RegisterInterest) {
    let reSubscribeUrl =
      process.env.FRONTEND_DOMAIN +
      '/' +
      process.env.FRONTEND_APP_RESUBSCRIPTION_URI +
      record.registerInterestUuid;
    await this.sendMailAfterCopy({
      to: record.email,
      subject: 'Welcome to StallionMatch',
      template: '/unsubscribe',
      context: {
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        reSubscribeUrl: reSubscribeUrl,
        portalUrl: process.env.FRONTEND_DOMAIN,
        portalView:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_UNSUBSCRIBE_URI +
          record.registerInterestUuid,
      },
    });
  }

  /*Contact Us*/
  async contactUs(mailData: MailData<{ fullName: string }>) {
    await this.sendMailAfterCopy({
      to: mailData.to,
      subject: 'Thank you for Contacting StallionMatch',
      text: '',
      template: '/contactus',
      context: {
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        portalUrl: process.env.FRONTEND_DOMAIN,
        fullName: await this.commonUtilsService.toTitleCase(
          mailData.data.fullName,
        ),
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
      },
    });
  }

  async unregisteredMessage(
    mailData: MailData<{
      fullName: string;
      FarmUserName: string;
      stallionName: string;
      mareInfo: string;
      broodmareSireInfo: string;
      mareName: string;
      countryName: string;
      message: string;
      time: string;
      origin: string;
      replyNow: string;
      farmName: string;
    }>,
  ) {
    await this.sendMailAfterCopy({
      to: mailData.to,
      subject:
        // 'New Message Email from Breeder to ' +
        // (await this.commonUtilsService.toTitleCase(mailData.data.farmName)),
      `You have a new message from a breeder`,
      text: '',
      template: '/unregistered-message',
      context: {
        fullName: await this.commonUtilsService.toTitleCase(
          mailData.data.fullName,
        ),
        FarmUserName: await this.commonUtilsService.toTitleCase(
          mailData.data.FarmUserName,
        ),
        stallionName: await this.commonUtilsService.toTitleCase(
          mailData.data.stallionName,
        ),
        mareName: await this.commonUtilsService.toTitleCase(
          mailData.data.mareName,
        ),
        countryName: await this.commonUtilsService.toTitleCase(
          mailData.data.countryName,
        ),
        message: mailData.data.message,
        mareInfo: mailData.data.mareInfo,
        broodmareSireInfo: mailData.data.broodmareSireInfo,
        time: mailData.data.time,
        origin: mailData.data.origin,
        replyNow: mailData.data.replyNow,
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        portalUrl: process.env.FRONTEND_DOMAIN,
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
      },
    });
  }

  async sendMailCommon(commonMailDto: CommonMailDto) {
    let context = commonMailDto.context;
    context['imgPath'] = process.env.EMAIL_TEMPLATE_IMAGES_PATH;
    context['portalUrl'] = process.env.FRONTEND_DOMAIN;
    context['facebookUrl'] = process.env.SOCIALMEDIA_FACEBOOK;
    context['twitterUrl'] = process.env.SOCIALMEDIA_TWITTER;
    let data = {
      to: commonMailDto.to,
      subject: commonMailDto.subject,
      text: commonMailDto.text,
      template: commonMailDto.template,
      context: context,
    };

    await this.sendMailAfterCopy(data);
  }

  async sendReport(mailData) {
    let products = '';
    let otherProducts = PRODUCTLIST;
    const reportCoverImagePath =
      this.configService.get('file.pathReportTemplateStylesAdmin') + '/images/';

    if (mailData.data.products.length > 0) {
      mailData.data.products.forEach(async (element) => {
        let productDetails = '';
        otherProducts = otherProducts.filter(function (obj) {
          return obj.productCode !== element.productCode;
        });
        if (
          element.productCode == 'REPORT_SHORTLIST_STALLION' ||
          element.productCode == 'REPORT_STALLION_MATCH_PRO'
        ) {
          productDetails =
            (await this.commonUtilsService.toTitleCase(element.mareName)) +
            ' x ' +
            element.quantity +
            ' Stallions';
        }
        if (element.productCode == 'REPORT_STALLION_AFFINITY') {
          productDetails = await this.commonUtilsService.toTitleCase(
            element.stallionName,
          );
        }
        if (element.productCode == 'PROMOTION_STALLION') {
          productDetails =
            (await this.commonUtilsService.toTitleCase(element.stallionName)) +
            '<br> Renews ' +
            (await this.commonUtilsService.dateFormate(element.expiryDate));
        }
        if (
          element.productCode == 'REPORT_BROODMARE_AFFINITY' ||
          element.productCode == 'REPORT_BROODMARE_SIRE'
        ) {
          productDetails = await this.commonUtilsService.toTitleCase(
            element.mareName,
          );
        }
        element.mediaUrl =
          reportCoverImagePath +
          (await this.commonUtilsService.getReportCoverImage(
            element.productCode,
          ));

        let reportStatus =
          '<p style="font-size:20px; color:#007142; font-weight: 400; line-height: 22px;">Pending</p>';
        if (element.pdfLink) {
          reportStatus =
            '<p style="padding-top:30px;"><a href="' +
            element.pdfLink +
            '" style="color:#007142;font-weight: 500;font-size:18px;">View Report</a></p>';
        }
        products += ` <table cellspacing="0" cellpadding="0" vertical-align='top' width="510" align="center" style="margin-top: 0px; border-top: solid 1px #DFE1E4; border-bottom: solid 1px #DFE1E4; padding-top: 20px; padding-bottom: 10px;">
    <tr>
        <td align="left" width="120"><img src="${
          element.mediaUrl
        }" alt='${await this.commonUtilsService.toTitleCase(
          element.productName,
        )}' width="120" style="padding-right:0px; width:90px; height:90px; border-radius:8px;object-fit: cover;"/></td>
        <td>
            <h2 style="margin: 0px;  padding:10px 0px 5px 0px; font-family: Arial; font-size:16px; color:#161716; font-weight: 400; line-height: 22px;">${await this.commonUtilsService.toTitleCase(
              element.productName,
            )}</h2>
            <p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetails}</p>
        </td>
        <td align="right"> 
            <p style="margin: 0px;  padding:10px 0px 0px 0px; font-family: Arial; font-size:20px; color:#1D472E; font-weight: 400; line-height: 22px;">${
              mailData.data.currencyCode
            } ${element.price}</p>
            ${reportStatus}
        </td>
    </tr>
</table>
`;
      });
    }
    if (!otherProducts.length) {
      otherProducts = PRODUCTLIST.slice(0, 2);
    } else if (otherProducts.length == 1) {
      let temp = PRODUCTLIST.filter(function (obj) {
        return obj.productCode !== otherProducts[0].productCode;
      });
      otherProducts = temp.slice(0, 2);
    } else if (otherProducts.length >= 2) {
      otherProducts = otherProducts.slice(0, 2);
    }
    let reportSettingData = await getRepository(PageSettings).findOne({ moduleId: 8 });
    let reportFromEmail = this.configService.get('mail.defaultEmail')
    if (reportSettingData) {
      if (reportSettingData.settingsResponse) {
        let settingsJsonParseData = JSON.parse(reportSettingData.settingsResponse);
        if (settingsJsonParseData.sendFrom) {
          reportFromEmail = settingsJsonParseData.sendFrom
        }
      }
    }
    return await this.sendMailAfterCopy({
      // from: `"${this.configService.get(
      //   'mail.defaultName',
      // )}" <${reportFromEmail}>`,
      to: mailData.to,
      subject: await this.i18n.t('Order Ready'),
      template: '/order-ready',
      context: {
        title: await this.i18n.t('Order Ready'),
        actionTitle: await this.i18n.t('Order Ready'),
        app_name: this.configService.get('app.name'),
        userName: mailData.data.clientName,
        dateGenerated: await this.commonUtilsService.dateFormate(
          mailData.data.orderCreatedOn,
        ), //22 July, 2022
        orderId: mailData.data.orderId,
        orderStatus: mailData.data.status,
        paymentMethod: mailData.data.paymentMethod,
        productName: await this.commonUtilsService.toTitleCase(
          mailData.data.productName,
        ),
        currencyCode: mailData.data.currencyCode,
        currencySymbol: mailData.data.currencySymbol,
        total: mailData.data.total,
        subTotal: mailData.data.subTotal,
        discount: mailData.data.discount ? mailData.data.discount : 0,
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        portalUrl: process.env.FRONTEND_DOMAIN,
        viewReportUrl: mailData.data.reportLink,
        tax: mailData.data.taxValue !== null ? mailData.data.taxValue : 0,
        taxPercent:  mailData.data.taxPercentage !== null ? mailData.data.taxPercentage : 0,
        products: products,
        otherProducts: otherProducts,
        viewOrderLink:
          process.env.FRONTEND_DOMAIN + '/user/profile?section=OrderHistory',
      },
    });
  }

  // @OnEvent('emitData')
  // async listenToupdateStallionPromotion(data: any) {}

  //Duplicate Stallions Identified In The Same Region
  async duplicateStallionWithInTheRegion(mailData) {
    return await this.sendMailAfterCopy({
      to: mailData.to,
      subject: await this.i18n.t('Duplicate stallions identified!'),
      template: '/duplicate-stallion-within-the-region',
      context: {
        url: `${this.configService.get('app.backendDomain')}${
          mailData.data.actionUrl
        }`,
        fullName: await this.commonUtilsService.toTitleCase(
          mailData.data.fullName,
        ),
        stallionName: await this.commonUtilsService.toTitleCase(
          mailData.data.stallionName,
        ),
        location: mailData.data.stateAndCountryName,
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        portalUrl: process.env.FRONTEND_DOMAIN,
      },
    });
  }

  /*Contact Us Info to Support*/
  async contactUsInfoToSupport(mailData) {
    await this.sendMailAfterCopy({
      to: mailData.to,
      subject: 'A Contact Us form has been submitted',
      text: '',
      template: '/contactus-info-to-support',
      context: {
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        portalUrl: process.env.FRONTEND_DOMAIN,
        userName: await this.commonUtilsService.toTitleCase(
          mailData.data.userName,
        ),
        userEmail: mailData.data.userEmail,
        userInterestedIn: mailData.data.userInterestedIn,
        description: await this.commonUtilsService.toTitleCase(
          mailData.data.description,
        ),
        location: mailData.data.location,
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
      },
    });
  }
}
