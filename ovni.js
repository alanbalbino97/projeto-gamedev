
function Ovni(context, imagem, jogo, nivel) {
   this.context = context;
   this.imagem = imagem;
   this.jogo = jogo;
   this.tipo = 'ovni';
   this.largura = 64;
   this.altura = 32;
   this.x = Math.random() * (context.canvas.width - this.largura);
   this.y = -this.altura;
   this.velocidade = 95 + Math.min(nivel, 12) * 17 + Math.random()*32;
   this.oscilacao = Math.random() * Math.PI * 2;
}
Ovni.prototype = {
   atualizar: function(dt) {
      this.y += this.velocidade * dt;
      this.oscilacao += dt * 2;
      if (this.y > this.context.canvas.height) this.jogo.removerSprite(this);
   },
   desenhar: function() {
      this.context.drawImage(this.imagem, this.x, this.y, this.largura, this.altura);
   },
   retangulosColisao: function() {
      return [
         {x:this.x+20,y:this.y+1,largura:25,altura:10},
         {x:this.x+2,y:this.y+11,largura:60,altura:12},
         {x:this.x+20,y:this.y+23,largura:25,altura:7}
      ];
   },
   colidiuCom: function(outro) {
      if (this.excluido) return;
      if (outro instanceof Tiro) {
         this.jogo.removerSprite(this);
         this.jogo.removerSprite(outro);
         this.jogo.pontos++;
         this.jogo.criarExplosao(this.x + this.largura/2, this.y+this.altura/2, ['#ffcb67', '#ffe8ba', '#ff62be']);
      }
   }
};
