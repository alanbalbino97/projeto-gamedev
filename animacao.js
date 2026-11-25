
function Animacao(context) {
   this.context = context;
   this.sprites = [];
   this.processamentos = [];
   this.spritesExcluir = [];
   this.ligado = false;
   this.ultimoTempo = null;
   this.idFrame = null;
   this.jogo = null;
}
Animacao.prototype = {
   novoSprite: function(sprite) {
      this.sprites.push(sprite);
      sprite.animacao = this;
   },
   novoProcessamento: function(processamento) {
      this.processamentos.push(processamento);
      processamento.animacao = this;
   },
   excluirSprite: function(sprite) {
      if (!sprite.excluido) {
         sprite.excluido = true;
         this.spritesExcluir.push(sprite);
      }
   },
   processarExclusoes: function() {
      if (!this.spritesExcluir.length) return;
      this.sprites = this.sprites.filter(function(sprite) {
         return !sprite.excluido;
      });
      this.spritesExcluir = [];
   },
   ligar: function() {
      if (this.ligado) return;
      this.ligado = true;
      this.ultimoTempo = null;
      var animacao = this;
      this.idFrame = requestAnimationFrame(function(agora) {
         animacao.proximoFrame(agora);
      });
   },
   desligar: function() {
      this.ligado = false;
      if (this.idFrame !== null) cancelAnimationFrame(this.idFrame);
      this.idFrame = null;
   },
   proximoFrame: function(agora) {
      if (!this.ligado) return;
      var dt = this.ultimoTempo === null ? 0 : Math.min((agora - this.ultimoTempo) / 1000, 0.05);
      this.ultimoTempo = agora;

      if (!this.jogo.pausado && !this.jogo.terminou) {
         this.jogo.atualizar(dt);
         var atualizados = this.sprites.slice();
         for (var i = 0; i < atualizados.length; i++) {
            if (!atualizados[i].excluido) atualizados[i].atualizar(dt);
         }
         for (var j = 0; j < this.processamentos.length; j++)
            this.processamentos[j].processar();
         this.processarExclusoes();
      }

      this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
      for (var k = 0; k < this.sprites.length; k++) {
         if (!this.sprites[k].excluido) this.sprites[k].desenhar();
      }
      this.jogo.desenharPainel();
      if (this.jogo.pausado) this.jogo.desenharMensagem('PAUSADO', 'Pressione P para continuar');
      if (this.jogo.terminou) this.jogo.desenharMensagem('GAME OVER', 'Pontuação: ' + this.jogo.pontos + '  •  Reinicie para jogar');

      if (!this.ligado) return;
      var animacao = this;
      this.idFrame = requestAnimationFrame(function(tempo) {
         animacao.proximoFrame(tempo);
      });
   }
};
