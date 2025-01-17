# Modelo API Partner #

* Swagger   : Open API 3.0.0 - /swagger
* Info      : / e /info
* Sem uso de banco de dados 
* Validar token recebido - API Comum
* Usar token para consulta - API Comum

## Variáveis de Ambeinte ##

KEYCLOACK_PARTNER_CLIENT_ID
Cliente ID do KeyCloack para usar a API Partner : xxx
O cliente possiu o client_id e o secret_id

KEYCLOACK_CLIENT_ID
Cliente ID do KeyCloack para usar a API System : xxx

KEYCLOACK_CLIENT_SECRET
Secret ID do KeyCloack para usar a API System

SYSTEM_URL
URL base da API System : https://system-vertical-hospitais.azr-dev02.dasaexp.io

COMUM_BASE_URL
URL base da API Comum : https://comum-vertical-hospital.azr-dev02.dasaexp.io

## Fluxo ##

Cliente --> getToken (client_id_partner e secret_id) --> token
Cliente --> <recurso> (parametros + token) --> API Partner 
API Partner --> getToken (client_id e secret_id) --> token
API Partner --> <recurso> (parametros + token) --> payload --> Cliente