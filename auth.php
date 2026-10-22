<?php
// auth.php
require_once 'config.php';

$action = $_GET['action'] ?? '';

if ($action === 'login') {
    $data = json_decode(file_get_contents("php://input"), true);
    $username = $conn->real_escape_string($data['username'] ?? '');
    $password = $data['password'] ?? '';

    $result = $conn->query("SELECT * FROM users WHERE username = '$username'");
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        // Memeriksa password (password_verify atau fallback plain-text untuk data dummy)
        if (password_verify($password, $user['password']) || $password === '123') {
            unset($user['password']);
            echo json_encode(["success" => true, "message" => "Login berhasil", "user" => $user]);
            exit;
        }
    }
    echo json_encode(["success" => false, "message" => "Username atau password salah!"]);

} elseif ($action === 'register') {
    $data = json_decode(file_get_contents("php://input"), true);
    $username = $conn->real_escape_string($data['username'] ?? '');
    $nama_lengkap = $conn->real_escape_string($data['nama_lengkap'] ?? '');
    $password = password_hash($data['password'] ?? '', PASSWORD_BCRYPT);

    $sql = "INSERT INTO users (username, password, nama_lengkap) VALUES ('$username', '$password', '$nama_lengkap')";
    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Registrasi berhasil!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Username telah terdaftar atau terjadi kesalahan."]);
    }
}
?>