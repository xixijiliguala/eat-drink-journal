import requests
import os
import re
from pathlib import Path

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

OUTPUT_DIR = Path('images/chagee')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# CHAGEE image URLs from CDN (direct, no Next.js proxy)
chagee_imgs = [
    'https://img-official-prod-cn.chagee.com/web/uploads/20240711/8ad0bcfc-5fda-4e50-9985-895f65f49f45.png',
    'https://img-official-prod-cn.chagee.com/web/uploads/20240712/998f1cc8-c575-4463-9577-fe268aa01c22.png',
    'https://img-official-prod-cn.chagee.com/web/uploads/20240715/660ad49a-5d35-40c1-a096-9735efc6db47.png',
    'https://img-official-prod-cn.chagee.com/web/uploads/20240715/a6029133-3165-4185-a987-233633c92ecc.jpg',
    'https://img-official-prod-cn.chagee.com/web/uploads/20240715/a8a3003b-3668-4431-ae2b-869ee8871582.png',
    'https://img-official-prod-cn.chagee.com/web/uploads/20240802/117eea14-9c2a-4aaa-ae2e-84d19b42bc40.png',
    'https://img-official-prod-cn.chagee.com/web/uploads/20240902/b077fece-0344-4b89-9306-8b078e07e45f.png',
    'https://img-official-prod-cn.chagee.com/web/uploads/20241116/5a54c0ee-e410-4372-b2e4-5aa93b95f022.jpeg',
    'https://img-official-prod-cn.chagee.com/web/uploads/20241116/cd81597c-2873-4ad3-8fe4-9aa980fcf5c0.jpeg',
    'https://img-official-prod-cn.chagee.com/web/uploads/20241205/43bec20c-cfc2-49f1-bb1f-875066fc5f08.jpeg',
    'https://img-official-prod-cn.chagee.com/web/uploads/20241207/0b3f7628-c272-4da2-9e96-4f3c43b49801.png',
    'https://img-official-prod-cn.chagee.com/web/uploads/20241207/0da3fbb3-c260-4870-b54d-ac47290902db.png',
    'https://img-official-prod-cn.chagee.com/web/uploads/20241207/94b39a85-fa61-4d6f-b95f-e343e97da654.png',
    'https://img-official-prod-cn.chagee.com/web/uploads/20241207/9c8a8a53-64a8-4701-9968-2109066589f9.png',
    'https://img-official-prod-cn.chagee.com/web/uploads/20241207/b1447779-3e27-4955-97fd-39a64d380a4d.png',
    'https://img-official-prod-cn.chagee.com/web/uploads/20241207/bf4f6ed9-d240-4ee2-b81d-bb6e33fb1b38.png',
]

downloaded = 0
for i, url in enumerate(chagee_imgs):
    url_part = url.split('/')[-1]
    filepath = OUTPUT_DIR / url_part
    try:
        print(f'[{i+1}/{len(chagee_imgs)}] {url_part}...')
        r = requests.get(url, headers=HEADERS, timeout=30)
        if r.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(r.content)
            downloaded += 1
            print(f'  -> OK ({len(r.content)} bytes)')
        else:
            print(f'  -> HTTP {r.status_code}')
    except Exception as e:
        print(f'  -> ERROR: {e}')

print(f'\nDownloaded {downloaded} CHAGEE images to {OUTPUT_DIR}')
