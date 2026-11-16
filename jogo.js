
function Jogo(context, teclado, imagens, aoTerminar, ranking) {
   this.context = context;
   this.teclado = teclado;
   this.imagens = imagens;
   this.aoTerminar = typeof aoTerminar === 'function' ? aoTerminar : null;
   this.recorde = ranking && ranking.melhor() ? ranking.melhor().pontos : 0;
   this.tempo = 0;
   this.pontos = 0;
   this.nivel = 1;
   this.terminou = false;
   this.pausado = false;
   this.proximaOnda = 0.85;
   this.proximoPoder = 5 + Math.random()*2;
   this.mensagem = '';
   this.corMensagem = '#ffffff';
   this.mensagemAte = 0;

   this.animacao = new Animacao(context);
   this.animacao.jogo = this;
   this.colisor = new Colisor();
   this.animacao.novoProcessamento(this.colisor);
   this.fundo = new Fundo(context, imagens.fundo);
   this.animacao.novoSprite(this.fundo); // Fundo vem antes da nave.
   this.nave = new Nave(context, teclado, imagens.nave, this);
   this.adicionarSprite(this.nave, true);
}
Jogo.prototype = {
   iniciar: function() { this.animacao.ligar(); },
   adicionarSprite: function(sprite, usarColisor) {
      this.animacao.novoSprite(sprite);
      if (usarColisor) this.colisor.novoSprite(sprite);
   },
   removerSprite: function(sprite) {
      if (sprite.excluido) return;
      this.animacao.excluirSprite(sprite);
      if (sprite.colisor) sprite.colisor.excluirSprite(sprite);
   },
   criarExplosao: function(x, y, cores) {
      this.adicionarSprite(new Particulas(this.context, this, x, y, cores), false);
   },
   aviso: function(texto, cor) {
      this.mensagem = texto;
      this.corMensagem = cor || '#f9f1cc';
      this.mensagemAte = this.tempo + 1.8;
   },
   ativarPoder: function(tipoPoder) {
      if (tipoPoder === 'estrela') {
         this.nave.escudoAte = this.tempo + 15; // 15 segundos a partir da coleta.
         this.aviso('ESCUDO ATIVADO • 15s', '#8fddff');
      } else if (tipoPoder === 'chave') {
         this.nave.tiroDuploAte = this.tempo + 15;
         this.aviso('TIRO DUPLO • 15s', '#ffe991');
      }
   },
   criarOvni: function() {
      var ovni = new Ovni(this.context, this.imagens.ovni, this, this.nivel);
      this.adicionarSprite(ovni, true);
   },
   criarPoder: function() {
      var tipo = Math.random() < 0.5 ? 'estrela' : 'chave';
      var existente = this.colisor.sprites.some(function(s) {
         return s.tipo === 'poder' && !s.excluido;
      });
      if (!existente)
         this.adicionarSprite(new PowerUp(this.context, this.imagens[tipo], tipo, this), true);
   },
   atualizar: function(dt) {
      this.tempo += dt;
      // A cada 18 segundos, dificuldade sobe suavemente.
      this.nivel = Math.min(12, 1 + Math.floor(this.tempo / 18));
      if (this.tempo >= this.proximaOnda) {
         this.criarOvni();
         // Nos níveis mais altos, algumas ondas têm mais de um inimigo.
         if (this.nivel >= 3 && Math.random() < Math.min(0.48, 0.12 + (this.nivel-3)*0.065))
            this.criarOvni();
         var intervalo = Math.max(0.42, 1.30 - (this.nivel-1)*0.098);
         this.proximaOnda = this.tempo + intervalo;
      }
      if (this.tempo >= this.proximoPoder) {
         this.criarPoder();
         this.proximoPoder = this.tempo + 9 + Math.random()*5;
      }
   },
   terminar: function() {
      if (this.terminou) return; // evita abrir o formulário duas vezes.
      this.terminou = true;
      if (this.aoTerminar) this.aoTerminar(this.pontos);
   },
   alternarPausa: function() {
      if (!this.terminou) this.pausado = !this.pausado;
      if (this.pausado) this.teclado.limpar();
   },
   desenharCoracao: function(x, y, cheio) {
      var ctx = this.context;
      var pixels = [
         '0110110',
         '1111111',
         '1111111',
         '0111110',
         '0011100',
         '0001000'
      ];
      var escala = 3;
      ctx.save();
      for (var linha = 0; linha < pixels.length; linha++) {
         for (var coluna = 0; coluna < pixels[linha].length; coluna++) {
            if (pixels[linha][coluna] === '1') {
               ctx.fillStyle = cheio ? (linha < 2 ? '#ff7ca4' : '#f13b71') : '#4a4264';
               ctx.fillRect(x+coluna*escala,y+linha*escala,escala,escala);
            }
         }
      }
      ctx.restore();
   },
   desenharPainel: function() {
      var ctx = this.context;
      var w = ctx.canvas.width;
      ctx.save();
      ctx.fillStyle = 'rgba(3,8,29,0.82)';
      ctx.fillRect(0, 0, w, 67);
      ctx.strokeStyle = 'rgba(139,184,255,0.32)';
      ctx.beginPath(); ctx.moveTo(0,67); ctx.lineTo(w,67); ctx.stroke();
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#d8e2ff';
      ctx.fillText('VIDAS', 16, 18);
      for (var i=0; i<5; i++) this.desenharCoracao(17+i*28, 27, i<this.nave.vidas);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffec8f';
      ctx.font = 'bold 19px monospace';
      ctx.fillText('PONTOS: ' + this.pontos, w-16, 28);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#b9ceff';
      ctx.fillText('NÍVEL ' + this.nivel + '  |  ' + Math.floor(this.tempo) + 's', w-16, 49);
      ctx.fillStyle = '#a8f1c7';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('RECORDE: ' + Math.max(this.recorde, this.pontos), w/2, 49);
      ctx.textAlign = 'left';

      var escudo = Math.max(0, this.nave.escudoAte - this.tempo);
      var duplo = Math.max(0, this.nave.tiroDuploAte - this.tempo);
      var y = ctx.canvas.height - 34;
      if (escudo > 0 || duplo > 0) {
         ctx.fillStyle = 'rgba(3,8,29,0.85)';
         ctx.fillRect(0, y-9, w, 43);
         ctx.font = 'bold 13px monospace';
         if (escudo > 0) {
            ctx.fillStyle = '#7adaff';
            ctx.fillText('ESCUDO: ' + Math.ceil(escudo) + 's', 15, y+16);
         }
         if (duplo > 0) {
            ctx.fillStyle = '#ffe47a';
            ctx.fillText('TIRO DUPLO: ' + Math.ceil(duplo) + 's', escudo > 0 ? 235 : 15, y+16);
         }
      }
      if (this.mensagemAte > this.tempo) {
         ctx.textAlign = 'center';
         ctx.font = 'bold 16px monospace';
         ctx.shadowColor = '#000';
         ctx.shadowBlur = 8;
         ctx.fillStyle = this.corMensagem;
         ctx.fillText(this.mensagem, w/2, 102);
      }
      ctx.restore();
   },
   desenharMensagem: function(titulo, subtitulo) {
      var ctx = this.context, cx = ctx.canvas.width/2, cy=ctx.canvas.height/2;
      ctx.save();
      ctx.fillStyle = 'rgba(4,6,26,0.79)';
      ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
      ctx.textAlign = 'center';
      ctx.shadowColor='#000'; ctx.shadowBlur=12;
      ctx.font='bold 41px monospace';
      ctx.fillStyle = this.terminou ? '#ff829a' : '#8bdcff';
      ctx.fillText(titulo,cx,cy-22);
      ctx.font='15px monospace';
      ctx.fillStyle='#f4f1ff';
      ctx.fillText(subtitulo,cx,cy+21);
      ctx.font='12px monospace';
      ctx.fillStyle='#b5bedb';
      ctx.fillText(this.terminou ? 'Registre seu nome na tela' : 'Use o botão ou a tecla P',cx,cy+49);
      ctx.restore();
   }
};
