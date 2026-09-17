#!/usr/bin/env python3
"""Create a reproducible source archive; never include local desktop data."""
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "manifest.json").read_text())
version = manifest["version"]
assert all(c.isalnum() or c in ".-" for c in version)
names = [
    "Visibility.js", "ScratchVisibility.qml", "AuthorLink.qml", "Preferences.qml", "PanelSelection.qml", "preview.png",
    "manifest.json", "qmldir", "Model.js", "I18n.js", "ScratchState.qml", "Widget.qml", "HintsToggle.qml", "MoveOutButton.qml", "HintButton.qml", "PanelHint.qml", "AddWindowPicker.qml",
    "Transfers.js", "WindowTransfer.qml", "TransferEditor.qml", "Details.qml", "PopupPlacement.js", "ScrollHandle.qml", "LabelsEditor.qml", "ScaleControl.qml", "ScalingEditor.qml", "Appearance.js", "AppearanceEditor.qml", "PresetChip.qml", "HoverTip.qml", "TooltipContent.qml", "README.md", "LICENSE", "CHANGELOG.md", ".gitignore",
]
for directory in ("docs", "tests", "tools", ".github", "vendor"):
    names.extend(str(p.relative_to(root)) for p in (root / directory).rglob("*") if p.is_file())

out = root / "dist" / f"ScratchPeek-{version}.zip"
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as archive:
    for name in sorted(names):
        source = root / name
        if source.is_symlink():
            raise ValueError(f"Refusing symlink: {name}")
        info = zipfile.ZipInfo(f"scratchpeek/{name}", (2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, source.read_bytes())
print(out)
