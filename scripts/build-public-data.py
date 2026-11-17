"""Build the public C-value snapshot from the Xiphium export archive."""
import csv
import io
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "static" / "data" / "cvalues.zip"
DESTINATION = ROOT / "static" / "data" / "cvalues.json"
PUBLIC_FIELDS = {
    "family": "Cva_APG_Family",
    "genus": "Cva_Genus",
    "species": "Cva_Species",
    "authority": "Cva_Authority",
    "cultivar": "Cva_Cultivar",
    "chromosomes": "Cva_Chromosome_Nr",
    "ploidy": "Cva_PloidyLevel",
    "method": "Cva_Estimation_Method",
    "voucher": "Cva_Voucher",
    "value": "Cva_2C_PG",
    "reference": "Cva_Original_Reference",
    "lifecycle": "Cva_Lifecycle",
    "group": "Cva_Angiosperm_Group",
}

with zipfile.ZipFile(SOURCE) as archive:
    csv_name = next(name for name in archive.namelist() if name.lower().endswith(".csv"))
    csv_text = archive.read(csv_name).decode("utf-8-sig")

public_records = []
for row in csv.DictReader(io.StringIO(csv_text), delimiter=";"):
    raw_value = (row.get("Cva_2C_PG") or "").strip()
    if not raw_value or raw_value == "0":
        continue
    try:
        value = float(raw_value.replace(",", "."))
    except ValueError:
        continue
    record = {key: (row.get(source) or "").strip() for key, source in PUBLIC_FIELDS.items()}
    record["value"] = value
    for key in ("chromosomes", "ploidy"):
        if record[key] == "0":
            record[key] = ""
    public_records.append(record)

DESTINATION.write_text(
    json.dumps(public_records, ensure_ascii=False, separators=(",", ":")),
    encoding="utf-8",
)
print(f"Wrote {len(public_records):,} public records to {DESTINATION.relative_to(ROOT)}")
