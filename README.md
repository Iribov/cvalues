# Iribov C-values

A static, searchable reference page for plant 2C DNA content. The browser loads a public JSON snapshot from `static/data/cvalues.json`; it does not call Xiphium or expose internal Xiphium fields.

## Refreshing the data

Replace `static/data/cvalues.zip` with the latest Xiphium export, then run:

```sh
python scripts/build-public-data.py
```

The build step keeps only the fields used by the public page and records with a usable 2C value. Review the generated snapshot before publishing. Internal company, employee, order, and maintenance fields are not copied to the public JSON.

The page reads the snapshot in one place (`loadRecords` in `src/scripts/script.js`). If the delivery model changes later, that loader is the seam to adapt to an approved API while keeping the search and presentation code independent.
