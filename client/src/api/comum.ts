import { NextFunction } from 'express'
import { checkTokenClient, getTokenKeyCloack } from './keycloack'
import { p, dDoRequest, dResult } from './debug'
import { getEnvEmpresas } from './resourceTools'
import { DateTime } from 'luxon'
import fs from 'fs'

export async function doRequestOld(options) {
    p(options,dDoRequest)    
    try {
        const response = await fetch(options.url, options.options)
        try {
            return await response.json()
        } catch (error) {
            const msgError = (String(error).includes('JSON at position 0')) ? '' : 'error ' + error
            return { 'error': options.url + ' : ' + response.status + ' : ' + response.statusText + ' : ' + msgError}
        }
    } catch (error) {
        return { 'error': error }
    }
}

export async function doRequest(options) {
    p(options,dDoRequest)    
    try {
        const response = await fetch(options.url, options.options)
        try {
            return [ response.status, await response.json() ]
        } catch (error) {
            const msgError = (String(error).includes('JSON at position 0')) ? '' : 'error ' + error
            //return { 'error': options.url + ' : ' + response.status + ' : ' + response.statusText + ' : ' + msgError}
            return [ 422, { 'error': options.url + ' : ' + response.status + ' : ' + response.statusText + ' : ' + msgError} ]
        }
    } catch (error) {
        return [ 422, { 'error': error } ]
    }
}

// validacoes antes de chamar o recurso : token do client | client tem acesso ao recurso | gera token para System | empresas carregadas
export const verifyAccessToken = async (req, res, next: NextFunction) => {
    if (!req.url.includes('set-debug')) {
        if (!req.headers.authorization) { return res.status(422).send(montaResposta('Token de autenticação não fornecido.',false)) }
        if ((process.env.SYSTEM_URL == undefined) || (process.env.SYSTEM_URL == '')) { return res.status(422).send(montaResposta('impossível atender a solicitação, variáveis de ambiente não carregadas.',false)) }
        if ((process.env.ENVEMPR == undefined) || (process.env.ENVEMPR == '')) { return res.status(422).send(montaResposta('impossível atender a solicitação, empresas não carregadas.',false)) }
        if (req.query.unidade != undefined) { 
            [ process.env.HIS, process.env.CD_MULTI_EMPRESA ] = getHIS(req.query.unidade)
            const token = await checkTokenClient(req.headers.authorization)
            if (!token.active) { return res.status(422).send({ error: token.client_id }) }
            process.env.CLIENT_ID = token.client_id
            const tokenSyetem = await getTokenKeyCloack()
            if (tokenSyetem.status) { 
                process.env.SYSTEM_TOKEN = tokenSyetem.token 
            } else {
                return res.status(422).send(montaResposta('não foi possível gerar Token para System : ' + JSON.stringify(tokenSyetem.token), false)) 
            }
        } else { 
            return res.status(422).send(montaResposta('informe a unidade',false)) 
        }
    }    
    next()
}

export function verifyParam(parametros, paramObrigatorios=[], paramMandatoryQtd=0) {
    let erro = false
    let paramMandatoryQtdAux = 0
    let executeResourceReturn = {}
    if (paramObrigatorios.length) {
        for (let paramObrigatorio of paramObrigatorios) {
            if (paramObrigatorio in parametros) { paramMandatoryQtdAux += 1 }             
        }
        if (paramMandatoryQtdAux < paramMandatoryQtd) {
            const msgAux = (paramMandatoryQtd < paramObrigatorios.length) ? `ao menos ${paramMandatoryQtd} d` : ''
            executeResourceReturn = `Informe ${msgAux}os parametros obrigatórios. ` + paramObrigatorios
            erro = true
        }
    } 
    return [erro, executeResourceReturn]
}

// mensagem de erro padrao
export function montaResposta(msg, sucesso=false) {
    if (sucesso) { 
        return { success : msg } 
    } else {
        return { erro : msg}
    }
}

export function getHIS(sigla) {
    const empr  = JSON.parse(process.env.ENVEMPR)
    let his  = ''
    let his_ = ''
    let empresa = ''
    Object.keys(empr).forEach(base => {
        Object.keys(empr[base]).forEach(element => {
            if ( element == 'his' ) { his_ = empr[base]['his']}            
            if ( element == String(sigla).toUpperCase() ) { 
                his = his_ 
                empresa = empr[base][sigla]['cd_multi_empresa']
            }
        })
    })    
    return [ his, empresa ]
}

export async function envEmpresas() {
    let it = {
        status  : false,
        envEmpr : {}
    }
    const token = await getTokenKeyCloack()    
    if (token.status) {
        process.env.SYSTEM_TOKEN = token.token
        const envEmpr = await getEnvEmpresas()    
        if (envEmpr.status) {
            process.env.ENVEMPR = JSON.stringify(envEmpr.empresas)
            p(envEmpr.empresas,dResult)
            it.status  = true
        } 
        it.envEmpr = envEmpr.empresas
    } else {
        it.envEmpr = token.token
    }
    return it
}

// testa se o objeto eh numero
export function isInteger(obj: any): number {
    return (parseInt(obj) == obj) ? parseInt(obj) : 1
}

// verifica se um objeto eh vazio
export function isEmpty(obj) {    
    if (obj === undefined) { return true }
    if (obj.constructor === Object) {
        return Object.entries(obj).length === 0
    } else if (obj.constructor === Array) {
            return obj.length === 0
        } else if (obj.constructor === String) {
                return obj.trim() === ''
            } else if (typeof(obj) == 'object') {
                    return Object.entries(obj).length === 0
                } else {
                    return false
                }        
}

export const utcToLocal = (dateStr, dataFormato): string => {
    if (dateStr != null) {
        const date = new Date(dateStr)
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'America/Sao_Paulo',
            hour12: false
        }
        const formatter = new Intl.DateTimeFormat('en-GB', options)
        try {
            const formattedDate: string = formatter.format(date)
            const [datePart, timePart] = formattedDate.split(", ")
            const [hour, min, sec] = timePart.split(":")
            const [day, month, year] = datePart.split("/")
            return dataFormato.replace('DD',day).replace('MM',month).replace('YYYY',year).replace('HH',hour).replace('mm',min).replace('SS',sec)
        } catch {
            return null
        }
    } else { 
        return null 
    }
}

export function mapear(obj, campos, camposData) {
    const keys = Object.keys(campos)
    const vlr  = Object.values(campos)
    let newObj = []
    for (const linha of obj) {
        let it = {}
        keys.forEach((item, index) => {
            if (camposData.includes(item)) {
                //it[item] = formatandoData(getCampo(vlr[index],linha))
                //it['dataUTC'] = dateString3ToDateUTC(formatandoData(getCampo(vlr[index],linha)))
                it[item] = DateTime.fromFormat(formatandoData(getCampo(vlr[index],linha)), "dd/MM/yyyy, HH:mm", { zone: "America/Sao_Paulo" })
            } else {
                it[item] = getCampo(vlr[index],linha)
            }
        })
        newObj.push(it)
    }
    return newObj
}

export function formatandoData(data_) {
    const dataFormatada = new Date(data_ * 1000).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    return dataFormatada
}

export function getCampo(campoJSON, objeto, tipo = null, defaultValue = null) {
    // exemplo: reserva/dataEHoraDeInicioDaCirurgia
    if ((typeof(objeto)=='string') && (String(objeto).trim() == '')) {  return defaultValue  }
    let existe = true
    while (campoJSON.includes('/')) {
        let key = campoJSON.substring(0, campoJSON.indexOf('/'))
        campoJSON = campoJSON.substring(campoJSON.indexOf('/') + 1)
        if (objeto && key in objeto) {
            objeto = objeto[key]
            if (campoJSON.includes('external-ref-num')) {
                if (isEmpty(objeto)) {
                    existe = false
                    break
                }
            }
        } else {
            existe = false
            break
        }
    }    
    if (existe) {
        if (objeto != null) {
            if (campoJSON in objeto) {                
                let objetoCampoJSON = String(objeto[campoJSON]).trim()                
                if (objetoCampoJSON.toLowerCase() === 'null' || objetoCampoJSON.toLowerCase() === 'none') return null
                if (tipo === null) {
                    return objeto[campoJSON]
                } else if (tipo === 'str') {
                    return objetoCampoJSON
                } else if (tipo === 'int') {
                    let retorno
                    try {
                        retorno = parseInt(objetoCampoJSON, 10)
                    } catch (error) {
                        retorno = defaultValue
                    }
                    return retorno
                } else if (tipo === 'date') {
                    try {
                        const date = new Date(objetoCampoJSON)
                        return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    } catch (error) {
                        console.error('Erro ao converter para DATE:', campoJSON, ': valor:', objetoCampoJSON)
                        return defaultValue
                    }
                }
            } else {
                return defaultValue
            }
        } else {
            return defaultValue
        }
    } else {
        return defaultValue
    }
}

export function saveUsers(users) {
    let flag = true
    users.forEach(linha =>{
        if (flag) { 
            flag = false
            fs.writeFileSync('users.txt', linha+'\n') 
        } else { 
            fs.appendFileSync('users.txt', linha+'\n') 
        }
    })
}

export function getUsers() {
    let users = []
    fs.readFile('users.txt', 'utf-8', function(err, data){
        let linhas = data.split(/\r?\n/)
        linhas.forEach(function(linha){
            users.push(linha)
        })
    })
    return users
}

export function dateString3ToDateUTC(dateString3) {
    const [datePart, timePart] = dateString3.split(", ")
    const [day, month, year] = datePart.split("/").map(Number)
    const [hour, minute] = timePart.split(":").map(Number)
    return new Date(Date.UTC(year, month - 1, day, hour + 3, minute))
}

export function sysdate(minutos=null) {
    const now = DateTime.now().setZone("America/Sao_Paulo")
    if (minutos) {
        return now.minus({ minutes: minutos })
    } else {
        return now
    }
}

