import os, urllib.request, urllib.parse, json, time, sys

IMAGE_API = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'
OUT_DIR = r'C:\code\购物网站\public\images'

os.makedirs(OUT_DIR, exist_ok=True)

items = [
    ('ge-101', 'premium over-ear noise cancelling headphones in matte charcoal and coral accents, isolated product photography on warm light gray studio background, realistic commercial ecommerce image, soft natural shadow, front three-quarter view, no text, no logo'),
    ('ge-102', 'minimal sculptural desk lamp with frosted glass shade and brushed silver base, switched on with warm glow, isolated product photography on pale warm gray background, realistic ecommerce image, subtle shadow, no text, no logo'),
    ('ge-103', 'compact 75 percent mechanical keyboard, off-white keycaps with teal and coral accent keys, premium product photography, warm neutral studio background, realistic ecommerce image, top three-quarter view, no text, no logo'),
    ('ge-104', 'modern structured commuter backpack in deep forest green recycled nylon, premium realistic product photography on warm light gray background, no text, no logo'),
    ('ge-105', 'chunky knit cardigan in off-white boucle wool, draped elegantly on invisible mannequin, premium fashion product photography on warm neutral background, no text, no logo'),
    ('ge-106', 'compact cylindrical portable bluetooth speaker in deep teal fabric with bright lime carry loop, realistic commercial product photography on warm neutral background, no text, no logo'),
    ('ge-107', 'handcrafted ceramic coffee mug with soft curved handle, matte off-white glaze and small teal accent, realistic ecommerce product photography on pale warm background, no text, no logo'),
    ('ge-108', 'sleek vacuum insulated travel bottle in brushed stainless steel and burnt coral cap, premium realistic product photography on light gray studio surface, no text, no logo'),
    ('ge-109', 'lightweight athletic track jacket in deep navy with subtle coral piping, premium sportswear product photography on invisible mannequin, warm neutral background, no text, no logo'),
    ('ge-110', 'minimal geometric sterling silver pendant necklace with faceted prism shape, elegant realistic jewelry product photography on warm gray stone surface, no text, no logo'),
    ('ge-111', 'minimal brushed brass fountain pen with deep teal cap, premium realistic stationery product photography on warm paper background, elegant diagonal composition, no text, no logo'),
    ('ge-112', 'stylish polarized sunglasses with translucent smoke gray frame and subtle coral temple tips, realistic premium ecommerce product photography on pale neutral background, no text, no logo'),
    ('hero', 'warm minimalist editorial lifestyle scene with neatly arranged desk accessories including a ceramic mug, a desk lamp, headphones, and a small plant on a wooden desk near a window with soft morning light, no text, no logo'),
    ('editorial', 'flat lay of curated lifestyle products on a warm beige linen background, including a mechanical keyboard, a knit cardigan, sunglasses, a fountain pen, and a ceramic mug, soft directional light, realistic editorial photography, no text, no logo'),
    ('fallback', 'premium lifestyle retail product silhouette on a warm neutral studio background, realistic ecommerce photography, soft shadow, no text, no logo'),
]

for idx, (name, prompt) in enumerate(items):
    out_path = os.path.join(OUT_DIR, f'{name}.jpg')
    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        print(f'[{idx+1}/{len(items)}] {name}.jpg already exists ({os.path.getsize(out_path)} bytes), skip')
        continue
    url = f'{IMAGE_API}?prompt={urllib.parse.quote(prompt)}&image_size=square_hd'
    print(f'[{idx+1}/{len(items)}] Downloading {name}.jpg ...')
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
            if len(data) > 1000:
                with open(out_path, 'wb') as f:
                    f.write(data)
                print(f'  OK: {len(data)} bytes')
            else:
                print(f'  WARN: too small ({len(data)} bytes)')
    except Exception as e:
        print(f'  FAIL: {e}')
    time.sleep(1)

print('\nDone! Files in images/:')
for f in os.listdir(OUT_DIR):
    print(f'  {f}: {os.path.getsize(os.path.join(OUT_DIR, f))} bytes')
