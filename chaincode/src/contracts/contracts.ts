import { uuid } from './../definitions/types/types'
import * as uuidgen from 'uuid'
import { Context, Contract, Info, Transaction } from 'fabric-contract-api'
import { convertToBufferDeterministically } from '../utils/buffer.util'
import {
  AlreadyExistsError,
  BadDataError,
  ContractMismatchError,
  NotFoundError,
  OptionNotFoundError,
} from '../definitions/errors/all.error'

import { IType, TestType, PessoaJuridica, MedicamentoCatalogo, Medicamento } from '../models/models'
import { RAMO_ATIVIDADE } from '../definitions/enums/enums'

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
    const query = {
      selector: {
        contractType: this.getName(),
      },
    }
    const allResults: Type[] = (await this.getByQuery(ctx, query)) as Type[]

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
  protected async getByQuery(ctx: Context, json: unknown): Promise<Array<unknown>> {
    const allResults = []

    const iterator = await ctx.stub.getQueryResult(JSON.stringify(json))
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

    return allResults
  }
  protected async getByProperty(ctx: Context, json: any, extra: any = {}): Promise<Array<unknown>> {
    const query = {
      selector: {
        contractType: this.getName(),
        ...json,
      },
      ...extra,
    }
    const allResults: Type[] = (await this.getByQuery(ctx, query)) as Type[]

    return allResults
  }
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

@Info({ title: 'PessoaJuridicaContract', description: '' })
export class PessoaJuridicaContract extends AbstractContract<PessoaJuridica> {
  constructor() {
    super('PessoaJuridicaContract')
  }
  protected async convert(ctx: Context, json: string): Promise<PessoaJuridica> {
    const obj = JSON.parse(json)

    if (!Object.values(RAMO_ATIVIDADE).includes(obj.RamoAtividade)) {
      throw new OptionNotFoundError(
        'Ramo de atividade',
        obj.RamoAtividade,
        Object.values(RAMO_ATIVIDADE)
      )
    }

    const data: PessoaJuridica = obj

    const searchResults = (await this.getByProperty(ctx, {
      $or: [
        {
          cnpj: {
            $eq: data.cnpj,
          },
        },
        {
          nome: {
            $eq: data.nome,
          },
        },
      ],
    })) as PessoaJuridica[]

    if (searchResults.length !== 0) throw new AlreadyExistsError(`${data.cnpj}/${data.nome}`)

    return data
  }
}

@Info({ title: 'MedicamentoCatalogoContract', description: '' })
export class MedicamentoCatalogoContract extends AbstractContract<MedicamentoCatalogo> {
  constructor() {
    super('MedicamentoCatalogoContract')
  }
  protected async convert(ctx: Context, json: string): Promise<MedicamentoCatalogo> {
    const obj = JSON.parse(json)

    const requiredFields = [
      'nome',
      'uuidEmpresa',
      'unidade',
      'rotulos',
      'retemPrescricaoMedica',
      'temRelacionamento',
      'disponivel',
      'dataCriacao',
      'ultimaModificacao',
      'extras',
    ]

    if (!requiredFields.some((f) => Object.values(obj).includes(f))) {
      throw new BadDataError(requiredFields.join(), Object.values(obj).join())
    }

    const data: MedicamentoCatalogo = obj

    if (data.uuidEmpresa) {
      const exists =
        (
          (await this.getByQuery(ctx, {
            selector: {
              contractType: 'PessoaJuridicaContract',
              uuid: data.uuidEmpresa,
            },
          })) as PessoaJuridica[]
        ).length == 1

      if (!exists) throw new NotFoundError(data.uuidEmpresa, 'uuidEmpresa')
    }

    return data
  }
}

@Info({ title: 'MedicamentoContract', description: '' })
export class MedicamentoContract extends AbstractContract<Medicamento> {
  constructor() {
    super('MedicamentoContract')
  }
  protected async convert(ctx: Context, json: string): Promise<Medicamento> {
    const obj = JSON.parse(json)

    const requiredFields = [
      'uuidMedicamentoCatalogo',
      'serial',
      'lote',
      'rotulos',
      'status',
      'dataValidade',
      'dataFabricação',
      'extras',
    ]

    if (!requiredFields.some((f) => Object.values(obj).includes(f))) {
      throw new BadDataError(requiredFields.join(), Object.values(obj).join())
    }

    const data: Medicamento = obj

    if (data.uuidMedicamentoCatalogo) {
      const exists =
        (
          (await this.getByQuery(ctx, {
            selector: {
              contractType: 'MedicamentoCatalogoContract',
              uuid: data.uuidMedicamentoCatalogo,
            },
          })) as PessoaJuridica[]
        ).length == 1

      if (!exists) throw new NotFoundError(data.uuidMedicamentoCatalogo, 'uuidMedicamentoCatalogo')
    }

    return data
  }
}
