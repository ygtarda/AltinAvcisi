import sys
from PIL import Image, ImageFilter
import numpy as np

def remove_green_screen(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img, dtype=np.float32)

    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # Chroma key algorithm:
    # A pixel is green if g is high and significantly larger than r and b
    # Let's compute green difference
    max_rb = np.maximum(r, b)
    green_diff = g - max_rb

    # Thresholds:
    # green_diff > 40 is definitely green
    # 15 < green_diff <= 40 is transition / soft edge
    alpha = np.ones_like(g) * 255.0
    
    mask_full = green_diff >= 35
    mask_soft = (green_diff > 10) & (green_diff < 35)

    alpha[mask_full] = 0.0
    alpha[mask_soft] = 255.0 * (1.0 - (green_diff[mask_soft] - 10) / 25.0)

    # De-spill green edge: if any green spill exists near borders, clamp g to max_rb
    # where green_diff > 0
    spill = green_diff > 0
    data[spill, 1] = np.maximum(np.minimum(g[spill], max_rb[spill] + 5), 0)

    data[:, :, 3] = alpha
    result = Image.fromarray(data.astype(np.uint8), mode="RGBA")

    # Autotrim transparent bbox with 4px padding
    bbox = result.getbbox()
    if bbox:
        # add tiny margin if within bounds
        w, h = result.size
        pad = 6
        crop_box = (
            max(0, bbox[0] - pad),
            max(0, bbox[1] - pad),
            min(w, bbox[2] + pad),
            min(h, bbox[3] + pad)
        )
        result = result.crop(crop_box)

    result.save(output_path, "PNG")
    print(f"Processed {input_path} -> {output_path}, final size: {result.size}")

remove_green_screen(
    "/Users/ardayigit/.gemini/antigravity-ide/brain/bf88619b-7f52-45b8-8ca6-8c3a38eeb022/penguin_diamond_raw_1792793600043.jpg",
    "public/assets/test_penguin_diamond.png"
)
remove_green_screen(
    "/Users/ardayigit/.gemini/antigravity-ide/brain/bf88619b-7f52-45b8-8ca6-8c3a38eeb022/penguin_dynamite_raw_1792793631092.jpg",
    "public/assets/test_penguin_dynamite.png"
)
