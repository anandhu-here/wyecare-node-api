import WyeMailer from "src/app/Services/email.service";
import { IEmail } from "src/interfaces/entities/email";

class EmailServices {
    private readonly transporter: WyeMailer;
    private readonly email: string;
    private readonly password: string;

    constructor() {
        this.email = process.env.EMAIL_USER;
        this.password = process.env.EMAIL_PASS;
        this.transporter = new WyeMailer(this.email, this.password).getTransporter();
    }

    public sendEmail = async (emailOptions: IEmail) => {
        try {
            const mailOptions: IEmail = {
                from: emailOptions.from,
                to: emailOptions.to,
                subject: emailOptions.subject,
                text: emailOptions.text,
                html: emailOptions.html,
            };
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            throw new Error(`Failed to send email: ${error}`);
        }
    }
}

export default EmailServices;