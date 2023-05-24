import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { NotFoundError, AlreadyExistsError } from '../definitions/errors/all.error';
import { Medicamento } from '../models/models';
import { convertToBufferDeterministically } from '../utils/buffer.util';
import { MedicamentoCatalogoContract } from './medicamento-catalogo.contract';

// import { UUIDGenerator } from '../utils/uuid.util'
@Info({ title: 'MedicamentoContract', description: '' })
export class MedicamentoContract extends Contract {
  constructor() {
    super('MedicamentoContract');
  }

  @Transaction(false)
  public async GetAll(ctx: Context): Promise<string> {
    const allResults = [];

    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();

    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue) as Medicamento;
        allResults.push(record);
      } catch (err) {
        console.log(err);
        // record = strValue
      }
      result = await iterator.next();
    }

    return JSON.stringify(allResults);
  }

  @Transaction(false)
  public async Exists(ctx: Context, uuid: string): Promise<boolean> {
    const assetJSON = await ctx.stub.getState(uuid);
    return assetJSON && assetJSON.length > 0;
  }

  @Transaction(false)
  public async Get(ctx: Context, uuid: string): Promise<string> {
    const assetJSON = await ctx.stub.getState(uuid);

    if (!assetJSON || assetJSON.length === 0) {
      throw new NotFoundError(uuid);
    }

    return assetJSON.toString();
  }

  @Transaction()
  public async Create(ctx: Context, jsonData: string): Promise<void> {
    const data: Medicamento = JSON.parse(jsonData);

    const exists = await this.Exists(ctx, data.uuid);

    if (exists) {
      throw new AlreadyExistsError(data.uuid);
    }

    this.Validate(ctx, data);

    // Inserção determinística das propriedades no JSON
    await ctx.stub.putState(data.uuid, convertToBufferDeterministically(data));
  }

  async Validate(ctx: Context, data: Medicamento): Promise<void> {
    const contract = new MedicamentoCatalogoContract();

    if ((await contract.Exists(ctx, data.uuidMedicamentoCatalogo)) === false) {
      throw new NotFoundError(`PessoaJuridicaContract(${data.uuidMedicamentoCatalogo})`);
    }
  }
}
