
function Ranking(chave, armazenamento) {
   this.chave = chave || 'missao-espacial-ranking-v1';
   this.armazenamento = armazenamento || null;
   this.persistente = false;
   if (arguments.length < 2) {
      try { this.armazenamento = window.localStorage; } catch (erro) { this.armazenamento = null; }
   }
   this.resultados = [];
   this.carregar();
}
Ranking.prototype = {
   normalizarNome: function(nome) {
      return String(nome || '').replace(/\s+/g, ' ').trim().slice(0, 18);
   },
   carregar: function() {
      if (!this.armazenamento) return;
      try {
         var dados = JSON.parse(this.armazenamento.getItem(this.chave) || '[]');
         if (!Array.isArray(dados)) return;
         var ranking = this;
         this.resultados = dados.filter(function(item) {
            return item && typeof item.nome === 'string' &&
                   Number.isInteger(item.pontos) && item.pontos >= 0;
         }).map(function(item) {
            return {nome: ranking.normalizarNome(item.nome) || 'Jogador', pontos: item.pontos};
         }).sort(function(a,b) { return b.pontos - a.pontos; }).slice(0, 10);
         this.persistente = true;
      } catch (erro) { this.persistente = false; }
   },
   melhor: function() {
      return this.resultados.length ? this.resultados[0] : null;
   },
   listar: function() {
      return this.resultados.slice();
   },
   registrar: function(nome, pontos) {
      var nomeLimpo = this.normalizarNome(nome);
      if (!nomeLimpo) throw new Error('Digite seu nome antes de salvar.');
      if (!Number.isInteger(pontos) || pontos < 0) throw new Error('Pontuação inválida.');
      var entrada = {nome: nomeLimpo, pontos: pontos};
      this.resultados.push(entrada);
      this.resultados.sort(function(a, b) { return b.pontos - a.pontos; });
      var posicao = this.resultados.indexOf(entrada) + 1;
      this.resultados = this.resultados.slice(0,10);
      if (this.armazenamento) {
         try {
            this.armazenamento.setItem(this.chave, JSON.stringify(this.resultados));
            this.persistente = true;
         } catch (erro) { this.persistente = false; }
      }
      return {entrou: posicao <= 10, posicao: posicao <= 10 ? posicao : 0,
              recorde: posicao === 1, nome: nomeLimpo, pontos: pontos};
   }
};
