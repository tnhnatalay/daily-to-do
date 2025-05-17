const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Gmail SMTP ayarları (kendi mail ve şifrenle değiştir)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ttunahanatalay@gmail.com',
    pass: 'xuux plyq xehr asyt '
  }
});

app.post('/send-email', (req, res) => {
  const { completedTasks } = req.body;
  if (!completedTasks || completedTasks.length === 0) {
    return res.status(400).send('Görev yok');
  }

  const mailOptions = {
    from: 'ttunahanatalay@gmail.com',
    to: 'tnhnatalay@gmail.com',
    subject: 'Tamamlanan Görevler',
    text: completedTasks.join('\n')
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Mail gönderme hatası:', error);
      return res.status(500).send('Mail gönderilemedi');
    }
    alert(res.send('Mail başarıyla gönderildi'))
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
