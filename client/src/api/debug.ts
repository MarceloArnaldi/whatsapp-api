export const dWarning      = 1
export const dToken        = 2
export const dConexaoBanco = 4
export const dDoRequest    = 8
export const dSQL          = 16
export const dRoles        = 32
export const dResourceAuth = 64
export const dPoolStatus   = 128
export const dBinds        = 256
export const dResult       = 512

export function p(msg, level=1) {
    const debug = parseInt(process.env.DEBUG)   
    if (debug & level) {
        console.log(msg)
    }
}

export function setDebug(level) {
    process.env.DEBUG=level
}