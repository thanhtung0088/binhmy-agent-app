// /api/gemini.js
// Vercel Serverless Function — proxy gọi Gemini API để các Agent trong app
// không cần lộ API key ra phía trình duyệt.
//
// Cách cấu hình:
// 1. Lấy API key miễn phí tại https://aistudio.google.com/apikey
// 2. Trên Vercel dashboard > Project > Settings > Environment Variables,
//    thêm biến GEMINI_API_KEY = <key vừa lấy>
// 3. Redeploy lại project.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Chỉ hỗ trợ phương thức POST' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY trên Vercel' });
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Thiếu nội dung prompt' });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(502).json({ error: 'Gemini API lỗi', detail: errText });
    }

    const data = await geminiRes.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      '(Không nhận được nội dung từ Gemini)';

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: 'Lỗi máy chủ', detail: String(err) });
  }
}
