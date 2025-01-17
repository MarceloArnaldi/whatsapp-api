import * as express                 from 'express'
import * as resources               from '../api/resourceWhatsApp'
//import { verifyAccessToken }        from '../api/comum'

const router = express.Router()

//router.get('/v1/status', verifyAccessToken, resources.status)
router.get('/v1/status', resources.status)
router.get('/v1/status/:id', resources.status)
router.get('/v1/getChats/:id', resources.getChats) 
router.get('/v1/fetchMessages/:id', resources.fetchMessages) 
router.post('/v1/clearMessages/:id', resources.clearMessages) 

module.exports = router