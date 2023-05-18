import {
  IConsumidorPessoaJuridica,
  IPessoaJuridica,
  IConsumidorFinalPessoaFisica,
  IPrescricaoMedica,
} from '../interfaces'

export class ConsumidorPessoaJuridica implements IConsumidorPessoaJuridica {
  empresa!: IPessoaJuridica
  motivo!: string
}

export class ConsumidorFinalPessoaFísica implements IConsumidorFinalPessoaFisica {
  cpf!: string
  nomeCompleto!: string
  nomeMae!: string
  nomePai!: string
  prescricaoMedica?: IPrescricaoMedica
}

export class PrescricaoMedica implements IPrescricaoMedica {
  sid!: string
  crm!: string
  cpf!: string
}
