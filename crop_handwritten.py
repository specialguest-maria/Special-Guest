import os
from PIL import Image

os.makedirs('docs/assets', exist_ok=True)

def crop_and_transparent(source_path, box, output_path, threshold=40):
    print(f"Cropping {output_path} from {source_path}...")
    img = Image.open(source_path).convert('RGBA')
    cropped = img.crop(box)
    
    # Make black transparent
    datas = cropped.getdata()
    new_data = []
    for item in datas:
        # If it's dark (RGB all below threshold), make it transparent
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            new_data.append((0, 0, 0, 0))
        else:
            # Keep original pixel color (white or green) but ensure solid alpha
            new_data.append((item[0], item[1], item[2], 255))
            
    cropped.putdata(new_data)
    
    # Trim to bounding box of visible pixels
    bbox = cropped.getbbox()
    if bbox:
        cropped = cropped.crop(bbox)
        
    cropped.save(output_path, 'PNG')
    print(f"Saved {output_path} with size {cropped.size}")

def crop_heart_clean(source_path, output_path, threshold=35):
    print(f"Cropping clean heart {output_path} from {source_path}...")
    img = Image.open(source_path).convert('RGBA')
    
    # Bounding box of heart with margin: x=(40, 80), y=(95, 130)
    box = (40, 95, 80, 130)
    cropped = img.crop(box)
    
    pixels = cropped.load()
    w, h = cropped.size
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # Make dark background transparent
            if r < threshold and g < threshold and b < threshold:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                # Erase only the top of the letter "B" of "BIO" to prevent overlap:
                # Letter "B" starts around original x = 70, y = 120
                # In crop starting at (40, 95), this is local x = 30, y = 25.
                if x >= 29 and y >= 24:
                    pixels[x, y] = (0, 0, 0, 0)
                else:
                    pixels[x, y] = (r, g, b, 255)
                    
    # Trim to bounding box of visible pixels
    bbox = cropped.getbbox()
    if bbox:
        cropped = cropped.crop(bbox)
        
    cropped.save(output_path, 'PNG')
    print(f"Saved clean heart {output_path} with size {cropped.size}")

# Define coordinates based on 440 width screens
# 1. Underline under header (crop from MUSIC.png)
crop_and_transparent('MUSIC.png', (30, 170, 160, 215), 'docs/assets/brush_underline.png', threshold=35)

# 2. Smiley and notes (from LIVE.png)
crop_and_transparent('LIVE.png', (280, 150, 420, 250), 'docs/assets/live_smiley_note.png', threshold=35)

# 3. Heart icon (from BIO.png) - Cleaned from overlapping BIO letters
crop_heart_clean('BIO.png', 'docs/assets/bio_heart.png', threshold=35)

# 4. Music note icon (from BIO.png)
crop_and_transparent('BIO.png', (95, 115, 180, 178), 'docs/assets/bio_note.png', threshold=35)

# 5. Handwriting text "Auch immer dabei... d Johnny" (from BIO.png)
crop_and_transparent('BIO.png', (10, 1100, 300, 1260), 'docs/assets/bio_handwriting.png', threshold=35)

# 6. Underline under "Lärmbeschwerde" (from BOOK.png)
# "Lärmbeschwerde" in BOOK.png is around y=480 to 530, x=150 to 380
crop_and_transparent('BOOK.png', (160, 500, 360, 540), 'docs/assets/book_underline.png', threshold=35)

print("Handwritten assets cropped successfully!")
