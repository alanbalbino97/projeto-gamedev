// Testes offline das regras: rode `node testes-logica.js`.
const fs = require('fs'), vm = require('vm'), assert = require('assert'), path = require('path');
const raiz = __dirname;
for (const nome of ['animacao','colisor','fundo','nave','tiro','ovni','powerup','particulas','ranking','jogo'])
  vm.runInThisContext(fs.readFileSync(path.join(raiz,nome+'.js'),'utf8'), {filename:nome+'.js'});
const ctx = {canvas:{width:640,height:780},
  save(){},restore(){},drawImage(){},fillRect(){},clearRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},translate(){},rotate(){}};
const imagens={fundo:{width:640,height:888},nave:{width:36,height:48},ovni:{width:64,height:32},
  estrela:{width:128,height:128},chave:{width:128,height:128},escudo:{width:128,height:128}};
const teclado={pressionada(){return false;},limpar(){}};
function novo(){return new Jogo(ctx,teclado,imagens)}
{
  let jogo=novo(), n=jogo.nave;
  assert.strictEqual(n.vidas,5);
  let ovni=new Ovni(ctx,imagens.ovni,jogo,1);
  ovni.x=150;ovni.y=100;jogo.adicionarSprite(ovni,true);
  let tiro=new Tiro(ctx,n,182);tiro.x=182;tiro.y=112;jogo.adicionarSprite(tiro,true);
  jogo.colisor.processar(); jogo.animacao.processarExclusoes();
  assert.strictEqual(jogo.pontos,1);
  assert(ovni.excluido && tiro.excluido);
  jogo.colisor.processar();assert.strictEqual(jogo.pontos,1);
}
{
 let jogo=novo(),n=jogo.nave;
 let estrela=new PowerUp(ctx,imagens.estrela,'estrela',jogo);
 estrela.x=n.x;estrela.y=n.y;jogo.adicionarSprite(estrela,true);
 jogo.colisor.processar();jogo.animacao.processarExclusoes();
 assert.strictEqual(n.escudoAte,15);assert(estrela.excluido);
 let ovni=new Ovni(ctx,imagens.ovni,jogo,1);ovni.x=n.x;ovni.y=n.y+20;
 jogo.adicionarSprite(ovni,true);jogo.colisor.processar();jogo.animacao.processarExclusoes();
 assert.strictEqual(n.vidas,5);assert.strictEqual(jogo.pontos,0);
 jogo.tempo=16;
 let ovni2=new Ovni(ctx,imagens.ovni,jogo,1);ovni2.x=n.x;ovni2.y=n.y+20;
 jogo.adicionarSprite(ovni2,true);jogo.colisor.processar();jogo.animacao.processarExclusoes();
 assert.strictEqual(n.vidas,4);
 let ovni3=new Ovni(ctx,imagens.ovni,jogo,1);ovni3.x=n.x;ovni3.y=n.y+20;
 jogo.adicionarSprite(ovni3,true);jogo.colisor.processar();jogo.animacao.processarExclusoes();
 assert.strictEqual(n.vidas,4); // 1,25 s após uma colisão.
 jogo.tempo=18;
 let ovni4=new Ovni(ctx,imagens.ovni,jogo,1);ovni4.x=n.x;ovni4.y=n.y+20;
 jogo.adicionarSprite(ovni4,true);jogo.colisor.processar();jogo.animacao.processarExclusoes();
 assert.strictEqual(n.vidas,3);
}
{
 let jogo=novo(),n=jogo.nave;
 jogo.ativarPoder('chave');
 assert.strictEqual(n.tiroDuploAte,15);
 n.atirar();
 assert.strictEqual(jogo.animacao.sprites.filter(s=>s.tipo==='tiro').length,2);
 jogo.tempo=16;n.atirar();
 assert.strictEqual(jogo.animacao.sprites.filter(s=>s.tipo==='tiro').length,3);
 jogo.tempo=37;jogo.atualizar(0.016);
 assert.strictEqual(jogo.nivel,3);
}
{
 const registros = {};
 const armazenamento = {getItem(k){return registros[k] || null;},setItem(k,v){registros[k] = v;}};
 const ranking = new Ranking('teste-ranking', armazenamento);
 assert.strictEqual(ranking.melhor(), null);
 assert.strictEqual(ranking.registrar('  Ana   Silva ', 4).posicao, 1);
 assert.strictEqual(ranking.registrar('Beto', 9).recorde, true);
 assert.strictEqual(ranking.registrar('Lu', 6).posicao, 2);
 assert.strictEqual(ranking.melhor().nome, 'Beto');
 assert.deepStrictEqual(ranking.listar().map(r => r.pontos), [9,6,4]);
 const recarregado = new Ranking('teste-ranking', armazenamento);
 assert.deepStrictEqual(recarregado.listar().map(r => r.nome), ['Beto','Lu','Ana Silva']);
 for(let i = 0; i < 10; i++) ranking.registrar('Novo' + i, i + 10);
 assert.strictEqual(ranking.listar().length, 10);
 assert.strictEqual(ranking.registrar('Sem Recorde', 1).entrou, false);
 assert.strictEqual(ranking.listar().length, 10);
 assert.throws(() => ranking.registrar('  ',4));
}
{
 let disparos = 0;
 let jogo = new Jogo(ctx,teclado,imagens, () => disparos++);
 jogo.pontos = 22;
 jogo.terminar(); jogo.terminar();
 assert.strictEqual(disparos,1);
 assert.strictEqual(jogo.terminou,true);
}
console.log('PASSOU: 5 vidas, OVNI = 1 ponto, poderes 15s, proteção após dano, nível a cada 18s, ranking local, recorde, persistência e fim de jogo único.');
