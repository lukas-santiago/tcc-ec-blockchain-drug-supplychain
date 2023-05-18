import { Contract } from 'fabric-contract-api'

class DrugSupplyChainContract extends Contract {
  constructor() {
    super('DrugSupplyChainContract')
  }

  //   async transactionA(ctx, newValue) {
  //     // retrieve existing chaincode states
  //     let oldValue = await ctx.stub.getState(key)

  //     await ctx.stub.putState(key, Buffer.from(newValue))

  //     return Buffer.from(newValue.toString())
  //   }

  //   async transactionB(ctx) {
  //     //  .....
  //   }
}

export default DrugSupplyChainContract
