<?php
require 'facebook-sdk/autoload.php';
 
use Facebook\FacebookSession;
use Facebook\FacebookRequest;
use Facebook\GraphNodes\GraphUser;
use Facebook\FacebookRequestException;
 
FacebookSession::setDefaultApplication('1513386428897011', 'd58bb94790bd07489db118cd5759cc8f');
$session = new FacebookSession($_GET['access_token']);
 
try {
  $me = (new FacebookRequest(
    $session, 'GET', '/me'
  ))->execute()->getGraphObject(GraphUser::className());
  echo $me->getName();
} catch (FacebookRequestException $e) {
  // The Graph API returned an error
}