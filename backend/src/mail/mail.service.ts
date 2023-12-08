import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const mailHost = '';
    const mailUser = 'youremail'; // Replace with your email
    const mailPass = 'youremail password'; // Replace with your email password
    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: 25,
      secure: false,
      secureConnection: false,
      SmtpClientAuthenticationDisabled: false,
      service: 'gmail',
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });
  }

  async sendMail(mailOptions: MailOptions): Promise<void> {
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw error;
    }
  }
}
