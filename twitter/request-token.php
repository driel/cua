<?php
session_start();
require 'tmhOAuth.php';
$tmhOAuth = new tmhOAuth(array(
    'consumer_key'              => 'GGtLVytf9aboOhqgS8K2pcxX0',
    'consumer_secret'           => 'YZyuYiz1GjIIUECiTV7pxDbG7dSjGdNmsjG66anPS2iUraEt3P',
    'curl_ssl_verifypeer'		=> false
));

$_SESSION['twitter_image_data'] = $_POST['twitter_image_data'];

$code = $tmhOAuth->request('POST', $tmhOAuth->url('oauth/request_token', ''), array(
	'oauth_callback'=>'http://'.$_SERVER['SERVER_NAME'].'/~cua/twitter/post2twitter.php'
));

if($code == 200){
    $_SESSION['oauth'] = $tmhOAuth->extract_params($tmhOAuth->response['response']);

    $authurl = $tmhOAuth->url("oauth/authorize", '') .  "?oauth_token={$_SESSION['oauth']['oauth_token']}";
  	header("Location: {$authurl}");
}