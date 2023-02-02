AEM : DFD-EAP_Any_Page 

LOGIN CTA

SET _ Session Storage _ State of -> DFD-EAP_Any_Page

Invoke Wrapper API _ by AEM -> /login

Authentication _ at OKTA Level

Invoke Wrapper API _ by OKTA -> /authorization-code/callback

Wrapper API _ /authorization-code/callback forwards to DFD-EAP_Auth_Page 
 
AEM : DFD-EAP_Auth_Page  [ Within AEM ] , Invoke Wrapper API _ by AEM -> /login-success 

Redirect the user GET _ Session Storage _ State -> DFD-EAP_Any_Page

LOGOUT CTA 

Invoke Wrapper API _ by AEM -> /logout



<img width="797" alt="image" src="https://user-images.githubusercontent.com/32787952/216406329-a2bd909a-e3dd-474d-9889-8686a22e9bbb.png">
