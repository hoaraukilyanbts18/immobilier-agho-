#!/usr/bin/env python3
"""
ARPENT — Estimation automatisée simplifiée (§1.2 : "automatiser les estimations")
Exemple pédagogique de script Python d'automatisation (§4.2), à brancher sur de
vraies données de marché (DVF, API notariat, etc.) pour un usage réel.

Usage :
    python estimate_price.py --city Lyon --surface 75 --type Appartement
"""
import argparse

# Prix moyen au m² par commune (données fictives, à remplacer par une vraie source
# — par ex. les indices notariaux de La Réunion ou l'observatoire des loyers)
PRIX_MOYEN_M2 = {
    "Saint-Denis": 3200, "Saint-Pierre": 2900, "Saint-Paul": 3100,
    "Le Tampon": 2400, "Saint-André": 2500, "Saint-Louis": 2300,
    "Le Port": 2200, "Saint-Benoît": 2100, "Sainte-Marie": 2700,
    "Saint-Leu": 3600,
}

COEFF_TYPE = {"Appartement": 1.0, "Maison": 1.05, "Studio": 1.15, "Villa": 1.2, "Terrain": 0.4}


def estimate(city: str, surface: float, property_type: str) -> dict:
    prix_m2 = PRIX_MOYEN_M2.get(city)
    if prix_m2 is None:
        raise ValueError(f"Ville inconnue : {city}")
    coeff = COEFF_TYPE.get(property_type, 1.0)
    estimation = surface * prix_m2 * coeff
    fourchette_basse = estimation * 0.92
    fourchette_haute = estimation * 1.08
    return {
        "ville": city,
        "surface_m2": surface,
        "type": property_type,
        "prix_m2_moyen": prix_m2,
        "estimation": round(estimation, -3),
        "fourchette": (round(fourchette_basse, -3), round(fourchette_haute, -3)),
    }


def main():
    parser = argparse.ArgumentParser(description="Estimation simplifiée d'un bien immobilier")
    parser.add_argument("--city", required=True)
    parser.add_argument("--surface", required=True, type=float)
    parser.add_argument("--type", required=True, choices=list(COEFF_TYPE.keys()))
    args = parser.parse_args()

    result = estimate(args.city, args.surface, args.type)
    print(f"Estimation pour un(e) {result['type']} de {result['surface_m2']} m² à {result['ville']} :")
    print(f"  Prix moyen constaté : {result['prix_m2_moyen']} €/m²")
    print(f"  Estimation : {result['estimation']:,.0f} €".replace(",", " "))
    print(f"  Fourchette : {result['fourchette'][0]:,.0f} € — {result['fourchette'][1]:,.0f} €".replace(",", " "))


if __name__ == "__main__":
    main()
