import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
  const slug = 'tv-publica';
  const baseUrl = 'https://librefutboltv.su';
 
   try {
     const pageUrl = `${baseUrl}/${slug}/`;
     const resp = await fetch(pageUrl, {
       headers: { 'User-Agent': 'Mozilla/5.0' }
     });
 
     if (!resp.ok) throw new Error(`Failed to load page (${resp.status})`);
 
     const html = await resp.text();
     const dom = new JSDOM(html);
     const scripts = dom.window.document.querySelectorAll('script');
 
     let streamUrl = null;
     scripts.forEach((s) => {
       const content = s.textContent || '';
       const match = content.match(/https?:\/\/[^"]+\.m3u8\?token=[^"]+/);
       if (match) {
         streamUrl = match[0];
       }
     });
 
     if (!streamUrl) {
       return res.status(500).json({ error: 'Stream URL not found in page' });
     }
 
     // Relay el contenido del .m3u8 con headers necesarios
     const streamResp = await fetch(streamUrl, {
       headers: {
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
         'Referer': 'https://envivofy.com/',
         'Origin': 'https://envivofy.com'
       }
     });
 
     if (!streamResp.ok) throw new Error(`Failed to fetch stream (${streamResp.status})`);
 
     const contentType = streamResp.headers.get('content-type') || 'application/vnd.apple.mpegurl';
     const body = await streamResp.text();
 
     res.setHeader('Content-Type', contentType);
     return res.status(200).send(body);
 
   } catch (err) {
     console.error(err);
     return res.status(500).json({ error: err.message });
   }
 }
 
