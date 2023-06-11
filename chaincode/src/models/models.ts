import { Property } from 'fabric-contract-api'
import { RAMO_ATIVIDADE } from '../definitions/enums/enums'
import { uuid } from '../definitions/types/types'

export interface IType {
  uuid?: string
  contractType?: string
}

@Object()
export class TestType implements IType {
  @Property()
  public uuid?: string | undefined
  @Property()
  public contractType?: string
}

@Object()
export class PessoaJuridica implements IType {
  @Property()
  public uuid?: uuid
  @Property()
  public contractId?: string

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
export class MedicamentoCatalogo implements IType {
  @Property()
  public uuid?: uuid
  @Property()
  public contractId?: string

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
  // @Property()
  // public temRelacionamento!: boolean
  @Property()
  public disponivel!: boolean
  // @Property()
  // public dataCriacao!: Date
  // @Property()
  // public ultimaModificacao!: Date
  @Property()
  public extras!: string
}

@Object()
export class Medicamento implements IType {
  @Property()
  public uuid?: uuid
  @Property()
  public contractId?: string

  @Property()
  public uuidMedicamentoCatalogo!: uuid
  @Property()
  public serial!: string
  @Property()
  public lote?: string
  @Property()
  public rotulos!: string[]
  @Property()
  public status!: string
  @Property()
  public dataValidade!: string
  @Property()
  public dataFabricação!: string
  @Property()
  public extras!: string
}
