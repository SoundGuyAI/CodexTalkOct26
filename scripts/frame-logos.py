"""Letterbox scraped logos into 16:10 frames without cropping."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
HIST = ROOT / 'public' / 'assets' / 'history'
W, H = 1280, 720
BG = (9, 9, 11, 255)
MARGIN = 0.1

# source filename -> deck filename (overwrite framed outputs)
JOBS = [
    ('zbang-logo.png', 'zbang-logo.png'),
    ('pizza-morgana-logo-site.png', 'pizza-morgana-tile.png'),
    ('kisa-logo.png', 'kisa-logo.png'),
    ('heavenly-hell-logo.png', 'heavenly-hell-logo.png'),
    ('spinning-cube-logo.png', 'spinning-cube-logo.png'),
    ('star-shipping-logo.png', 'star-shipping-logo.png'),
    ('herberts-quest.jpg', 'herberts-quest.jpg'),
    ('uniform-logo.jpg', 'uniform-logo.jpg'),
    ('avner-icon.jpg', 'avner-icon.jpg'),
    ('bolt-riley-intro.jpg', 'bolt-riley-intro.jpg'),
]


def frame(src: Path, dest: Path) -> None:
    im = Image.open(src).convert('RGBA')
    max_w, max_h = int(W * (1 - 2 * MARGIN)), int(H * (1 - 2 * MARGIN))
    scale = min(max_w / im.width, max_h / im.height)
    nw, nh = max(1, int(im.width * scale)), max(1, int(im.height * scale))
    im2 = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (W, H), BG)
    canvas.paste(im2, ((W - nw) // 2, (H - nh) // 2), im2)
    if dest.suffix.lower() in {'.jpg', '.jpeg'}:
        canvas.convert('RGB').save(dest, 'JPEG', quality=90)
    else:
        canvas.save(dest, 'PNG')
    print(f'framed {dest.name} ({dest.stat().st_size} bytes) from {src.name} {im.size} -> {nw}x{nh}')


def main() -> None:
    for src_name, dest_name in JOBS:
        src = HIST / src_name
        # Prefer raw unframed copies if we saved *-raw; else use current file
        raw = HIST / f'{src.stem}-raw{src.suffix}'
        if raw.exists():
            src = raw
        elif not src.exists():
            print(f'missing {src_name}')
            continue
        # If framing in place, keep a raw backup once
        dest = HIST / dest_name
        if src.resolve() == dest.resolve() and not raw.exists():
            backup = HIST / f'{src.stem}-raw{src.suffix}'
            backup.write_bytes(src.read_bytes())
            src = backup
            print(f'backed up raw -> {backup.name}')
        frame(src, dest)


if __name__ == '__main__':
    main()
