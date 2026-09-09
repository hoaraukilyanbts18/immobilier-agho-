<?php
/**
 * ARPENT — API REST des biens (§2.2 et §3.2 du cahier des charges)
 * Endpoint : /backend/php/api/properties.php
 *
 * GET    ?city=Paris&type=Appartement&transaction=Vente&max_price=500000
 * POST   body JSON { title, type, transaction_type, city, price, surface, pieces, owner_id, ... }
 *
 * Exemple d'appel depuis le front (à la place des données mockées de data.js) :
 *   fetch('/backend/php/api/properties.php?city=Paris').then(r => r.json())
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // à restreindre en production (CORS, §4.3)

require_once __DIR__ . '/../models/Property.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $filters = [
            'city'        => $_GET['city'] ?? null,
            'type'        => $_GET['type'] ?? null,
            'transaction' => $_GET['transaction'] ?? null,
            'max_price'   => isset($_GET['max_price']) ? (float) $_GET['max_price'] : null,
        ];
        echo json_encode(Property::all(array_filter($filters)));
        exit;
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        // Validation minimale des entrées (§4.3)
        $required = ['title', 'type', 'transaction_type', 'city', 'price', 'surface', 'pieces', 'owner_id'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                http_response_code(422);
                echo json_encode(['error' => "Champ requis manquant : {$field}"]);
                exit;
            }
        }

        $id = Property::create($data);
        http_response_code(201);
        echo json_encode(['id' => $id, 'message' => 'Bien créé avec succès (statut : brouillon)']);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);

} catch (Throwable $e) {
    http_response_code(500);
    // Ne jamais renvoyer le message d'erreur brut en production (fuite d'info) — le logger côté serveur à la place.
    echo json_encode(['error' => 'Erreur serveur']);
}
