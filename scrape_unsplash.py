import requests
import os
from pathlib import Path
import io
from PIL import Image

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
}

OUTPUT_DIR = Path('images/unsplash')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def download_img(url, filepath):
    try:
        r = requests.get(url, headers={'User-Agent': HEADERS['User-Agent']}, timeout=30)
        if r.status_code == 200 and len(r.content) > 10000:
            img = Image.open(io.BytesIO(r.content))
            # Save as PNG with good quality
            img.save(filepath, 'PNG')
            return len(r.content)
        return 0
    except Exception as e:
        print(f'    Skip: {e}')
        return 0

# Use Unsplash source URLs with search params (free, no API key needed)
# These are direct Unsplash image URLs for "bubble tea" / "奶茶"
bubble_tea_urls = [
    # Bubble tea / milk tea from Unsplash
    'https://images.unsplash.com/photo-1558857563-b371033873b8?w=800&q=80',  # bubble tea
    'https://images.unsplash.com/photo-1525803377221-4f6ccdaa5133?w=800&q=80',  # milk tea
    'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80',  # bubble tea
    'https://images.unsplash.com/photo-1569096651661-820d0de8b4ab?w=800&q=80',  # fruit tea
    'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80',  # drink
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80',  # boba tea
    'https://images.unsplash.com/photo-1613922517335-075e4f6d4a78?w=800&q=80',  # bubble tea
    'https://images.unsplash.com/photo-1589371997443-3cc3e1a70a10?w=800&q=80',  # boba
    'https://images.unsplash.com/photo-1621416528059-635f48ce1c15?w=800&q=80',  # bubble tea
    'https://images.unsplash.com/photo-1593643789344-4b74522b7a9e?w=800&q=80',  # milk tea
    'https://images.unsplash.com/photo-1606836581212-80aa7b0e35a5?w=800&q=80',  # boba
    'https://images.unsplash.com/photo-1587032043648-374df1f94e5b?w=800&q=80',  # bubble tea
    'https://images.unsplash.com/photo-1620189507187-1ecc7e2e9cff?w=800&q=80',  # fruit tea
    'https://images.unsplash.com/photo-1595981267035-7b04ca84a6fd?w=800&q=80',  # drink
    'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=800&q=80',  # ice tea
    'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=800&q=80',  # tea
    'https://images.unsplash.com/photo-1576026533360-a0c82cfef900?w=800&q=80',  # drink
    'https://images.unsplash.com/photo-1494796541004-2f74b27ee55a?w=800&q=80',  # drink
    'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&q=80',  # boba tea
    'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800&q=80',  # tea drink
]

downloaded = 0
for i, url in enumerate(bubble_tea_urls):
    filename = f'unsplash_{i:03d}.png'
    filepath = OUTPUT_DIR / filename
    size = download_img(url, filepath)
    if size:
        downloaded += 1
        print(f'[{i+1}/{len(bubble_tea_urls)}] OK ({size} bytes) -> {filename}')
    else:
        print(f'[{i+1}/{len(bubble_tea_urls)}] Skip')

print(f'\nDownloaded {downloaded} images from Unsplash to {OUTPUT_DIR}')
