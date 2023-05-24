export class NotFoundError extends Error {
  constructor(data: string) {
    super('Registro não encontrado: ' + data)
  }
}

export class AlreadyExistsError extends Error {
  constructor(data: string) {
    super('Registro já existe: ' + data)
  }
}

export class BadDataError extends Error {
  constructor(property: string, data: string) {
    super(`Propriedade "${property}" inválida para: ${data}`)
  }
}

export class ContractMismatchError extends Error {
  constructor(contract: string, value: string) {
    super(
      `Propriedade contractType inválida para o contrato "${contract}" e o encontrado foi ${value}`
    )
  }
}
