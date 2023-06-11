import {
  MedicamentoCatalogoContract,
  PessoaJuridicaContract,
  TestTypeContract,
} from './contracts/contracts'

export {
  PessoaJuridicaContract,
  TestTypeContract,
  MedicamentoCatalogoContract,
} from './contracts/contracts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const contracts: any[] = [
  TestTypeContract,
  PessoaJuridicaContract,
  MedicamentoCatalogoContract,
]
