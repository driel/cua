<?php
require 'facebook-sdk/autoload.php';
 
use Facebook\FacebookSession;
use Facebook\FacebookJavaScriptLoginHelper;
use Facebook\FacebookRequest;
use Facebook\GraphNodes\GraphUser;
use Facebook\FacebookRequestException;
 
FacebookSession::setDefaultApplication('APP-ID', 'APP-SECRET');
 
session_start();
//check for existing session and validate it
if (isset($_SESSION['token'])) {
  $session = new FacebookSession($_SESSION['token']);
  try {
    $session->Validate('APP-ID', 'APP-SECRET');
  } catch(FacebookAuthorizationException $e) {
    unset($session);
    echo $e->getMessage();
  }
}
 
//get new session
if (!isset($session)) {
  try {
    $helper = new FacebookJavaScriptLoginHelper();
    $session = $helper->getSession();
    $_SESSION['token'] = $session->getToken();
  } catch(FacebookRequestException $e) {
    unset($session);
    echo $e->getMessage();
  }
}
 
//do some api stuff
if (isset($session)) {
  $me = (new FacebookRequest(
    $session, 'GET', '/me'
  ))->execute()->getGraphObject(GraphUser::className());
  echo $me->getName();
}