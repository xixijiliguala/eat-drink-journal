import requests
from bs4 import BeautifulSoup
import json
import base64
import os
import re
from urllib.parse import urljoin
from pathlib import Path

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

OUTPUT_DIR = Path('images/luckin')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def scrape_menu(url):
    print(f'Fetching: {url}')
    r = requests.get(url, headers=HEADERS, timeout=15)
    r.encoding = 'utf-8'
    soup = BeautifulSoup(r.text, 'html.parser')

    found_urls = set()

    # Method 1: Schema.org JSON-LD
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(script.string)
            if isinstance(data, dict):
                if '@graph' in data:
                    items = data['@graph']
                elif isinstance(data.get('@type'), str):
                    items = [data]
                else:
                    items = []
                for item in items:
                    if isinstance(item, dict) and 'image' in item:
                        img = item['image']
                        if isinstance(img, str):
                            found_urls.add(img)
                        elif isinstance(img, list):
                            for u in img:
                                if isinstance(u, str):
                                    found_urls.add(u)
                    if isinstance(item, dict) and 'name' in item:
                        pass  # name exists
        except:
            pass

    # Method 2: window._INIT_DATA_ (base64 encoded JSON)
    for script in soup.find_all('script'):
        if script.string and '_INIT_DATA_' in script.string:
            m = re.search(r'window\._INIT_DATA_\s*=\s*["\']([^"\']+)["\']', script.string)
            if m:
                try:
                    decoded = base64.b64decode(m.group(1)).decode('utf-8')
                    data = json.loads(decoded)
                    # Search for image URLs in the data recursively
                    def find_urls(obj, depth=0):
                        if depth > 10:
                            return
                        if isinstance(obj, str):
                            if obj.startswith('http') and any(ext in obj.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                                found_urls.add(obj)
                        elif isinstance(obj, dict):
                            for k, v in obj.items():
                                if 'img' in k.lower() or k.lower() == 'image':
                                    if isinstance(v, str) and v.startswith('http'):
                                        found_urls.add(v)
                                find_urls(v, depth + 1)
                        elif isinstance(obj, list):
                            for item in obj:
                                find_urls(item, depth + 1)
                    find_urls(data)
                except:
                    pass

    # Method 3: Direct img tags
    for img in soup.find_all('img'):
        src = img.get('src', '')
        if src:
            full = urljoin(url, src)
            found_urls.add(full)

    # Filter to only image files
    filtered = {u for u in found_urls if any(e in u.lower() for e in ['.jpg', '.jpeg', '.png', '.webp'])}
    return list(filtered)


def download_images(urls, prefix=''):
    downloaded = []
    for i, url in enumerate(urls):
        url_part = url.split('/')[-1].split('?')[0]
        ext = url_part.split('.')[-1] if '.' in url_part else 'jpg'
        filename = f'{prefix}luckin_{i}.{ext}'
        filepath = OUTPUT_DIR / filename

        try:
            print(f'  [{i+1}/{len(urls)}] {url[:80]}...')
            r = requests.get(url, headers=HEADERS, timeout=30)
            if r.status_code == 200 and len(r.content) > 5000:
                with open(filepath, 'wb') as f:
                    f.write(r.content)
                downloaded.append(str(filepath))
                print(f'    -> OK ({len(r.content)} bytes)')
            else:
                print(f'    -> Skip (status={r.status_code}, size={len(r.content)})')
        except Exception as e:
            print(f'    -> ERROR: {e}')
    return downloaded


if __name__ == '__main__':
    urls_to_try = [
        'https://www.luckincoffee.com/menu',
        'https://www.luckincoffee.com.sg/menu',
        'https://www.luckincoffee.com/',
        'https://www.luckincoffee.com.sg/',
    ]

    all_imgs = set()
    for u in urls_to_try:
        try:
            imgs = scrape_menu(u)
            all_imgs.update(imgs)
        except Exception as e:
            print(f'Failed to fetch {u}: {e}')

    print(f'\nTotal unique image URLs: {len(all_imgs)}')
    downloaded = download_images(list(all_imgs))
    print(f'\nDownloaded {len(downloaded)} images to {OUTPUT_DIR}')
