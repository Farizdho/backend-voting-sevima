const fetch = require('node-fetch');

async function sendTelegram(chatId, message) {
  try {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
    if (!res.ok) throw new Error('Failed to send Telegram');
    console.log(`📱 Telegram sent to ${chatId}`);
  } catch (err) {
    console.error('Telegram error:', err);
  }
}

module.exports = { sendEmail, sendTelegram };
