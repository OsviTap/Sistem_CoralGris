const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // ejemplo: "smtp.gmail.com"
  port: process.env.EMAIL_PORT, // ejemplo: 587
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER, // tu correo
    pass: process.env.EMAIL_PASSWORD // tu contraseña o contraseña de aplicación
  },
  tls: {
    rejectUnauthorized: false
  }
})

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Sistema Coral Gris" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    })
    console.log('Email enviado:', info.messageId)
    return info
  } catch (error) {
    console.error('Error al enviar email:', error)
    throw error
  }
}

module.exports = { sendEmail } 