"""Build an offline, self-contained Thunderbird add-on (Python 3 standard library)."""
from pathlib import Path
import json
import zipfile
root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'extension/manifest.json').read_text())
dest = root / 'dist'
dest.mkdir(exist_ok=True)
output = dest / f'markdown-diretto-{manifest["version"]}.xpi'
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted((root / 'extension').rglob('*')):
        if file.is_file():
            archive.write(file, file.relative_to(root / 'extension'))
print(output)
