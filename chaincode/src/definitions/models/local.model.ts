import { ILocal } from '../interfaces/local.interface'

export class Local implements ILocal {
  nomeLocal?: string
  endereco!: string
  cep?: string
}
