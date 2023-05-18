import { IPessoaJuridica } from '.'

export interface IConsumidorPessoaJuridica {
  empresa: IPessoaJuridica
  motivo: string
}

export interface IConsumidorFinalPessoaFisica {
  cpf: string
  nomeCompleto: string
  nomeMae: string
  nomePai: string
  prescricaoMedica?: IPrescricaoMedica
}

export interface IPrescricaoMedica {
  sid: string
  crm: string
  cpf: string
}
