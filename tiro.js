
function Tiro(context, nave, centroX) {
   this.context = context;
   this.jogo = nave.jogo;
   this.tipo = 'tiro';
   this.largura = 5;
   this.altura = 19;
   this.x = centroX - this.largura/2;
   this.y = nave.y - this.altura + 2;
   this.velocidade = 520;
   this.cor = '#ffdb38';
}
Tiro.prototype = {
   atualizar: function(dt) {
      this.y -= this.velocidade * dt;
      if (this.y + this.altura < 0) this.jogo.removerSprite(this);
   },
   desenhar: function() {
      var ctx = this.context;
      ctx.save();
      ctx.shadowColor = '#ffe87a';
      ctx.shadowBlur = 12;
      ctx.fillStyle = this.cor;
      ctx.fillRect(this.x, this.y, this.largura, this.altura);
      ctx.fillStyle = '#fffbd4';
      ctx.fillRect(this.x+1, this.y, this.largura-2, this.altura-4);
      ctx.restore();
   },
   retangulosColisao: function() {
      return [{x:this.x, y:this.y, largura:this.largura, altura:this.altura}];
   },
   colidiuCom: function(outro) {}
};
