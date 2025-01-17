/*

    os usuarios devem estar previamente cadastrados me users.txt
    usar getChats para saber se existe algum chat aberto com os usuarios 
    ler as mensagens em tempos em tempos usando fetchMessage, comandos esperados:
    - ache <nome_do_imobilizado>
    - ache todos
    - pare <nome_do_imobilizado>
    - pare todos
    - lista <local> (opcional)

*/

import { resourceWhatsApp } from './resourceTools'
import { montaResposta, mapear, getUsers, sysdate } from './comum'

export const status = async (req, res) => {
    if (req.params.hasOwnProperty('id')) {
        let resource       = '/session/status/' + req.params.id
        let returnResource = await resourceWhatsApp(resource)
        return res.status(returnResource[0]).json(returnResource[1])
    } else {        
        return res.status(422).json(montaResposta('informe o ID da Sessão'))
    }
}

export const getChats = async (req, res) => {
    const returnFields = {
        'fone' : 'id/user',
        'name' : 'name',
        'msg'  : 'lastMessage/_data/body',
        'data' : 'lastMessage/_data/t'
    }
    const dateFields = ['timestamp','data']    
    const users      = getUsers()
    if (req.params.hasOwnProperty('id')) {
        let resource       = '/client/getChats/' + req.params.id
        let returnResource = await resourceWhatsApp(resource)
        let returnResource_ = mapeando(returnResource, 'chats', returnFields, dateFields, users)
        return res.status(returnResource_.statusCode).json(returnResource_.payload)
    } else {        
        return res.status(422).json(montaResposta('informe o ID da Sessão'))
    }
}

export const fetchMessages = async (req, res) => {
    if (!req.query.hasOwnProperty('fone')) { return res.status(422).json(montaResposta('informe o número do celular | fone')) }
    const minutos = (req.query.hasOwnProperty('minutos')) ? req.query.minutos : null
    const body = {
        "chatId": `${req.query.fone}@c.us`,
        "searchOptions": {}
    }
    const returnFields = {
        'id  '   : '_data/id/id',
        'fone'   : '_data/from/user',
        'fromMe' : 'fromMe',
        'msg'    : 'body',
        'date'   : 'timestamp'
    }
    const dateFields = ['date']    
    const users      = getUsers()
    if (req.params.hasOwnProperty('id')) {
        let resource        = '/chat/fetchMessages/' + req.params.id
        let returnResource  = await resourceWhatsApp(resource, 'POST', body)
        let returnResource_ = mapeando(returnResource, 'messages', returnFields, dateFields, users)
        returnResource_.payload = returnResource_.payload.filter(obj => obj.fromMe === false)
        const filteredData = returnResource_.payload.filter(item => item.date >= sysdate(minutos) && item.date <= sysdate())
        return res.status(returnResource_.statusCode).json(filteredData)
    } else {        
        return res.status(422).json(montaResposta('informe o ID da Sessão'))
    }
}

export const clearMessages = async (req, res) => {
    if (!req.query.hasOwnProperty('fone')) { return res.status(422).json(montaResposta('informe o número do celular | fone')) }
    const body = {
        "chatId": `${req.query.fone}@c.us`
    }
    if (req.params.hasOwnProperty('id')) {
        let resource       = '/chat/clearMessages/' + req.params.id
        let returnResource = await resourceWhatsApp(resource, 'POST', body)
        return res.status(returnResource[0]).json(returnResource[1])
    } else {        
        return res.status(422).json(montaResposta('informe o ID da Sessão'))
    }
}

function mapeando(obj, chave, returnFields, dateFields, filter) {
    let it = {
        statusCode : 422,
        payload    : []
    }
    if (obj.length > 1) {
        if (obj[0] == 200) {
            let newObj = mapear(obj[1][chave],returnFields,dateFields)
            newObj = newObj.filter(obj => filter.includes(obj.fone))            
            it.statusCode = 200
            it.payload = newObj
        } else {
            it.payload = obj[1]
        }
    } else {
        it.payload = [{ erro: 'objeto retornou vazio' }]
    }
    return it
}