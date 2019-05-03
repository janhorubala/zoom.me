require('dotenv').config()
const login = require('facebook-chat-api');
const winston = require('winston');
const nodemailer = require('nodemailer');

const FB_USER = process.env.FB_USER
const FB_PASS = process.env.FB_PASS
const RECEIVE = process.env.RECEIVE

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: FB_USER,
    pass: FB_PASS,
  }
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

login({ email: FB_USER, password: FB_PASS }, (err, api) => {
  if (err) {
    logger.error('### facebook-chat-api error')
    logger.error(err)
    return;
  }
  api.listen((err, message) => {
    if (err) {
      logger.error('### facebook-chat-api error')
      logger.error(err)
      return;
    }
    logger.info('get new message')

    if (message.attachments && message.attachments.length) {
      logger.info('get new attachment')

      for (let i = 0; i < message.attachments.length; i++) {
          transporter.sendMail({
            from: 'ramkazoome@gmail.com',
            to: RECEIVE,
            subject: 'image',
            attachments: [
              {
                filename: 'image.jpg',
                path: message.attachments[i].url
              },
            ]
          }, function(err, info) {
            if (err) {
              api.sendMessage('🍄', message.threadID);
              logger.error('### nodemailer error')
              logger.error(err)
            }
            else {
              api.sendMessage('🍓', message.threadID);
            }
          });
        }
      }
    });
});


