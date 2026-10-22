import os
from PIL import Image, ImageFilter

def make_transparent(img, threshold=25, softness=15):
    """Converts dark/black background to alpha channel with smooth antialiased border."""
    rgba = img.convert('RGBA')
    datas = rgba.getdata()
    new_data = []
    for item in datas:
        # brightness calculation
        brightness = (item[0] + item[1] + item[2]) / 3
        if brightness <= threshold:
            new_data.append((0, 0, 0, 0))
        elif brightness < threshold + softness:
            alpha = int(255 * (brightness - threshold) / softness)
            new_data.append((item[0], item[1], item[2], alpha))
        else:
            new_data.append(item)
    rgba.putdata(new_data)
    return rgba

def crop_and_trim(img, box):
    cropped = img.crop(box)
    rgba = make_transparent(cropped)
    # Autotrim transparent borders
    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)
    return rgba

os.makedirs('public/assets', exist_ok=True)

# 1. Background (1280x720)
bg = Image.open('/Users/ardayigit/.gemini/antigravity-ide/brain/394c21f2-a018-4905-bc6d-8f28bdeac8a2/mine_cave_bg_1792538808642.jpg')
bg_resized = bg.resize((1280, 720), Image.Resampling.LANCZOS)
bg_resized.save('public/assets/mine_cave_bg.jpg', quality=95)
print("Saved mine_cave_bg.jpg")

# 2. Miners
duo = Image.open('/Users/ardayigit/.gemini/antigravity-ide/brain/394c21f2-a018-4905-bc6d-8f28bdeac8a2/miner_duo_1792538830943.jpg')
# P1: Left half (approx 50 to 480, y: 80 to 900)
p1_img = crop_and_trim(duo, (30, 60, 480, 920))
p1_img.save('public/assets/miner_p1.png')
print("Saved miner_p1.png", p1_img.size)

# P2: Right half (approx 500 to 980, y: 80 to 900)
p2_img = crop_and_trim(duo, (490, 60, 970, 920))
p2_img.save('public/assets/miner_p2.png')
print("Saved miner_p2.png", p2_img.size)

# 3. Items
items = Image.open('/Users/ardayigit/.gemini/antigravity-ide/brain/394c21f2-a018-4905-bc6d-8f28bdeac8a2/miner_items_sheet_1792538859153.jpg')
# 3x3 grid: each cell is roughly ~340x340
# Cell 0,0: Gold Nugget (0, 0, 340, 340)
gold_img = crop_and_trim(items, (20, 20, 340, 340))
gold_img.save('public/assets/gold_nugget.png')
print("Saved gold_nugget.png", gold_img.size)

# Cell 0,1: Diamond (340, 0, 680, 340)
diamond_img = crop_and_trim(items, (340, 20, 680, 340))
diamond_img.save('public/assets/diamond.png')
print("Saved diamond.png", diamond_img.size)

# Cell 0,2: TNT (680, 0, 1020, 340)
tnt_img = crop_and_trim(items, (680, 20, 1020, 340))
tnt_img.save('public/assets/tnt.png')
print("Saved tnt.png", tnt_img.size)

# Cell 1,0: Mystery Box (0, 340, 340, 680)
box_img = crop_and_trim(items, (20, 340, 340, 680))
box_img.save('public/assets/mystery_box.png')
print("Saved mystery_box.png", box_img.size)

# Cell 1,1: Rock (340, 340, 680, 680)
rock_img = crop_and_trim(items, (340, 340, 680, 680))
rock_img.save('public/assets/rock.png')
print("Saved rock.png", rock_img.size)

# Cell 1,2: Claw Open (680, 340, 1020, 680)
claw_open_img = crop_and_trim(items, (680, 340, 1020, 680))
claw_open_img.save('public/assets/claw_open.png')
print("Saved claw_open.png", claw_open_img.size)

# Cell 2,2: Claw Closed / Grabbing (680, 680, 1020, 1020)
claw_closed_img = crop_and_trim(items, (680, 680, 1020, 1020))
claw_closed_img.save('public/assets/claw_closed.png')
print("Saved claw_closed.png", claw_closed_img.size)

# 4. Minecart
cart = Image.open('/Users/ardayigit/.gemini/antigravity-ide/brain/394c21f2-a018-4905-bc6d-8f28bdeac8a2/minecart_winch_1792538891298.jpg')
cart_img = crop_and_trim(cart, (50, 100, 950, 950))
cart_img.save('public/assets/minecart.png')
print("Saved minecart.png", cart_img.size)

print("All assets successfully processed and saved!")
