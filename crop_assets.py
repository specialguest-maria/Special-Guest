import os
from PIL import Image

# Create assets directory
os.makedirs('assets', exist_ok=True)

def crop_and_transparent(source_path, box, output_path, make_transparent=True, threshold=40):
    \"\"\"
    Crops an image from source_path using the box (left, upper, right, lower),
    optionally makes the black pixels transparent, trims it to the tight bounding box,
    and saves to output_path.
    \"\"\"
    print(f"Processing {output_path} from {source_path}...")
    img = Image.open(source_path).convert('RGBA')
    cropped = img.crop(box)
    
    if make_transparent:
        datas = cropped.getdata()
        new_data = []
        for item in datas:
            # Check if it's close to black
            if item[0] < threshold and item[1] < threshold and item[2] < threshold:
                new_data.append((0, 0, 0, 0)) # fully transparent
            else:
                new_data.append(item)
        cropped.putdata(new_data)
        
        # Trim empty space (bounding box of non-transparent pixels)
        bbox = cropped.getbbox()
        if bbox:
            cropped = cropped.crop(bbox)
            
    cropped.save(output_path, 'PNG')
    print(f"Saved {output_path} with size {cropped.size}")

# 1. Band photo (HOME.png) - no transparency needed, but we can do a nice crop
img_home = Image.open('HOME.png')
w, h = img_home.size
# Crop band photo from HOME.png (y=360 to y=698)
crop_and_transparent('HOME.png', (0, 360, w, 698), 'assets/band_photo.png', make_transparent=False)

# 2. Logo (HOME.png) - y=100 to y=355
crop_and_transparent('HOME.png', (0, 100, w, 355), 'assets/logo.png', make_transparent=True, threshold=35)

# 3. Bird icon (HOME.png) - y=715 to y=890
crop_and_transparent('HOME.png', (0, 715, w, 890), 'assets/bird.png', make_transparent=True, threshold=35)

# 4. Bio Slider photo 1 (BIO.png) - x=0 to 344, y=262 to 510
crop_and_transparent('BIO.png', (0, 262, 344, 510), 'assets/bio_photo1.png', make_transparent=False)

# 5. Live Smiley & Notes (LIVE.png) - x=200 to 440, y=140 to 260
crop_and_transparent('LIVE.png', (200, 140, 440, 260), 'assets/live_smiley_note.png', make_transparent=True, threshold=35)

# 6. Heart icon above BIO (BIO.png) - x=10 to 120, y=60 to 110
crop_and_transparent('BIO.png', (10, 60, 120, 110), 'assets/bio_heart.png', make_transparent=True, threshold=35)

# 7. Music note next to BIO (BIO.png) - x=120 to 190, y=70 to 135
crop_and_transparent('BIO.png', (120, 70, 190, 135), 'assets/bio_note.png', make_transparent=True, threshold=35)

# 8. Bio Handwriting text & arrow (BIO.png) - x=0 to 320, y=1100 to 1260
# Exclude the bird (which is on the right)
crop_and_transparent('BIO.png', (0, 1100, 320, 1260), 'assets/bio_handwriting.png', make_transparent=True, threshold=35)

# 9. Chalk underline under headers (MUSIC.png) - crop the underline brush stroke under "MUSIC"
# In MUSIC.png, "MUSIC" title is at the top left. Let's find y range of the underline.
# Row analysis for MUSIC.png to find underline
# Let's crop a broad area for the underline: x=30 to 160, y=180 to 220
crop_and_transparent('MUSIC.png', (30, 175, 160, 215), 'assets/chalk_underline.png', make_transparent=True, threshold=35)

print("All assets cropped successfully!")
