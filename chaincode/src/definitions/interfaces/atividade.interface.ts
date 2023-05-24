import { IPessoaJuridica, ILocal, IConsumidorPessoaJuridica, IConsumidorFinalPessoaFisica } from '.'
import { TIPO_ATIVIDADE, TIPO_TRANSPORTE } from '../enums/enums'

export interface IAtividade {
  uuid: string
  seq: number
  tipoAtividade: TIPO_ATIVIDADE
  author: string
  dataCriacao: Date
  ultimaModificacao: Date
  extras: string
}

export interface ITransporteAtividade extends IAtividade {
  transportadora: keyof IPessoaJuridica
  tipoTransporte: TIPO_TRANSPORTE
  remetente: IPessoaJuridica
  destinatario: IPessoaJuridica
  localRemetente: ILocal
  localDestinatario: ILocal
}

export interface IInspecaoAtividade extends IAtividade {
  responsavel: IPessoaJuridica
  resultado: string
}

export interface IIncidenteAtividade extends IAtividade {
  responsavel: IPessoaJuridica
  descricao: string
}

export interface IOutraAtividade extends IAtividade {
  atividade: string
  descricao: string
}

export interface IVendaAtividade extends IAtividade {
  vendedor: IPessoaJuridica
  consumidor: IConsumidorPessoaJuridica | IConsumidorFinalPessoaFisica
}
