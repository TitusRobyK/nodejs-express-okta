AEM Anthemeap _ Any Page 

LOGIN CTA

SET _ Session Storage _ State -> Anthemeap _ Any Page

Invoke Wrapper API _ by AEM -> /login

Authentication _ at OKTA Level

Invoke Wrapper API _ by OKTA -> /authorization-code/callback

Wrapper API _ /authorization-code/callback forwards to AEM Anthemeap _ Login Page 
 
AEM Anthemeap _ auth Page [ Within AEM ] , Invoke Wrapper API _ by AEM -> /login-success 

Redirect the user GET _ Session Storage _ State -> Anthemeap _ Any Page

LOGOUT CTA 

Invoke Wrapper API _ by AEM -> /logout