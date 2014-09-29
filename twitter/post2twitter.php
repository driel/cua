<?php
session_start();
require 'tmhOAuth.php';

$tmhOAuth = new tmhOAuth(array(
    'consumer_key'              => 'GGtLVytf9aboOhqgS8K2pcxX0',
    'consumer_secret'           => 'YZyuYiz1GjIIUECiTV7pxDbG7dSjGdNmsjG66anPS2iUraEt3P',
    'curl_ssl_verifypeer'		=> false
));

if(isset($_GET['oauth_verifier'])){
	$tmhOAuth->config['user_token']  = $_SESSION['oauth']['oauth_token'];
	$tmhOAuth->config['user_secret'] = $_SESSION['oauth']['oauth_token_secret'];

	$code = $tmhOAuth->request(
	    'POST',
	    $tmhOAuth->url('oauth/access_token', ''),
	    array(
	      'oauth_verifier' => $_GET['oauth_verifier']
	    )
	);

	if($code == 200){
		$_SESSION['access_token'] = $tmhOAuth->extract_params($tmhOAuth->response['response']);

		$tmhOAuth->config['user_token']  = $_SESSION['access_token']['oauth_token'];
  		$tmhOAuth->config['user_secret'] = $_SESSION['access_token']['oauth_token_secret'];

  		$base64_data = str_replace("data:image/jpeg;base64,", '', $_SESSION['twitter_image_data']);
		$base64_data = base64_decode($base64_data);

		$path = 'result';
		$img_name = md5('c');
		file_put_contents($path.$img_name.'.jpg', $base64_data);

		$params = array(
		    'media[]' => "{$base64_data};type=image/jpeg;filename=myimage.jpg",
		    'status'  => 'Chatolic University of America Photo Editor '
		);

		$response = $tmhOAuth->user_request(array(
			'method' => 'POST',
			'url' => $tmhOAuth->url("1.1/statuses/update_with_media"),
			'params' => $params,
			'multipart' => true
		));

		if($response == 200){
			?>
			<pre>Your image has been uploaded to twitter. you will be redirected back to home in 3 seconds...</pre>
			<script>
				setTimeout(function(){
					window.location = '../index.html';
				}, 3000);
			</script>
			<?php
		}

		unset($_SESSION['oauth']);
		unset($_SESSION['twitter_image_data']);
	}
}