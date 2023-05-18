/* eslint-disable @typescript-eslint/no-unused-vars */
import { Object, Property } from 'fabric-contract-api'
import { UUID } from '../types/types'
import {
  IMedicamento,
  ILote,
  IPessoaJuridica,
  IAtividade,
  IMedicamentoCatalogo,
} from '../interfaces'

export class Medicamento implements IMedicamento {
  // Dados de Rastreio
  uuid!: UUID
  uuidMedicamentoCatalogo!: UUID
  serial!: string
  lote?: string

  // Dados da situação
  rotulos!: string[]
  status!: string

  // Dados de Fabricação
  dataValidade!: Date
  dataFabricação!: Date

  extras!: string
}

export class Lote implements ILote {
  // Dados de Rastreio
  uuid!: UUID
  lote!: string

  // Dados do lote
  empresa!: IPessoaJuridica
  status!: string
  atividades!: Array<IAtividade>

  extras!: string
}

export class MedicamentoCatalogo implements IMedicamentoCatalogo {
  // Dados de Rastreio
  uuid!: UUID

  // Dados do medicamento
  nome!: string
  empresa!: IPessoaJuridica
  unidade!: string
  rotulos!: string[]
  retemPrescricaoMedica!: boolean
  temRelacionamento!: boolean
  disponivel!: boolean

  // Metadados
  dataCriacao!: Date
  ultimaModificacao!: Date

  extras!: string
}
