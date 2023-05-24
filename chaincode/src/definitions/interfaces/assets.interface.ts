import { DefaultType, IAtividade, IPessoaJuridica } from '.'
import { uuid } from '../types/types'

export interface IMedicamento {
  uuid: uuid
  uuidMedicamentoCatalogo: uuid
  serial: string
  lote?: string
  rotulos: string[]
  status: string
  dataValidade: Date
  dataFabricação: Date
  extras: string
}

export interface ILote {
  uuid: uuid
  lote: string
  empresa: IPessoaJuridica
  status: string
  atividades: IAtividade[]
  extras: string
}

export interface IMedicamentoCatalogo extends DefaultType {
  nome: string
  uuidEmpresa: string
  unidade: string
  rotulos: string[]
  retemPrescricaoMedica: boolean
  temRelacionamento: boolean
  disponivel: boolean
  dataCriacao: Date
  ultimaModificacao: Date
  extras: string
}
