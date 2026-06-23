from rembg import remove, new_session
from PIL import Image, ImageFilter
import numpy as np
import os
from pathlib import Path

INPUT_ROOT = Path('images')
OUTPUT_ROOT = Path('stickers')
REMOVED_ROOT = Path('images/nobg')
OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
REMOVED_ROOT.mkdir(parents=True, exist_ok=True)

MIN_SIZE_BYTES = 20000

def add_sticker_border(img, border_size=25, shadow_offset=6, shadow_blur=10):
    """Add white border and shadow using numpy for speed"""
    img = img.convert('RGBA')
    orig_w, orig_h = img.size

    total_pad = border_size + shadow_offset
    new_w = orig_w + total_pad * 2
    new_h = orig_h + total_pad * 2

    alpha_arr = np.array(img.split()[3], dtype=np.float32)

    # Shadow: paste alpha on larger canvas, offset, blur
    shadow_mask = np.zeros((new_h, new_w), dtype=np.float32)
    sy, sx = total_pad + shadow_offset, total_pad + shadow_offset
    shadow_mask[sy:sy+orig_h, sx:sx+orig_w] = alpha_arr
    shadow_img = Image.fromarray(shadow_mask.astype(np.uint8), mode='L')
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(shadow_blur))
    shadow_arr = np.array(shadow_img, dtype=np.float32) / 255.0

    # White border: dilate original alpha, then subtract original
    border_canvas = np.zeros((new_h, new_w), dtype=np.float32)
    by, bx = total_pad, total_pad
    border_canvas[by:by+orig_h, bx:bx+orig_w] = alpha_arr / 255.0
    # Simple dilation via max filter on binary mask
    border_binary = (border_canvas > 0.5).astype(np.float32)
    border_img_pil = Image.fromarray((border_binary * 255).astype(np.uint8), mode='L')
    dilated = np.array(border_img_pil.filter(ImageFilter.MaxFilter(border_size * 2 + 1)), dtype=np.float32) / 255.0
    # Subtract original to get outline only
    border_arr = np.maximum(dilated - border_binary, 0)

    # Build RGBA result
    result = np.zeros((new_h, new_w, 4), dtype=np.float32)

    # Shadow layer (black with transparency from shadow_arr)
    shadow_alpha = shadow_arr * 0.35
    result[:, :, 0] = 0  # R
    result[:, :, 1] = 0  # G
    result[:, :, 2] = 0  # B
    result[:, :, 3] = shadow_alpha

    # White border layer (overlay)
    border_alpha = border_arr
    for c in range(3):
        result[:, :, c] = result[:, :, c] * (1 - border_alpha) + 1.0 * border_alpha
    result[:, :, 3] = np.maximum(result[:, :, 3], border_alpha)

    # Original subject on top
    rgba_arr = np.array(img, dtype=np.float32) / 255.0
    subj_alpha = rgba_arr[:, :, 3]
    for c in range(4):
        canvas_slice = result[by:by+orig_h, bx:bx+orig_w, c]
        result[by:by+orig_h, bx:bx+orig_w, c] = (
            canvas_slice * (1 - subj_alpha) + rgba_arr[:, :, c] * subj_alpha
        )

    result = (result * 255).clip(0, 255).astype(np.uint8)
    return Image.fromarray(result, mode='RGBA')


def process_images():
    session = new_session('u2net')

    all_files = []
    for subdir in INPUT_ROOT.iterdir():
        if subdir.is_dir() and subdir.name != 'nobg':
            for f in subdir.iterdir():
                if f.is_file() and f.stat().st_size > MIN_SIZE_BYTES:
                    all_files.append(f)

    print(f'Processing {len(all_files)} images (>{MIN_SIZE_BYTES//1024}KB)...')

    processed = 0
    for i, filepath in enumerate(all_files):
        try:
            input_img = Image.open(filepath).convert('RGBA')

            # Skip very small images
            w, h = input_img.size
            if w < 50 or h < 50:
                continue

            # Remove background
            output = remove(input_img, session=session)

            # Save no-bg version
            nobg_path = REMOVED_ROOT / f'{filepath.stem}_nobg.png'
            output.save(nobg_path, 'PNG')

            # Add sticker border
            sticker = add_sticker_border(output)
            sticker_path = OUTPUT_ROOT / f'{filepath.stem}_sticker.png'
            sticker.save(sticker_path, 'PNG')

            processed += 1
            if processed % 10 == 0:
                print(f'  [{processed}/{len(all_files)}] {filepath.name}')

        except Exception as e:
            print(f'  ERROR [{filepath.name}]: {e}')

    print(f'\nDone! Processed {processed} images.')
    print(f'  No-background: {REMOVED_ROOT}')
    print(f'  Stickers:       {OUTPUT_ROOT}')


if __name__ == '__main__':
    process_images()
