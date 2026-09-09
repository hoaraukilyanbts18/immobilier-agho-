#!/usr/bin/env python3
"""
ARPENT — Script d'import en masse des biens depuis un CSV/Excel (§3.2, §4.2)
Usage :
    pip install pandas mysql-connector-python --break-system-packages
    python import_properties.py biens_a_importer.csv

Le fichier attendu contient au minimum les colonnes :
    title,type,transaction_type,city,price,surface,pieces,chambres,owner_id
"""
import sys
import csv
import os

REQUIRED_COLUMNS = ["title", "type", "transaction_type", "city", "price", "surface", "pieces", "owner_id"]


def read_rows(path: str):
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        missing = [c for c in REQUIRED_COLUMNS if c not in reader.fieldnames]
        if missing:
            raise ValueError(f"Colonnes manquantes dans le fichier : {missing}")
        yield from reader


def validate_row(row: dict) -> list:
    errors = []
    if float(row.get("price", 0) or 0) <= 0:
        errors.append("prix invalide")
    if float(row.get("surface", 0) or 0) <= 0:
        errors.append("surface invalide")
    if row.get("type") not in {"Appartement", "Maison", "Studio", "Villa", "Terrain"}:
        errors.append("type de bien inconnu")
    if row.get("transaction_type") not in {"Vente", "Location"}:
        errors.append("transaction invalide")
    return errors


def insert_row(cursor, row: dict):
    cursor.execute(
        """
        INSERT INTO properties
            (title, type, transaction_type, city, price, surface, pieces, chambres, owner_id, status, created_at)
        VALUES
            (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'brouillon', NOW())
        """,
        (
            row["title"], row["type"], row["transaction_type"], row["city"],
            float(row["price"]), float(row["surface"]), int(row["pieces"]),
            int(row.get("chambres") or 0), int(row["owner_id"]),
        ),
    )


def main():
    if len(sys.argv) != 2:
        print("Usage : python import_properties.py <fichier.csv>")
        sys.exit(1)

    path = sys.argv[1]
    if not os.path.exists(path):
        print(f"Fichier introuvable : {path}")
        sys.exit(1)

    imported, rejected = 0, []
    for i, row in enumerate(read_rows(path), start=2):  # ligne 1 = en-têtes
        errors = validate_row(row)
        if errors:
            rejected.append((i, errors))
            continue
        # Décommenter pour écrire réellement en base une fois la connexion configurée :
        # insert_row(cursor, row)
        imported += 1

    print(f"{imported} bien(s) prêt(s) à être importés.")
    if rejected:
        print(f"{len(rejected)} ligne(s) rejetée(s) :")
        for line_num, errs in rejected:
            print(f"  - ligne {line_num} : {', '.join(errs)}")


if __name__ == "__main__":
    main()
