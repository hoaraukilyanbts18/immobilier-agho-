<?php
/**
 * ARPENT — Connexion à la base de données
 * Squelette illustratif correspondant au cahier des charges (§4.2, §4.4).
 * Nécessite un serveur PHP 8.1+ et une base MySQL/PostgreSQL pour fonctionner.
 * Ne PAS committer de vrais identifiants : utilisez des variables d'environnement.
 */

class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $host = getenv('DB_HOST') ?: '172.16.1.78';
            $db   = getenv('DB_NAME') ?: 'imo';
            $user = getenv('DB_USER') ?: 'user1';
            $pass = getenv('DB_PASS') ?: 'Alpine18';
            $dsn  = "mysql:host={$host};dbname={$db};charset=utf8mb4";

            self::$instance = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false, // requêtes préparées natives (anti-injection SQL)
            ]);
        }
        return self::$instance;
    }
}
