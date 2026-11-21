// Roda as baterias de teste do guia, uma depois da outra, com um servidor só para a pasta do site gerado:
//
//   python3 site/build.py      gere o site antes
//   node testes/todos.mjs      todas; sai com erro se alguma conferência falhou
//   node testes/todos.mjs radio web     só as baterias nomeadas
//
// A regressão visual (regressao-visual.mjs) fica de fora: as fotos de referência valem para a máquina onde foram
// feitas, então ela roda à parte, na máquina de quem mexe no visual.
import { servir } from './comum.mjs';

const BATERIAS = ['navegacao', 'ferramentas', 'radio', 'web', 'acessibilidade'];
const pedidas = process.argv.slice(2).filter((x) => BATERIAS.includes(x));
const { servidor, url } = await servir();
const resultado = [];
for (const nome of pedidas.length ? pedidas : BATERIAS) {
  const inicio = Date.now();
  let falhas;
  try {
    const { rodar } = await import(`./${nome}.mjs`);
    falhas = await rodar(url);
  } catch (e) {
    console.log(`FALHA ${nome} parou com erro: ${e.stack || e}`);
    falhas = 1;
  }
  resultado.push([nome, falhas, Math.round((Date.now() - inicio) / 1000)]);
}
servidor.close();
console.log('\n== Resumo');
for (const [nome, falhas, s] of resultado) console.log(`${falhas ? 'FALHA' : 'ok   '} ${nome} (${s} s)${falhas ? `: ${falhas} falha(s)` : ''}`);
process.exit(resultado.some((x) => x[1]) ? 1 : 0);
