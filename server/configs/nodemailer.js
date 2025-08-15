import nodemailer from 'nodemailer';

// 1. Validate environment variables at startup
const { SMTP_USER, SMTP_PASS, SENDER_EMAIL } = process.env;

if (!SMTP_USER || !SMTP_PASS || !SENDER_EMAIL) {
    throw new Error("Missing required email environment variables (SMTP_USER, SMTP_PASS, SENDER_EMAIL).");
}

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

// 2. Add a try...catch block for robust error handling
export const sendEmail = async ({ to, subject, body }) => {
    try {
        const response = await transporter.sendMail({
            from: SENDER_EMAIL,
            to,
            subject,
            html: body,
        });
        console.log("Email sent successfully: ", response.messageId);
        return response;
    } catch (error) {
        console.error("Error sending email:", error);
        // Re-throw the error so the calling function knows the email failed to send
        throw new Error("Failed to send email.");
    }
};