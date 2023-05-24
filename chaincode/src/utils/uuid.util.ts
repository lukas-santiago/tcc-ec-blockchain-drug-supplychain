import * as uuidgen from 'uuid'
import { Context } from 'fabric-contract-api'

import { uuid } from '../definitions/types/types'

export class UUIDGenerator {
  newUUID(): uuid { //context: Context, stringToHash: uuid
    // const defaultNameSpace = 'da14e742-91e4-4088-9ff9-f7cef3de5561'

    // let MSPID = uuidgen.v4()
    // try {
    //   MSPID = uuidgen.v5(context.clientIdentity.getMSPID(), defaultNameSpace)
    // } catch (error) {
    //   console.log(error)
    //   MSPID = uuidgen.v4()
    // }

    return uuidgen.v4()
  }
  validateUUID(uuid: uuid): boolean {
    return uuidgen.validate(uuid) && uuidgen.version(uuid) === 4
  }
}
