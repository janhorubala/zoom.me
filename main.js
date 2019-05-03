require('dotenv').config()
const login = require('facebook-chat-api');
const { createLogger, format, transports } = require('winston');
const nodemailer = require('nodemailer');

const {
  FB_USER,
  FB_PASS,
  RECEIVE,
} = process.env

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: FB_USER,
    pass: FB_PASS,
  }
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
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


