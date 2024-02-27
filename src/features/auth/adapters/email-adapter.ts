import * as nodemailer from 'nodemailer';
import { EmailAdapterDto } from '../models/input/EmailAdapterDto';

export const emailAdapter = {
  async sendCode(newUser: EmailAdapterDto): Promise<boolean> {
    const transport = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'uladzislauzasko@gmail.com',
        pass: 'ryko hyxu ntid aqrf',
      },
    });
    await transport.sendMail({
      from: 'Vlad Zasko <uladzislauzasko@gmail.com>',
      to: newUser.email,
      subject: 'Confirmation Code', // Subject line
      html:
        ' <h1>Thanks for your registration</h1>\n' +
        ' <p>To finish registration please follow the link below:\n' +
        `${newUser.confirmationCode}` +
        `     <a href=\'https://somesite.com/confirm-email?code=${newUser.confirmationCode}\'>complete registration</a>` +
        ' </p>', // html body
    });
    return true;
  },
  async sendNewCode(user: EmailAdapterDto): Promise<boolean> {
    const transport = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'uladzislauzasko@gmail.com',
        pass: 'ryko hyxu ntid aqrf',
      },
    });
    await transport.sendMail({
      from: 'Vlad Zasko <uladzislauzasko@gmail.com>',
      to: user.email,
      subject: 'Confirmation Code', // Subject line
      html:
        ' <h1>new code</h1>\n' +
        ' <p>new code:\n' +
        `${user.newCode}` +
        `     <a href=\'https://somesite.com/confirm-email?code=${user.newCode}\'>complete registration</a>\n` +
        ' </p>', // html body
    });
    return true;
  },
  async sendRecoveryCode(user: EmailAdapterDto): Promise<boolean> {
    const transport = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'uladzislauzasko@gmail.com',
        pass: 'ryko hyxu ntid aqrf',
      },
    });
    await transport.sendMail({
      from: 'Vlad Zasko <uladzislauzasko@gmail.com>',
      to: user.email,
      subject: 'Confirmation Code', // Subject line
      html:
        ' <h1>RecoveryCode</h1>\n' +
        ' <p>RecoveryCode:\n' +
        `${user.recoveryCode}` +
        `     <a href=\'https://somesite.com/password-recovery?recoveryCode=${user.recoveryCode}\'>Change password</a>\n` +
        ' </p>', // html body
    });
    return true;
  },
};
