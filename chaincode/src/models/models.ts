import { Property } from 'fabric-contract-api'
import { RAMO_ATIVIDADE } from '../definitions/enums/enums'
import { uuid } from '../definitions/types/types'

@Object()
export class PessoaJuridica {
  contractId?: string
  @Property()
  public uuid!: uuid

  @Property()
  public cnpj!: string
  @Property()
  public nome!: string
  @Property()
  public RamoAtividade!: RAMO_ATIVIDADE
  @Property()
  public extras!: string
}

@Object()
export class MedicamentoCatalogo {
  contractId?: string
  @Property()
  public uuid!: uuid

  @Property()
  public nome!: string
  @Property()
  public uuidEmpresa!: string
  @Property()
  public unidade!: string
  @Property()
  public rotulos!: string[]
  @Property()
  public retemPrescricaoMedica!: boolean
  @Property()
  public temRelacionamento!: boolean
  @Property()
  public disponivel!: boolean
  @Property()
  public dataCriacao!: Date
  @Property()
  public ultimaModificacao!: Date
  @Property()
  public extras!: string
}

@Object()
export class Medicamento {
  @Property()
  uuid!: uuid
  @Property()
  uuidMedicamentoCatalogo!: uuid
  @Property()
  serial!: string
  @Property()
  lote?: string
  @Property()
  rotulos!: string[]
  @Property()
  status!: string
  @Property()
  dataValidade!: Date
  @Property()
  dataFabricação!: Date
  @Property()
  extras!: string
}

export interface IType {
  uuid?: string
  contractType?: string
}

@Object()
export class TestType implements IType {
  @Property()
  uuid?: string | undefined
  @Property()
  contractType?: string
}
