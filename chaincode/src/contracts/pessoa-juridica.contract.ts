import { Context, Contract, Info, Transaction } from 'fabric-contract-api'
import { PessoaJuridica } from '../models/models'
import { NotFoundError, AlreadyExistsError, BadDataError } from '../definitions/errors/all.error'
import { convertToBufferDeterministically } from '../utils/buffer.util'
import { RAMO_ATIVIDADE } from '../definitions/enums/enums'

@Info({ title: 'PessoaJuridicaContract', description: '' })
export class PessoaJuridicaContract extends Contract {
  constructor() {
    super('PessoaJuridicaContract')
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
  public async Exists(ctx: Context, uuid: string): Promise<boolean> {
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
  public async Create(
    ctx: Context,
    uuid: string,
    cnpj: string,
    nome: string,
    RamoAtividade: string,
    extras: string
  ): Promise<void> {
    const exists = await this.Exists(ctx, uuid)

    if (exists) {
      throw new AlreadyExistsError(uuid)
    }

    const data: PessoaJuridica = this.createObject(RamoAtividade, uuid, cnpj, nome, extras)

    // Inserção determinística das propriedades no JSON
    await ctx.stub.putState(uuid, convertToBufferDeterministically(data))
  }

  private createObject(
    RamoAtividade: string,
    uuid: string,
    cnpj: string,
    nome: string,
    extras: string
  ) {
    try {
      if (!Object.values(RAMO_ATIVIDADE).includes(RamoAtividade as RAMO_ATIVIDADE)) {
        throw new BadDataError('RamoAtividade', RamoAtividade)
      }
    } catch (error) {
      throw new BadDataError('RamoAtividade', RamoAtividade)
    }

    const data: PessoaJuridica = {
      uuid: uuid,
      cnpj: cnpj,
      nome: nome,
      RamoAtividade: RAMO_ATIVIDADE[RamoAtividade as RAMO_ATIVIDADE],
      extras: extras,
    }
    return data
  }
  @Transaction()
  public async Update(ctx: Context, jsonData: string): Promise<void> {
    const data: PessoaJuridica = JSON.parse(jsonData)

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
        // || (await this.GetObject(ctx, uuid)) instanceof PessoaJuridica) {
        throw new NotFoundError(uuid)
      }
    } catch (error) {
      throw new NotFoundError(uuid)
    }

    return ctx.stub.deleteState(uuid)
  }

  async Validate(ctx: Context, data: PessoaJuridica): Promise<void> {
    console.log(data)
  }
}
