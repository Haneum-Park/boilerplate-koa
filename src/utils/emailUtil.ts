import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';

import { logger } from '@src/logger';
import EMAIL_CONFIG from '@config/emailConfig';

import { IEmail } from './emailUtil.interface';

export * from './emailUtil.interface';

namespace EMAIL_UTIL {
  export const send = async (msg: IEmail): Promise<void> => {
    const transporter = nodemailer.createTransport(smtpTransport(EMAIL_CONFIG.gmail));
    await transporter.sendMail(msg).catch((err) => logger.error(err.message));
  };

  export const justsendMail = async (
    email: string, title: string, message: string,
  ): Promise<void> => {
    const msg = {
      to: email,
      from: EMAIL_CONFIG.gmail.from,
      subject: title,
      text: message,
    };
    await send(msg);
  };
}

export default EMAIL_UTIL;
