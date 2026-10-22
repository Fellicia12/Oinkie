<?php
// barang.php
require_once 'config.php';

$action = $_GET['action'] ?? '';

if ($action === 'read') {
    $result = $conn->query("SELECT * FROM barang ORDER BY id DESC");
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
    echo json_encode(["success" => true, "data" => $items]);

} elseif ($action === 'create') {
    $nama_barang = $conn->real_escape_string($_POST['nama_barang'] ?? '');
    $kategori    = $conn->real_escape_string($_POST['kategori'] ?? '');
    $status      = $conn->real_escape_string($_POST['status'] ?? 'hilang');
    $lokasi      = $conn->real_escape_string($_POST['lokasi'] ?? '');
    $tanggal     = $conn->real_escape_string($_POST['tanggal'] ?? date('Y-m-d'));
    $deskripsi   = $conn->real_escape_string($_POST['deskripsi'] ?? '');
    
    $fotoName = null;
    if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION);
        $fotoName = time() . '_' . uniqid() . '.' . $ext;
        move_uploaded_file($_FILES['foto']['tmp_name'], 'uploads/' . $fotoName);
    }

    $sql = "INSERT INTO barang (nama_barang, kategori, status, lokasi, tanggal, deskripsi, foto) 
            VALUES ('$nama_barang', '$kategori', '$status', '$lokasi', '$tanggal', '$deskripsi', '$fotoName')";

    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Laporan berhasil disimpan!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Gagal menyimpan laporan: " . $conn->error]);
    }
}
?>