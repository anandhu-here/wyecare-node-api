import { IEmail } from "src/interfaces/entities/email";
import Logger from "src/logger";

const nodemailer = require("nodemailer");

class WyeMailer {
  private transporter: any;

  constructor(email: string, password: string) {
    try {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: email,
          pass: password,
        },
      });
    } catch (error) {
      Logger.error(
        "WyeMailer: constructor",
        "errorInfo:" + JSON.stringify(error)
      );
    }
  }

  public getTransporter() {
    return this.transporter;
  }
  public async sendMail(mailOptions: IEmail) {
    Logger.info(
      "WyeMailer: sendMail",
      "mailOptions:" + JSON.stringify(mailOptions)
    );
    return this.transporter.sendMail(mailOptions);
  }
}

export default WyeMailer;
