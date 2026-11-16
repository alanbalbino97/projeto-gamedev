
function PowerUp(context, imagem, tipoPoder, jogo) {
   this.context = context;
   this.imagem = imagem;
   this.tipo = 'poder';
   this.tipoPoder = tipoPoder;
   this.jogo = jogo;
   this.largura = 48;
   this.altura = 48;
   this.baseX = 16 + Math.random() * (context.canvas.width - this.largura - 32);
   this.x = this.baseX;
   this.y = -this.altura;
   this.velocidade = 100;
   this.tempo = Math.random()*10;
}
PowerUp.prototype = {
   atualizar: function(dt) {
      this.tempo += dt;
      this.y += this.velocidade * dt;
      this.x = this.baseX + Math.sin(this.tempo*2.8) * 10;
      if (this.y > this.context.canvas.height) this.jogo.removerSprite(this);
   },
   desenhar: function() {
      var ctx = this.context;
      ctx.save();
      ctx.shadowBlur = 15 + Math.sin(this.tempo*5)*5;
      ctx.shadowColor = this.tipoPoder === 'estrela' ? '#ffdf53' : '#9bcaff';
      ctx.drawImage(this.imagem, this.x, this.y, this.largura, this.altura);
      ctx.restore();
   },
   retangulosColisao: function() {
      return [{x:this.x+5,y:this.y+5,largura:this.largura-10,altura:this.altura-10}];
   },
   colidiuCom: function(outro) {}
};
