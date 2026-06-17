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

# Define coordinates based on 440 width screens
# 1. Underline under header (crop from MUSIC.png)
crop_and_transparent('MUSIC.png', (30, 170, 160, 215), 'docs/assets/brush_underline.png', threshold=35)

# 2. Smiley and notes (from LIVE.png)
crop_and_transparent('LIVE.png', (280, 150, 420, 250), 'docs/assets/live_smiley_note.png', threshold=35)

# 3. Heart icon (from BIO.png)
crop_and_transparent('BIO.png', (40, 95, 80, 125), 'docs/assets/bio_heart.png', threshold=35)

# 4. Music note icon (from BIO.png)
crop_and_transparent('BIO.png', (95, 115, 180, 178), 'docs/assets/bio_note.png', threshold=35)

# 5. Handwriting text "Auch immer dabei... d Johnny" (from BIO.png)
crop_and_transparent('BIO.png', (10, 1100, 300, 1260), 'docs/assets/bio_handwriting.png', threshold=35)

# 6. Underline under "Lärmbeschwerde" (from BOOK.png)
# "Lärmbeschwerde" in BOOK.png is around y=480 to 530, x=150 to 380
crop_and_transparent('BOOK.png', (160, 500, 360, 540), 'docs/assets/book_underline.png', threshold=35)

print("Handwritten assets cropped successfully!")
