<?php
$base64_data = str_replace("data:image/jpeg;base64,", '', $_POST['image_data']);
$base64_data = base64_decode($base64_data);

header("Content-Description: File Transfer"); 
header("Content-Type: image/png"); 
header("Content-Disposition: attachment; filename=cua-image.jpg");
echo $base64_data; 
