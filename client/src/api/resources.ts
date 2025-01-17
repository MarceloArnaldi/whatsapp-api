import * as debug from './debug'

export const info = (req, res) => {
    const https = (req.headers.host.includes('localhost')) ? '//' : 'https://'
    const swagger = https + req.headers.host + '/swagger/'        
    return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DASA Vertical Hospitais</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    margin: 50px;
                }            
                h1 {
                    color: #333;
                }            
                p {
                    color: #666;
                }            
                a {
                    color: #007BFF;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <h1>API Partner Modelo</h1>
            <p>Versão ${process.env.VERSION}</p>
            <p><a href="${swagger}">Swagger</a></p>                
        </body>
        </html>            
        `)
}

export const setDebug = async (req, res) => {
    debug.p(req.body)
    const warning       = (req.body.dWarning) ? debug.dWarning : 0
    const dToken        = (req.body.dToken) ? debug.dToken : 0
    const dConexaoBanco = (req.body.dConexaoBanco) ? debug.dConexaoBanco : 0
    const dDoRequest    = (req.body.dDoRequest) ? debug.dDoRequest : 0
    const dSQL          = (req.body.dSQL) ? debug.dSQL : 0
    const dRoles        = (req.body.dRoles) ? debug.dRoles : 0
    const dBinds        = (req.body.dBinds) ? debug.dBinds : 0
    const dResult       = (req.body.dResult) ? debug.dResult : 0
    const dResourceAuth = (req.body.dResourceAuth) ? debug.dResourceAuth : 0
    debug.setDebug(warning + dToken + dConexaoBanco + dDoRequest + dSQL + dRoles + dResourceAuth + dBinds + dResult)
    return res.status(200).json({ debug : process.env.DEBUG })
}