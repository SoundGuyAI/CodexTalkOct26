from pathlib import Path

p = Path('ASSETS-NEEDED.md')
t = p.read_text(encoding='utf-8')
rows = {
    '| 4 | Zbang |': '| 4 | Zbang | **HAVE** | `history/zbang-logo.png` framed from Corbomite zbangoLogo |\n',
    '| 4 | Pizza Morgana |': '| 4 | Pizza Morgana | **HAVE** | `history/pizza-morgana-tile.png` framed from pizzalogo1.png |\n',
    '| 4 | Knights': '| 4 | KISA (Knights In Shining Armor) | **HAVE** | `history/kisa-logo.png` from Corbomite KISA_LOGO.png |\n',
    '| 4 | Rock Band': '| 4 | Heavenly Hell | **HAVE** | `history/heavenly-hell-logo.png` (Rock Band removed from this slide) |\n',
    '| 5 | Star Shipping |': '| 5 | Star Shipping | **HAVE** | `history/star-shipping-logo.png` framed Corbomite logo |\n',
    '| 5 | Spinning Cube |': '| 5 | Spinning Cube | **HAVE** | `history/spinning-cube-logo.png` from CubeSpinLogo.png |\n',
    '| 6 | Herbert': "| 6 | Herbert's Quest | **HAVE** | `history/herberts-quest.jpg` from adventuremob screenshot |\n",
    '| 6 | Nightmare': '| 6 | Uniform | **HAVE** | `history/uniform-logo.jpg` (replaced Nightmare Playground) |\n',
    '| 8 | StreetWize |': '| 8 | StreetWize | **PLACEHOLDER · YOU** | Not on Corbomite /games or streetwize.com — need your logo |\n',
    '| 9 | Midburn pyro |': '| 9 | Midburn pyro | **HAVE (relabeled)** | Uses `about/burning-man-sculpture.jpg` (was mislabeled Burns) + fireworks |\n',
}

out = []
for line in t.splitlines(keepends=True):
    replaced = False
    for prefix, new_line in rows.items():
        if line.startswith(prefix):
            out.append(new_line)
            replaced = True
            print('patched', prefix)
            break
    if not replaced:
        out.append(line)
p.write_text(''.join(out), encoding='utf-8')
print('done')
