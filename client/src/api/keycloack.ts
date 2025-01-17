import { doRequestOld } from './comum'
import { p, dToken } from './debug'

export async function getTokenKeyCloack() {
    let it = {
        status : false,
        token  : ''
    }
    try {
        let options = {
            'url': process.env.COMUM_BASE_URL + '/v1/getToken',
            'options': {
                'method': 'POST',  
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({                   
                    'client_id': process.env.KEYCLOACK_CLIENT_ID,
                    'client_secret': process.env.KEYCLOACK_CLIENT_SECRET
                })  
            }
        }
        let response = await doRequestOld(options)
        p(response,dToken)
        if ((response.hasOwnProperty('erro')) || (response.hasOwnProperty('error'))) {
            it.token = response
        } else {
            it.status = true
            it.token  = response.access_token
        }
    } catch (error) {
        it.token = error
    }
    return it
}

export async function checkTokenClient(token) { 
    let it = {
        active    : false,
        client_id : '' 
    }
    try {
        let options = {
            'url': process.env.KEYCLOACK_BASE_URL + '/token/introspect',
            'options': {
                'method': 'POST',  
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({                   
                    'client_id'     : process.env.KEYCLOACK_CLIENT_ID,
                    'client_secret' : process.env.KEYCLOACK_CLIENT_SECRET,
                    'grant_type'    : 'client_credentials',
                    'token'         : token.replace('Bearer','').trim()
                })  
            }
        }        
        const retorno = await doRequestOld(options)
        if (retorno.active) {
            if (retorno.client_id != process.env.KEYCLOACK_PARTNER_CLIENT_ID) {
                it.client_id = `client_id ${retorno.client_id} sem acesso à API.`
            } else {
                it.active    = true
                it.client_id = retorno
            }
        } else {
            it.client_id = 'token inválido ou expirado.' 
        }        
        return it
    } catch (error) {
        it.client_id = 'checkTokenClient : ' + error 
        return it
    }
  }