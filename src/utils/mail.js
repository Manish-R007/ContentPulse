import Mailgen from "mailgen";
import nodemailer from "nodemailer"

const sendMail = async (options) => {
    const mailGenerator = new Mailgen({
        theme : "default",
        product : {
            name : "Task Manager",
            link : "https://taskmanager.com",
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHtml = mailGenerator.generate(options.mailgenContent)

    const transporter = nodemailer.createTransport( {
        host : process.env.MAILTRAP_SMTP_HOST,
        port : process.env.MAILTRAP_SMTP_PORT,
        auth : {  
            user : process.env.MAILTRAP_SMTP_USER,
            pass : process.env.MAILTRAP_SMTP_PASS  
        }
    })

    const mail = {
        from : "developermanishr@gmail.com",
        to : options.email,
        subject : options.subject,
        text : emailTextual,
        html : emailHtml
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Error sending email: ", error);
        
    }
}

const emailVerificationMailgenContent = (username , verificationurl) => {
    return {
        body : {
            name : username,
            intro : "Welcome to oyr app ! we are excitedbto have you on board.",
            action : {
                instructions : "To get started with our app, please click the button below to verify your email address.",
                button : {
                    color : "#22BC66",
                    text : "Verify your email",
                    link : verificationurl
                }
            }
        },
        outro : "Need help, or have questions ? Just reply to this email, we are always happy to help."
    }
}

const forgotPasswordMailgenContent = (username , passwordRereshUrl) => {
    return {
        body : {
            name : username,
            intro : "You have requested to reset your password.",
            action : {
                instructions : "To reset your password, please click the button below.",
                button : {
                    color : "#22BC66",
                    text : "Reset Password",
                    link : passwordRereshUrl
                }
            }
        },
        outro : "Need help, or have questions ? Just reply to this email, we are always happy to help."
    }
}

export  {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendMail
}