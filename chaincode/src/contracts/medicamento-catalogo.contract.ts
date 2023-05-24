import { Contract, Context, Transaction, Info } from 'fabric-contract-api'
import { AlreadyExistsError, NotFoundError } from '../definitions/errors/all.error'
import { convertToBufferDeterministically } from '../utils/buffer.util'
import { uuid } from '../definitions/types/types'
import { MedicamentoCatalogo, PessoaJuridica } from '../models/models'
import { PessoaJuridicaContract } from './pessoa-juridica.contract'

@Info({ title: 'MedicamentoCatalogoContract', description: '' })
export class MedicamentoCatalogoContract extends Contract {
  constructor() {
    super('MedicamentoCatalogoContract')
  }

  @Transaction(false)
  public async GetAll(ctx: Context): Promise<string> {
    const allResults = []

    const iterator = await ctx.stub.getStateByRange('', '')
    let result = await iterator.next()

    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8')
      let record
      try {
        record = JSON.parse(strValue)
      } catch (err) {
        console.log(err)
        record = strValue
      }
      allResults.push(record)
      result = await iterator.next()
    }

    return JSON.stringify(allResults)
  }

  @Transaction(false)
  public async Exists(ctx: Context, uuid: uuid): Promise<boolean> {
    const assetJSON = await ctx.stub.getState(uuid)
    return assetJSON && assetJSON.length > 0
  }

  @Transaction(false)
  public async Get(ctx: Context, uuid: string): Promise<string> {
    const assetJSON = await ctx.stub.getState(uuid)

    if (!assetJSON || assetJSON.length === 0) {
      throw new NotFoundError(uuid)
    }

    return assetJSON.toString()
  }

  @Transaction()
  public async Create(ctx: Context, jsonData: string): Promise<void> {
    const data: MedicamentoCatalogo = JSON.parse(jsonData)

    const exists = await this.Exists(ctx, data.uuid)

    if (exists) {
      throw new AlreadyExistsError(data.uuid)
    }

    this.Validate(ctx, data)

    // Inserção determinística das propriedades no JSON
    await ctx.stub.putState(data.uuid, convertToBufferDeterministically(data))
  }

  @Transaction()
  public async Update(ctx: Context, jsonData: string): Promise<void> {
    const data: MedicamentoCatalogo = JSON.parse(jsonData)

    await this.Get(ctx, jsonData)
    this.Validate(ctx, data)

    // Inserção determinística das propriedades no JSON
    await ctx.stub.putState(data.uuid, convertToBufferDeterministically(data))
  }

  @Transaction()
  public async Delete(ctx: Context, uuid: string): Promise<void> {
    const exists = await this.Exists(ctx, uuid)

    try {
      if (!exists) {
        // || (await this.GetObject(ctx, uuid)) instanceof MedicamentoCatalogo) {
        throw new NotFoundError(uuid)
      }
    } catch (error) {
      throw new NotFoundError(uuid)
    }

    return ctx.stub.deleteState(uuid)
  }

  async Validate(ctx: Context, data: MedicamentoCatalogo): Promise<void> {
    const pessoaJuridicaContract = new PessoaJuridicaContract()

    if ((await pessoaJuridicaContract.Exists(ctx, data.uuidEmpresa)) === false) {
      throw new NotFoundError(`PessoaJuridicaContract(${data.uuidEmpresa})`)
    }
  }
}
