import requests
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def extract_imgs_from_html(html, base_url):
    """Extract all potential product image URLs from HTML"""
    found = set()
    soup = BeautifulSoup(html, 'html.parser')

    # img tags
    for img in soup.find_all('img'):
        src = img.get('src', '')
        data_src = img.get('data-src', '')
        for s in [src, data_src]:
            if s:
                full = urljoin(base_url, s)
                if any(e in full.lower() for e in ['.jpg', '.jpeg', '.png', '.webp']):
                    found.add(full)

    # background-image in style
    for el in soup.find_all(style=True):
        m = re.findall(r'url\(["\']?([^)"\']+)["\']?\)', el['style'])
        for u in m:
            full = urljoin(base_url, u)
            if any(e in full.lower() for e in ['.jpg', '.jpeg', '.png', '.webp']):
                found.add(full)

    # JSON data in script tags (look for image URLs)
    for script in soup.find_all('script'):
        if not script.string:
            continue
        # Find URLs in script content
        urls = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp)[^\s"\'<>]*', script.string, re.I)
        found.update(urls)

    return found


def try_site(name, urls):
    all_imgs = set()
    for url in urls:
        try:
            print(f'Fetching {url}...')
            r = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
            print(f'  Status: {r.status_code}, Size: {len(r.text)}')
            imgs = extract_imgs_from_html(r.text, r.url)
            all_imgs.update(imgs)
            print(f'  Images found: {len(imgs)}')
        except Exception as e:
            print(f'  Failed: {e}')
    print(f'\n=== {name}: {len(all_imgs)} total images ===')
    for img in sorted(all_imgs):
        print(f'  {img}')
    return all_imgs


# Test accessible brands
brands = {
    '喜茶': [
        'https://www.heytea.com/',
        'https://www.heytea.com/cn/',
    ],
    '奈雪的茶': [
        'https://www.naixue.com/',
        'https://www.naixue.com/#/menu',
    ],
    '霸王茶姬': [
        'https://chagee.com/',
        'https://chagee.com/menu',
    ],
    '茶百道': [
        'https://www.chabaidao.com/',
    ],
    '古茗': [
        'https://www.guming.com.cn/',
    ],
    '一点点': [
        'https://www.yidiandian.com/',
    ],
}

for name, urls in brands.items():
    try_site(name, urls)
    print()
