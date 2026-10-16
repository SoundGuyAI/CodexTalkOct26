from pathlib import Path

assets = Path('ASSETS-NEEDED.md')
t = assets.read_text(encoding='utf-8')
out = []
for line in t.splitlines(True):
    if line.startswith('| 8 | StreetWize |') or line.startswith('| 8 | Oh SHIP! Time to Escape |'):
        out.append(
            '| 8 | Oh SHIP! Time to Escape | **HAVE** | '
            '`history/oh-ship-time-to-escape.jpg` (user YT-style thumb; replaces StreetWize) |\n'
        )
        print('patched ASSETS-NEEDED slide 8')
    else:
        out.append(line)
assets.write_text(''.join(out), encoding='utf-8')

sources = Path('assets/SOURCES.md')
st = sources.read_text(encoding='utf-8')
if 'oh-ship-time-to-escape' not in st:
    sources.write_text(
        st.rstrip()
        + '\n\n| `history/oh-ship-time-to-escape.jpg` | User-provided YouTube-style thumb '
        '(Oh Ship / TIME TO ESCAPE corridor); letterboxed 16:10 | Slide 8 (replaces StreetWize) |\n'
        '| `history/oh-ship-time-to-escape.png` | Raw user attachment | Source backup |\n',
        encoding='utf-8',
    )
    print('SOURCES updated')
else:
    print('SOURCES already has entry')

todo = Path('TODO.md')
tt = todo.read_text(encoding='utf-8')
tt2 = tt.replace(
    '| 8 | XR | Star Mates, BRCvr, Oh SHIP!, StreetWize |',
    '| 8 | XR | Star Mates, BRCvr, Oh SHIP!, Time to Escape |',
)
tt2 = tt2.replace(', StreetWize, Midburn', ', Midburn')
if tt2 != tt:
    todo.write_text(tt2, encoding='utf-8')
    print('TODO updated')
