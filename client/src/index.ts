/*

WhatsApp Client

version 1.00.00 - 26/11/2024

*/

import cors      from 'cors'
import express   from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from './config/swagger.json'
import { p } from './api/debug'
import { saveUsers, getUsers } from './api/comum'

const app = express()
const routes = require('./config/routes');
const routes_whatsapp = require('./config/routes_whatsapp');

app.disable('x-powered-by')
app.use(cors())
app.use(express.json())
app.use((err, req, res, next) => {
    const msgError = (err.stack.includes('in JSON at position')) ? 'JSON invalido' : err.stack
    res.status(422).send({ erro : msgError })
})
app.use(express.urlencoded({extended: true}))
app.use('/', routes)
app.use('/whatsapp', routes_whatsapp)

//saveUsers(['5511969799183'])
global.gUsers = getUsers()

process.env.VERSION='1.00.00 - 26/11/2024 build _:30'
console.clear()

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

async function connect() {    
    try {
        const port = process.env.PORT ?? 3009
        process.env.DEBUG = (process.env.DEBUG) ?? '1'
        app.listen(port, () => {
            console.info('API WhatsApp Client - Backend Listen at ' + port);
            console.info('version : ' + process.env.VERSION)
            console.info('DEBUG   : ' + process.env.DEBUG)
        }).on('error', (err: string) => {
            if (parseInt(process.env.DEBUG) > 0) { 
                console.info('API WhatsApp Client - Server Error : ' + err) 
            } else {
                console.info('API WhatsApp Client - Server doesnt Online') 
            }
            });
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

connect()

