export class NotFoundError extends Error {
  constructor(data: string, property = '') {
    super('Registro não encontrado: ' + data + (property ? ' - Propriedade: ' + property : ''))
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

export class OptionNotFoundError extends Error {
  constructor(enumName: string, optionTested: string, availableOptions: string[]) {
    super(
      `Opção não foi encontrada para o enum "${enumName}" com o valor "${optionTested}". Valores disponíveis: ${availableOptions.join(
        ', '
      )}`
    )
  }
}
