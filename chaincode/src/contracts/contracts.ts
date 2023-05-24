import { Context, Contract, Info, Transaction } from 'fabric-contract-api'
import {
  AlreadyExistsError,
  ContractMismatchError,
  NotFoundError,
} from '../definitions/errors/all.error'
import { convertToBufferDeterministically } from '../utils/buffer.util'
import { IType, TestType } from '../models/models'
import * as uuidgen from 'uuid'

export abstract class AbstractContract<Type extends IType> extends Contract {
  constructor(name: string) {
    super(name)
  }

  @Transaction(false)
  public async exists(ctx: Context, uuid: string): Promise<boolean> {
    const assetJSON = await ctx.stub.getState(uuid)

    if (!assetJSON || assetJSON.length === 0) {
      return false
    }

    const asset = await this.convert(ctx, assetJSON.toString())

    if (asset.contractType != this.getName()) {
      throw new ContractMismatchError(this.getName(), asset.contractType || 'não atribuido')
    }

    return assetJSON && assetJSON.length > 0
  }

  @Transaction(false)
  public async get(ctx: Context, uuid: string): Promise<string> {
    const assetJSON = await ctx.stub.getState(uuid)

    if (!assetJSON || assetJSON.length === 0) {
      throw new NotFoundError(uuid)
    }

    const asset = await this.convert(ctx, assetJSON.toString())

    if (asset.contractType != this.getName()) {
      throw new ContractMismatchError(this.getName(), asset.contractType || 'não atribuido')
    }

    return assetJSON.toString()
  }

  @Transaction(false)
  public async getAll(ctx: Context): Promise<string> {
    const allResults = []

    const query = {
      selector: {
        contractType: this.getName(),
      },
    }

    const iterator = await ctx.stub.getQueryResult(JSON.stringify(query))
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

  @Transaction()
  public async create(ctx: Context, json: string): Promise<void> {
    const data: Type = await this.convert(ctx, json)

    if (!data.uuid) {
      data.uuid = uuidgen.v4()
    } else {
      const exists = await this.globalExists(ctx, data.uuid)

      if (exists) throw new AlreadyExistsError(data.uuid)
    }

    if (!data.contractType) {
      data.contractType = this.getName()
    }

    await ctx.stub.putState(data.uuid, convertToBufferDeterministically(data))
  }

  @Transaction()
  public async delete(ctx: Context, uuid: string): Promise<void> {
    const exists = await this.exists(ctx, uuid)

    if (!exists) throw new NotFoundError(uuid)

    return ctx.stub.deleteState(uuid)
  }

  protected async globalExists(ctx: Context, uuid: string): Promise<boolean> {
    const assetJSON = await ctx.stub.getState(uuid)
    return assetJSON && assetJSON.length > 0
  }

  protected abstract convert(ctx: Context, json: string): Promise<Type>
}

@Info({ title: 'TestTypeContract', description: '' })
export class TestTypeContract extends AbstractContract<TestType> {
  constructor() {
    super('TestTypeContract')
  }
  protected async convert(ctx: Context, json: string): Promise<TestType> {
    const obj = JSON.parse(json)
    const data: TestType = obj
    return data
  }
}
