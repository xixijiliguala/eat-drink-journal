import requests
from bs4 import BeautifulSoup
import os
import re
from urllib.parse import urljoin
from pathlib import Path

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

OUTPUT_DIR = Path('images/mxbc')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def scrape_page(url):
    print(f'Fetching: {url}')
    r = requests.get(url, headers=HEADERS, timeout=15)
    r.encoding = 'utf-8'
    soup = BeautifulSoup(r.text, 'html.parser')

    imgs = soup.find_all('img')
    product_imgs = []

    for img in imgs:
        src = img.get('src', '')
        if not src:
            continue
        full_url = urljoin(url, src)
        # Filter: only oss.mxbc.com images, exclude SVG and known UI images
        if 'oss.mxbc.com' not in full_url:
            continue
        if full_url.endswith('.svg'):
            continue
        # Skip very small UI elements based on path patterns
        if '/static/' in src:
            continue

        # Try to get a name from alt, or nearby text
        alt = img.get('alt', '')
        name = alt.strip() if alt else ''

        # Look for nearby text (parent/sibling text)
        if not name:
            parent = img.parent
            if parent:
                parent_text = parent.get_text(strip=True)
                if parent_text and len(parent_text) < 50:
                    name = parent_text

        product_imgs.append((full_url, name))

    return product_imgs

def download_images(product_imgs, prefix=''):
    downloaded = []
    seen = set()

    for i, (url, name) in enumerate(product_imgs):
        # Create filename from URL or name
        if name:
            safe_name = re.sub(r'[<>:"/\\|?*]', '', name)[:40]
        else:
            safe_name = ''

        # Extract original filename from URL
        url_part = url.split('/')[-1].split('?')[0]
        ext = url_part.split('.')[-1] if '.' in url_part else 'jpg'

        if safe_name:
            filename = f'{prefix}{safe_name}_{i}.{ext}'
        else:
            filename = f'{prefix}mxbc_{i}.{ext}'

        filepath = OUTPUT_DIR / filename

        # Skip duplicates
        if filename in seen:
            continue
        seen.add(filename)

        try:
            print(f'  Downloading [{i+1}/{len(product_imgs)}]: {filename}')
            r = requests.get(url, headers=HEADERS, timeout=30)
            if r.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(r.content)
                downloaded.append(str(filepath))
                print(f'    -> OK ({len(r.content)} bytes)')
            else:
                print(f'    -> HTTP {r.status_code}')
        except Exception as e:
            print(f'    -> ERROR: {e}')

    return downloaded


if __name__ == '__main__':
    urls = [
        'https://www.mxbc.com/product_strength.html',
        'https://www.mxbc.com/',  # homepage for more images
    ]

    all_imgs = []
    for url in urls:
        imgs = scrape_page(url)
        all_imgs.extend(imgs)

    # Deduplicate
    unique = {}
    for url, name in all_imgs:
        if url not in unique:
            unique[url] = name
        elif name and not unique[url]:
            unique[url] = name

    all_imgs = [(url, name) for url, name in unique.items()]
    print(f'\nTotal unique product images: {len(all_imgs)}')

    downloaded = download_images(all_imgs)
    print(f'\nDownloaded {len(downloaded)} images to {OUTPUT_DIR}')
