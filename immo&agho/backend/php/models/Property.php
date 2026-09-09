<?php
/**
 * ARPENT — Modèle Property (biens immobiliers)
 * Correspond au CRUD décrit en §3.2 du cahier des charges.
 */
require_once __DIR__ . '/../Database.php';

class Property
{
    public static function all(array $filters = []): array
    {
        $pdo = Database::getConnection();
        $sql = "SELECT * FROM properties WHERE 1=1";
        $params = [];

        if (!empty($filters['city'])) {
            $sql .= " AND city = :city";
            $params['city'] = $filters['city'];
        }
        if (!empty($filters['type'])) {
            $sql .= " AND type = :type";
            $params['type'] = $filters['type'];
        }
        if (!empty($filters['transaction'])) {
            $sql .= " AND transaction_type = :transaction";
            $params['transaction'] = $filters['transaction'];
        }
        if (!empty($filters['max_price'])) {
            $sql .= " AND price <= :max_price";
            $params['max_price'] = $filters['max_price'];
        }
        $sql .= " ORDER BY created_at DESC";

        $stmt = $pdo->prepare($sql); // requête préparée (protection injection SQL)
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function find(int $id): ?array
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM properties WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function create(array $data): int
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            "INSERT INTO properties (title, type, transaction_type, city, price, surface, pieces, chambres, salles_bain, dpe, description, status, owner_id, created_at)
             VALUES (:title, :type, :transaction_type, :city, :price, :surface, :pieces, :chambres, :salles_bain, :dpe, :description, 'en_attente', :owner_id, NOW())"
        );
        $stmt->execute([
            'title'            => $data['title'],
            'type'             => $data['type'],
            'transaction_type' => $data['transaction_type'],
            'city'             => $data['city'],
            'price'            => $data['price'],
            'surface'          => $data['surface'],
            'pieces'           => $data['pieces'],
            'chambres'         => $data['chambres'] ?? 0,
            'salles_bain'      => $data['salles_bain'] ?? 0,
            'dpe'              => $data['dpe'] ?? null,
            'description'      => $data['description'] ?? '',
            'owner_id'         => $data['owner_id'],
        ]);
        return (int) $pdo->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            "UPDATE properties SET title=:title, price=:price, status=:status WHERE id=:id"
        );
        return $stmt->execute([
            'id'     => $id,
            'title'  => $data['title'],
            'price'  => $data['price'],
            'status' => $data['status'],
        ]);
    }

    public static function setStatus(int $id, string $status): bool
    {
        $allowed = ['en_attente', 'validee', 'refusee', 'vendue', 'louee'];
        if (!in_array($status, $allowed, true)) {
            throw new InvalidArgumentException('Statut invalide');
        }
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE properties SET status = :status WHERE id = :id");
        return $stmt->execute(['id' => $id, 'status' => $status]);
    }

    public static function delete(int $id): bool
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM properties WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
