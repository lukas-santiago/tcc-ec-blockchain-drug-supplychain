import { promisify } from 'util'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

// Função util.promisify para transformar a função exec em uma Promise
const execPromise = promisify(exec)

// Função assíncrona para executar um comando shell
async function runShellCommand(cmd) {
  try {
    // Executando o comando
    const { stdout, stderr } = await execPromise(cmd)

    // Verificando erros
    if (stderr) {
      throw new Error(`Erro no comando: ${stderr}`)
    }

    // Retornando a saída do comando
    return stdout
  } catch (error) {
    console.error(`Erro ao executar o comando: ${error.message}`)
    throw error
  }
}

async function main() {
  try {
    // Comando a ser executado
    const cmd = 'node_modules/.bin/fabric-chaincode-node metadata generate'

    // Executando o comando e aguardando a resposta
    const output = await runShellCommand(cmd)

    // console.log(`Saída do comando:\n${output}`)

    const json = extractJSONFromText(output)

    const caminhoDiretorio = path.resolve('./ffi')
    const caminhoArquivo = `${caminhoDiretorio}/metadata.json`
    const conteudoArquivo = JSON.stringify(json, null, 2)

    // Cria o diretório se não existir
    if (!fs.existsSync(caminhoDiretorio)) {
      fs.mkdirSync(caminhoDiretorio)
    }

    // Salva o arquivo
    fs.writeFileSync(caminhoArquivo, conteudoArquivo)
    console.log({
      caminhoArquivo,
      caminhoDiretorio,
      a: fs.existsSync(caminhoDiretorio),
    })
  } catch (error) {
    console.error('Ocorreu um erro:', error)
  }
}

// Chamando a função principal
main()

function extractJSONFromText(text) {
  const regex = /({$\n*\s*"\$schema.*\n(?:.+\n)+^\})[\s]*$/gm
  const match = text.match(regex)

  if (match) {
    const json = JSON.parse(match[0])

    return json
  } else {
    console.log('Nenhum JSON encontrado no texto.')
  }
}
