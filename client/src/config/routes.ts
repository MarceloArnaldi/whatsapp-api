import * as express                 from 'express'
import * as resources               from '../api/resources'

const router = express.Router()

router.get('/', resources.info)

router.get('/info', resources.info)

router.post('/v1/set-debug/', resources.setDebug)

module.exports = router