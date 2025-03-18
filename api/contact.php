<?php
/**
 * Processador de Formulário de Contato
 * 
 * Este script processa os dados do formulário de contato
 * e envia um email para o administrador do site.
 */

// Definir cabeçalhos para JSON
header('Content-Type: application/json');

// Verificar se o método de requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Verificação CSRF (implementar conforme necessário)
// if (!isset($_POST['csrf_token']) || !verify_csrf_token($_POST['csrf_token'])) {
//     http_response_code(403);
//     echo json_encode(['success' => false, 'message' => 'Erro de validação de segurança']);
//     exit;
// }

// Campos obrigatórios
$required_fields = ['name', 'email', 'subject', 'message', 'consent'];

// Verificar campos obrigatórios
foreach ($required_fields as $field) {
    if (!isset($_POST[$field]) || empty($_POST[$field])) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Todos os campos obrigatórios devem ser preenchidos',
            'field' => $field
        ]);
        exit;
    }
}

// Validar email
if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Por favor, forneça um email válido',
        'field' => 'email'
    ]);
    exit;
}

// Sanitizar dados
$name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
$phone = isset($_POST['phone']) ? filter_var($_POST['phone'], FILTER_SANITIZE_STRING) : 'Não informado';
$subject = filter_var($_POST['subject'], FILTER_SANITIZE_STRING);
$product_interest = isset($_POST['product_interest']) ? filter_var($_POST['product_interest'], FILTER_SANITIZE_STRING) : 'Não informado';
$message = filter_var($_POST['message'], FILTER_SANITIZE_STRING);

// Processar upload de arquivo (se existir)
$attachment_path = null;
if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
    $allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    $max_size = 5 * 1024 * 1024; // 5MB
    
    // Verificar tipo de arquivo
    if (!in_array($_FILES['attachment']['type'], $allowed_types)) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Tipo de arquivo não permitido. Use apenas JPG, PNG, WEBP ou PDF.',
            'field' => 'attachment'
        ]);
        exit;
    }
    
    // Verificar tamanho
    if ($_FILES['attachment']['size'] > $max_size) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'O arquivo deve ter no máximo 5MB',
            'field' => 'attachment'
        ]);
        exit;
    }
    
    // Gerar nome de arquivo único
    $upload_dir = '../uploads/';
    $file_extension = pathinfo($_FILES['attachment']['name'], PATHINFO_EXTENSION);
    $file_name = uniqid('contact_') . '.' . $file_extension;
    $attachment_path = $upload_dir . $file_name;
    
    // Mover arquivo (comentado para ambiente de demonstração)
    // if (!move_uploaded_file($_FILES['attachment']['tmp_name'], $attachment_path)) {
    //     http_response_code(500);
    //     echo json_encode(['success' => false, 'message' => 'Erro ao fazer upload do arquivo']);
    //     exit;
    // }
}

// Configurar destinatário
$to = 'contato@resinart.com.br';

// Assunto do email baseado no subject do formulário
$email_subject = "Contato Site: $subject";

// Corpo do email
$email_body = "
<html>
<head>
  <title>Nova mensagem de contato</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    h2 { color: #005F73; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { text-align: left; padding: 8px; background-color: #f2f2f2; }
    td { padding: 8px; border-top: 1px solid #ddd; }
    .message-box { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #005F73; }
  </style>
</head>
<body>
  <div class='container'>
    <h2>Nova mensagem de contato do site</h2>
    <table>
      <tr>
        <th>Nome:</th>
        <td>$name</td>
      </tr>
      <tr>
        <th>Email:</th>
        <td>$email</td>
      </tr>
      <tr>
        <th>Telefone:</th>
        <td>$phone</td>
      </tr>
      <tr>
        <th>Assunto:</th>
        <td>$subject</td>
      </tr>
      <tr>
        <th>Produto de Interesse:</th>
        <td>$product_interest</td>
      </tr>
    </table>
    
    <h3>Mensagem:</h3>
    <div class='message-box'>
      " . nl2br($message) . "
    </div>
    " . ($attachment_path ? "<p><strong>Anexo:</strong> " . basename($attachment_path) . "</p>" : "") . "
    <p><small>Esta mensagem foi enviada através do formulário de contato do site em " . date('d/m/Y H:i:s') . "</small></p>
  </div>
</body>
</html>
";

// Cabeçalhos do email
$headers = "From: Site ResinArt <no-reply@resinart.com.br>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

// Enviar email (comentado para ambiente de demonstração)
// $mail_sent = mail($to, $email_subject, $email_body, $headers);

// Para este exemplo de API, simularemos um envio bem-sucedido
$mail_sent = true;

// Registrar contato no banco de dados (simulado)
// save_contact_to_database($name, $email, $phone, $subject, $product_interest, $message, $attachment_path);

// Resposta para o cliente
if ($mail_sent) {
    // Configurar cabeçalhos para evitar cache
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Cache-Control: post-check=0, pre-check=0', false);
    header('Pragma: no-cache');
    
    echo json_encode([
        'success' => true, 
        'message' => 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
        'redirect' => '/contato.html?status=success'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Erro ao enviar mensagem. Por favor, tente novamente mais tarde.',
        'redirect' => '/contato.html?status=error'
    ]);
}

/**
 * Função para salvar contato no banco de dados (simulação)
 */
function save_contact_to_database($name, $email, $phone, $subject, $product_interest, $message, $attachment_path) {
    // Em uma implementação real, este código salvaria os dados em um banco de dados
    // Como este é um exemplo, apenas simularemos o registro
    $log_file = 'contact_log.txt';
    $date = date('Y-m-d H:i:s');
    $log_entry = "[$date] Nome: $name, Email: $email, Assunto: $subject\n";
    
    // file_put_contents($log_file, $log_entry, FILE_APPEND);
    return true;
}