import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
  const slug = 'espn-premium';
  const baseUrl = 'https://librefutboltv.su';

  try {
    const pageUrl = `${baseUrl}/${slug}/`;
    const resp = await fetch(pageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!resp.ok) throw new Error(`Failed to load page (${resp.status})`);
    const html = await resp.text();
    const dom = new JSDOM(html);
    const scripts = dom.window.document.querySelectorAll('script');

    let found = null;
    scripts.forEach((s) => {
      const content = s.textContent || '';
      const match = content.match(/https?:\/\/[^"]+\.m3u8\?token=[^"]+/);
      if (match) {
        found = match[0];
      }
    });

    if (!found) {
      return res.status(500).json({ error: 'Stream URL not found in page' });
    }

    return res.status(200).json({ url: found });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

 