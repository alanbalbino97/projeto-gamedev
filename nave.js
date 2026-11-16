
function Nave(context, teclado, imagem, jogo) {
   this.context = context;
   this.teclado = teclado;
   this.imagem = imagem;
   this.jogo = jogo;
   this.tipo = 'nave';
   this.largura = 54;
   this.altura = 72;
   this.x = (context.canvas.width - this.largura) / 2;
   this.y = context.canvas.height - this.altura - 35;
   this.velocidade = 285;
   this.vidas = 5;
   this.protegidaAte = 0; // intervalo curto após sofrer dano
   this.escudoAte = 0; // estrela: 15 segundos
   this.tiroDuploAte = 0; // chave: 15 segundos
   this.intervaloTiro = 0;
   this.inclinacao = 0;
}
Nave.prototype = {
   atualizar: function(dt) {
      var horizontal = Number(this.teclado.pressionada(SETA_DIREITA)) - Number(this.teclado.pressionada(SETA_ESQUERDA));
      var vertical = Number(this.teclado.pressionada(SETA_ABAIXO)) - Number(this.teclado.pressionada(SETA_ACIMA));
      var tamanho = Math.hypot(horizontal, vertical) || 1;
      this.x += horizontal / tamanho * this.velocidade * dt;
      this.y += vertical / tamanho * this.velocidade * dt;
      this.x = Math.max(0, Math.min(this.x, this.context.canvas.width - this.largura));
      this.y = Math.max(70, Math.min(this.y, this.context.canvas.height - this.altura));
      this.inclinacao += ((horizontal * 0.13) - this.inclinacao) * Math.min(1, dt * 9);
      this.intervaloTiro -= dt;
      if (this.teclado.pressionada(ESPACO) && this.intervaloTiro <= 0) {
         this.atirar();
         this.intervaloTiro = 0.23;
      }
   },
   desenhar: function() {
      var ctx = this.context;
      var t = this.jogo.tempo;
      // A nave pisca após receber dano; a proteção da estrela é separada.
      if (this.protegidaAte > t && Math.floor(t * 12) % 2 === 0) return;
      ctx.save();
      ctx.translate(this.x + this.largura/2, this.y + this.altura/2);
      ctx.rotate(this.inclinacao);
      ctx.drawImage(this.imagem, -this.largura/2, -this.altura/2, this.largura, this.altura);
      ctx.restore();
      if (this.escudoAte > t) {
         var raio = 97 + Math.sin(t * 6) * 3;
         ctx.save();
         ctx.globalAlpha = 0.88;
         ctx.drawImage(this.jogo.imagens.escudo, this.x + this.largura/2 - raio/2,
                       this.y + this.altura/2 - raio/2, raio, raio);
         ctx.restore();
      }
   },
   atirar: function() {
      if (this.jogo.terminou || this.jogo.pausado) return;
      var duplo = this.tiroDuploAte > this.jogo.tempo;
      var posicoes = duplo ? [0.27, 0.73] : [0.5];
      for (var i = 0; i < posicoes.length; i++) {
         var tiro = new Tiro(this.context, this, this.x + this.largura * posicoes[i]);
         this.jogo.adicionarSprite(tiro, true);
      }
   },
   retangulosColisao: function() {
      // Aproximação de três partes do corpo, como no código original.
      var sx = this.largura / 36, sy = this.altura / 48;
      return [
         {x: this.x+2*sx, y: this.y+19*sy, largura: 9*sx, altura: 13*sy},
         {x: this.x+13*sx, y: this.y+3*sy, largura: 10*sx, altura: 33*sy},
         {x: this.x+25*sx, y: this.y+19*sy, largura: 9*sx, altura: 13*sy}
      ];
   },
   colidiuCom: function(outro) {
      if (outro.excluido) return;
      if (outro instanceof PowerUp) {
         this.jogo.ativarPoder(outro.tipoPoder);
         this.jogo.removerSprite(outro);
      }
      if (outro instanceof Ovni) {
         // Remover o inimigo para não descontar vidas várias vezes.
         this.jogo.removerSprite(outro);
         this.jogo.criarExplosao(outro.x + outro.largura/2, outro.y + outro.altura/2, ['#fc8e5b', '#ffeb9d', '#c957e7']);
         if (this.escudoAte > this.jogo.tempo || this.protegidaAte > this.jogo.tempo) return;
         this.vidas--;
         this.protegidaAte = this.jogo.tempo + 1.25;
         this.jogo.aviso('NAVE ATINGIDA!', '#ff8ca9');
         if (this.vidas <= 0) this.jogo.terminar();
      }
   }
};
