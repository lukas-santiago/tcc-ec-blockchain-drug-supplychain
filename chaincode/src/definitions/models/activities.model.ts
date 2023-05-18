import { TIPO_ATIVIDADE, TIPO_TRANSPORTE } from '../enums/enums'
import {
  ITransporteAtividade,
  IPessoaJuridica,
  ILocal,
  IInspecaoAtividade,
  IIncidenteAtividade,
  IOutraAtividade,
  IVendaAtividade,
  IConsumidorPessoaJuridica,
  IConsumidorFinalPessoaFisica,
} from '../interfaces'

export class TransporteAtividade implements ITransporteAtividade {
  // Interface
  uuid!: string
  seq!: number
  tipoAtividade: TIPO_ATIVIDADE = TIPO_ATIVIDADE.TRANSPORTE
  author!: string
  dataCriacao!: Date
  ultimaModificacao!: Date
  extras!: string

  // Dados da atividade
  transportadora!: IPessoaJuridica
  tipoTransporte!: TIPO_TRANSPORTE
  remetente!: IPessoaJuridica
  destinatario!: IPessoaJuridica
  localRemetente!: ILocal
  localDestinatario!: ILocal
}

export class InspecaoAtividade implements IInspecaoAtividade {
  // Interface
  uuid!: string
  seq!: number
  tipoAtividade: TIPO_ATIVIDADE = TIPO_ATIVIDADE.INSPEÇÃO
  author!: string
  dataCriacao!: Date
  ultimaModificacao!: Date
  extras!: string

  // Dados da atividade
  responsavel!: IPessoaJuridica
  resultado!: string
}

export class IncidenteAtividade implements IIncidenteAtividade {
  // Interface
  uuid!: string
  seq!: number
  tipoAtividade: TIPO_ATIVIDADE = TIPO_ATIVIDADE.INCIDENTE
  author!: string
  dataCriacao!: Date
  ultimaModificacao!: Date
  extras!: string

  // Dados da atividade
  responsavel!: IPessoaJuridica
  descricao!: string
}

export class OutraAtividade implements IOutraAtividade {
  // Interface
  uuid!: string
  seq!: number
  tipoAtividade!: TIPO_ATIVIDADE
  author!: string
  dataCriacao!: Date
  ultimaModificacao!: Date
  extras!: string

  // Dados da atividade
  atividade!: string
  descricao!: string
}

export class VendaAtividade implements IVendaAtividade {
  // Interface
  uuid!: string
  seq!: number
  tipoAtividade!: TIPO_ATIVIDADE
  author!: string
  dataCriacao!: Date
  ultimaModificacao!: Date
  extras!: string

  // Dados da atividade
  vendedor!: IPessoaJuridica
  consumidor!: IConsumidorPessoaJuridica | IConsumidorFinalPessoaFisica
}
