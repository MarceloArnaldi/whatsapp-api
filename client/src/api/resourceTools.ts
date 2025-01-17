import { doRequest, doRequestOld, utcToLocal } from './comum'
import { p, dResult } from './debug';

async function callSystem(resource) {    
    let options = {
        'url': process.env.SYSTEM_URL + resource,
        'options': {
            'method': 'GET',  
            'timeout': process.env.SYSTEM_TIME_OUT,
            'headers': {
                'Authorization': process.env.SYSTEM_TOKEN
            }  
        }
    }
    try {                
        const response = await doRequestOld(options)        
        try {
            return response
        } catch (e) {
            return response.toString();
        }
    } catch (e) {        
        const msgError = (e.hasOwnProperty('code')) ? `{"erro":"durante o doRequestSystem : ${e['code']} "}` : e
        try {
            return JSON.parse(msgError)
        } catch (e) {
            return msgError
        }
    }    
}

export async function executeResource(resourceName, parametros, returnFileds=[], displayFields=[]) {  
    // configuracao DateTime
    const horaLocal     = true  
    const campoTipoData = /(dt_|DT_|hr_|HR_|Timestamp)/
    const dataFormato   = 'DD/MM/YYYY HH:mm:SS'
    //
    let params = ''
    let executeResourceReturn = {}
    Object.keys(parametros).forEach(key => {
        params += (params !== '') ? '&' : ''
        params += key + '=' + parametros[key]
    })
    let returnResource = await callSystem('/v1/' + resourceName + '?' + params)    
    const statusCode = ((returnResource.hasOwnProperty('erro')) || (returnResource.hasOwnProperty('error')) || ((JSON.stringify(returnResource)).includes('html'))) ? 422 : 200
    if (statusCode === 200) {
        let it = {}
        it['Dados'] = []
        if (returnResource.hasOwnProperty('Dados')) {
            returnResource.Dados.forEach(row => {
                let itRow = {}
                if (returnFileds.length > 0) {
                    returnFileds.forEach((field, index) => {
                        let vlr : string
                        if ((horaLocal) && (campoTipoData.test(field))) {
                            vlr = utcToLocal(row[field],dataFormato)
                        } else {
                            vlr = row[field]
                        }
                        if (displayFields.length > 0) {
                            itRow[displayFields[index]] = vlr
                        } else {                        
                            itRow[field] = vlr
                        }
                    })
                } else {
                    itRow = row
                }
                it['Dados'].push(itRow)
            })
        }
        returnResource = it
    }
    executeResourceReturn = returnResource
    p(executeResourceReturn,dResult)
    return [statusCode, executeResourceReturn]
}

export async function executeAnotherResource(returnResource, param, paramVlr, req, resource, returnFileds=[], returnDisplay=[], group='') {
    if (returnResource[0] === 200) {
        for (let linha of returnResource[1]['Dados']) { 
            const param_ = montaParam(param, paramVlr, req, linha)
            const aux = await executeResource(resource,param_,returnFileds, returnDisplay)
            if (aux[0] === 200) {     
                if ((aux[1].hasOwnProperty('Dados')) && (aux[1]['Dados'].length > 0)) {
                    if (group == '') {
                        Object.assign(linha, aux[1]['Dados'][0])
                    } else {
                        linha[group] = aux[1]['Dados']
                    }
                } 
            } else {
                linha['erro'] = resource + ' : ' + JSON.stringify(aux[1])
            }
        }
    }
}

export async function executeAnotherResourceCleaningUp(returnResource, param, paramVlr, req, resource, returnFileds=[], returnDisplay=[], group='') {
    if (returnResource[0] === 200) {
        for (let linha of returnResource[1]['Dados']) { 
            const param_ = montaParam(param, paramVlr, req, linha)
            const aux = await executeResource(resource,param_,returnFileds, returnDisplay)
            if (aux[0] === 200) {     
                if ((aux[1].hasOwnProperty('Dados')) && (aux[1]['Dados'].length > 0)) {
                    if (group == '') {
                        Object.assign(linha, aux[1]['Dados'][0])
                    } else {
                        linha[group] = aux[1]['Dados']
                    }
                } else {
                    returnResource[1]['Dados'] = returnResource[1]['Dados'].filter(obj => obj[paramVlr[0]] !== linha[paramVlr[0]])
                }
            } else {
                linha['erro'] = resource + ' : ' + JSON.stringify(aux[1])                
            }
        }
    }
}

export function montaParam(parametros, paramVlr, queryOriginal, linha) {
    let it = { 'unidade' : queryOriginal.query.unidade }
    parametros.forEach((param, index) => {
        if (paramVlr[index].includes('@')) {
            it[param] = paramVlr[index].replace('@','')
        } else {
            it[param] = linha[paramVlr[index]]
        }
    })
    return it
}

export async function getEnvEmpresas() {
    let it = {
        'empresas' : {},
        'status'   :  false
    }
    let options = {
        'url': process.env.COMUM_BASE_URL + '/v1/envEmpresas-completo',    
        'options': {
            'method': 'GET',
            'timeout': 1000,        
            'rejectUnauthorized': false,
            'headers': {
                'Content-Type'  : 'application/json',
                'Authorization' : process.env.SYSTEM_TOKEN
            }
        }
    }
    let response = await doRequestOld(options)
    if ((response != undefined) && (!response.hasOwnProperty('erro'))) { it.status = true }
    it.empresas = response
    return it
}

//export async function resourceWhatsApp(resourceName, method='GET', parametros, returnFileds=[], displayFields=[]) {  
export async function resourceWhatsApp(resourceName, method='GET', body={}) {  
    // const horaLocal     = true  
    // const campoTipoData = /(dt_|DT_|hr_|HR_|Timestamp)/
    // const dataFormato   = 'DD/MM/YYYY HH:mm:SS'
    // let params = ''
    // let executeResourceReturn = {}
    // Object.keys(parametros).forEach(key => {
    //     params += (params !== '') ? '&' : ''
    //     params += key + '=' + parametros[key]
    // })
    let returnResource = await callWhatsApp(resourceName, method, body)    
    const statusCode = returnResource[0]
    p(returnResource[1] ,dResult)
    return [statusCode, returnResource[1] ]
}

async function callWhatsApp(resource, method='GET', body={}) {    
    const searchParams = new URLSearchParams(body)
    let options = {
        'url': process.env.WHATSAPP_URL + resource,
        'options': {
            'method': method
        },
    }
    if (Object.keys(body).length > 0) { options.options['body'] = searchParams }    
    try {                
        const response = await doRequest(options)        
        try {
            return response
        } catch (e) {
            return response.toString()
        }
    } catch (e) {        
        const msgError = (e.hasOwnProperty('code')) ? `{"erro":"durante o callWhatsApp : ${e['code']} "}` : e
        try {
            return JSON.parse(msgError)
        } catch (e) {
            return msgError
        }
    }    
}