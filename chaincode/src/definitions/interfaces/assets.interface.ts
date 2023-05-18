import { IAtividade, IPessoaJuridica } from '.'
import { UUID } from '../types/types'

export interface IMedicamento {
  uuid: UUID
  uuidMedicamentoCatalogo: UUID
  serial: string
  lote?: string
  rotulos: string[]
  status: string
  dataValidade: Date
  dataFabricação: Date
  extras: string
}

export interface ILote {
  uuid: UUID
  lote: string
  empresa: IPessoaJuridica
  status: string
  atividades: IAtividade[]
  extras: string
}

export interface IMedicamentoCatalogo {
  uuid: UUID
  nome: string
  empresa: IPessoaJuridica
  unidade: string
  rotulos: string[]
  retemPrescricaoMedica: boolean
  temRelacionamento: boolean
  disponivel: boolean
  dataCriacao: Date
  ultimaModificacao: Date
  extras: string
}
